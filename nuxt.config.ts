import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 开发模式配置
  devtools: { enabled: true },

  // Nitro 配置
  nitro: {
    compatibilityDate: '2025-11-07',
  },

  // 兼容性日期（Nuxt 4）
  compatibilityDate: '2025-11-07',

  // 应用配置
  app: {
    head: {
      title: 'ECSHOPX',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  // 源码目录
  srcDir: 'app',

  // 类型检查配置
  typescript: {
    strict: true,
    shim: false,
    typeCheck: false, // 禁用运行时类型检查（避免 vite-plugin-checker 问题）
  },

  // 实验性功能
  experimental: {
    componentIslands: true,
    typedPages: true,
    payloadExtraction: false,
  },

  // 构建配置
  vite: {
    define: {
      'process.env.DEBUG': false,
      global: {},
    },
    resolve: {
      alias: {
        'form-data': 'form-data',
        'node-fetch': 'node-fetch',
      },
    },
    css: {
      // 确保CSS被正确处理
      devSourcemap: true,
    },
    build: {
      // 优化 CSS 代码分割以减少FOUC
      cssCodeSplit: false,
    },
  },

  // 模块配置
  modules: [
    [
      '@nuxt/ui',
      {
        // 禁用 Google Fonts 的预获取
        fonts: false,
      },
    ],
    '@pinia/nuxt', // ✅ 添加 Pinia 模块
    '@nuxtjs/i18n',
  ],

  i18n: {
    lazy: true,
    langDir: '../app/locales',
    locales: [
      {
        code: 'en',
        file: 'en-US.json',
        name: 'English',
      },
      {
        code: 'zh',
        file: 'zh-CN.json',
        name: '简体中文',
      },
      {
        code: 'ar',
        file: 'ar.json',
        name: 'العربية',
      },
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  // CSS 配置
  css: ['~/assets/css/main.css'],

  // 优化 CSS 以防止 FOUC
  features: {
    // 内联关键 CSS
    inlineStyles: true,
  },

  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      companyId: process.env.NUXT_PUBLIC_COMPANY_ID,
      countryCode: process.env.NUXT_PUBLIC_COUNTRY_CODE, // 未设置时由 HTTP 插件用 i18n cookie 或默认 zh-CN
      businessMode: process.env.NUXT_PUBLIC_BUSINESS_MODE || 'b2c', // b2b 或 b2c
    },
  },

  // 自动导入配置
  imports: {
    dirs: ['composables', 'utils'],
  },

  // 组件自动导入配置
  components: {
    dirs: [
      {
        path: '~/components',
        extensions: ['vue'],
        pattern: '**/*.vue', // 递归扫描所有子目录
        pathPrefix: false,
      },
      '~/templateEngines',
    ],
  },
})
