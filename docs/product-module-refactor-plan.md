# 商品模块重构方案

## 📋 现状分析

### 当前实现

```
❌ 不完整的数据流
list.vue (直接调用底层)
  ├─ itemApiClient
  └─ ProductTransformer
  
⚠️ useProduct 存在但被简化
  └─ 跳过了 Store 层
  
❌ useProductStore 未实现
  └─ 只有静态假数据
```

### 目标架构（与登录模块一致）

```
✅ 完整的数据流
list.vue
  ↓
useProduct (Composable)
  ↓
useProductStore (Store)
  ↓
itemApiClient (API Client)
  ↓
ProductTransformer (Transformer)
  ↓
更新 Store 状态
  ↓
响应式数据返回到 UI
```

## 🔧 重构步骤

### 步骤 1: 重构 Product Store

```typescript
// 📁 app/stores/product.ts
import { defineStore } from 'pinia'
import { itemApiClient } from '~/infrastructure/http/clients'
import { ProductTransformer } from '~/infrastructure/transformers'
import type { IProduct } from '~/components/business/product/ProductCard/types'
import type { IItemListParams, IBrand } from '~/types/api/item'

interface ProductState {
  // 列表状态
  products: IProduct[]
  brands: IBrand[]
  totalCount: number
  
  // 详情状态
  currentProduct: IProduct | null
  
  // 分页状态
  currentPage: number
  pageSize: number
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    brands: [],
    totalCount: 0,
    currentProduct: null,
    currentPage: 1,
    pageSize: 20,
  }),

  getters: {
    /**
     * 是否有商品
     */
    hasProducts: (state): boolean => {
      return state.products.length > 0
    },

    /**
     * 是否有更多商品
     */
    hasMore: (state): boolean => {
      return state.products.length < state.totalCount
    },

    /**
     * 当前商品数量
     */
    productCount: (state): number => {
      return state.products.length
    },
  },

  actions: {
    /**
     * 加载商品列表
     */
    async loadProducts(params: IItemListParams) {
      try {
        // 1. 调用 API Client 获取数据
        const response = await itemApiClient.getItemList(params)

        if (response?.list) {
          // 2. 使用 Transformer 转换数据
          const products = ProductTransformer.toModelList(response.list)

          // 3. 更新状态
          this.products = products
          this.totalCount = response.total_count || 0
          this.brands = response.brand_list?.list || []
          this.currentPage = parseInt(params.page)

          return { success: true, data: products }
        }

        return { success: false, error: '没有数据' }
      } catch (error: any) {
        console.error('Load products error:', error)
        return {
          success: false,
          error: error.message || '加载商品列表失败'
        }
      }
    },

    /**
     * 加载更多商品（追加）
     */
    async loadMoreProducts(params: IItemListParams) {
      try {
        const response = await itemApiClient.getItemList(params)

        if (response?.list) {
          const newProducts = ProductTransformer.toModelList(response.list)

          // 追加到现有列表
          this.products = [...this.products, ...newProducts]
          this.totalCount = response.total_count || 0
          this.currentPage = parseInt(params.page)

          return { success: true, data: newProducts }
        }

        return { success: false, error: '没有更多数据' }
      } catch (error: any) {
        console.error('Load more products error:', error)
        return {
          success: false,
          error: error.message || '加载更多商品失败'
        }
      }
    },

    /**
     * 加载商品详情
     */
    async loadProductDetail(id: string) {
      try {
        const response = await itemApiClient.getItemDetail({ id })

        if (response) {
          const product = ProductTransformer.toModel(response)
          this.currentProduct = product

          return { success: true, data: product }
        }

        return { success: false, error: '商品不存在' }
      } catch (error: any) {
        console.error('Load product detail error:', error)
        return {
          success: false,
          error: error.message || '加载商品详情失败'
        }
      }
    },

    /**
     * 清空商品列表
     */
    clearProducts() {
      this.products = []
      this.totalCount = 0
      this.currentPage = 1
    },

    /**
     * 清空当前商品详情
     */
    clearCurrentProduct() {
      this.currentProduct = null
    },

    /**
     * 重置所有状态
     */
    reset() {
      this.$reset()
    },
  }
})
```

### 步骤 2: 重构 useProduct Composable

