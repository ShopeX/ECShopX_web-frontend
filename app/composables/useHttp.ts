import type { UseFetchOptions } from 'nuxt/app'
import { useFetch, useNuxtApp } from 'nuxt/app'
import { computed, ref } from 'vue'
import type { Ref, ComputedRef } from 'vue'

// 标准 API 响应格式
export interface ApiResponse<T = any> {
  code: number | string    // 业务状态码
  message: string          // 响应消息
  data: T                  // 响应数据
  timestamp?: number       // 时间戳
  traceId?: string        // 追踪ID
}

// 分页响应格式
export interface ApiPaginatedResponse<T = any> extends ApiResponse<{
  list: T[]
  total_count: number
  page?: number
  page_size?: number
}> { }

// 错误类型定义
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',           // 网络错误
  HTTP_ERROR = 'HTTP_ERROR',                 // HTTP状态码错误  
  BUSINESS_ERROR = 'BUSINESS_ERROR',         // 业务逻辑错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',     // 参数验证错误
  AUTH_ERROR = 'AUTH_ERROR',                 // 认证错误
  PERMISSION_ERROR = 'PERMISSION_ERROR',     // 权限错误
  SERVER_ERROR = 'SERVER_ERROR',             // 服务器错误
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',           // 超时错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'            // 未知错误
}

// 扩展的错误信息
export interface HttpError extends Error {
  type: ErrorType
  code?: number | string
  status?: number
  statusText?: string
  url?: string
  method?: string
  details?: any
  retry?: boolean          // 是否可重试
}

// 响应处理器配置
export interface ResponseHandler<T = any> {
  // 成功响应处理
  onSuccess?: (data: T, response: Response) => T | Promise<T>
  // 业务错误处理  
  onBusinessError?: (error: HttpError, response: Response) => void | Promise<void>
  // HTTP错误处理
  onHttpError?: (error: HttpError, response: Response) => void | Promise<void>
  // 是否显示成功消息
  showSuccessMessage?: boolean
  // 是否显示错误消息
  showErrorMessage?: boolean
  // 自定义成功消息
  successMessage?: string
  // 自定义错误消息映射
  errorMessages?: Record<string | number, string>
}

// 重试配置接口
export interface RetryConfig {
  maxRetries?: number          // 最大重试次数，默认3
  baseDelay?: number          // 基础延迟时间(ms)，默认1000
  maxDelay?: number           // 最大延迟时间(ms)，默认5000
  backoffFactor?: number      // 退避因子，默认2
  retryCondition?: (error: any) => boolean // 自定义重试条件
}

// HTTP 请求选项接口
export interface UseHttpOptions<T = any> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  query?: Record<string, any>
  headers?: Record<string, string>
  server?: boolean
  key?: string
  skipAuth?: boolean
  skipCompanyId?: boolean
  watch?: any
  immediate?: boolean
  cache?: RequestCache
  transform?: (input: any) => T
  retry?: RetryConfig | boolean  // 重试配置，true使用默认配置
  // 新增响应处理配置
  responseHandler?: ResponseHandler<T>
  // 是否显示全局加载状态
  showGlobalLoading?: boolean
  // 是否静默处理（不显示任何提示）
  silent?: boolean
  // 业务成功状态码（默认检查 code === 0 或 code === '0'）
  successCodes?: (number | string)[]
}

// 默认重试配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // 默认可重试的错误条件
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504]

    // 网络错误
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      return true
    }

    // HTTP状态码错误
    if (error.status && retryableStatusCodes.includes(error.status)) {
      return true
    }

    // 超时错误
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return true
    }

    return false
  }
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 计算重试延迟（指数退避 + 随机抖动）
const calculateRetryDelay = (attempt: number, config: RetryConfig): number => {
  const baseDelay = config.baseDelay || DEFAULT_RETRY_CONFIG.baseDelay!
  const backoffFactor = config.backoffFactor || DEFAULT_RETRY_CONFIG.backoffFactor!
  const maxDelay = config.maxDelay || DEFAULT_RETRY_CONFIG.maxDelay!

  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1)
  const jitteredDelay = exponentialDelay + Math.random() * 1000 // 添加随机延迟避免雪崩
  return Math.min(jitteredDelay, maxDelay)
}

