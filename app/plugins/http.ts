import { defineNuxtPlugin, useRuntimeConfig, navigateTo } from 'nuxt/app'
import type { ApiResponse, HttpError } from '~/types/http'
import { ErrorType } from '~/types/http'
import { useUserStore } from '~/stores/user'

export default defineNuxtPlugin({
  name: 'http',
  setup() {
    const config = useRuntimeConfig()
    const userStore = useUserStore()

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
        const { useToastMessage } = await import('~/composables/useToastMessage')
        const toast = useToastMessage()

        switch (error.type) {
          case ErrorType.AUTH_ERROR:
            toast.show('登录已过期，请重新登录')
            break
          case ErrorType.PERMISSION_ERROR:
            toast.show('权限不足，无法执行此操作')
            break
          case ErrorType.VALIDATION_ERROR:
            toast.show('请求参数有误')
            break
          case ErrorType.NETWORK_ERROR:
          case ErrorType.TIMEOUT_ERROR:
            toast.show('网络连接失败，请检查网络设置')
            break
          case ErrorType.SERVER_ERROR:
            toast.show('服务器错误，请稍后重试')
            break
          case ErrorType.BUSINESS_ERROR:
            toast.show(error.message || '操作失败')
            break
          default:
            toast.show(error.message || '请求失败')
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
        // 添加认证头（从 Store 中获取 token）
        if (!(options as any).skipAuth) {
          const token = userStore.token
          if (token) {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`,
            } as any
          }
        }

        // ✅ 统一处理 Content-Type：默认 form-urlencoded，可通过 useJson: true 覆盖
        // 这符合项目后端的统一规范（所有 POST/PUT/PATCH 都使用 form-urlencoded）
        if (options.body && !(options as any).useJson) {
          // 排除已经是特殊格式的情况（FormData 用于文件上传，URLSearchParams 已处理，Blob 用于二进制数据）
          if (!(options.body instanceof FormData) &&
            !(options.body instanceof URLSearchParams) &&
            !(options.body instanceof Blob)) {

            // ✅ 在转换为 URLSearchParams 之前，先添加 company_id 到 body
            const bodyData = typeof options.body === 'object' ? { ...options.body as Record<string, any> } : {}
            if (!(options as any).skipCompanyId && config.public.companyId) {
              bodyData.company_id = config.public.companyId
            }

            const params = new URLSearchParams()
            Object.entries(bodyData).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                params.append(key, String(value))
              }
            })
            options.body = params as any
            // URLSearchParams 会自动设置正确的 Content-Type: application/x-www-form-urlencoded
          }
        } else {
          // ✅ GET 请求或没有 body 的请求：company_id 添加到 query 参数
          if (!(options as any).skipCompanyId && config.public.companyId) {
            options.query = {
              ...options.query,
              company_id: config.public.companyId,
            }
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
        if (data && typeof data === 'object') {
          // 检查是否包含业务错误状态码
          if ('status_code' in data && data.status_code !== undefined) {
            // 有 status_code 字段，检查是否为错误
            const statusCode = Number(data.status_code)
            if (statusCode >= 400) {
              // 业务错误：创建并抛出错误
              const error = createBusinessError({
                message: data.message || '请求失败',
                status_code: statusCode,
                data: data
              } as ApiResponse)
              await showErrorMessage(error)
              throw error
            }
          } else {
            // 没有 status_code，按原逻辑处理
            const apiResponse = data as ApiResponse
            if (!isBusinessSuccess(apiResponse)) {
              const error = createBusinessError(apiResponse)
              await showErrorMessage(error)
              throw error
            }
          }
          // ✅ 业务成功：自动解包 data 字段
          response._data = data
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
          // ✅ 优先从嵌套的 data.message 中提取，兼容多种响应格式
          const message = response._data?.data?.message || response._data?.message || response.statusText || '请求失败'

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
  }
})