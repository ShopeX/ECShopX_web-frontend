# 架构实用指南：何时使用哪种方案

## 🎯 核心原则：**根据复杂度选择架构**

> **不要过度设计，但要为扩展留空间**

## 📊 三种方案对比

### 方案 1：完整架构（推荐用于核心业务）

```
UI → Composable → Store → API Client → Transformer
```

**适用场景**：
- ✅ 需要跨组件共享状态（如：用户信息、购物车）
- ✅ 需要数据持久化（localStorage）
- ✅ 复杂的状态管理（登录、认证）
- ✅ 频繁的状态更新
- ✅ 核心业务逻辑

**例子**：
- 用户登录/注册
- 购物车
- 订单管理
- 用户个人信息

### 方案 2：简化架构（推荐用于一般业务）

```
UI → Composable → API Client → Transformer
```

**适用场景**：
- ✅ 不需要跨组件共享状态
- ✅ 一次性获取数据
- ✅ 简单的列表/详情页
- ✅ 读多写少的场景

**例子**：
- 商品列表（如果不需要共享状态）
- 文章列表
- 静态内容页
- 简单的表单提交

### 方案 3：最简架构（仅用于极简场景）

```
UI → API Client → Transformer
```

**适用场景**：
- ✅ 一次性的简单请求
- ✅ 不需要状态管理
- ✅ 不需要复杂的错误处理
- ✅ 静态数据获取

**例子**：
- 静态配置获取
- 一次性的数据提交
- 工具类页面

## 🤔 你的三个问题详解

### 问题 1：考虑开发便捷也要易扩展

**我的建议：采用「渐进式架构」**

```typescript
// 📋 架构决策树

开始新功能
    ↓
    ├─ 是核心业务？
    │   ├─ 是 → 方案 1（完整架构）
    │   │   例：登录、购物车、订单
    │   │
    │   └─ 否 → 继续判断
    │       ↓
    ├─ 需要跨组件共享状态？
    │   ├─ 是 → 方案 1（完整架构）
    │   │   例：用户信息、主题设置
    │   │
    │   └─ 否 → 继续判断
    │       ↓
    ├─ 有复杂的业务逻辑？
    │   ├─ 是 → 方案 2（简化架构）
    │   │   例：商品列表、文章详情
    │   │
    │   └─ 否 → 方案 3（最简架构）
    │       例：静态页面、配置获取
```

### 问题 2：是否所有页面都对应一个 Composable？

**答案：不是必须的，但推荐有选择地使用**

#### ✅ 建议创建 Composable 的场景

```typescript
// 1. 业务逻辑可复用
// ✅ 多个页面都需要商品相关逻辑
export function useProduct() {
  // 商品列表页用
  // 商品详情页用
  // 首页推荐用
}

// 2. 需要封装复杂逻辑
// ✅ 表单验证、数据处理等
export function useForm() {
  const validate = () => { /* 复杂验证逻辑 */ }
  const submit = () => { /* 提交逻辑 */ }
}

// 3. 需要管理局部状态
// ✅ loading、error、分页等
export function usePagination() {
  const loading = ref(false)
  const currentPage = ref(1)
}
```

#### ❌ 不需要创建 Composable 的场景

```typescript
// 1. 简单的一次性页面
// ❌ 没必要为静态页面创建 Composable
// pages/about.vue
<script setup>
// 直接写在页面中即可
const company = '我的公司'
const description = '公司简介...'
</script>

// 2. 逻辑极简的页面
// ❌ 只是简单展示数据
// pages/terms.vue
<script setup>
const terms = await $fetch('/api/terms')
</script>

// 3. 不会复用的特殊逻辑
// ❌ 只在一个页面用一次
// 直接写在页面组件中
```

### 问题 3：如果不涉及数据状态管理，是否可以跳过 Store？

**答案：是的！完全可以跳过**

#### ✅ 必须使用 Store 的场景

```typescript
// 1. 跨组件共享状态
// ✅ 用户信息需要在多个页面访问
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLoggedIn: false
  })
})

// Header.vue 用
const { userInfo } = useUserStore()

// Profile.vue 用
const { userInfo } = useUserStore()

// 2. 需要持久化
// ✅ 购物车数据需要保存到 localStorage
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  // 自动持久化
  persist: true
})

// 3. 复杂的状态变更
// ✅ 登录状态影响多个模块
export const useUserStore = defineStore('user', {
  actions: {
    async login() {
      // 更新用户信息
      // 更新 token
      // 触发其他模块更新
    }
  }
})
```

#### ✅ 可以跳过 Store 的场景

```typescript
// 1. 不需要共享的列表数据
// ✅ 直接在 Composable 中管理
export function useProductList() {
  const products = ref([])
  
  async function loadProducts() {
    const data = await itemApiClient.getItemList()
    products.value = ProductTransformer.toModelList(data.list)
  }
  
  return { products, loadProducts }
}

// 2. 一次性的数据获取
// ✅ 直接在页面中处理
<script setup>
const { data } = await useFetch('/api/articles')
</script>

// 3. 局部的表单状态
// ✅ 表单数据不需要全局共享
export function useContactForm() {
  const form = ref({ name: '', email: '' })
  
  async function submit() {
    await $fetch('/api/contact', { body: form.value })
  }
  
  return { form, submit }
}
```

