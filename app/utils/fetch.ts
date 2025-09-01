import { $fetch } from 'ofetch'
import type { IApiResponse } from './auth'
import { getAuthHeaders, getBaseURL, getCompanyId, handleResponse } from './auth'

// 基础请求选项类型
export interface IFetchOptions {
  skipAuth?: boolean
  skipCompanyId?: boolean
  params?: Record<string, any>
  headers?: Record<string, string>
  query?: Record<string, any>
  body?: any
  method?: string
}

// 创建基础配置
function createOptions(options: IFetchOptions = {}) {
  const { skipAuth, skipCompanyId, ...fetchOptions } = options

  const headers = skipAuth ? 
    { 'Content-Type': 'application/json' } : 
    getAuthHeaders()

  // 添加公司ID
  const query = { ...(fetchOptions.query || {}) }
  if (!skipCompanyId) {
    const companyId = getCompanyId()
    if (companyId) {
      query.company_id = companyId
    }
  }

  return {
    baseURL: getBaseURL(),
    headers,
    query,
    ...fetchOptions
  }
}

// 创建请求实例
function createFetchInstance(defaultOptions: IFetchOptions = {}) {
  return {
    // GET 请求
    async get<T>(url: string, options: IFetchOptions = {}) {
      const response = await $fetch<IApiResponse<T>>(url, {
        method: 'GET',
        ...createOptions(defaultOptions),
        ...createOptions(options)
      })
      return handleResponse(response)
    },

    // POST 请求
    async post<T>(url: string, data?: any, options: IFetchOptions = {}) {
      const response = await $fetch<IApiResponse<T>>(url, {
        method: 'POST',
        body: data,
        ...createOptions(defaultOptions),
        ...createOptions(options)
      })
      return handleResponse(response)
    },

    // PUT 请求
    async put<T>(url: string, data?: any, options: IFetchOptions = {}) {
      const response = await $fetch<IApiResponse<T>>(url, {
        method: 'PUT',
        body: data,
        ...createOptions(defaultOptions),
        ...createOptions(options)
      })
      return handleResponse(response)
    },

    // DELETE 请求
    async delete<T>(url: string, options: IFetchOptions = {}) {
      const response = await $fetch<IApiResponse<T>>(url, {
        method: 'DELETE',
        ...createOptions(defaultOptions),
        ...createOptions(options)
      })
      return handleResponse(response)
    }
  }
}

// 导出默认实例
export const fetch = createFetchInstance()

// 导出创建实例方法
export const createFetch = createFetchInstance 