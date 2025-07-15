// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  components: {
    dirs: [
      '~/components',
    ]
  },
  app: {
    head: {
      title: 'ECshopex - 华为商城',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ECshopex 华为商城 - 基于 Nuxt 4 的电商平台' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap'
        }
      ]
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    config: {
      content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
      ],
      theme: {
        extend: {
          colors: {
            primary: '#007AFF',
            secondary: '#666666',
            dark: '#333333',
            light: '#f7f7fa',
          },
          fontFamily: {
            sans: ['Noto Sans SC', 'sans-serif'],
          },
        },
      },
    }
  }
}) 