---
name: ecshopx-catalog
description: "ECShopX 商品目录功能开发指南。包含商品列表、商品详情、SKU 选择器、价格展示等功能的开发规范。适用场景: (1) 开发商品列表页功能 (2) 开发商品详情页 (3) 实现 SKU 选择和库存展示 (4) 处理商品价格显示逻辑 (5) 商品筛选和排序功能。采用简化架构方案，不需要全局状态管理。"
---

# 商品目录功能开发

## 概述

商品目录模块负责商品的展示、浏览、筛选和详情查看，是 B2C 商城的核心功能。

**包含功能**：
- 商品列表展示（带筛选、排序、分页）
- 商品详情查看
- SKU 规格选择
- 价格计算和展示
- 库存状态展示

**架构方案**：**方案 2（简化架构）** - `UI → Composable → API Client → Transformer`

**原因**：
- ❌ 不需要跨组件共享状态（每次进入页面重新加载）
- ✅ 有复杂业务逻辑（筛选、分页、SKU 选择）
- ❌ 不需要持久化

## 架构设计

### 目录结构

```
app/
├── pages/
│   └── item/
│       ├── list.vue              # 商品列表页
│       └── [id].vue              # 商品详情页
│
├── components/business/product/
│   ├── ProductCard.vue           # 商品卡片
│   ├── ProductList.vue           # 商品列表
│   ├── ProductFilter.vue         # 商品筛选器
│   ├── ProductDetail.vue         # 商品详情
│   ├── SkuSelector.vue           # SKU 选择器
│   └── PriceDisplay.vue          # 价格展示
│
├── composables/
│   ├── useProduct.ts             # 商品逻辑
│   └── usePagination.ts          # 分页逻辑
│
├── infrastructure/
│   ├── http/clients/
│   │   └── ItemApiClient.ts      # 商品 API 客户端
│   └── transformers/
│       └── productTransformer.ts # 数据转换器
│
└── types/
    ├── api/item.ts               # API 类型
    └── product.ts                # 领域类型
```

### 数据流

```
页面组件 (list.vue / [id].vue)
  ↓ 调用
Composable (useProduct)
  ↓ 调用
API Client (ItemApiClient)
  ↓ 返回
Transformer (ProductTransformer)
  ↓ 转换
领域模型 (IProduct)
  ↓ 返回
Composable (管理状态)
  ↓ 响应式更新
页面组件 (渲染)
```

## 功能开发指南

### 1. 商品列表功能

#### 1.1 类型定义

```typescript
// app/types/api/item.ts

/** 商品列表查询参数 */
export interface IItemListParams {
  page?: number
  pageSize?: number
  categoryId?: string
  keyword?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'default' | 'price_asc' | 'price_desc' | 'sales'
  brandId?: string
}

/** 商品 DTO */
export interface IItemDTO {
  item_id: string
  item_name: string
  default_image: string
  price: number
  market_price?: number
  sales_count: number
  stock: number
  brand?: {
    brand_id: string
    brand_name: string
  }
}

/** 商品列表响应 */
export interface IItemListResponse {
  list: IItemDTO[]
  total: number
  page: number
  pageSize: number
}
```

```typescript
// app/types/product.ts

/** 商品领域模型 */
export interface IProduct {
  id: string
  name: string
  image: string
  price: number
  marketPrice?: number
  salesCount: number
  stock: number
  isInStock: boolean
  discount?: number  // 折扣百分比
  brand?: {
    id: string
    name: string
  }
}
```

#### 1.2 API Client

```typescript
// app/infrastructure/http/clients/ItemApiClient.ts

import type { IItemListParams, IItemListResponse, IItemDetailResponse } from '~/types/api/item'

export class ItemApiClient {
  private http: any
  
  constructor() {
    const nuxtApp = useNuxtApp()
    this.http = nuxtApp.$http
  }
  
  /**
   * 获取商品列表
   */
  async getItemList(params: IItemListParams): Promise<IItemListResponse> {
    return await this.http('/items', {
      method: 'GET',
      params
    })
  }
  
  /**
   * 获取商品详情
   */
  async getItemDetail(itemId: string): Promise<IItemDetailResponse> {
    return await this.http(`/items/${itemId}`, {
      method: 'GET'
    })
  }
}

export const itemApiClient = new ItemApiClient()
```

#### 1.3 Transformer