## 📝 实战建议

### 方案选择矩阵

| 场景 | 需要共享状态 | 需要持久化 | 逻辑复杂度 | 推荐方案 | Store | Composable |
|------|------------|-----------|-----------|---------|-------|-----------|
| 用户登录 | ✅ 是 | ✅ 是 | 高 | 方案 1 | ✅ 必须 | ✅ 必须 |
| 购物车 | ✅ 是 | ✅ 是 | 高 | 方案 1 | ✅ 必须 | ✅ 必须 |
| 商品列表 | ❌ 否 | ❌ 否 | 中 | 方案 2 | ❌ 可选 | ✅ 推荐 |
| 商品详情 | ❌ 否 | ❌ 否 | 中 | 方案 2 | ❌ 可选 | ✅ 推荐 |
| 文章列表 | ❌ 否 | ❌ 否 | 低 | 方案 2/3 | ❌ 不需要 | ⚠️ 可选 |
| 静态页面 | ❌ 否 | ❌ 否 | 低 | 方案 3 | ❌ 不需要 | ❌ 不需要 |
| 表单提交 | ❌ 否 | ❌ 否 | 中 | 方案 2 | ❌ 不需要 | ✅ 推荐 |
| 搜索功能 | ⚠️ 看情况 | ❌ 否 | 中 | 方案 2 | ❌ 可选 | ✅ 推荐 |

## 🎯 针对你的项目的具体建议

### 方案 A：渐进式混合架构（推荐）

```
核心业务（完整架构）：
  ├─ 用户模块：UI → useAuth → useUserStore → authApiClient
  ├─ 购物车：UI → useCart → useCartStore → cartApiClient
  └─ 订单模块：UI → useOrder → useOrderStore → orderApiClient

一般业务（简化架构）：
  ├─ 商品列表：UI → useProduct → itemApiClient
  ├─ 文章列表：UI → useArticle → articleApiClient
  └─ 评论功能：UI → useComment → commentApiClient

简单页面（最简架构）：
  ├─ 关于我们：UI → 直接使用 useFetch
  ├─ 服务条款：UI → 直接使用 useFetch
  └─ 静态配置：UI → 直接调用 API
```

### 具体到商品模块的建议

```typescript
// 📁 app/composables/useProduct.ts

/**
 * 商品业务逻辑（不使用 Store）
 * 
 * 适用场景：
 * - 商品列表不需要跨页面共享
 * - 每次进入页面重新加载即可
 * - 不需要持久化
 */
export function useProduct() {
  // 局部状态
  const products = ref<IProduct[]>([])
  const loading = ref(false)
  const error = ref('')

  // 加载商品列表
  async function loadProducts(params: IItemListParams) {
    try {
      loading.value = true
      error.value = ''

      // 1. 调用 API Client
      const response = await itemApiClient.getItemList(params)

      // 2. 使用 Transformer 转换
      if (response?.list) {
        products.value = ProductTransformer.toModelList(response.list)
      }

      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    products: readonly(products),
    loading: readonly(loading),
    error: readonly(error),
    loadProducts,
  }
}

// 📁 app/pages/item/list.vue
<script setup>
// ✅ 简单清晰，不需要 Store
const { products, loading, loadProducts } = useProduct()

onMounted(() => {
  loadProducts({ page: '1', pageSize: '20' })
})
</script>
```

**什么时候需要为商品添加 Store？**

```typescript
// 当有以下需求时，再考虑添加 Store：

// 1. 需要在多个页面共享商品数据
// 例如：首页显示推荐商品，列表页也要访问相同数据

// 2. 需要全局的商品筛选状态
// 例如：用户的筛选条件要在多个页面保持

// 3. 需要缓存商品数据
// 例如：避免重复请求，提升性能

// 那时再添加：
export const useProductStore = defineStore('product', {
  state: () => ({
    cachedProducts: new Map(),
    filterState: {}
  })
})
```

## 📋 项目模块架构建议

### ✅ 推荐的分层策略

```typescript
// 📦 模块 1：用户认证（核心）- 完整架构
// 理由：跨组件共享、需要持久化、状态复杂
app/
├── pages/account/
│   └── login.vue          → useAuth() → useUserStore()
├── composables/
│   └── useAuth.ts         ← 封装业务逻辑
├── stores/
│   └── user.ts            ← 全局状态管理
└── infrastructure/
    ├── clients/authApiClient.ts
    └── transformers/authTransformer.ts

// 📦 模块 2：购物车（核心）- 完整架构  
// 理由：跨组件共享、需要持久化
app/
├── pages/cart/
│   └── index.vue          → useCart() → useCartStore()
├── composables/
│   └── useCart.ts
├── stores/
│   └── cart.ts            ← 持久化到 localStorage
└── infrastructure/
    ├── clients/cartApiClient.ts
    └── transformers/cartTransformer.ts

// 📦 模块 3：商品（一般）- 简化架构
// 理由：不需要共享状态、每次重新加载
app/
├── pages/item/
│   ├── list.vue           → useProduct()
│   └── [id].vue           → useProduct()
├── composables/
│   └── useProduct.ts      ← 管理局部状态，直接调用 API
└── infrastructure/
    ├── clients/itemApiClient.ts
    └── transformers/productTransformer.ts
    
// ❌ 不需要 stores/product.ts（除非需要全局状态）

// 📦 模块 4：文章/资讯（简单）- 最简架构
// 理由：静态内容、简单列表
app/
├── pages/articles/
│   ├── index.vue          → 直接 useFetch 或 useAsyncData
│   └── [id].vue           → 直接 useFetch
└── infrastructure/
    └── clients/articleApiClient.ts  ← 可选
```

