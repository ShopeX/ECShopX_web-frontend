---
name: ecshopx-account
description: "ECShopX 账号管理功能开发指南。包含用户登录、注册、个人信息、地址管理、订单查看等功能。适用场景: (1) 开发登录注册功能 (2) 用户信息管理 (3) 收货地址管理 (4) 个人中心页面 (5) 权限控制和路由守卫。采用完整架构方案，需要全局状态管理和持久化。"
---

# 账号管理功能开发

## 概述

账号管理是 B2C 商城的基础功能，涉及用户认证、信息管理、权限控制等。

**核心功能**：
- 用户登录/注册
- 个人信息管理
- 收货地址管理
- 订单查看
- 退出登录
- 路由权限控制

**架构方案**：**方案 1（完整架构）** - 用户状态需要全局共享

## 快速开始

### 基本结构

```
app/
├── pages/account/
│   ├── login.vue                 # 登录页
│   ├── register.vue              # 注册页
│   ├── index.vue                 # 个人中心
│   ├── address.vue               # 地址管理
│   └── orders.vue                # 我的订单
│
├── components/business/account/
│   ├── LoginForm.vue             # 登录表单
│   ├── RegisterForm.vue          # 注册表单
│   ├── UserProfile.vue           # 用户信息
│   └── AddressCard.vue           # 地址卡片
│
├── composables/
│   ├── useAuth.ts                # 认证逻辑
│   ├── useAuthGuard.ts           # 路由守卫
│   └── useAddress.ts             # 地址管理
│
├── stores/
│   ├── user.ts                   # 用户状态
│   └── address.ts                # 地址状态
│
├── middleware/
│   └── auth.global.ts            # 认证中间件
│
└── infrastructure/http/clients/
    ├── AuthApiClient.ts          # 认证 API
    └── AddressApiClient.ts       # 地址 API
```

## 核心功能实现

### 1. 用户 Store

```typescript
// app/stores/user.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IUser } from '~/types/user'
import { authApiClient } from '~/infrastructure/http/clients/AuthApiClient'
import { logger } from '~/utils/log'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<IUser | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.name || '未登录')
  
  /**
   * 登录
   */
  async function login(credentials: { username: string; password: string }) {
    loading.value = true
    
    try {
      const response = await authApiClient.login(credentials)
      
      token.value = response.token
      user.value = {
        id: response.user_id,
        name: response.user_name,
        mobile: response.mobile,
        avatar: response.avatar
      }
      
      // 持久化 token
      if (process.client) {
        localStorage.setItem('token', response.token)
      }
      
      logger.info('[UserStore] 登录成功:', user.value.name)
    } catch (e: any) {
      logger.error('[UserStore] 登录失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 注册
   */
  async function register(params: {
    username: string
    password: string
    mobile: string
    smsCode: string
  }) {
    loading.value = true
    
    try {
      await authApiClient.register(params)
      
      // 注册成功后自动登录
      await login({
        username: params.username,
        password: params.password
      })
      
      logger.info('[UserStore] 注册成功')
    } catch (e: any) {
      logger.error('[UserStore] 注册失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    if (!token.value) return
    
    try {
      const response = await authApiClient.getUserInfo()
      
      user.value = {
        id: response.user_id,
        name: response.user_name,
        mobile: response.mobile,
        avatar: response.avatar
      }
      
      logger.info('[UserStore] 获取用户信息成功')
    } catch (e: any) {
      logger.error('[UserStore] 获取用户信息失败:', e)
      
      // token 失效，清除登录状态
      logout()
    }
  }
  
  /**
   * 退出登录
   */
  function logout() {
    token.value = null
    user.value = null
    
    if (process.client) {
      localStorage.removeItem('token')
    }
    
    logger.info('[UserStore] 退出登录')
  }
  
  /**
   * 初始化（从 localStorage 恢复）
   */
  function initialize() {
    if (process.client) {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        token.value = savedToken
        // 获取用户信息
        fetchUserInfo()
      }
    }
  }
  
  return {
    // 状态
    user,
    token,
    loading,
    
    // Getters
    isLoggedIn,
    userName,
    
    // Actions
    login,
    register,
    fetchUserInfo,
    logout,
    initialize
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['token']  // 只持久化 token
  }
})
```

