import { logger } from '~/utils/log'
// 全局中间件 - 每个路由都会执行
export default defineNuxtRouteMiddleware((to, from) => {
  logger.info(`路由导航: ${from?.path || '/'} -> ${to.path}`)

  // 在这里可以进行全局路由检查
  // 例如：用户认证状态检查

  // 如果需要重定向，返回 navigateTo()
  // if (!userAuthenticated && to.path !== '/login') {
  //   return navigateTo('/login')
  // }
})