// 创建 HTTP 错误对象
const createHttpError = (
  message: string,
  type: ErrorType,
  options: {
    code?: number | string
    status?: number
    statusText?: string
    url?: string
    method?: string
    details?: any
    retry?: boolean
  } = {}
): HttpError => {
  const error = new Error(message) as HttpError
  error.type = type
  error.code = options.code
  error.status = options.status
  error.statusText = options.statusText
  error.url = options.url
  error.method = options.method
  error.details = options.details
  error.retry = options.retry ?? false
  return error
}

// 判断是否为业务成功响应
const isBusinessSuccess = (data: any, successCodes: (number | string)[] = [0, '0']): boolean => {
  if (!data || typeof data !== 'object') return false
  return successCodes.includes(data.code)
}

// 统一响应处理器
const processResponse = async <T>(
  response: any,
  options: UseHttpOptions<T> = {}
): Promise<T> => {
  const { responseHandler, silent, successCodes, showGlobalLoading } = options

  try {
    // 引入消息提示系统（延迟导入避免循环依赖）
    const { useMessage } = await import('~/composables/useMessage')
    const message = useMessage()

    // 检查是否为标准 API 响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      const apiResponse = response as ApiResponse<T>

      // 检查业务成功状态
      if (isBusinessSuccess(apiResponse, successCodes)) {
        // 业务成功处理
        let processedData = apiResponse.data

        // 执行自定义成功处理器
        if (responseHandler?.onSuccess) {
          processedData = await responseHandler.onSuccess(processedData, response as Response)
        }

        // 显示成功消息
        if (!silent && responseHandler?.showSuccessMessage && responseHandler?.successMessage) {
          message.success(responseHandler.successMessage)
        }

        debugger

        return processedData
      } else {
        // 业务错误处理
        const businessError = createHttpError(
          apiResponse.message || '业务处理失败',
          ErrorType.BUSINESS_ERROR,
          {
            code: apiResponse.code,
            details: apiResponse,
            retry: false
          }
        )

        // 执行自定义业务错误处理器
        if (responseHandler?.onBusinessError) {
          await responseHandler.onBusinessError(businessError, response as Response)
        } else if (!silent && (responseHandler?.showErrorMessage !== false)) {
          // 显示业务错误消息
          const errorMsg = responseHandler?.errorMessages?.[apiResponse.code] || apiResponse.message || '操作失败'
          message.error(errorMsg)
        }

        throw businessError
      }
    }

    // 非标准格式，直接返回
    return response as T

  } catch (error) {
    // 处理过程中的错误
    if ((error as HttpError).type) {
      // 已经是处理过的错误，直接抛出
      throw error
    }

    // 未知错误
    const unknownError = createHttpError(
      '响应处理失败',
      ErrorType.UNKNOWN_ERROR,
      { details: error }
    )
    throw unknownError
  }
}

