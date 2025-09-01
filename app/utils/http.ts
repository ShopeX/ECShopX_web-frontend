import type { UseFetchOptions } from 'nuxt/app'
import { useRuntimeConfig, useFetch } from 'nuxt/app'
import type { IApiResponse } from './auth'
import { getAuthHeaders, getBaseURL, getCompanyId, handleResponse } from './auth'

// 扩展配置接口
export interface IHttpOptions<T> extends Omit<UseFetchOptions<T>, 'baseURL'> {
  skipAuth?: boolean
  skipCompanyId?: boolean
  params?: Record<string, any>
}

// 扩展 FetchOptions 类型
interface IExtendedFetchOptions extends RequestInit {
  url: string
  _startTime?: number
  method?: string
  headers?: Record<string, string>
  query?: Record<string, any>
  body?: any
}

// HTTP 方法类型
type HttpMethod = 'get' | 'post' | 'put' | 'delete'

// 创建基础配置
function createOptions<T>(options: IHttpOptions<T> = {}): UseFetchOptions<T> {
  const config = useRuntimeConfig()
  const { skipAuth, skipCompanyId, params = {}, ...fetchOptions } = options

  // 合并查询参数
  const query: Record<string, any> = {
    ...(fetchOptions.query || {}),
    ...params
  }

  // 添加公司ID
  if (!skipCompanyId && config.public.companyId) {
    query.company_id = config.public.companyId
  }

  // 添加认证信息
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {})
  }

  if (!skipAuth) {
    // 这里可以添加token等认证信息
    // const token = useCookie('token').value
    // if (token) {
    //   headers.Authorization = `Bearer ${token}`
    // }
  }

  return {
    baseURL: config.public.apiBase || '/api',
    headers,
    query,
    ...fetchOptions,
    // 请求拦截
    onRequest({ options }: { options: IExtendedFetchOptions }) {
      // 请求开始时间
      const startTime = Date.now()
      // 保存到 options 中，供 onResponse 使用
      options._startTime = startTime

      console.log(`[Request] ${options.method} ${options.url}`, {
        headers: options.headers,
        query: options.query,
        body: options.body
      })
    },
    // 请求错误拦截
    onRequestError({ error }: { error: Error }) {
      console.error('[Request Error]', error)
      throw error
    },
    // 响应拦截
    onResponse({ request, response, options }: { 
      request: Request
      response: Response & { _data?: any }
      options: IExtendedFetchOptions 
    }) {
      // 计算请求耗时
      const endTime = Date.now()
      const duration = endTime - (options._startTime || endTime)

      // 打印请求信息
      console.log(`[Response] ${request.method} ${request.url}`, {
        duration: `${duration}ms`,
        status: response.status,
        headers: response.headers
      })

      // 处理特殊的响应头
      const token = response.headers.get('X-Token')
      if (token) {
        // 更新 token
        // const tokenCookie = useCookie('token')
        // tokenCookie.value = token
      }

      // 处理刷新 token
      const refreshToken = response.headers.get('X-Refresh-Token')
      if (refreshToken) {
        // 更新 refresh token
        // const refreshTokenCookie = useCookie('refresh-token')
        // refreshTokenCookie.value = refreshToken
      }

      // 处理业务提示信息
      const message = response.headers.get('X-Message')
      if (message) {
        // 显示业务提示
        // useMessage().success(message)
      }

      // 处理业务警告信息
      const warning = response.headers.get('X-Warning')
      if (warning) {
        // 显示警告提示
        // useMessage().warning(warning)
      }

      // 响应数据监控
      const data = response._data as IApiResponse<unknown>
      if (data?.status_code !== 200) {
        // 记录非成功的响应
        console.warn('[Response Warning]', {
          url: request.url,
          status: response.status,
          statusCode: data?.status_code,
          message: data?.message
        })
      }

      // 性能监控
      if (duration > 1000) {
        // 记录慢请求
        console.warn('[Slow Request]', {
          url: request.url,
          duration: `${duration}ms`
        })
      }

      // 处理响应数据
      if (response._data) {
        response._data = JSON.parse(JSON.stringify(response._data))
      }
    },
    // 响应错误拦截
    onResponseError({ request, error }: { 
      request: Request
      error: Error & { status?: number } 
    }) {
      console.error('[Response Error]', {
        url: request.url,
        status: error.status,
        message: error.message
      })

      // 处理HTTP错误
      if (error.status === 401) {
        // 处理未授权错误
        // const router = useRouter()
        // router.push('/login')
      } else if (error.status === 403) {
        // 处理权限错误
        // useMessage().error('没有权限访问')
      } else if (error.status === 404) {
        // 处理资源不存在
        // useMessage().error('请求的资源不存在')
      } else if (error.status && error.status >= 500) {
        // 处理服务器错误
        // useMessage().error('服务器异常，请稍后重试')
      }

      throw error
    }
  }
}

// HTTP 客户端
export const http = {
  // GET 请求
  get<T>(url: string, options: IHttpOptions<T> = {}) {
    return useFetch<T>(url, {
      method: 'get' as HttpMethod,
      ...createOptions(options)
    })
  },

  // POST 请求
  post<T>(url: string, data?: any, options: IHttpOptions<T> = {}) {
    return useFetch<T>(url, {
      method: 'post' as HttpMethod,
      body: data,
      ...createOptions(options)
    })
  },

  // PUT 请求
  put<T>(url: string, data?: any, options: IHttpOptions<T> = {}) {
    return useFetch<T>(url, {
      method: 'put' as HttpMethod,
      body: data,
      ...createOptions(options)
    })
  },

  // DELETE 请求
  delete<T>(url: string, options: IHttpOptions<T> = {}) {
    return useFetch<T>(url, {
      method: 'delete' as HttpMethod,
      ...createOptions(options)
    })
  }
} 