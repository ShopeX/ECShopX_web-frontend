export default defineAppConfig({
  title: 'ECSHOPX',
  description: 'ECSHOPX - 新一代电商解决方案',
  ui: {
    primary: 'sky', // 将主色调设置为天空蓝
    neutral: 'slate'  // 使用 slate 替代默认的 gray
  },
  head: {
    meta: [
      { name: 'description', content: 'ECSHOPX - 新一代电商解决方案' }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  }
}) 