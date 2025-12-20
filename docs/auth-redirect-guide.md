# 登录重定向功能说明

## 📋 功能概述

当用户访问需要登录的页面或点击需要登录的功能时，系统会自动跳转到登录页面，并在登录成功后自动重定向回原来的页面。

## 🎯 实现方式

### 1. 全局认证中间件

**文件**：`app/middleware/auth.global.ts`

```typescript
// 需要登录才能访问的路由路径前缀
const protectedRoutes = [
  '/member',          // 个人中心
  '/cart',            // 购物车（如果需要登录）
  '/order',           // 订单
  '/account/profile', // 个人信息
]

// 中间件逻辑
export default defineNuxtRouteMiddleware((to, from) => {
  const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route))

  if (requiresAuth && !userStore.isLoggedIn) {
    // 重定向到登录页，携带原路由
    return navigateTo({
      path: '/account/login',
      query: {
        redirect: to.fullPath  // 完整路径，包含 query 和 hash
      }
    })
  }
})
```

**特点**：
- ✅ 自动拦截需要登录的路由
- ✅ 携带完整的原路由信息（包括 query 参数）
- ✅ 统一管理受保护的路由

### 2. 手动跳转登录（如：Header 用户按钮）

**文件**：`app/components/business/headerBar/HeaderBar.vue`

```typescript
const handleUser = () => {
  if (userStore.isLoggedIn) {
    router.push('/member')
  } else {
    // 跳转到登录页，携带当前路由作为 redirect 参数
    const currentPath = router.currentRoute.value.fullPath
    router.push({
      path: '/account/login',
      query: {
        redirect: currentPath
      }
    })
  }
}
```

**使用场景**：
- 点击用户头像/按钮
- 点击"我的订单"
- 点击"收藏"等需要登录的功能

### 3. 登录成功后重定向

**文件**：`app/pages/account/login.vue`

```typescript
// 手机验证码登录成功后
async function handlePhoneLogin() {
  const success = await loginWithPhone({ phone, smsCode })
  
  if (success) {
    await fetchUserInfo()
    
    // 获取 redirect 参数，如果没有则默认跳转首页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  }
}

// 账号密码登录成功后
async function handleAccountLogin() {
  const success = await login({ username, password })
  
  if (success) {
    await fetchUserInfo()
    
    // 获取 redirect 参数，如果没有则默认跳转首页
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  }
}
```

**特点**：
- ✅ 统一处理两种登录方式的重定向
- ✅ 登录成功后先获取用户信息
- ✅ 支持默认跳转首页（没有 redirect 参数时）

## 🔒 受保护的路由列表

当前需要登录才能访问的路由：

| 路由路径 | 说明 | 重定向行为 |
|---------|------|-----------|
| `/member/*` | 个人中心所有页面 | 自动重定向到登录页 |
| `/cart` | 购物车（可选） | 自动重定向到登录页 |
| `/order/*` | 订单相关页面 | 自动重定向到登录页 |
| `/account/profile` | 个人信息编辑 | 自动重定向到登录页 |

### 添加新的受保护路由

在 `app/middleware/auth.global.ts` 中添加路由前缀：

```typescript
const protectedRoutes = [
  '/member',
  '/cart',
  '/order',
  '/account/profile',
  '/favorite',      // ✅ 新增：收藏夹
  '/coupon',        // ✅ 新增：优惠券
]
```

## 📝 使用示例

### 示例 1：用户点击"个人中心"

```typescript
// 用户行为
用户点击 Header 中的用户图标
    ↓
handleUser() 检查登录状态
    ↓
未登录 → 跳转到 /account/login?redirect=/member
    ↓
用户输入账号密码登录
    ↓
登录成功 → 读取 redirect 参数 → 跳转到 /member
```

### 示例 2：用户直接访问订单页面

```typescript
// 用户行为
用户在地址栏输入或点击链接访问 /order/list
    ↓
全局中间件检查路由
    ↓
/order/list 需要登录 → 重定向到 /account/login?redirect=/order/list
    ↓
用户登录成功
    ↓
自动跳转回 /order/list
```

### 示例 3：带查询参数的重定向

```typescript
// 用户行为
用户访问 /member/orders?status=pending&page=2
    ↓
未登录 → 重定向到 /account/login?redirect=/member/orders?status=pending&page=2
    ↓
登录成功 → 跳转到 /member/orders?status=pending&page=2
    ✅ 保留了原始的 query 参数
```

## 🔧 高级配置

### 1. 某些页面不需要登录也能访问购物车

如果购物车可以游客访问，只在结算时才需要登录：

```typescript
// 📁 app/middleware/auth.global.ts
const protectedRoutes = [
  '/member',
  // '/cart',  // ❌ 移除，购物车不需要登录
  '/cart/checkout',  // ✅ 只有结算时需要登录
  '/order',
]
```

