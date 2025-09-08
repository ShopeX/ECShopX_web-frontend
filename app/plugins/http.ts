import { defineNuxtPlugin } from 'nuxt/app'
import type { UseFetchOptions } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const defaultOptions: UseFetchOptions<any> = {
    baseURL: config.public.apiBase || '/api',
    timeout: config.public.apiTimeout as number || 10000,
    headers: {
      'Content-Type': 'application/json'
    },
    onRequest({ options }) {
      // 可以在这里添加token等认证信息
      return options
    },
    onResponse({ response }) {
      // 处理响应数据
      const data = response._data
      
      if (data.code === 0) {
        response._data = data.data
      } else {
        throw new Error(data.message || '请求失败')
      }
    },
    onResponseError({ error }) {
      // 处理错误
      console.error('请求错误:', error)
      throw error
    }
  }

  return {
    provide: {
      // 扩展 useFetch 的默认配置
      fetch: (url: string, options: UseFetchOptions<any> = {}) => {
        return useFetch(url, {
          ...defaultOptions,
          ...options
        })
      }
    }
  }
}) 