```typescript
// app/infrastructure/transformers/productTransformer.ts

import type { IItemDTO } from '~/types/api/item'
import type { IProduct } from '~/types/product'

export class ProductTransformer {
  /**
   * DTO → 领域模型
   */
  static toModel(dto: IItemDTO): IProduct {
    const discount = dto.market_price && dto.market_price > dto.price
      ? Math.round((1 - dto.price / dto.market_price) * 100)
      : undefined
    
    return {
      id: dto.item_id,
      name: dto.item_name,
      image: dto.default_image,
      price: dto.price,
      marketPrice: dto.market_price,
      salesCount: dto.sales_count,
      stock: dto.stock,
      isInStock: dto.stock > 0,
      discount,
      brand: dto.brand ? {
        id: dto.brand.brand_id,
        name: dto.brand.brand_name
      } : undefined
    }
  }
  
  /**
   * DTO 数组 → 领域模型数组
   */
  static toModelList(dtos: IItemDTO[]): IProduct[] {
    return dtos.map(dto => this.toModel(dto))
  }
}
```

#### 1.4 Composable

```typescript
// app/composables/useProduct.ts

import { ref, computed, readonly } from 'vue'
import type { IProduct } from '~/types/product'
import type { IItemListParams } from '~/types/api/item'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { ProductTransformer } from '~/infrastructure/transformers/productTransformer'
import { logger } from '~/utils/log'

export function useProduct() {
  // 状态
  const products = ref<IProduct[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  
  // 计算属性
  const hasProducts = computed(() => products.value.length > 0)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  
  /**
   * 加载商品列表
   */
  async function loadProducts(params: IItemListParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await itemApiClient.getItemList({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...params
      })
      
      products.value = ProductTransformer.toModelList(response.list)
      total.value = response.total
      
      logger.info('[useProduct] 加载成功:', products.value.length, '个商品')
    } catch (e: any) {
      error.value = e.message
      logger.error('[useProduct] 加载失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 切换页码
   */
  async function changePage(page: number, params?: IItemListParams) {
    currentPage.value = page
    await loadProducts(params)
  }
  
  /**
   * 重置并重新加载
   */
  async function reload(params?: IItemListParams) {
    currentPage.value = 1
    await loadProducts(params)
  }
  
  return {
    // 状态（只读）
    products: readonly(products),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSize),
    
    // 计算属性
    hasProducts,
    totalPages,
    
    // 方法
    loadProducts,
    changePage,
    reload
  }
}
```

#### 1.5 页面组件

```vue
<!-- app/pages/item/list.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 筛选器 -->
    <ProductFilter 
      v-model:filters="filters"
      @change="handleFilterChange"
    />
    
    <!-- 商品列表 -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <ProductCardSkeleton v-for="i in 8" :key="i" />
    </div>
    
    <div v-else-if="hasProducts" class="mt-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          :product="product"
        />
      </div>
      
      <!-- 分页 -->
      <UPagination
        v-model="currentPageLocal"
        :total="total"
        :page-size="pageSize"
        class="mt-8 flex justify-center"
        @update:model-value="handlePageChange"
      />
    </div>
    
    <div v-else class="text-center py-20 text-gray-500">
      暂无商品
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IItemListParams } from '~/types/api/item'

// 使用 Composable
const { 
  products, 
  loading, 
  hasProducts, 
  total, 
  currentPage, 
  pageSize,
  loadProducts,
  changePage 
} = useProduct()

// 筛选条件
const filters = ref<IItemListParams>({})

// 本地页码（用于 v-model）
const currentPageLocal = computed({
  get: () => currentPage.value,
  set: (value) => { /* 通过 handlePageChange 处理 */ }
})

// 加载数据
onMounted(() => {
  loadProducts(filters.value)
})

// 筛选变化
const handleFilterChange = async () => {
  await loadProducts(filters.value)
}

// 页码变化
const handlePageChange = async (page: number) => {
  await changePage(page, filters.value)
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// SEO
useHead({
  title: '商品列表',
  meta: [
    { name: 'description', content: '浏览我们的精选商品' }
  ]
})
</script>
```

### 2. 商品详情功能

#### 2.1 扩展 Composable