### 2. 认证 Composable

```typescript
// app/composables/useAuth.ts

import { computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { useRouter } from 'vue-router'

export function useAuth() {
  const userStore = useUserStore()
  const router = useRouter()
  const message = useMessage()
  
  /**
   * 登录
   */
  const login = async (credentials: {
    username: string
    password: string
  }): Promise<boolean> => {
    try {
      await userStore.login(credentials)
      message.success('登录成功')
      return true
    } catch (error: any) {
      message.error(`登录失败: ${error.message}`)
      return false
    }
  }
  
  /**
   * 注册
   */
  const register = async (params: {
    username: string
    password: string
    mobile: string
    smsCode: string
  }): Promise<boolean> => {
    try {
      await userStore.register(params)
      message.success('注册成功')
      return true
    } catch (error: any) {
      message.error(`注册失败: ${error.message}`)
      return false
    }
  }
  
  /**
   * 退出登录
   */
  const logout = async () => {
    userStore.logout()
    message.success('已退出登录')
    router.push('/account/login')
  }
  
  /**
   * 检查登录状态
   */
  const checkAuth = (): boolean => {
    if (!userStore.isLoggedIn) {
      message.warning('请先登录')
      router.push('/account/login')
      return false
    }
    return true
  }
  
  return {
    // 状态
    user: computed(() => userStore.user),
    isLoggedIn: computed(() => userStore.isLoggedIn),
    userName: computed(() => userStore.userName),
    loading: computed(() => userStore.loading),
    
    // 方法
    login,
    register,
    logout,
    checkAuth
  }
}
```

### 3. 登录页面

```vue
<!-- app/pages/account/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-2xl font-bold text-center mb-6">用户登录</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- 用户名 -->
        <div>
          <label class="block text-sm font-medium mb-2">用户名/手机号</label>
          <UInput
            v-model="form.username"
            placeholder="请输入用户名或手机号"
            size="lg"
            required
          />
        </div>
        
        <!-- 密码 -->
        <div>
          <label class="block text-sm font-medium mb-2">密码</label>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="lg"
            required
          />
        </div>
        
        <!-- 记住密码 -->
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input 
              v-model="rememberMe" 
              type="checkbox" 
              class="mr-2"
            />
            <span class="text-sm">记住密码</span>
          </label>
          
          <NuxtLink 
            to="/account/forgot-password" 
            class="text-sm text-primary hover:underline"
          >
            忘记密码?
          </NuxtLink>
        </div>
        
        <!-- 登录按钮 -->
        <UButton 
          type="submit"
          block 
          size="lg"
          :loading="loading"
        >
          登录
        </UButton>
        
        <!-- 注册链接 -->
        <div class="text-center text-sm text-gray-600">
          还没有账号？
          <NuxtLink 
            to="/account/register" 
            class="text-primary hover:underline"
          >
            立即注册
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { login, loading } = useAuth()

const form = ref({
  username: '',
  password: ''
})

const rememberMe = ref(false)

// 登录
const handleLogin = async () => {
  const success = await login(form.value)
  
  if (success) {
    // 登录成功，跳转到来源页或首页
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  }
}

// SEO
useHead({
  title: '用户登录',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>
```

### 4. 路由守卫

```typescript
// app/middleware/auth.global.ts

export default defineNuxtRouteMiddleware((to, from) => {
  // 客户端才执行
  if (process.server) return
  
  const userStore = useUserStore()
  
  // 需要登录的路由
  const authRequiredRoutes = [
    '/account',
    '/checkout',
    '/orders'
  ]
  
  // 检查是否需要登录
  const requiresAuth = authRequiredRoutes.some(route => 
    to.path.startsWith(route)
  )
  
  if (requiresAuth && !userStore.isLoggedIn) {
    // 未登录，跳转到登录页
    return navigateTo({
      path: '/account/login',
      query: { redirect: to.fullPath }
    })
  }
  
  // 已登录用户访问登录/注册页，跳转到首页
  if (userStore.isLoggedIn && (to.path === '/account/login' || to.path === '/account/register')) {
    return navigateTo('/')
  }
})
```

### 5. 地址管理