// 统一错误处理器
const processError = async (
  error: any,
  options: UseHttpOptions = {}
): Promise<never> => {
  const { responseHandler, silent } = options

  try {
    // 引入消息提示系统
    const { useMessage } = await import('~/composables/useMessage')
    const message = useMessage()

    let httpError: HttpError

    // 转换为标准错误格式
    if ((error as HttpError).type) {
      httpError = error as HttpError
    } else if (error.response) {
      // HTTP 响应错误
      const status = error.response.status
      let errorType = ErrorType.HTTP_ERROR

      // 根据状态码分类错误类型
      if (status === 401) {
        errorType = ErrorType.AUTH_ERROR
      } else if (status === 403) {
        errorType = ErrorType.PERMISSION_ERROR
      } else if (status === 422) {
        errorType = ErrorType.VALIDATION_ERROR
      } else if (status >= 500) {
        errorType = ErrorType.SERVER_ERROR
      }

      httpError = createHttpError(
        error.message || `请求失败 (${status})`,
        errorType,
        {
          status,
          statusText: error.response.statusText,
          url: error.response.url,
          details: error.response,
          retry: [408, 429, 500, 502, 503, 504].includes(status)
        }
      )
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // 超时错误
      httpError = createHttpError(
        '请求超时，请检查网络连接',
        ErrorType.TIMEOUT_ERROR,
        { retry: true }
      )
    } else if (!navigator.onLine) {
      // 网络错误
      httpError = createHttpError(
        '网络连接失败，请检查网络设置',
        ErrorType.NETWORK_ERROR,
        { retry: true }
      )
    } else {
      // 未知错误
      httpError = createHttpError(
        error.message || '未知错误',
        ErrorType.UNKNOWN_ERROR,
        { details: error }
      )
    }

    // 执行自定义错误处理器
    if (responseHandler?.onHttpError) {
      await responseHandler.onHttpError(httpError, error.response)
    } else if (!silent && (responseHandler?.showErrorMessage !== false)) {
      // 显示错误消息
      const errorMsg = responseHandler?.errorMessages?.[httpError.status || httpError.code || 'default'] || httpError.message

      switch (httpError.type) {
        case ErrorType.AUTH_ERROR:
          message.error('登录已过期，请重新登录')
          break
        case ErrorType.PERMISSION_ERROR:
          message.error('权限不足，无法执行此操作')
          break
        case ErrorType.VALIDATION_ERROR:
          message.error(errorMsg || '请求参数有误')
          break
        case ErrorType.NETWORK_ERROR:
        case ErrorType.TIMEOUT_ERROR:
          message.error(errorMsg)
          break
        case ErrorType.SERVER_ERROR:
          message.error('服务器错误，请稍后重试')
          break
        default:
          message.error(errorMsg || '操作失败')
      }
    }

    throw httpError

  } catch (processedError) {
    // 确保错误被正确抛出
    throw processedError
  }
}

/**
 * 带重试功能的 HTTP 请求
 * 返回与 useFetch 兼容的结构
 */
function useHttpWithRetry<T>(
  url: string | (() => string),
  options: UseHttpOptions<T>,
  retryConfig: RetryConfig
) {
  const { $api } = useNuxtApp()
  const finalUrl = typeof url === 'function' ? url() : url

  // 合并重试配置
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }

  // 创建响应式状态
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const pending = ref(true)

  // 提取自定义选项
  const { skipAuth, skipCompanyId, retry, ...fetchOptions } = options

  // 执行重试逻辑的异步函数
  const executeWithRetry = async () => {
    let lastError: HttpError | Error | null = null
    const startTime = Date.now()

    for (let attempt = 1; attempt <= (config.maxRetries || 3) + 1; attempt++) {
      try {
        // 日志记录
        if (attempt === 1) {
          console.log(`[API Request] ${options.method || 'GET'} ${finalUrl}`)
        } else {
          console.log(`[API Retry] ${attempt - 1}/${config.maxRetries} ${options.method || 'GET'} ${finalUrl}`)
        }

        const response = await ($api as any)(finalUrl, {
          ...fetchOptions,
          skipAuth,
          skipCompanyId
        })

        // 使用统一响应处理器
        const processedData = await processResponse<T>(response, options)

        // 成功时更新状态
        data.value = processedData
        error.value = null
        pending.value = false

        const duration = Date.now() - startTime
        console.log(`[API Success] ${options.method || 'GET'} ${finalUrl} (${duration}ms)`)

        return
      } catch (err: any) {
        // 使用统一错误处理器处理错误
        try {
          await processError(err, options)
        } catch (processedError) {
          lastError = processedError as HttpError
        }

        // 检查是否应该重试
        const httpError = lastError as HttpError
        const shouldRetry = httpError.retry || (config.retryCondition || DEFAULT_RETRY_CONFIG.retryCondition!)(err)
        const isLastAttempt = attempt > (config.maxRetries || 3)

        if (isLastAttempt || !shouldRetry) {
          // 最后一次尝试或不可重试，设置错误状态并退出
          error.value = lastError
          pending.value = false

          const duration = Date.now() - startTime
          console.error(`[API Error] ${options.method || 'GET'} ${finalUrl} failed after ${attempt - 1} retries (${duration}ms)`, lastError)

          return
        }

        // 计算延迟并重试
        const retryDelay = calculateRetryDelay(attempt, config)
        console.warn(`[API Retry] ${attempt}/${config.maxRetries} after ${retryDelay}ms. Error:`, lastError?.message || 'Unknown error')
        await delay(retryDelay)
      }
    }

    // 理论上不会到达这里，但为安全起见设置默认错误
    if (lastError) {
      error.value = lastError
    } else {
      error.value = createHttpError('请求失败', ErrorType.UNKNOWN_ERROR)
    }
    pending.value = false
  }

  // 立即执行重试逻辑
  executeWithRetry()

  // 提供刷新方法
  const refresh = () => {
    pending.value = true
    error.value = null
    executeWithRetry()
  }

  return {
    data: data as Ref<T | null>,
    error: error as Ref<Error | null>,
    pending: pending as Ref<boolean>,
    refresh
  }
}