```typescript
// 📁 app/composables/useProduct.ts
import { computed } from 'vue'
import { useProductStore } from '~/stores/product'
import type { IItemListParams } from '~/types/api/item'

/**
 * 商品组合式函数
 * 
 * 职责：
 * - 封装商品相关的业务逻辑
 * - 管理局部状态（loading、error）
 * - 与 useProductStore 交互
 * 
 * @example
 * ```vue
 * <script setup>
 * const { products, loadProducts, isLoading } = useProduct()
 * await loadProducts({ page: '1', pageSize: '20' })
 * </script>
 * ```
 */
export function useProduct() {
  const productStore = useProductStore()

  // 局部状态
  const isLoading = ref(false)
  const error = ref<string>('')

  // 计算属性（从 Store 获取）
  const products = computed(() => productStore.products)
  const brands = computed(() => productStore.brands)
  const totalCount = computed(() => productStore.totalCount)
  const hasProducts = computed(() => productStore.hasProducts)
  const hasMore = computed(() => productStore.hasMore)
  const currentProduct = computed(() => productStore.currentProduct)

  /**
   * 加载商品列表
   */
  async function loadProducts(params: IItemListParams) {
    try {
      isLoading.value = true
      error.value = ''

      // 调用 Store 方法
      const result = await productStore.loadProducts(params)

      if (!result.success) {
        error.value = result.error || '加载失败'
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || '加载商品列表失败'
      console.error('Load products error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载更多商品
   */
  async function loadMore(params: IItemListParams) {
    try {
      isLoading.value = true
      error.value = ''

      const result = await productStore.loadMoreProducts(params)

      if (!result.success) {
        error.value = result.error || '加载失败'
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || '加载更多失败'
      console.error('Load more error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载商品详情
   */
  async function loadProductDetail(id: string) {
    try {
      isLoading.value = true
      error.value = ''

      const result = await productStore.loadProductDetail(id)

      if (!result.success) {
        error.value = result.error || '加载失败'
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || '加载商品详情失败'
      console.error('Load product detail error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新商品列表
   */
  async function refresh(params: IItemListParams) {
    productStore.clearProducts()
    return await loadProducts(params)
  }

  /**
   * 清除错误信息
   */
  function clearError() {
    error.value = ''
  }

  return {
    // 状态
    products,
    brands,
    totalCount,
    hasProducts,
    hasMore,
    currentProduct,
    isLoading,
    error,

    // 方法
    loadProducts,
    loadMore,
    loadProductDetail,
    refresh,
    clearError,
  }
}
```

### 步骤 3: 重构商品列表页

```vue
<!-- 📁 app/pages/item/list.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 筛选器 -->
    <ItemFilter 
      v-model="filterParams" 
      :brands="brands" 
      @change="handleFilterChange" 
    />

    <!-- 加载状态 -->
    <div v-if="isLoading && !hasProducts" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <UButton @click="handleRefresh">重新加载</UButton>
    </div>

    <!-- 商品列表 -->
    <div v-else-if="hasProducts">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in products"
          :key="product.itemId"
          :product="product"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="text-center mt-6">
        <UButton
          :loading="isLoading"
          @click="handleLoadMore"
        >
          {{ isLoading ? '加载中...' : '加载更多' }}
        </UButton>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">暂无商品</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IItemListParams } from '~/types/api/item'

// ✅ 只调用 Composable，不直接调用底层模块
const {
  products,
  brands,
  hasProducts,
  hasMore,
  isLoading,
  error,
  loadProducts,
  loadMore,
  refresh,
} = useProduct()

// 筛选参数
const filterParams = ref({
  brandId: '',
  sort: 'default',
  startPrice: undefined as number | undefined,
  endPrice: undefined as number | undefined,
})

// 当前页码
const currentPage = ref(1)
const pageSize = 20

// 构建 API 参数
const buildParams = (page: number): IItemListParams => {
  return {
    page: page.toString(),
    pageSize: pageSize.toString(),
    item_type: 'normal',
    main_category: '',
    is_tdk: '1',
    type: '0',
    ...(filterParams.value.brandId && { brand_id: filterParams.value.brandId }),
    ...(filterParams.value.sort !== 'default' && { sort: filterParams.value.sort }),
    ...(filterParams.value.startPrice && { start_price: filterParams.value.startPrice }),
    ...(filterParams.value.endPrice && { end_price: filterParams.value.endPrice }),
  }
}

// 加载商品
async function loadProductList() {
  const params = buildParams(currentPage.value)
  await loadProducts(params)
}

// 加载更多
async function handleLoadMore() {
  currentPage.value++
  const params = buildParams(currentPage.value)
  await loadMore(params)
}

// 刷新列表
async function handleRefresh() {
  currentPage.value = 1
  const params = buildParams(1)
  await refresh(params)
}

// 筛选变化
function handleFilterChange() {
  handleRefresh()
}

// 初始化
onMounted(() => {
  loadProductList()
})
</script>
```

