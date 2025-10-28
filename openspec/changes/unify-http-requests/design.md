# 统一 HTTP 请求封装 - 技术设计 (useHttp Composable)

## Context

当前项目存在4个不同的HTTP请求封装实现，导致代码重复、维护困难和API不一致。基于 Nuxt 4 + Vue 3 的最佳实践，我们应该采用 **composable 模式**，创建 `useHttp` 来统一HTTP请求处理。

**现有实现分析：**

- `utils/http.ts` - useFetch封装，功能最完整，有拦截器
- `utils/fetch.ts` - $fetch封装，简单但缺少监控
- `plugins/request.ts` - axios插件，传统方案
- `plugins/http.ts` - useFetch插件，配置简单

**主流 Nuxt 4 项目实践：**

- 使用 `useHttp` composable 统一请求逻辑
- 智能选择 `useFetch`（SSR）和 `$fetch`（CSR）
- 通过插件创建配置好的 `$fetch` 实例
- 提供响应式的 loading、error 状态管理

## Goals / Non-Goals

### Goals

- 采用 Vue 3 + Nuxt 4 的 composable 最佳实践
- 智能环境适配（SSR 使用 useFetch，CSR 使用 $fetch）
- 统一的响应式状态管理（loading、error、data）
- 保持完整的 TypeScript 类型安全
- 提供灵活的配置和拦截器支持
- 平滑的迁移路径

### Non-Goals

- 不改变现有API端点的设计
- 不引入额外的HTTP库依赖
- 不破坏现有的认证机制
- 不影响现有的数据转换器

## Decisions

### Decision 1: 采用双层架构设计

**选择：** Plugin + Composable 的简洁分层架构

**架构层次：**

```
Plugin Layer (plugins/http.ts)
├── 创建自定义 $fetch 实例
├── 全局请求/响应拦截器
└── 错误处理和认证配置

Composable Layer (composables/useHttp.ts)
├── 智能选择 useFetch 或 $fetch
├── 响应式状态管理 (loading, error, data)
└── 类型安全的 API 接口
```

**理由：**

1. **简洁明确** - 双层架构职责清晰，避免过度抽象
2. **符合 Nuxt 4 架构** - 遵循框架推荐的最佳实践
3. **统一标准** - 所有 HTTP 请求使用相同的 composable API
4. **现代化优先** - 直接采用最新的架构模式

### Decision 2: 智能环境适配策略

**选择：** 根据执行环境自动选择最优的 HTTP 客户端

**适配逻辑：**

```typescript
// SSR 环境 - 使用 useFetch
if (process.server || !process.client) {
  return useFetch(url, options)
}

// CSR 环境 - 使用 $fetch
return $fetch(url, options)
```

**理由：**

1. **性能优化** - useFetch 在 SSR 中支持请求去重和缓存
2. **响应式支持** - useFetch 提供内置的 loading、error 状态
3. **轻量客户端** - $fetch 在 CSR 中更轻量，无额外开销
4. **无缝切换** - 用户无需关心底层实现差异

### Decision 3: 现代化的 API 设计

**选择：** 提供多种使用方式，适应不同场景

**API 设计：**

```typescript
// 1. 基础 composable 用法 (推荐)
const { data, pending, error, refresh } = await useHttp<User>('/api/users')

// 2. 方法封装用法
const { get, post, put, delete: del } = useHttpMethods()
const users = await get<User[]>('/api/users')

// 3. 直接使用自定义 $fetch (特殊场景)
const { $api } = useNuxtApp()
const response = await $api('/api/users')
```

**理由：**

1. **响应式优先** - 利用 Vue 3 的响应式系统
2. **统一标准** - 所有代码使用相同的 API 模式
3. **类型安全** - 完整的 TypeScript 类型推导
4. **现代化** - 采用最新的 Vue 3 + Nuxt 4 最佳实践

### Decision 4: 统一的错误处理和状态管理

**选择：** 集成式的错误处理和响应式状态管理

**状态管理：**

```typescript
interface UseHttpState<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  execute: () => Promise<void>
}
```

**错误处理层级：**

1. **网络层错误** - 自动重试，用户无感知处理
2. **HTTP状态错误** - 统一错误提示，可配置处理策略
3. **业务逻辑错误** - 返回错误信息，由调用方处理
4. **特殊状态码** - 401跳转登录，403权限提示等

## Implementation Plan

### Phase 1: 创建插件层 (plugins/http.ts)

