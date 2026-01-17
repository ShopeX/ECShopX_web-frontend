# ECShopX 架构决策规则

本文档提供完整的架构决策规则和模式选择指南。

## 三种架构方案详解

### 方案 1：完整架构
`UI → Composable → Store → API Client → Transformer`

**数据流向**：
1. UI 组件调用 Composable
2. Composable 调用 Store actions
3. Store 调用 API Client
4. API Client 调用后端接口
5. Transformer 转换数据格式
6. Store 更新状态
7. UI 响应式更新

**示例场景**：用户登录流程
```typescript
// pages/login.vue → useAuth() → useUserStore() → authApiClient → AuthTransformer

// 1. 页面调用
const { login } = useAuth()
await login({ username, password })

// 2. Composable 协调
export function useAuth() {
  const userStore = useUserStore()
  
  async function login(credentials) {
    await userStore.login(credentials)
  }
  
  return { login }
}

// 3. Store 处理
export const useUserStore = defineStore('user', {
  actions: {
    async login(credentials) {
      const response = await authApiClient.login(credentials)
      const user = AuthTransformer.toModel(response)
      this.user = user
      this.token = user.token
      // 持久化
      localStorage.setItem('token', user.token)
    }
  }
})
```

**优势**：
- ✅ 全局状态管理，多个组件可访问
- ✅ 支持数据持久化（localStorage）
- ✅ 统一的状态更新逻辑
- ✅ 易于测试和维护

**劣势**：
- ⚠️ 代码层次较多，复杂度高
- ⚠️ Store 会增加内存占用

**适用模块**：
- 用户认证（登录、注册、个人信息）
- 购物车（需要全局访问和持久化）
- 订单管理（跨页面使用）
- 全局配置（主题、语言等）

---

### 方案 2：简化架构
`UI → Composable → API Client → Transformer`

**数据流向**：
1. UI 组件调用 Composable
2. Composable 直接调用 API Client
3. Transformer 转换数据
4. Composable 管理局部状态
5. UI 响应式更新

**示例场景**：商品列表
```typescript
// pages/products/index.vue → useProduct() → itemApiClient → ProductTransformer

// 1. 页面调用
const { products, loading, loadProducts } = useProduct()
onMounted(() => loadProducts())

// 2. Composable 直接处理
export function useProduct() {
  const products = ref([])
  const loading = ref(false)
  
  async function loadProducts(params = {}) {
    loading.value = true
    try {
      const response = await itemApiClient.getItemList(params)
      products.value = ProductTransformer.toModelList(response.list)
    } finally {
      loading.value = false
    }
  }
  
  return { products: readonly(products), loading, loadProducts }
}
```

**优势**：
- ✅ 代码简洁，层次清晰
- ✅ 性能好（组件销毁时自动释放内存）
- ✅ 状态隔离，不会互相影响
- ✅ 适合大多数业务场景

**劣势**：
- ⚠️ 每次进入页面重新请求
- ⚠️ 无法跨组件共享状态

**适用模块**：
- 商品列表/详情（不需要全局共享）
- 搜索结果（局部使用）
- 文章/内容列表
- 表单提交
- 评论功能

---

### 方案 3：最简架构
`UI → 直接处理`

**数据流向**：
1. 在组件中直接使用 Nuxt 内置函数
2. 数据直接渲染

**示例场景**：静态页面
```vue
<!-- pages/about.vue -->
<script setup>
// 直接使用 useFetch
const { data: content } = await useFetch('/api/about')
</script>

<template>
  <div class="container">
    <h1>{{ content?.title }}</h1>
    <div v-html="content?.body"></div>
  </div>
</template>
```

**优势**：
- ✅ 极简代码，快速开发
- ✅ 适合简单场景

**劣势**：
- ⚠️ 不适合复杂逻辑
- ⚠️ 代码可复用性差

**适用模块**：
- 关于我们
- 服务条款
- 帮助中心
- 简单配置获取
- 纯展示页面

---

## 方案选择决策树

