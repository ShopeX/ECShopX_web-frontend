# Product 模块重构总结

## 📋 重构概述

将 `app/composables/domain/product/` 目录下的代码重构为符合新架构的扁平化风格，与 `useCart.ts` 保持一致。

**重构日期**: 2025-01-XX

---

## 🎯 重构目标

1. **统一架构风格**：与 `useCart.ts` 等新架构文件保持一致
2. **扁平化结构**：去除不必要的嵌套目录
3. **简化导入路径**：更符合 Vue 3 生态习惯
4. **合并功能**：将列表和详情合并到一个文件中

---

## 🔄 重构前后对比

### 重构前（旧 DDD 架构）

#### 目录结构
```
app/composables/
└── domain/                          ← 嵌套的 domain 层
    └── product/                     ← 按模块分组
        ├── index.ts                 ← 统一导出
        ├── useProductList.ts        ← 列表功能（160行）
        └── useProductDetail.ts      ← 详情功能（100行）
```

#### 导入方式
```typescript
// ❌ 路径较长且不直观
import { useProductList, useProductDetail } from '~/composables/domain/product'
```

#### 使用方式
```vue
<script setup>
// 需要分别导入
import { useProductList } from '~/composables/domain/product'
import { useProductDetail } from '~/composables/domain/product'

const { products, loadProducts } = useProductList()
const { product, loadProduct } = useProductDetail()
</script>
```

---

### 重构后（新轻量级 DDD 架构）

#### 目录结构
```
app/composables/
├── useCart.ts               ← 扁平化
├── useProduct.ts            ← 新文件（合并后约270行）
├── useTheme.ts
├── useI18n.ts
└── useMessage.ts
```

#### 导入方式
```typescript
// ✅ 路径简短直观
import { useProduct } from '~/composables/useProduct'
```

#### 使用方式
```vue
<script setup>
// 一次导入，获取所有功能
import { useProduct } from '~/composables/useProduct'

const { 
  // 列表相关
  products, 
  loadProducts, 
  loadMore,
  
  // 详情相关
  product, 
  loadProduct 
} = useProduct()
</script>
```

---

## 📊 重构改进

### 1️⃣ 结构简化

| 项目 | 重构前 | 重构后 | 改进 |
|------|--------|--------|------|
| **目录层级** | 3 层 | 2 层 | ✅ 减少 1 层 |
| **文件数量** | 3 个文件 | 1 个文件 | ✅ 减少 67% |
| **导入路径** | `~/composables/domain/product` | `~/composables/useProduct` | ✅ 缩短 40% |

### 2️⃣ 代码改进

#### 旧架构代码示例

```typescript
// ❌ 分散在两个文件中
// useProductList.ts
export function useProductList() {
  const products = ref<IProduct[]>([])
  const loading = ref(false)
  
  async function loadProducts(params: IItemListParams) {
    // ...
  }
  
  return { products, loading, loadProducts }
}

// useProductDetail.ts
export function useProductDetail() {
  const product = ref<IProduct | null>(null)
  const loading = ref(false)  // ⚠️ 命名冲突
  
  async function loadProduct(params: IItemDetailParams) {
    // ...
  }
  
  return { product, loading, loadProduct }
}
```

**问题**：
- ❌ 分散在两个文件，需要多次导入
- ❌ `loading` 命名冲突，使用时容易混淆
- ❌ 无法共享状态和工具函数

#### 新架构代码示例

```typescript
// ✅ 合并在一个文件中
export function useProduct() {
  // 列表状态
  const products = ref<IProduct[]>([])
  const listLoading = ref(false)  // ✅ 命名清晰
  
  // 详情状态
  const product = ref<IProduct | null>(null)
  const detailLoading = ref(false)  // ✅ 命名清晰
  
  async function loadProducts(params: IItemListParams) {
    // ...
  }
  
  async function loadProduct(params: IItemDetailParams) {
    // ...
  }
  
  return {
    // 列表
    products,
    listLoading,
    loadProducts,
    
    // 详情
    product,
    detailLoading,
    loadProduct,
  }
}
```