```typescript
// app/composables/useAddress.ts

import { ref, computed } from 'vue'
import type { IAddress } from '~/types/address'
import { addressApiClient } from '~/infrastructure/http/clients/AddressApiClient'
import { logger } from '~/utils/log'

export function useAddress() {
  const addresses = ref<IAddress[]>([])
  const loading = ref(false)
  
  // 默认地址
  const defaultAddress = computed(() => 
    addresses.value.find(addr => addr.isDefault)
  )
  
  /**
   * 加载地址列表
   */
  async function loadAddresses() {
    loading.value = true
    
    try {
      const response = await addressApiClient.getAddressList()
      addresses.value = response.list.map(addr => ({
        id: addr.address_id,
        consignee: addr.consignee,
        mobile: addr.mobile,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        detail: addr.detail,
        fullAddress: `${addr.province}${addr.city}${addr.district}${addr.detail}`,
        isDefault: addr.is_default
      }))
      
      logger.info('[useAddress] 加载地址成功:', addresses.value.length)
    } catch (e: any) {
      logger.error('[useAddress] 加载地址失败:', e)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 添加地址
   */
  async function addAddress(address: Omit<IAddress, 'id'>) {
    try {
      await addressApiClient.addAddress(address)
      await loadAddresses()
      
      logger.info('[useAddress] 添加地址成功')
      return true
    } catch (e: any) {
      logger.error('[useAddress] 添加地址失败:', e)
      throw e
    }
  }
  
  /**
   * 更新地址
   */
  async function updateAddress(id: string, address: Partial<IAddress>) {
    try {
      await addressApiClient.updateAddress(id, address)
      await loadAddresses()
      
      logger.info('[useAddress] 更新地址成功')
      return true
    } catch (e: any) {
      logger.error('[useAddress] 更新地址失败:', e)
      throw e
    }
  }
  
  /**
   * 删除地址
   */
  async function deleteAddress(id: string) {
    try {
      await addressApiClient.deleteAddress(id)
      addresses.value = addresses.value.filter(addr => addr.id !== id)
      
      logger.info('[useAddress] 删除地址成功')
      return true
    } catch (e: any) {
      logger.error('[useAddress] 删除地址失败:', e)
      throw e
    }
  }
  
  /**
   * 设置默认地址
   */
  async function setDefaultAddress(id: string) {
    try {
      await addressApiClient.setDefaultAddress(id)
      
      // 本地更新
      addresses.value.forEach(addr => {
        addr.isDefault = addr.id === id
      })
      
      logger.info('[useAddress] 设置默认地址成功')
      return true
    } catch (e: any) {
      logger.error('[useAddress] 设置默认地址失败:', e)
      throw e
    }
  }
  
  return {
    addresses: computed(() => addresses.value),
    defaultAddress,
    loading: computed(() => loading.value),
    
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
}
```

## 开发检查清单

**认证功能**：
- [ ] 创建用户 Store
- [ ] 实现登录功能
- [ ] 实现注册功能
- [ ] 实现退出登录
- [ ] Token 持久化
- [ ] 自动登录

**页面**：
- [ ] 登录页
- [ ] 注册页
- [ ] 个人中心页
- [ ] 地址管理页

**路由守卫**：
- [ ] 创建认证中间件
- [ ] 配置需要登录的路由
- [ ] 登录后重定向

**地址管理**：
- [ ] 地址列表
- [ ] 添加地址
- [ ] 编辑地址
- [ ] 删除地址
- [ ] 设置默认地址

## 常见问题

**Q: Token 何时过期？**
A: 根据后端设置。前端应捕获 401 错误，清除登录状态并跳转到登录页。

**Q: 如何实现"记住密码"？**
A: 将加密后的密码存储在 localStorage，下次自动填充（注意安全性）。

**Q: 路由守卫在哪里配置？**
A: 使用 Nuxt 中间件（`middleware/auth.global.ts`），自动应用到所有路由。

**Q: 如何处理登录过期？**
A: 在 HTTP 插件中拦截 401 响应，清除登录状态并跳转到登录页。

---

**相关 Skills**：
- `ecshopx-system` - 系统基础架构
- `ecshopx-checkout` - 结账流程（使用地址）

**最后更新**：2025-01-11