/**
 * 统一的 HTTP 请求 composable
 * 智能选择 useFetch (SSR) 或 $fetch (CSR)，支持重试功能
 */
export function useHttp<T>(
  url: string | (() => string),
  options: UseHttpOptions<T> = {}
) {
  const { $api } = useNuxtApp()

  // 如果配置了重试，使用重试版本
  if (options.retry) {
    const retryConfig = typeof options.retry === 'boolean' ? {} : options.retry
    return useHttpWithRetry<T>(url, options, retryConfig)
  }

  // 提取自定义选项
  const { skipAuth, skipCompanyId, retry, responseHandler, silent, successCodes, showGlobalLoading, ...fetchOptions } = options

  // 包装 transform 函数以集成响应处理
  const originalTransform = fetchOptions.transform
  if (originalTransform || responseHandler) {
    // 创建新的 transform 函数（同步版本）
    fetchOptions.transform = (input: any): T => {
      // 先执行原始 transform
      let transformedData = originalTransform ? originalTransform(input) : input

      // 对于简单的响应处理，我们在这里进行同步处理
      // 复杂的异步处理会在 useFetch 的其他钩子中进行
      return transformedData as T
    }
  }

  // 默认使用 useFetch（无重试）
  return useFetch<T>(url, {
    ...fetchOptions,
    $fetch: $api as any,
    // 添加错误处理  
    onResponseError: async ({ error }: { error: any }) => {
      await processError(error, options)
    }
  } as any)
}

/**
 * HTTP 方法封装
 * 提供类似传统 HTTP 客户端的使用方式
 */
export function useHttpMethods() {
  const { $api } = useNuxtApp()

  return {
    /**
     * GET 请求
     */
    get<T>(url: string, options: UseHttpOptions<T> = {}) {
      return useHttp<T>(url, { ...options, method: 'GET' })
    },

    /**
     * POST 请求
     */
    post<T>(url: string, body?: any, options: UseHttpOptions<T> = {}) {
      return useHttp<T>(url, { ...options, method: 'POST', body })
    },

    /**
     * PUT 请求
     */
    put<T>(url: string, body?: any, options: UseHttpOptions<T> = {}) {
      return useHttp<T>(url, { ...options, method: 'PUT', body })
    },

    /**
     * DELETE 请求
     */
    delete<T>(url: string, options: UseHttpOptions<T> = {}) {
      return useHttp<T>(url, { ...options, method: 'DELETE' })
    },

    /**
     * PATCH 请求
     */
    patch<T>(url: string, body?: any, options: UseHttpOptions<T> = {}) {
      return useHttp<T>(url, { ...options, method: 'PATCH', body })
    },
  }
}

/**
 * 直接使用 $api 实例进行请求 (用于特殊场景)
 * 不提供响应式状态管理
 */
export function useApi() {
  const { $api } = useNuxtApp()
  return $api
}

/**
 * 类型安全的 HTTP 请求 composable
 * 支持泛型类型推导
 */
