import { defineNuxtPlugin } from '#app'
import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  // 创建axios实例
  const request = axios.create({
    baseURL: config.public.apiBase || '/api',
    timeout: config.public.apiTimeout || 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器
  request.interceptors.request.use(
    (config) => {
      // 可以在这里添加token等认证信息
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  request.interceptors.response.use(
    (response) => {
      const { data } = response
      
      // 这里可以根据业务需求处理响应数据
      if (data.code === 0) {
        return data.data
      }
      
      return Promise.reject(new Error(data.message || '请求失败'))
    },
    (error) => {
      // 处理请求错误
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      request
    }
  }
}) 