## 📊 重构前后对比

### 重构前（当前）

```typescript
// ❌ 组件直接调用底层
list.vue
  ├─ import { itemApiClient } from '~/infrastructure/...'
  ├─ import { ProductTransformer } from '~/infrastructure/...'
  ├─ const data = await itemApiClient.getItemList()
  └─ const products = ProductTransformer.toModelList()

// 问题：
// 1. 违反分层原则
// 2. 组件与基础设施层耦合
// 3. 无法跨组件共享状态
// 4. 难以测试
```

### 重构后（目标）

```typescript
// ✅ 完整的数据流
list.vue
  ↓ 只调用
useProduct() (Composable)
  ↓ 管理局部状态，调用
useProductStore() (Store)
  ↓ 管理全局状态，调用
itemApiClient (API Client)
  ↓ HTTP 通信，返回原始响应
ProductTransformer (Transformer)
  ↓ 数据转换
返回业务模型 → 更新 Store → 响应式数据 → UI 更新

// 优势：
// ✅ 符合分层架构
// ✅ 职责清晰
// ✅ 状态可共享
// ✅ 易于测试
// ✅ 与登录模块架构一致
```

## 🎯 重构收益

### 1. 架构统一

```
登录模块：UI → useAuth → useUserStore → authApiClient → AuthTransformer
商品模块：UI → useProduct → useProductStore → itemApiClient → ProductTransformer

✅ 所有模块遵循相同的数据流向
```

### 2. 状态共享

```typescript
// 多个组件可以共享商品状态
const { products } = useProduct()  // 组件 A
const { products } = useProduct()  // 组件 B（相同数据）
```

### 3. 易于测试

```typescript
// 可以独立测试每一层
describe('ProductStore', () => {
  it('should load products', async () => {
    const store = useProductStore()
    await store.loadProducts({ page: '1', pageSize: '20' })
    expect(store.products).toHaveLength(20)
  })
})
```

### 4. 代码复用

```typescript
// Composable 可以组合多个 Store
export function useProductWithCart() {
  const { products, loadProducts } = useProduct()
  const { addToCart } = useCart()
  
  async function buyNow(productId: string) {
    await loadProducts(...)
    await addToCart(productId, 1)
  }
  
  return { products, buyNow }
}
```

## 📝 重构检查清单

- [ ] 重构 `app/stores/product.ts`
  - [ ] 添加完整的状态定义
  - [ ] 实现 `loadProducts` action
  - [ ] 实现 `loadMoreProducts` action
  - [ ] 实现 `loadProductDetail` action
  - [ ] 添加 getters

- [ ] 重构 `app/composables/useProduct.ts`
  - [ ] 调用 `useProductStore`
  - [ ] 管理局部状态（isLoading、error）
  - [ ] 封装业务逻辑
  - [ ] 提供统一的错误处理

- [ ] 重构 `app/pages/item/list.vue`
  - [ ] 移除直接导入 `itemApiClient` 和 `ProductTransformer`
  - [ ] 只调用 `useProduct` composable
  - [ ] 简化组件逻辑

- [ ] 更新文档
  - [ ] 更新数据流向文档
  - [ ] 添加商品模块示例
  - [ ] 更新开发规范

## 🚀 实施建议

### 渐进式重构

不必一次性重构所有文件，可以按以下顺序逐步进行：

1. **第一阶段**：重构 Store
   - 先实现 `useProductStore`
   - 保持现有代码可用

2. **第二阶段**：重构 Composable
   - 更新 `useProduct` 调用新的 Store
   - 向后兼容旧代码

3. **第三阶段**：重构页面组件
   - 逐个更新页面使用新的 Composable
   - 商品列表页 → 商品详情页 → 其他页面

4. **第四阶段**：清理旧代码
   - 移除不再使用的代码
   - 更新文档

### 测试验证

每完成一个阶段，都应该：

1. ✅ 功能测试：确保功能正常
2. ✅ 性能测试：确保性能无退化
3. ✅ 代码审查：确保符合规范
4. ✅ 文档更新：同步更新文档

## 📚 相关文档

- [数据流向架构](./data-flow-architecture.md)
- [数据流向快速参考](./data-flow-quick-reference.md)
- [DDD 开发指南](./DDD-DEVELOPMENT-GUIDE.md)

