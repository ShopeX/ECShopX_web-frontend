# API Client 延迟初始化修复

## 问题描述

页面刷新时出现 500 错误：

```
[nuxt] A composable that requires access to the Nuxt instance was called 
outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function.
```

## 错误堆栈

```
useNuxtApp  nuxt/dist/app/nuxt.js:259:13
tApiClient  ./app/infrastructure/http/clients/CartApiClient.ts:9:59
anonymous   ./app/infrastructure/http/clients/CartApiClient.ts:163:23
```

## 根本原因

### 问题代码

在 `CartApiClient.ts`、`ItemApiClient.ts` 和 `AuthApiClient.ts` 中：

```typescript
export class CartApiClient {
  private $api: any

  constructor() {
    // ❌ 错误：在构造函数中调用 useNuxtApp()
    if (process.client || process.server) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
  }

  private get http() {
    return this.$api
  }
}

// ❌ 错误：在模块顶层创建实例
export const cartApiClient = new CartApiClient()
```

### 问题分析

1. **模块顶层实例化**: `export const cartApiClient = new CartApiClient()`
2. **构造函数调用 Composable**: 构造函数中立即调用 `useNuxtApp()`
3. **时机错误**: 模块加载时还没有 Nuxt 上下文，导致错误

**执行流程**：
```
模块导入 
  → new CartApiClient() 
  → constructor() 
  → useNuxtApp() ❌ 
  → 错误：Not in Nuxt context
```

## 解决方案

### 延迟初始化

将 `useNuxtApp()` 的调用延迟到第一次使用时：

```typescript
export class CartApiClient {
  private $api: any

  constructor() {
    // ✅ 正确：不在构造函数中初始化
  }

  /**
   * 获取 HTTP 实例（延迟初始化，SSR 安全）
   */
  private get http() {
    // ✅ 正确：在第一次使用时才调用 useNuxtApp()
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }
}

// ✅ 仍然可以导出单例（构造函数为空，安全）
export const cartApiClient = new CartApiClient()
```

### 工作原理

**修复后的执行流程**：
```
模块导入 
  → new CartApiClient()  // 只创建对象，不调用 useNuxtApp()
  → export cartApiClient ✅

使用时（在 Composable 中）
  → cartApiClient.getCartList()
  → 调用 http getter
  → 首次调用 useNuxtApp() ✅
  → 此时已在 Nuxt 上下文中
```

## 修复的文件

1. ✅ `app/infrastructure/http/clients/CartApiClient.ts`
2. ✅ `app/infrastructure/http/clients/ItemApiClient.ts`
3. ✅ `app/infrastructure/http/clients/AuthApiClient.ts`

## 优点

### 1. **SSR 安全**
- 模块加载时不会调用 `useNuxtApp()`
- 只在真正使用时才初始化（此时已在 Nuxt 上下文中）

### 2. **保持单例模式**
- 仍然可以导出单例实例
- 使用方式不变，无需修改业务代码

### 3. **懒加载性能**
- 不使用的 API Client 不会初始化
- 减少应用启动开销

## 使用示例

### 在 Composable 中使用（不变）

```typescript
import { cartApiClient } from '~/infrastructure/http/clients'

export function useCart() {
  // ✅ 直接使用，不需要任何改变
  const loadCart = async () => {
    const response = await cartApiClient.getCartList()
    return response
  }

  return { loadCart }
}
```

### 在页面组件中使用（不变）

```vue
<script setup>
import { cartApiClient } from '~/infrastructure/http/clients'

onMounted(async () => {
  // ✅ 直接使用，不需要任何改变
  const cart = await cartApiClient.getCartList()
  console.log(cart)
})
</script>
```

## 测试验证

### 1. 手动测试
```bash
# 启动开发服务器
pnpm run dev

# 测试以下场景：
# 1. 直接访问 /item/list 并刷新 ✅
# 2. 直接访问 /cart 并刷新 ✅
# 3. 从首页导航到商品列表 ✅
# 4. 添加商品到购物车 ✅
```

### 2. 检查错误
打开浏览器控制台，确认：
- ✅ 没有 "useNuxtApp outside context" 错误
- ✅ 页面正常渲染
- ✅ API 请求正常发送

## 相关问题

### 为什么之前没有发现？

1. **开发时没问题**: 热重载（HMR）时模块在 Nuxt 上下文中重新加载
2. **刷新才暴露**: 完整的页面刷新才会触发模块的冷启动
3. **SSR 时暴露**: 服务端渲染时会重新加载所有模块

### 类似的坑

任何在**模块顶层**或**类构造函数**中调用 Nuxt Composable 都会有这个问题：

```typescript
// ❌ 错误示例
const app = useNuxtApp()  // 模块顶层

class MyService {
  constructor() {
    const app = useNuxtApp()  // 构造函数中
  }
}
const service = new MyService()  // 模块顶层实例化
```

## 最佳实践

### 1. 延迟初始化 Composable

```typescript
class MyApiClient {
  private _api: any

  // ✅ 使用 getter 延迟初始化
  private get api() {
    if (!this._api) {
      this._api = useNuxtApp().$api
    }
    return this._api
  }
}
```

### 2. 避免模块顶层调用 Composable

```typescript
// ❌ 错误
const app = useNuxtApp()
const config = useRuntimeConfig()

// ✅ 正确 - 在函数或 getter 中调用
export function getConfig() {
  return useRuntimeConfig()
}
```

### 3. 构造函数保持纯粹

```typescript
class MyClass {
  constructor() {
    // ✅ 只做简单的赋值和初始化
    // ❌ 不调用 Composable
    // ❌ 不调用异步操作
  }
}
```

## 总结

### 问题
- API Client 在构造函数中调用 `useNuxtApp()`
- 模块顶层实例化导致在 Nuxt 上下文外调用

### 解决
- 使用 getter 延迟初始化
- 首次使用时才调用 `useNuxtApp()`

### 结果
- ✅ SSR 安全
- ✅ 单例模式保持不变
- ✅ 使用方式无需改变
- ✅ 页面刷新正常

---

**修复日期**: 2025-01-09  
**影响范围**: 所有使用 API Client 的页面和组件  
**状态**: ✅ 已修复并验证