```
┌─────────────────────────────────────┐
│      开始开发新功能/模块              │
└───────────┬─────────────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ 是否需要跨组件    │
    │ 共享状态？        │
    └───┬───────────┬───┘
        │           │
      是│          否│
        │           │
        ▼           ▼
    ┌───────┐   ┌───────────────────┐
    │       │   │ 是否有复杂的      │
    │方案 1 │   │ 业务逻辑？        │
    │       │   └───┬───────────┬───┘
    │完整架构│       │           │
    └───────┘     是│          否│
                    │           │
                    ▼           ▼
                ┌───────┐   ┌───────┐
                │       │   │       │
                │方案 2 │   │方案 3 │
                │       │   │       │
                │简化架构│   │最简架构│
                └───────┘   └───────┘
```

### 判断标准

**是否需要跨组件共享状态？**

判断标准：
- [ ] 多个页面需要访问这个数据？
- [ ] Header/Footer 组件需要显示这个数据？
- [ ] 数据需要在应用生命周期内持续存在？
- [ ] 需要 localStorage/sessionStorage 持久化？

如果有任何一个 "是"，则需要 Store（方案 1）

**是否有复杂业务逻辑？**

判断标准：
- [ ] 需要复杂的数据处理/计算？
- [ ] 多个组件会复用这个逻辑？
- [ ] 需要管理 loading/error 等状态？
- [ ] 需要分页/搜索/筛选等功能？
- [ ] 逻辑超过 20 行代码？

如果有 2 个及以上 "是"，则需要 Composable（方案 2）

**两者都不需要？**

使用方案 3（最简架构）

---

## 实际案例分析

### 案例 1：用户个人中心

**需求**：
- 显示用户信息（头像、昵称、等级）
- 可在多个页面访问（Header、个人中心页、订单页）
- 需要持久化登录状态

**分析**：
- ✅ 需要跨组件共享 → 需要 Store
- ✅ 需要持久化 → 需要 Store
- ✅ 复杂度中等 → 需要 Composable

**决策**：方案 1（完整架构）

**实现**：
```
stores/user.ts          # 用户状态管理
composables/useAuth.ts  # 认证逻辑封装
infrastructure/http/clients/AuthApiClient.ts
infrastructure/transformers/authTransformer.ts
```

---

### 案例 2：商品详情页

**需求**：
- 显示单个商品信息
- 只在商品详情页使用
- 不需要持久化
- 有 SKU 选择、数量调整等逻辑

**分析**：
- ❌ 不需要跨组件共享
- ✅ 有复杂业务逻辑 → 需要 Composable
- ❌ 不需要持久化

**决策**：方案 2（简化架构）

**实现**：
```
composables/useProduct.ts  # 商品逻辑封装
infrastructure/http/clients/ItemApiClient.ts
infrastructure/transformers/productTransformer.ts
```

---

### 案例 3：关于我们页面

**需求**：
- 展示公司介绍
- 静态内容
- 只在一个页面使用

**分析**：
- ❌ 不需要跨组件共享
- ❌ 没有复杂业务逻辑
- ❌ 不需要持久化

**决策**：方案 3（最简架构）

**实现**：
```vue
<!-- pages/about.vue -->
<script setup>
const { data } = await useFetch('/api/about')
</script>
```

---

## 架构升级路径

项目可以渐进式升级架构：

```
阶段 1: 快速原型（方案 3）
  ↓ 逻辑变复杂
阶段 2: 提取 Composable（方案 2）
  ↓ 需要共享状态
阶段 3: 添加 Store（方案 1）
```

### 从方案 3 → 方案 2

**场景**：页面逻辑变复杂，需要提取

**步骤**：
1. 创建 Composable 文件
2. 将逻辑移到 Composable
3. 页面使用 Composable

```typescript
// Before (方案 3)
<script setup>
const products = ref([])
const loading = ref(false)

async function loadProducts() {
  loading.value = true
  const response = await $fetch('/api/products')
  products.value = response.data
  loading.value = false
}

onMounted(() => loadProducts())
</script>

// After (方案 2)
<script setup>
const { products, loading, loadProducts } = useProduct()
onMounted(() => loadProducts())
</script>
```

### 从方案 2 → 方案 1

**场景**：需要在多个组件共享状态

**步骤**：
1. 创建 Store
2. Composable 调用 Store
3. 其他组件也可以访问 Store