```typescript
// app/composables/useProduct.ts (扩展)

export function useProduct() {
  // ... 之前的代码 ...
  
  const productDetail = ref<IProductDetail | null>(null)
  const detailLoading = ref(false)
  
  /**
   * 加载商品详情
   */
  async function loadProductDetail(itemId: string) {
    detailLoading.value = true
    error.value = null
    
    try {
      const response = await itemApiClient.getItemDetail(itemId)
      productDetail.value = ProductTransformer.toDetailModel(response)
      
      logger.info('[useProduct] 详情加载成功:', itemId)
      return productDetail.value
    } catch (e: any) {
      error.value = e.message
      logger.error('[useProduct] 详情加载失败:', e)
      throw e
    } finally {
      detailLoading.value = false
    }
  }
  
  return {
    // ... 之前的返回值 ...
    
    // 详情相关
    productDetail: readonly(productDetail),
    detailLoading: readonly(detailLoading),
    loadProductDetail
  }
}
```

#### 2.2 商品详情页

```vue
<!-- app/pages/item/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="detailLoading" class="animate-pulse">
      <div class="h-96 bg-gray-200 rounded-lg"></div>
    </div>
    
    <div v-else-if="productDetail" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 商品图片 -->
      <div>
        <img 
          :src="productDetail.image" 
          :alt="productDetail.name"
          class="w-full rounded-lg"
        />
      </div>
      
      <!-- 商品信息 -->
      <div>
        <h1 class="text-2xl font-bold mb-4">
          {{ productDetail.name }}
        </h1>
        
        <!-- 价格 -->
        <PriceDisplay 
          :price="productDetail.price"
          :market-price="productDetail.marketPrice"
          :discount="productDetail.discount"
        />
        
        <!-- SKU 选择 -->
        <SkuSelector 
          v-if="productDetail.skus"
          v-model:selected-sku="selectedSku"
          :skus="productDetail.skus"
          class="mt-6"
        />
        
        <!-- 购买按钮 -->
        <div class="mt-6 flex gap-4">
          <UButton 
            size="lg"
            class="flex-1"
            :disabled="!productDetail.isInStock"
            @click="handleAddToCart"
          >
            {{ productDetail.isInStock ? '加入购物车' : '已售罄' }}
          </UButton>
          
          <UButton 
            size="lg" 
            color="primary"
            class="flex-1"
            :disabled="!productDetail.isInStock"
            @click="handleBuyNow"
          >
            立即购买
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { loadProductDetail, productDetail, detailLoading } = useProduct()
const { addToCart } = useCart()
const message = useMessage()

// 选中的 SKU
const selectedSku = ref<string | null>(null)

// 加载商品详情
onMounted(async () => {
  const itemId = route.params.id as string
  await loadProductDetail(itemId)
})

// 加入购物车
const handleAddToCart = async () => {
  if (!productDetail.value) return
  
  try {
    const success = await addToCart(productDetail.value.id, 1, selectedSku.value)
    if (success) {
      message.success('已加入购物车')
    }
  } catch (error: any) {
    message.error(error.message)
  }
}

// 立即购买
const handleBuyNow = async () => {
  await handleAddToCart()
  router.push('/cart')
}

// SEO
useHead({
  title: computed(() => productDetail.value?.name || '商品详情'),
  meta: computed(() => [
    { 
      name: 'description', 
      content: productDetail.value?.description || '' 
    }
  ])
})
</script>
```

### 3. SKU 选择器组件