export function useTypedHttp() {
  return {
    /**
     * 类型安全的 GET 请求
     */
    get: <T = any>(url: string, options?: UseHttpOptions<T>) => useHttp<T>(url, { ...options, method: 'GET' }),

    /**
     * 类型安全的 POST 请求
     */
    post: <T = any>(url: string, body?: any, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'POST', body }),

    /**
     * 类型安全的 PUT 请求
     */
    put: <T = any>(url: string, body?: any, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'PUT', body }),

    /**
     * 类型安全的 DELETE 请求
     */
    delete: <T = any>(url: string, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'DELETE' }),

    /**
     * 类型安全的 PATCH 请求
     */
    patch: <T = any>(url: string, body?: any, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'PATCH', body }),
  }
}

/**
 * 条件式 HTTP 请求
 * 只在条件满足时执行请求
 */
export function useConditionalHttp<T>(
  url: string | (() => string),
  condition: Ref<boolean> | ComputedRef<boolean> | (() => boolean),
  options: UseHttpOptions<T> = {}
) {
  const shouldExecute = typeof condition === 'function'
    ? computed(condition)
    : condition

  return useHttp<T>(url, {
    ...options,
    server: false, // 禁用服务端执行
    immediate: false, // 禁用立即执行
    watch: [shouldExecute], // 监听条件变化
  })
}

/**
 * 全局加载状态管理
 */
const globalLoadingState = ref(0) // 使用计数器管理多个请求的加载状态

export function useGlobalLoading() {
  const isLoading = computed(() => globalLoadingState.value > 0)

  const startLoading = () => {
    globalLoadingState.value++
  }

  const stopLoading = () => {
    globalLoadingState.value = Math.max(0, globalLoadingState.value - 1)
  }

  return {
    isLoading: readonly(isLoading),
    startLoading,
    stopLoading
  }
}

/**
 * 便捷的 API 调用函数
 * 集成了常用的响应处理配置
 */
export function useSimpleApi() {

  return {
    /**
     * 简单的 GET 请求，自动显示错误提示
     */
    get: <T>(url: string, options: Partial<UseHttpOptions<T>> = {}) => {
      return useHttp<T>(url, {
        method: 'GET',
        responseHandler: {
          showErrorMessage: true
        },
        ...options
      })
    },

    /**
     * 简单的 POST 请求，自动显示成功/错误提示
     */
    post: <T>(url: string, body?: any, options: Partial<UseHttpOptions<T>> = {}) => {
      return useHttp<T>(url, {
        method: 'POST',
        body,
        responseHandler: {
          showSuccessMessage: true,
          showErrorMessage: true,
          successMessage: '操作成功'
        },
        ...options
      })
    },

    /**
     * 静默请求，不显示任何提示
     */
    silent: <T>(url: string, options: Partial<UseHttpOptions<T>> = {}) => {
      return useHttp<T>(url, {
        silent: true,
        ...options
      })
    },

    /**
     * 带重试的请求
     */
    withRetry: <T>(url: string, options: Partial<UseHttpOptions<T>> = {}) => {
      return useHttp<T>(url, {
        retry: true,
        responseHandler: {
          showErrorMessage: true
        },
        ...options
      })
    }
  }
}

/**
 * 创建带统一错误处理的 API 客户端
 */
export function createApiClient(baseOptions: Partial<UseHttpOptions> = {}) {
  const defaultOptions: Partial<UseHttpOptions> = {
    responseHandler: {
      showErrorMessage: true
    },
    ...baseOptions
  }

  return {
    get: <T>(url: string, options: Partial<UseHttpOptions<T>> = {}) =>
      useHttp<T>(url, { ...defaultOptions, method: 'GET', ...options }),

    post: <T>(url: string, body?: any, options: Partial<UseHttpOptions<T>> = {}) =>
      useHttp<T>(url, { ...defaultOptions, method: 'POST', body, ...options }),

    put: <T>(url: string, body?: any, options: Partial<UseHttpOptions<T>> = {}) =>
      useHttp<T>(url, { ...defaultOptions, method: 'PUT', body, ...options }),

    delete: <T>(url: string, options: Partial<UseHttpOptions<T>> = {}) =>
      useHttp<T>(url, { ...defaultOptions, method: 'DELETE', ...options }),

    patch: <T>(url: string, body?: any, options: Partial<UseHttpOptions<T>> = {}) =>
      useHttp<T>(url, { ...defaultOptions, method: 'PATCH', body, ...options })
  }
}