## 🔄 架构升级路径

```typescript
// 阶段 1：快速开发（最简架构）
// 直接在页面中调用 API
<script setup>
const { data } = await useFetch('/api/products')
</script>

         ↓ 当逻辑变复杂时

// 阶段 2：提取 Composable（简化架构）
// 封装业务逻辑
const { products, loadProducts } = useProduct()

         ↓ 当需要共享状态时

// 阶段 3：添加 Store（完整架构）
// 全局状态管理
const productStore = useProductStore()
```

## ⚡ 性能考虑

### 使用 Store 的性能影响

```typescript
// ✅ Store 的优势
// 1. 避免重复请求
const productStore = useProductStore()
if (productStore.products.length > 0) {
  // 使用缓存数据，不再请求
} else {
  await productStore.loadProducts()
}

// 2. 响应式更新
// 一处更新，多处响应
productStore.updateProduct(id, newData)

// ⚠️ Store 的劣势
// 1. 内存占用（保持所有状态在内存）
// 2. 状态管理复杂度
// 3. 可能的状态污染
```

### 不使用 Store 的性能考虑

```typescript
// ✅ 局部状态的优势
// 1. 内存自动释放（组件销毁时）
// 2. 状态隔离（不会互相影响）
// 3. 简单直观

// ⚠️ 局部状态的劣势
// 1. 每次进入页面重新请求
// 2. 无法跨组件共享
```

## 📊 决策流程图

```
开始新功能
    ↓
是否需要跨组件共享状态？
    ├─ 是 → 使用 Store（方案 1）
    │        例：用户信息、购物车
    │
    └─ 否 → 是否有复杂业务逻辑？
            ├─ 是 → 使用 Composable（方案 2）
            │        例：表单验证、分页
            │
            └─ 否 → 直接在组件中处理（方案 3）
                     例：静态页面、简单列表

需要持久化？
    ├─ 是 → 必须使用 Store + persist
    │        例：购物车、用户设置
    │
    └─ 否 → Composable 即可

逻辑是否会复用？
    ├─ 是 → 提取 Composable
    │        例：useForm, usePagination
    │
    └─ 否 → 写在组件中即可
```

## 🎓 最佳实践总结

### ✅ 推荐做法

```typescript
// 1. 核心业务用完整架构
UI → useAuth → useUserStore → authApiClient → AuthTransformer

// 2. 一般业务用简化架构
UI → useProduct → itemApiClient → ProductTransformer

// 3. 简单页面直接处理
UI → $fetch('/api/data')

// 4. 根据需要渐进式升级
简单 → Composable → Store（按需添加）
```

### ❌ 避免做法

```typescript
// ❌ 1. 为所有页面创建 Store（过度设计）
useAboutStore()  // 静态页面不需要
useTermsStore()  // 简单内容不需要

// ❌ 2. 不需要 Composable 时也创建（增加复杂度）
function useSimplePage() {
  const data = 'static'
  return { data }  // 这种直接写在组件中
}

// ❌ 3. 所有逻辑都写在组件中（难以维护）
<script setup>
// 500 行代码全在这里
</script>
```

## 📚 具体建议给你的项目

### 当前应该采用的架构

```
✅ 完整架构（有 Store）：
├─ 用户模块（useAuth + useUserStore）
├─ 购物车（useCart + useCartStore）
└─ 订单模块（useOrder + useOrderStore）

✅ 简化架构（无 Store）：
├─ 商品列表/详情（useProduct）← 推荐这个
├─ 文章列表（useArticle）
├─ 评论功能（useComment）
└─ 地址管理（useAddress）

✅ 直接处理（无 Composable）：
├─ 关于我们
├─ 服务条款
└─ 帮助中心
```

**结论**：商品模块用**方案 2（简化架构）**最合适 ✅

- ✅ 不需要 Store（不需要跨组件共享）
- ✅ 需要 Composable（有分页、筛选等逻辑）
- ✅ 开发便捷，易于扩展
- ✅ 当需要共享状态时，随时可以升级到方案 1

## 🔗 相关文档

- [数据流向架构](./data-flow-architecture.md) - 完整理论
- [商品模块重构方案](./product-module-refactor-plan.md) - 方案 1 实现
- [DDD 开发指南](./DDD-DEVELOPMENT-GUIDE.md) - 架构设计