### 2. 页面级别的认证控制

如果某个页面有特殊的认证需求，可以使用页面级中间件：

```vue
<!-- 📁 app/pages/member/vip.vue -->
<script setup>
definePageMeta({
  middleware: ['auth', 'vip-check']  // 需要登录且是 VIP
})
</script>
```

### 3. 组件级别的认证控制

```vue
<!-- 📁 app/components/VipContent.vue -->
<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const router = useRouter()

// 检查 VIP 权限
function checkVipAccess() {
  if (!userStore.isLoggedIn) {
    router.push({
      path: '/account/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return false
  }
  
  if (!userStore.userInfo?.isPlusVip) {
    router.push('/member/vip')
    return false
  }
  
  return true
}
</script>
```

## ⚠️ 注意事项

### 1. 安全性

- ✅ **验证 redirect 参数**：防止开放重定向攻击
  ```typescript
  // 推荐：验证 redirect 是否是内部路由
  const redirect = router.currentRoute.value.query.redirect as string
  const isInternalRedirect = redirect && redirect.startsWith('/')
  router.push(isInternalRedirect ? redirect : '/')
  ```

- ❌ **不要重定向到外部 URL**
  ```typescript
  // 危险！可能被用于钓鱼攻击
  const redirect = 'http://evil.com'
  router.push(redirect)  // ❌ 不安全
  ```

### 2. 用户体验

- ✅ **登录成功后显示提示**
  ```typescript
  if (success) {
    await fetchUserInfo()
    showMessage('登录成功')  // ✅ 友好提示
    router.push(redirect || '/')
  }
  ```

- ✅ **保留用户操作上下文**
  ```typescript
  // 示例：用户在商品详情页点击"立即购买"
  router.push({
    path: '/account/login',
    query: {
      redirect: '/cart/checkout',
      from: 'product-detail',      // 来源页面
      productId: '123'              // 商品 ID
    }
  })
  
  // 登录成功后可以自动添加商品到购物车
  ```

### 3. SSR 兼容性

- ✅ **在客户端检查登录状态**
  ```typescript
  // app/middleware/auth.global.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    // ✅ Nuxt 的 middleware 默认在客户端和服务端都会执行
    // ✅ useUserStore() 在 SSR 时会使用服务端的 Store 实例
    const userStore = useUserStore()
    
    if (requiresAuth && !userStore.isLoggedIn) {
      return navigateTo({
        path: '/account/login',
        query: { redirect: to.fullPath }
      })
    }
  })
  ```

### 4. 防止重定向循环

- ✅ **确保登录页不在受保护路由中**
  ```typescript
  // ❌ 错误示例
  const protectedRoutes = [
    '/member',
    '/account/login',  // ❌ 不能包含登录页！
  ]
  
  // ✅ 正确示例
  const protectedRoutes = [
    '/member',
    '/account/profile',  // ✅ 可以包含登录后的个人信息页
  ]
  ```

## 📊 完整流程图

```
用户访问页面
    ↓
    ├─ 访问公开页面（首页、商品列表）
    │   └─> 直接显示
    │
    └─ 访问受保护页面（个人中心、订单）
        ↓
        全局中间件检查
        ↓
        ├─ 已登录
        │   └─> 正常访问
        │
        └─ 未登录
            ↓
            重定向到登录页
            携带参数：?redirect=/original/path
            ↓
            用户输入账号密码
            ↓
            ├─ 登录失败
            │   └─> 显示错误，停留在登录页
            │
            └─ 登录成功
                ↓
                1. 获取用户信息
                2. 读取 redirect 参数
                3. 跳转到原页面
                ↓
                用户继续之前的操作
```

## 🔗 相关文档

- [用户认证流程](./data-flow-architecture.md#用户认证流程)
- [路由中间件文档](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Nuxt 路由守卫](https://nuxt.com/docs/getting-started/routing#route-middleware)

## 🎓 最佳实践总结

1. ✅ **使用全局中间件**统一管理受保护路由
2. ✅ **手动跳转时携带 redirect 参数**，提升用户体验
3. ✅ **登录成功后验证 redirect 参数**，确保安全性
4. ✅ **保留完整路径**（使用 `fullPath` 而不是 `path`）
5. ✅ **提供默认跳转**（redirect 为空时跳转到首页）
6. ✅ **记录日志**，方便调试和追踪用户行为
7. ✅ **友好提示**，让用户知道发生了什么

## 📝 更新日志

- 2024-12-16: 初始版本，实现基础的登录重定向功能
  - 添加全局认证中间件
  - HeaderBar 用户按钮跳转携带 redirect
  - 登录页面处理 redirect 重定向

