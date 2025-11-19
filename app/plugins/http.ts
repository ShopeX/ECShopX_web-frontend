import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useCookie } from 'nuxt/app'
import type { ApiResponse, HttpError } from '~/types/http'
import { ErrorType } from '~/types/http'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // ============ 辅助函数 ============

  /**
   * 判断是否为业务成功响应
   */
  const isBusinessSuccess = (data: any): boolean => {
    if (!data || typeof data !== 'object' || ('status_code' in data)) {
      return false
    }
    return true
  }

  /**
   * 创建业务错误
   */
  const createBusinessError = (response: ApiResponse): HttpError => {
    const error = new Error(response.message || '业务处理失败') as HttpError
    error.type = ErrorType.BUSINESS_ERROR
    error.code = response.status_code
    error.details = response
    error.retry = false
    return error
  }

  /**
   * 创建 HTTP 错误
   */
  const createHttpError = (
    message: string,
    type: ErrorType,
    status?: number,
    details?: any
  ): HttpError => {
    const error = new Error(message) as HttpError
    error.type = type
    error.status = status
    error.details = details
    // 可重试的HTTP状态码
    error.retry = [408, 429, 500, 502, 503, 504].includes(status || 0)
    return error
  }

  /**
   * 根据状态码获取错误类型
   */
  const getErrorType = (status: number): ErrorType => {
    if (status === 401) return ErrorType.AUTH_ERROR
    if (status === 403) return ErrorType.PERMISSION_ERROR
    if (status === 422) return ErrorType.VALIDATION_ERROR
    if (status >= 500) return ErrorType.SERVER_ERROR
    return ErrorType.HTTP_ERROR
  }

  /**
   * 显示错误消息（仅客户端）
   */
  const showErrorMessage = async (error: HttpError) => {
    // 只在客户端显示消息
    if (import.meta.server) return

    try {
      const { useMessage } = await import('~/composables/useMessage')
      const message = useMessage()

      switch (error.type) {
        case ErrorType.AUTH_ERROR:
          message.error('登录已过期，请重新登录')
          break
        case ErrorType.PERMISSION_ERROR:
          message.error('权限不足，无法执行此操作')
          break
        case ErrorType.VALIDATION_ERROR:
          message.error('请求参数有误')
          break
        case ErrorType.NETWORK_ERROR:
        case ErrorType.TIMEOUT_ERROR:
          message.error('网络连接失败，请检查网络设置')
          break
        case ErrorType.SERVER_ERROR:
          message.error('服务器错误，请稍后重试')
          break
        case ErrorType.BUSINESS_ERROR:
          message.error(error.message || '操作失败')
          break
        default:
          message.error(error.message || '请求失败')
      }
    } catch (err) {
      console.error('[Error Message] Failed to show error message:', err)
    }
  }

  // ============ 创建 $fetch 实例 ============

  const $api = $fetch.create({
    baseURL: config.public.apiBase || '/api',
    timeout: (config.public.apiTimeout as number) || 10000,

    // ✅ 自动重试配置（ofetch 内置）
    retry: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],

    onRequest({ options }) {
      // 添加认证头
      if (!(options as any).skipAuth) {
        const token = useCookie('token').value
        if (token) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          } as any
        }
      }

      // 添加公司ID
      if (!(options as any).skipCompanyId && config.public.companyId) {
        options.query = {
          ...options.query,
          company_id: config.public.companyId,
        }
      }

      // 请求日志
      console.log(`[API Request] ${options.method || 'GET'} ${options.baseURL}${(options as any).url || ''}`)
    },

    async onResponse({ response }) {
      // 响应日志
      console.log(`[API Response] ${response.status} ${response.url}`)

      // 处理业务响应头
      const token = response.headers.get('X-Token')
      if (token) {
        useCookie('token').value = token
      }

      const refreshToken = response.headers.get('X-Refresh-Token')
      if (refreshToken) {
        useCookie('refresh-token').value = refreshToken
      }

      // ✅ 业务状态码检查
      const data = response._data?.data
      if (data && typeof data === 'object' && !('status_code' in data)) {
        const apiResponse = data as ApiResponse

        if (!isBusinessSuccess(apiResponse)) {
          // 业务失败：创建并抛出业务错误
          const error = createBusinessError(apiResponse)
          await showErrorMessage(error)
          throw error
        }
        // ✅ 业务成功：自动解包 data 字段
        // 直接修改 response._data，让后续代码自动获得解包后的数据
        response._data = apiResponse
      }
    },

    async onResponseError({ response, error }) {
      // 错误日志
      console.error(`[API Error] ${response?.status || 'Network'} ${response?.url || ''}`)

      // 创建标准错误对象
      let httpError: HttpError

      if (response) {
        // HTTP 响应错误（401, 403, 500 等）
        const errorType = getErrorType(response.status)
        const message = response._data?.message || response.statusText || '请求失败'

        httpError = createHttpError(message, errorType, response.status, response._data)

        // 特殊处理：401 跳转登录页（仅客户端）
        if (response.status === 401 && import.meta.client) {
          navigateTo('/login')
        }
      } else if (error?.message?.includes('timeout')) {
        // 超时错误
        httpError = createHttpError(
          '请求超时，请检查网络连接',
          ErrorType.TIMEOUT_ERROR
        )
      } else if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
        // 网络错误
        httpError = createHttpError(
          '网络连接失败，请检查网络设置',
          ErrorType.NETWORK_ERROR
        )
      } else {
        // 未知错误
        httpError = createHttpError(
          error?.message || '未知错误',
          ErrorType.UNKNOWN_ERROR
        )
      }

      // 显示错误消息
      await showErrorMessage(httpError)

      // 重新抛出标准错误对象
      throw httpError
    },
  })

  return {
    provide: {
      api: $api,
    },
  }
})