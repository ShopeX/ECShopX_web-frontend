# SSR 架构分析：$fetch vs useFetch

## 项目 SSR 需求

### ✅ 需要 SSR 的页面（SEO + 首屏性能）
1. **首页** - `/`
2. **商品列表页** - `/item/list`
3. **商品详情页** - `/item/:id`
4. **自定义活动页** - `/activity/:id`

### 🔄 客户端渲染的页面
- 购物车 `/cart` - 需要登录
- 登录页 `/login` - 无需 SSR
- 个人中心 `/user/*` - 需要登录
- 订单页 `/order/*` - 需要登录

---

## 核心问题：当前架构是否需要 useFetch？

### 当前架构

```
页面组件 (Page)
   ↓
Composable (useProduct)
   ↓ 管理状态 (ref, computed)
API Client (ItemApiClient)
   ↓ 返回 Promise
$api ($fetch)
   ↓
Backend API
```

### 如果使用 useFetch 的架构

```
页面组件 (Page)
   ↓ 直接调用
useFetch('/api/products')
   ↓ 返回 AsyncData
   ↓ 跳过 Composable 和 API Client
Backend API
```

---

## 深度对比：$fetch vs useFetch

### 场景 1️⃣：商品列表页（SSR）

#### 方案 A：当前架构 - $fetch + 手动 SSR

```vue
<!-- pages/item/list.vue -->
<script setup>
import { useProduct } from '~/composables/useProduct'

const { products, listLoading, loadProducts } = useProduct()

// ❌ 问题：数据在客户端才加载，SSR 无数据
onMounted(async () => {
  await loadProducts({ page: '1', pageSize: '20' })
})
</script>

<template>
  <!-- SSR HTML：空白（没有商品数据）-->
  <div v-if="listLoading">Loading...</div>
  <div v-else>
    <ProductCard v-for="p in products" :key="p.id" :product="p" />
  </div>
</template>
```

**问题：**
- ✅ 架构清晰，职责分离
- ❌ SSR 时没有数据（首屏空白）
- ❌ SEO 不友好（爬虫看到的是 loading）
- ❌ 首屏性能差（客户端才开始请求）

---

#### 方案 B：useFetch 直接调用

```vue
<!-- pages/item/list.vue -->
<script setup>
// ✅ 自动处理 SSR
const { data: products, pending } = await useFetch('/goods/items', {
  query: { page: '1', pageSize: '20' },
  server: true,  // SSR 时执行
})
</script>

<template>
  <!-- SSR HTML：包含商品数据 -->
  <div v-if="pending">Loading...</div>
  <div v-else>
    <ProductCard v-for="p in products?.data?.list" :key="p.id" :product="p" />
  </div>
</template>
```

**优点：**
- ✅ SSR 时有数据（首屏完整）
- ✅ SEO 友好
- ✅ 无双重请求
- ✅ 自动数据传递

**缺点：**
- ❌ 跳过了 Composable 层（业务逻辑分散）
- ❌ 跳过了 API Client 层（URL 硬编码）
- ❌ 跳过了 Transformer 层（数据未转换）
- ❌ 破坏了架构设计

---

#### 方案 C：混合架构（推荐）⭐

```vue
<!-- pages/item/list.vue -->
<script setup>
import { itemApiClient } from '~/infrastructure/http/clients'
import { ProductTransformer } from '~/infrastructure/transformers'

// ✅ 使用 useAsyncData + API Client
const { data: rawResponse, pending, error } = await useAsyncData(
  'products-list',  // 缓存 key
  () => itemApiClient.getItemList({
    page: '1',
    pageSize: '20',
    item_type: 'normal',
    main_category: route.query.category as string,
  }),
  {
    server: true,  // SSR 时执行
  }
)

// ✅ 使用 Transformer 转换数据
const products = computed(() => {
  if (!rawResponse.value?.data?.list) return []
  return ProductTransformer.toModelList(rawResponse.value.data.list)
})

const totalCount = computed(() => rawResponse.value?.data?.total_count || 0)
</script>

<template>
  <!-- SSR HTML：包含转换后的商品数据 -->
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <ProductCard v-for="p in products" :key="p.id" :product="p" />
  </div>
</template>
```

**优点：**
- ✅ 保持架构完整（使用 API Client + Transformer）
- ✅ SSR 友好（数据自动传递）
- ✅ SEO 友好
- ✅ 无双重请求
- ✅ 类型安全

**缺点：**
- ⚠️ 绕过了 Composable 层（对于首屏数据可接受）

