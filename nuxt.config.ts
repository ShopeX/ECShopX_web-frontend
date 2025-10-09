import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 开发模式配置
  devtools: { enabled: true },
  
  // Nitro 配置
  nitro: {
    compatibilityDate: '2025-09-04'
  },

  // 应用配置
  app: {
    head: {
      title: 'ECSHOPX',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },
    // Payload 配置
    payload: {
      reviver: (key: string, value: any) => {
        // 处理日期
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
        }
        return value
      },
      reducer: (value: any) => {
        // 处理日期
        if (value instanceof Date) {
          return value.toISOString()
        }
        // 处理函数
        if (typeof value === 'function') {
          return undefined
        }
        // 处理 undefined
        if (value === undefined) {
          return null
        }
        // 处理 Error
        if (value instanceof Error) {
          return {
            message: value.message,
            stack: value.stack
          }
        }
        return value
      }
    }
  },

  // 源码目录
  srcDir: 'app',

  // 类型检查配置
  typescript: {
    strict: true,
    shim: false,
    typeCheck: true // 启用类型检查
  },

  // 实验性功能
  experimental: {
    componentIslands: true,
    typedPages: true,
    payloadExtraction: false
  },

  // 构建配置
  vite: {
    define: {
      'process.env.DEBUG': false,
      'global': {}
    },
    resolve: {
      alias: {
        'form-data': 'form-data',
        'node-fetch': 'node-fetch'
      }
    }
  },

  // 模块配置
  modules: [
    '@nuxt/ui'
  ],
  ui: {
    fonts: false,
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral'
      ]
    }
  },

  // CSS 配置
  css: [
    '~/assets/css/main.css',
    '~/assets/css/sp-theme.css'
  ],

  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      companyId: process.env.NUXT_PUBLIC_COMPANY_ID
    }
  },

  // 自动导入配置
  imports: {
    dirs: [
      'composables',
      'utils'
    ]
  },

  // 组件配置
  components: {
    dirs: [
      '~/components',
      '~/components/business'
    ]
  }
})
