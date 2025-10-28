import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useCookie } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // 创建自定义 $fetch 实例
  const $api = $fetch.create({
    baseURL: config.public.apiBase || '/api',
    timeout: (config.public.apiTimeout as number) || 10000,

    onRequest({ options }) {
      // 添加认证头
      if (!(options as any).skipAuth) {
        const token = useCookie('token').value
        if (token) {
          options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          } as any
        } else {
          options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
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
      console.log(`[API Request] ${options.method || 'GET'} ${options.baseURL}${(options as any).url || ''}`, {
        headers: options.headers,
        query: options.query,
        body: options.body,
      })
    },

    onResponse({ response, options }) {
      // 计算请求耗时
      const duration = Date.now() - ((options as any)._startTime || Date.now())

      // 响应日志
      console.log(`[API Response] ${response.status} ${response.url}`, {
        duration: `${duration}ms`,
        status: response.status,
      })

      // 处理业务响应头
      const token = response.headers.get('X-Token')
      if (token) {
        useCookie('token').value = token
      }

      const refreshToken = response.headers.get('X-Refresh-Token')
      if (refreshToken) {
        useCookie('refresh-token').value = refreshToken
      }

      // 处理业务提示信息
      const message = response.headers.get('X-Message')
      if (message) {
        // TODO: 集成消息提示系统
        console.info('[API Message]', message)
      }

      const warning = response.headers.get('X-Warning')
      if (warning) {
        // TODO: 集成消息提示系统
        console.warn('[API Warning]', warning)
      }
    },

    onResponseError({ response, error }) {
      // 错误日志
      console.error(`[API Error] ${response?.status || 'Network'} ${response?.url || ''}`, {
        status: response?.status,
        statusText: response?.statusText,
        message: error?.message || 'Unknown error',
      })

      // 统一错误处理
      if (response?.status === 401) {
        // 处理未授权错误
        console.warn('[Auth] Unauthorized access, redirecting to login...')
        navigateTo('/login')
      } else if (response?.status === 403) {
        // 处理权限错误
        console.error('[Auth] Forbidden access')
        // TODO: 显示权限错误提示
      } else if (response?.status === 404) {
        // 处理资源不存在
        console.error('[API] Resource not found')
      } else if (response?.status && response.status >= 500) {
        // 处理服务器错误
        console.error('[API] Server error')
        // TODO: 显示服务器错误提示
      }

      // 重新抛出错误供上层处理
      throw error
    },
  })

  return {
    provide: {
      api: $api,
    },
  }
})