---

### 场景 2️⃣：购物车页（客户端渲染）

```vue
<!-- pages/cart/index.vue -->
<script setup>
import { useCart } from '~/composables/useCart'

const { cart, cartUI, loading, loadCart } = useCart()

// ✅ 当前方案完美
onMounted(async () => {
  await loadCart()  // 客户端加载，有 token
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <CartItem v-for="item in cartUI.items" :key="item.id" :item="item" />
  </div>
</template>
```

**评估：**
- ✅ 不需要 SSR（购物车无需 SEO）
- ✅ 需要 token（客户端才有）
- ✅ 当前架构完美适配
- ❌ 不应该用 useFetch

---

## 架构决策矩阵

| 页面类型 | 是否SSR | 推荐方案 | 原因 |
|---------|--------|---------|------|
| **商品列表** | ✅ | `useAsyncData` + API Client | SEO + 首屏性能 |
| **商品详情** | ✅ | `useAsyncData` + API Client | SEO + 首屏性能 |
| **首页** | ✅ | `useAsyncData` + API Client | SEO + 首屏性能 |
| **活动页** | ✅ | `useAsyncData` + API Client | SEO + 首屏性能 |
| **购物车** | ❌ | `onMounted` + Composable | 需要登录 |
| **登录页** | ❌ | `onMounted` + Composable | 无需 SSR |
| **个人中心** | ❌ | `onMounted` + Composable | 需要登录 |
| **订单页** | ❌ | `onMounted` + Composable | 需要登录 |

---

## 推荐架构方案

### 📐 **双层架构**

```
SSR 页面（首屏数据）
   ├─ useAsyncData + API Client + Transformer
   └─ 直接在页面组件处理

客户端页面（用户交互）
   ├─ Composable (useCart, useAuth)
   ├─ API Client
   └─ $api ($fetch)
```

### 具体实现模式

#### 1️⃣ **SSR 页面：使用 useAsyncData**

```vue
<!-- pages/item/list.vue -->
<script setup>
import { itemApiClient } from '~/infrastructure/http/clients'
import { ProductTransformer } from '~/infrastructure/transformers'

// 首屏数据：使用 useAsyncData
const { data: response } = await useAsyncData(
  'products',
  () => itemApiClient.getItemList(params)
)

// 转换数据
const products = computed(() => 
  ProductTransformer.toModelList(response.value?.data?.list || [])
)

// 后续交互：使用 Composable
const { addToCart } = useCart()

async function handleAddToCart(product) {
  await addToCart({
    productId: product.id,
    quantity: 1
  })
}
</script>
```

**特点：**
- ✅ 首屏：`useAsyncData` 获取数据（SSR）
- ✅ 交互：Composable 处理业务逻辑（Client）
- ✅ 保持架构分层（API Client + Transformer）

---

#### 2️⃣ **客户端页面：使用 Composable**

```vue
<!-- pages/cart/index.vue -->
<script setup>
import { useCart } from '~/composables/useCart'

// 全部使用 Composable
const { cart, cartUI, loading, loadCart, updateQuantity } = useCart()

onMounted(async () => {
  await loadCart()
})
</script>
```

**特点：**
- ✅ 完整使用 Composable 层
- ✅ 业务逻辑内聚
- ✅ 状态管理清晰

---

## useFetch vs useAsyncData

### **为什么用 useAsyncData 而不是 useFetch？**

| 特性 | useFetch | useAsyncData |
|-----|----------|--------------|
| **用途** | 直接 HTTP 请求 | 包装任何异步函数 |
| **灵活性** | ⚠️ 只能请求 URL | ✅ 可以调用 API Client |
| **架构兼容** | ❌ 跳过 API Client | ✅ 保持架构完整 |
| **数据转换** | ❌ 需要 transform | ✅ 可以用 Transformer |
| **类型安全** | ⚠️ 需要泛型 | ✅ API Client 类型 |

**示例对比：**

```typescript
// ❌ useFetch：跳过架构层
const { data } = await useFetch('/goods/items', {
  query: params,
  transform: (response) => {
    // 需要在这里转换，代码分散
    return response.data.list.map(...)
  }
})

// ✅ useAsyncData：保持架构
const { data } = await useAsyncData(
  'products',
  async () => {
    // 使用 API Client（统一管理）
    const response = await itemApiClient.getItemList(params)
    // 使用 Transformer（职责单一）
    return ProductTransformer.toModelList(response.data.list)
  }
)
```