**优势**：
- ✅ 单一入口，一次导入
- ✅ 命名清晰，避免冲突
- ✅ 可以共享状态和工具函数
- ✅ 更易于维护和扩展

---

## 🎨 API 设计优化

### 命名规范改进

| 状态/方法 | 旧命名 | 新命名 | 说明 |
|----------|--------|--------|------|
| 列表加载状态 | `loading` | `listLoading` | ✅ 更明确 |
| 详情加载状态 | `loading` | `detailLoading` | ✅ 避免冲突 |
| 列表错误 | `error` | `listError` | ✅ 更明确 |
| 详情错误 | `error` | `detailError` | ✅ 避免冲突 |
| 重置列表 | `reset()` | `resetList()` | ✅ 更明确 |
| 重置详情 | `reset()` | `resetDetail()` | ✅ 更明确 |

### 完整 API

```typescript
const {
  // ==================== 列表相关 ====================
  
  // 状态
  products,          // 商品列表
  brands,            // 品牌列表
  totalCount,        // 总数
  listLoading,       // 列表加载状态
  listError,         // 列表错误信息
  
  // 计算属性
  hasProducts,       // 是否有商品
  isListEmpty,       // 列表是否为空
  
  // 方法
  loadProducts,      // 加载商品列表
  loadMore,          // 加载更多（分页）
  resetList,         // 重置列表状态
  
  // ==================== 详情相关 ====================
  
  // 状态
  product,           // 商品详情
  detailLoading,     // 详情加载状态
  detailError,       // 详情错误信息
  
  // 计算属性
  hasProduct,        // 是否有详情
  
  // 方法
  loadProduct,       // 加载商品详情
  resetDetail,       // 重置详情状态
  
  // ==================== 通用 ====================
  
  reset,             // 重置所有状态
  
} = useProduct()
```

---

## 📝 使用场景

### 场景 1: 商品列表页

```vue
<template>
  <div>
    <div v-if="listLoading">加载中...</div>
    
    <div v-else-if="isListEmpty">暂无商品</div>
    
    <div v-else>
      <ProductCard 
        v-for="item in products" 
        :key="item.itemId" 
        :product="item" 
      />
      
      <button @click="handleLoadMore" :disabled="listLoading">
        加载更多
      </button>
    </div>
  </div>
</template>

<script setup>
import { useProduct } from '~/composables/useProduct'

const { 
  products, 
  listLoading, 
  isListEmpty,
  loadProducts, 
  loadMore 
} = useProduct()

// 初始加载
onMounted(async () => {
  await loadProducts({ page: '1', pageSize: '20' })
})

// 加载更多
const currentPage = ref(1)
const handleLoadMore = async () => {
  currentPage.value++
  await loadMore({ 
    page: String(currentPage.value), 
    pageSize: '20' 
  })
}
</script>
```

### 场景 2: 商品详情页

```vue
<template>
  <div>
    <div v-if="detailLoading">加载中...</div>
    
    <div v-else-if="!hasProduct">商品不存在</div>
    
    <div v-else>
      <h1>{{ product.itemName }}</h1>
      <p>价格: {{ product.price }}</p>
      <button @click="handleAddToCart">加入购物车</button>
    </div>
  </div>
</template>

<script setup>
import { useProduct } from '~/composables/useProduct'
import { useCart } from '~/composables/useCart'

const route = useRoute()
const { product, detailLoading, hasProduct, loadProduct } = useProduct()
const { addToCart } = useCart()

// 加载商品详情
onMounted(async () => {
  await loadProduct({ id: route.params.id as string })
})

// 加入购物车
const handleAddToCart = async () => {
  if (!product.value) return
  
  await addToCart({
    productId: product.value.itemId,
    specId: product.value.specId || 'default',
    quantity: 1
  })
}
</script>
```

### 场景 3: 同时使用列表和详情