```vue
<!-- app/components/business/product/SkuSelector.vue -->
<template>
  <div class="sku-selector">
    <div 
      v-for="spec in specs" 
      :key="spec.name"
      class="mb-4"
    >
      <h4 class="text-sm font-medium mb-2">{{ spec.name }}</h4>
      
      <div class="flex flex-wrap gap-2">
        <button
          v-for="value in spec.values"
          :key="value.id"
          :class="[
            'px-4 py-2 border rounded-lg transition-colors',
            isSelected(spec.name, value.id)
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 hover:border-primary',
            !value.available && 'opacity-50 cursor-not-allowed'
          ]"
          :disabled="!value.available"
          @click="handleSelect(spec.name, value.id)"
        >
          {{ value.label }}
        </button>
      </div>
    </div>
    
    <!-- 库存提示 -->
    <div v-if="selectedSkuInfo" class="mt-4 text-sm">
      <span class="text-gray-600">库存：</span>
      <span :class="selectedSkuInfo.stock > 0 ? 'text-green-600' : 'text-red-600'">
        {{ selectedSkuInfo.stock > 0 ? `${selectedSkuInfo.stock} 件` : '已售罄' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SkuSpec {
  name: string
  values: Array<{
    id: string
    label: string
    available: boolean
  }>
}

interface Props {
  skus: any[]  // SKU 数据
  selectedSku?: string | null
}

interface Emits {
  (e: 'update:selectedSku', value: string | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 规格选项
const specs = computed<SkuSpec[]>(() => {
  // 从 SKU 数据中提取规格
  // 实际实现需要根据后端数据结构调整
  return []
})

// 当前选中的规格组合
const selectedSpecs = ref<Record<string, string>>({})

// 选中的 SKU 信息
const selectedSkuInfo = computed(() => {
  // 根据选中的规格组合查找对应的 SKU
  return null
})

// 判断是否选中
const isSelected = (specName: string, valueId: string) => {
  return selectedSpecs.value[specName] === valueId
}

// 选择规格
const handleSelect = (specName: string, valueId: string) => {
  selectedSpecs.value[specName] = valueId
  
  // 查找对应的 SKU ID
  const skuId = findSkuId(selectedSpecs.value)
  emit('update:selectedSku', skuId)
}

// 根据规格组合查找 SKU ID
const findSkuId = (specs: Record<string, string>): string | null => {
  // 实际实现
  return null
}
</script>
```

### 4. 价格展示组件

```vue
<!-- app/components/business/product/PriceDisplay.vue -->
<template>
  <div class="price-display">
    <div class="flex items-baseline gap-3">
      <!-- 当前价格 -->
      <span class="text-3xl font-bold text-primary">
        ¥{{ formatPrice(price) }}
      </span>
      
      <!-- 原价（如果有折扣） -->
      <span v-if="marketPrice && marketPrice > price" class="text-lg text-gray-500 line-through">
        ¥{{ formatPrice(marketPrice) }}
      </span>
      
      <!-- 折扣标签 -->
      <span v-if="discount" class="px-2 py-1 bg-red-100 text-red-600 text-sm rounded">
        {{ discount }}折
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  price: number
  marketPrice?: number
  discount?: number
}

const props = defineProps<Props>()

// 格式化价格
const formatPrice = (price: number): string => {
  return price.toFixed(2)
}
</script>
```

## 开发检查清单

商品目录功能开发前确认：

**类型定义**：
- [ ] 定义 API 请求/响应类型 (`types/api/item.ts`)
- [ ] 定义领域模型类型 (`types/product.ts`)

**基础设施层**：
- [ ] 创建 API Client (`ItemApiClient.ts`)
- [ ] 创建 Transformer (`productTransformer.ts`)
- [ ] 测试 API 调用

**应用层**：
- [ ] 创建 Composable (`useProduct.ts`)
- [ ] 实现商品列表加载
- [ ] 实现商品详情加载
- [ ] 实现分页逻辑
- [ ] 错误处理

**表现层**：
- [ ] 创建商品列表页 (`pages/item/list.vue`)
- [ ] 创建商品详情页 (`pages/item/[id].vue`)
- [ ] 创建商品卡片组件 (`ProductCard.vue`)
- [ ] 创建 SKU 选择器 (`SkuSelector.vue`)
- [ ] 创建价格展示组件 (`PriceDisplay.vue`)
- [ ] 实现筛选功能
- [ ] 实现排序功能

**测试**：
- [ ] 测试商品列表加载
- [ ] 测试分页功能
- [ ] 测试筛选和排序
- [ ] 测试商品详情加载
- [ ] 测试 SKU 选择
- [ ] 测试移动端响应式

## 常见问题

**Q: 商品数据需要缓存吗？**
A: 不需要。采用简化架构，每次进入页面重新加载。如需缓存可以使用浏览器的 keepalive。

**Q: SKU 选择逻辑很复杂怎么办？**
A: 可以创建单独的 `useSkuSelector` Composable 来封装 SKU 选择逻辑。

**Q: 如何处理商品图片懒加载？**
A: 使用 `<img loading="lazy">` 或 Nuxt Image 组件。

**Q: 商品列表需要无限滚动吗？**
A: 根据需求决定。传统分页更适合 SEO，无限滚动更适合移动端体验。

---

**相关 Skills**：
- `ecshopx-system` - 系统基础架构
- `ecshopx-search` - 商品搜索功能

**相关文档**：
- 项目架构规则：参考 `ecshopx-system` skill
- API 规范：`/docs/api/item/list.md`

**最后更新**：2025-01-11