---

## 最终建议

### ✅ **使用 useAsyncData（而不是 useFetch）**

**原因：**
1. ✅ **保持架构完整性** - 继续使用 API Client 和 Transformer
2. ✅ **类型安全** - 复用 API Client 的类型定义
3. ✅ **职责分离** - 不破坏现有分层
4. ✅ **灵活性高** - 可以调用任何异步函数
5. ✅ **SSR 友好** - 自动处理数据传递

### 📋 **实施计划**

#### 阶段 1：改造 SSR 页面
- [ ] 商品列表页：`useAsyncData` + `itemApiClient`
- [ ] 商品详情页：`useAsyncData` + `itemApiClient`
- [ ] 首页：`useAsyncData` + 相关 API Client
- [ ] 活动页：`useAsyncData` + 相关 API Client

#### 阶段 2：保持客户端页面
- [x] 购物车页：继续使用 `useCart` Composable
- [x] 登录页：继续使用 `useAuth` Composable
- [x] 其他需要登录的页面：继续使用 Composable

#### 阶段 3：优化 API Client
- [ ] 增强 `plugins/http.ts`（自动重试、业务状态码检查）
- [ ] 统一错误处理
- [ ] 完善日志系统

---

## 示例代码

### 商品列表页改造示例

```vue
<script setup lang="ts">
import { itemApiClient } from '~/infrastructure/http/clients'
import { ProductTransformer } from '~/infrastructure/transformers'
import type { IProduct } from '~/components/SpProductCard/types'

// 路由参数
const route = useRoute()

// 筛选参数
const filterParams = reactive({
  page: '1',
  pageSize: '20',
  item_type: 'normal' as const,
  main_category: route.query.category as string || '',
  brand_id: route.query.brand as string || '',
  sort: (route.query.sort as string) || 'default',
})

// SSR 数据获取
const { data: response, pending, error, refresh } = await useAsyncData(
  `products-${JSON.stringify(filterParams)}`,  // 唯一 key
  () => itemApiClient.getItemList({
    page: filterParams.page,
    pageSize: filterParams.pageSize,
    item_type: filterParams.item_type,
    main_category: filterParams.main_category,
    brand_id: filterParams.brand_id || undefined,
    sort: filterParams.sort,
  }),
  {
    server: true,  // SSR 时执行
    lazy: false,   // 立即执行
  }
)

// 转换为 UI 数据
const products = computed<IProduct[]>(() => {
  if (!response.value?.data?.list) return []
  return ProductTransformer.toModelList(response.value.data.list)
})

const totalCount = computed(() => response.value?.data?.total_count || 0)
const brands = computed(() => response.value?.data?.brand_list?.list || [])

// 筛选变更：刷新数据
async function handleFilterChange(newParams: any) {
  Object.assign(filterParams, newParams)
  await refresh()  // 重新请求
}

// 添加到购物车：使用 Composable
const { addToCart } = useCart()

async function handleAddToCart(product: IProduct) {
  await addToCart({
    productId: product.id,
    quantity: 1,
    specId: product.defaultSpecId,
    productName: product.name,
    productImage: product.image,
    price: product.price,
    stock: product.stock,
  })
}
</script>

<template>
  <div class="product-list-page">
    <!-- 筛选器 -->
    <SpFilter :brands="brands" @change="handleFilterChange" />
    
    <!-- 商品列表 -->
    <div v-if="pending" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败: {{ error.message }}</div>
    <div v-else class="products">
      <SpProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart(product)"
      />
    </div>
    
    <!-- 分页 -->
    <Pagination :total="totalCount" :page-size="20" @change="handleFilterChange" />
  </div>
</template>
```

---

## 总结

### ❌ **不需要 useFetch**

**原因：**
- 破坏现有架构（跳过 API Client 和 Transformer）
- 代码分散（URL 和数据转换逻辑混在一起）
- 类型不安全（需要手动定义泛型）

### ✅ **推荐使用 useAsyncData**

**原因：**
- 保持架构完整性
- 复用 API Client 和 Transformer
- 类型安全
- SSR 友好

### 📐 **最终架构**

```
SSR 页面（首屏）：useAsyncData + API Client + Transformer
   └─ 商品列表、商品详情、首页、活动页

客户端页面（交互）：Composable + API Client + $fetch
   └─ 购物车、登录、个人中心、订单

共享层：API Client + Transformer + $api (plugin)
```

**这个架构既满足 SSR 需求，又保持了代码的清晰和可维护性。**