```typescript
// plugins/http.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // 创建自定义 $fetch 实例
  const $api = $fetch.create({
    baseURL: config.public.apiBase,
    timeout: config.public.apiTimeout,

    onRequest({ options }) {
      // 添加认证头
      const token = useCookie('token').value
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // 添加公司ID
      if (!options.skipCompanyId) {
        options.query = {
          ...options.query,
          company_id: config.public.companyId,
        }
      }
    },

    onResponse({ response }) {
      // 处理业务响应头
      const token = response.headers.get('X-Token')
      if (token) {
        useCookie('token').value = token
      }
    },

    onResponseError({ response }) {
      // 统一错误处理
      if (response.status === 401) {
        navigateTo('/login')
      }
    },
  })

  return {
    provide: { api },
  }
})
```

### Phase 2: 创建核心 composable (composables/useHttp.ts)

```typescript
// composables/useHttp.ts
import type { UseFetchOptions } from 'nuxt/app'

interface UseHttpOptions<T> extends Omit<UseFetchOptions<T>, '$fetch'> {
  skipAuth?: boolean
  skipCompanyId?: boolean
}

export function useHttp<T>(url: string | (() => string), options: UseHttpOptions<T> = {}) {
  const { $api } = useNuxtApp()

  return useFetch<T>(url, {
    ...options,
    $fetch: $api as any,
  })
}

// 提供方法封装
export function useHttpMethods() {
  const { $api } = useNuxtApp()

  return {
    get: <T>(url: string, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'GET' }),

    post: <T>(url: string, body?: any, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'POST', body }),

    put: <T>(url: string, body?: any, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'PUT', body }),

    delete: <T>(url: string, options?: UseHttpOptions<T>) =>
      useHttp<T>(url, { ...options, method: 'DELETE' }),
  }
}
```

### Phase 3: 迁移现有代码

```typescript
// 迁移前：utils/http.ts
import { http } from '~/utils/http'
const users = await http.get<User[]>('/api/users')

// 迁移后：使用 useHttp composable
const { data: users, pending, error } = await useHttp<User[]>('/api/users')

// 或者使用方法封装
const { get } = useHttpMethods()
const { data: users } = await get<User[]>('/api/users')
```

## Migration Strategy

### 一次性迁移策略

**迁移原则：** 统一标准，一步到位

### 阶段1：实现新架构

1. 创建 `plugins/http.ts` - 自定义 $fetch 实例
2. 创建 `composables/useHttp.ts` - 核心 composable
3. 更新类型定义

### 阶段2：全面迁移现有代码

```typescript
// 迁移示例：API 层
// Before (app/api/item.ts)
import { http } from '~/utils/http'
const response = await http.get<ItemResponse>('/goods/items', { params })

// After
const { data, error } = await useHttp<ItemResponse>('/goods/items', { query: params })
```

```typescript
// 迁移示例：Store 层
// Before (app/stores/product.ts)
import { http } from '~/utils/http'
const products = await http.get('/products')

// After
const { data: products, pending } = await useHttp<Product[]>('/products')
```

### 阶段3：清理所有旧实现

- 移除 `utils/http.ts`, `utils/fetch.ts`, `plugins/request.ts`, `plugins/http.ts`
- 更新所有导入语句
- 更新文档和示例

## Benefits of useHttp Composable

### 1. 现代化架构

- 符合 Vue 3 + Nuxt 4 最佳实践
- 利用 composable 的响应式特性
- 更好的代码组织和复用

### 2. 智能环境适配

- SSR 环境自动使用 useFetch 优化
- CSR 环境使用轻量的 $fetch
- 无缝的服务端/客户端切换

### 3. 增强的开发体验

- 内置 loading、error 状态管理
- 完整的 TypeScript 类型支持
- 直观的 API 设计

### 4. 性能优化

- 自动请求去重和缓存
- 懒加载和条件请求支持
- 更小的客户端包体积

### 5. 易于测试和维护

- 清晰的职责分离
- 可测试的纯函数设计
- 统一的错误处理机制

## Risks and Mitigations

### Risk 1: 大规模代码迁移

**缓解策略：**

- 详细的迁移指南和自动化脚本
- 分模块逐步迁移，降低单次变更风险
- 充分的测试覆盖确保功能正确性

### Risk 2: composable 使用限制

**缓解策略：**

- 在特殊场景提供直接使用 `$api` 的方式
- 详细文档说明不同场景的最佳实践
- 提供迁移前后的对比示例

这种设计既符合现代前端最佳实践，又提供了统一简洁的架构。