```typescript
// Before (方案 2)
export function useCart() {
  const items = ref([])  // 局部状态
  
  async function addItem(item) {
    items.value.push(item)
  }
  
  return { items, addItem }
}

// After (方案 1)
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] }),  // 全局状态
  actions: {
    addItem(item) {
      this.items.push(item)
    }
  }
})

export function useCart() {
  const cartStore = useCartStore()
  
  return {
    items: computed(() => cartStore.items),
    addItem: cartStore.addItem
  }
}
```

---

## 性能考虑

### 方案 1（完整架构）性能特点

**优势**：
- ✅ 避免重复请求（数据缓存在 Store）
- ✅ 多个组件共享，减少网络请求

**注意**：
- ⚠️ Store 中的数据会一直占用内存
- ⚠️ 需要手动清理不用的数据

**优化建议**：
```typescript
export const useCartStore = defineStore('cart', {
  actions: {
    // 退出登录时清空购物车
    clear() {
      this.items = []
    }
  }
})
```

### 方案 2（简化架构）性能特点

**优势**：
- ✅ 组件销毁时自动释放内存
- ✅ 状态隔离，不会互相影响

**注意**：
- ⚠️ 每次进入页面重新请求

**优化建议**：
```typescript
// 使用 keepalive 缓存页面
<NuxtPage keep-alive />

// 或者在 Composable 中添加缓存逻辑
const cache = new Map()

export function useProduct() {
  async function loadProducts(params) {
    const key = JSON.stringify(params)
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const data = await fetchProducts(params)
    cache.set(key, data)
    return data
  }
}
```

---

## 最佳实践总结

### ✅ 推荐做法

1. **从简单开始**
   - 默认使用方案 2（简化架构）
   - 按需升级到方案 1

2. **清晰的职责分离**
   - UI 只负责渲染和交互
   - Composable 封装业务逻辑
   - Store 管理全局状态
   - API Client 负责网络请求

3. **统一的错误处理**
   ```typescript
   export function useProduct() {
     const error = ref(null)
     
     async function loadProducts() {
       try {
         // ...
       } catch (e) {
         error.value = e.message
         logger.error('[useProduct] 加载失败:', e)
       }
     }
     
     return { error: readonly(error) }
   }
   ```

4. **类型安全**
   ```typescript
   export function useProduct() {
     const products = ref<IProduct[]>([])  // 明确类型
     
     return {
       products: readonly(products) as Readonly<Ref<IProduct[]>>
     }
   }
   ```

### ❌ 避免做法

1. **过度设计**
   ```typescript
   // ❌ 错误：简单页面也创建 Store
   export const useAboutStore = defineStore('about', {
     // 静态内容不需要 Store
   })
   ```

2. **绕过架构**
   ```typescript
   // ❌ 错误：在组件中直接调用 API Client
   import { itemApiClient } from '~/infrastructure/...'
   const data = await itemApiClient.getList()  // 应该通过 Composable
   ```

3. **状态管理混乱**
   ```typescript
   // ❌ 错误：Store 和 Composable 各自管理状态
   export const useCartStore = defineStore('cart', {
     state: () => ({ items: [] })
   })
   
   export function useCart() {
     const localItems = ref([])  // ❌ 不要重复管理状态
   }
   ```

---

## 架构审查检查清单

开发新功能前，请确认：

**方案选择**：
- [ ] 已明确是否需要跨组件共享状态
- [ ] 已明确是否需要数据持久化
- [ ] 已确定使用的架构方案（1/2/3）
- [ ] 团队成员对方案选择达成共识

**代码组织**：
- [ ] 类型定义在 `types/` 目录
- [ ] API Client 在 `infrastructure/http/clients/`
- [ ] Transformer 在 `infrastructure/transformers/`
- [ ] Store 在 `stores/`（如需要）
- [ ] Composable 在 `composables/`（如需要）

**代码质量**：
- [ ] 所有数据有明确的 TypeScript 类型
- [ ] 使用 `logger` 而非 `console.log`
- [ ] 错误处理完善
- [ ] 代码通过 ESLint 检查

---

**相关文档**：
- `web-rules.md` - Web 开发规范
- `ddd-guide.md` - DDD 开发指南

**最后更新**：2025-01-11