```vue
<template>
  <div>
    <!-- 推荐商品列表 -->
    <section>
      <h2>推荐商品</h2>
      <ProductCard 
        v-for="item in products" 
        :key="item.itemId" 
        :product="item" 
      />
    </section>
    
    <!-- 当前查看的商品详情 -->
    <section v-if="hasProduct">
      <h2>商品详情</h2>
      <ProductDetail :product="product" />
    </section>
  </div>
</template>

<script setup>
import { useProduct } from '~/composables/useProduct'

// ✅ 一次导入，同时使用列表和详情
const { 
  products, 
  loadProducts,
  product,
  loadProduct,
  hasProduct
} = useProduct()

onMounted(async () => {
  // 同时加载列表和详情
  await Promise.all([
    loadProducts({ page: '1', pageSize: '5' }),
    loadProduct({ id: route.params.id })
  ])
})
</script>
```

---

## 🔍 对比其他 Composables

### 统一的架构风格

所有 composables 现在都采用相同的风格：

```typescript
// ✅ 所有 composables 都在同一层级
app/composables/
├── useCart.ts        // 购物车
├── useProduct.ts     // 商品（新）
├── useOrder.ts       // 订单（将来）
├── useUser.ts        // 用户（将来）
├── useTheme.ts       // 主题
├── useI18n.ts        // 国际化
└── useMessage.ts     // 消息提示
```

### 统一的导入方式

```typescript
// ✅ 所有导入都是相同的模式
import { useCart } from '~/composables/useCart'
import { useProduct } from '~/composables/useProduct'
import { useOrder } from '~/composables/useOrder'
import { useUser } from '~/composables/useUser'
import { useTheme } from '~/composables/useTheme'
import { useI18n } from '~/composables/useI18n'
```

---

## ✅ 重构清单

- [x] 创建新的 `useProduct.ts` 文件
- [x] 合并 `useProductList` 功能
- [x] 合并 `useProductDetail` 功能
- [x] 优化命名避免冲突
- [x] 删除旧的 `domain/product/` 目录
- [x] 删除 `useProductList.ts`
- [x] 删除 `useProductDetail.ts`
- [x] 删除 `index.ts` 导出文件
- [x] 删除空的 `domain/` 目录
- [x] 更新文档

---

## 📚 相关文档

- [轻量级 DDD 架构改造总结](./轻量级DDD架构改造总结.md) - 整体架构改造
- [代码清理总结](./代码清理总结.md) - 旧代码清理记录

---

## 🎯 后续建议

### 1. 如果需要更多商品相关功能

可以继续在 `useProduct.ts` 中添加：

```typescript
export function useProduct() {
  // 现有功能...
  
  // ✅ 可以添加更多功能
  const searchProducts = async (keyword: string) => { }
  const filterByCategory = (categoryId: string) => { }
  const sortProducts = (sortBy: string) => { }
  
  return {
    // 现有 API...
    searchProducts,
    filterByCategory,
    sortProducts,
  }
}
```

### 2. 如果功能变得过于复杂

当单个文件超过 500 行时，可以考虑拆分：

```typescript
// app/composables/useProductList.ts
export function useProductList() {
  // 只处理列表相关
}

// app/composables/useProductDetail.ts
export function useProductDetail() {
  // 只处理详情相关
}

// app/composables/useProductSearch.ts
export function useProductSearch() {
  // 只处理搜索相关
}
```

**注意**：拆分时仍然保持扁平化，不要创建嵌套目录。

---

## 🎉 总结

成功将 Product 模块从旧 DDD 架构重构为新的轻量级 DDD 架构：

### ✅ 已完成
- **文件减少**: 从 3 个文件减少到 1 个文件（减少 67%）
- **目录层级**: 从 3 层减少到 2 层（减少 33%）
- **导入路径**: 更简短、更直观
- **命名优化**: 避免冲突，更加明确
- **风格统一**: 与 `useCart.ts` 等新架构保持一致

### 📈 改进效果
- ✅ **更易理解**: 扁平化结构，一目了然
- ✅ **更易使用**: 单一入口，一次导入
- ✅ **更易维护**: 代码集中，便于修改
- ✅ **更易扩展**: 可以轻松添加新功能

---

**重构负责人**: AI Assistant  
**审核人**: 待定  
**最后更新**: 2025-01-XX

