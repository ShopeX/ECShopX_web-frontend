# ECShopX Web 开发规范

本文档提供 Web 开发的详细规范和最佳实践。

## TypeScript 规范

### 类型定义规范

**接口命名**：使用 `I` 前缀
```typescript
// ✅ 推荐
export interface IProduct {
  id: string
  name: string
  price: number
}

export interface IUser {
  id: string
  username: string
}
```

**类型别名命名**：使用 `T` 前缀（内部使用）
```typescript
// 内部类型，不导出
type TProductStatus = 'active' | 'inactive' | 'deleted'
```

**枚举命名**：使用 `E` 前缀
```typescript
export enum EOrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
  Completed = 'completed'
}
```

### 严格类型检查

**禁止使用 `any`**：
```typescript
// ❌ 错误
function process(data: any) {
  return data.value
}

// ✅ 正确
function process(data: IProductData) {
  return data.value
}

// ✅ 或使用泛型
function process<T>(data: T): T {
  return data
}
```

**避免类型断言**：
```typescript
// ❌ 尽量避免
const item = data as IProduct

// ✅ 使用类型守卫
function isProduct(data: unknown): data is IProduct {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

if (isProduct(data)) {
  // data 自动推断为 IProduct
  console.log(data.name)
}
```

### 函数类型注解

**参数和返回值都要明确类型**：
```typescript
// ✅ 推荐
function calculateTotal(items: ICartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// ✅ 异步函数
async function fetchProduct(id: string): Promise<IProduct> {
  const response = await fetch(`/api/products/${id}`)
  return response.json()
}

// ✅ 可选参数
function loadProducts(params?: IProductListParams): Promise<IProduct[]> {
  // ...
}
```

### 泛型使用

**提高代码复用性**：
```typescript
// API 响应泛型
interface IApiResponse<T> {
  success: boolean
  data: T
  message: string
}

// 分页响应泛型
interface IPaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 使用
type ProductListResponse = IPaginatedResponse<IProduct>
type OrderListResponse = IPaginatedResponse<IOrder>
```

---

## Vue 组件规范

### 组件结构

**标准结构顺序**：
```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, watch, onMounted } from 'vue'
import type { IProduct } from '~/types'

// 2. Props 和 Emits 定义
interface Props {
  product: IProduct
  editable?: boolean
}

interface Emits {
  (e: 'update', value: IProduct): void
  (e: 'delete', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<Emits>()

// 3. 响应式数据
const quantity = ref(1)
const isLoading = ref(false)

// 4. 计算属性
const totalPrice = computed(() => {
  return props.product.price * quantity.value
})

// 5. 方法
const handleIncrease = () => {
  quantity.value++
}

const handleDecrease = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 6. 监听器
watch(() => props.product, (newProduct) => {
  // 处理逻辑
}, { deep: true })

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>
```

### Props 定义规范

**使用 TypeScript 接口**：
```typescript
// ✅ 推荐
interface Props {
  // 必需属性
  id: string
  name: string
  
  // 可选属性
  description?: string
  
  // 带默认值
  size?: 'small' | 'medium' | 'large'
  
  // 复杂类型
  product: IProduct
  items: ICartItem[]
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  description: ''
})
```

### Emits 定义规范

**明确事件参数类型**：
```typescript
// ✅ 推荐
interface Emits {
  // 单参数事件
  (e: 'update', value: string): void
  
  // 多参数事件
  (e: 'change', id: string, value: number): void
  
  // 无参数事件
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// 使用
emit('update', 'new-value')
emit('change', '123', 100)
emit('close')
```

### 组件命名

**文件命名**：PascalCase
```
ProductCard.vue
UserProfile.vue
CartItem.vue
```

**组件使用**：
```vue
<template>
  <!-- 自动导入的组件使用 PascalCase -->
  <ProductCard :product="product" />
  <UserProfile :user="currentUser" />
</template>
```

---

## Composable 开发规范

### 命名规范

**以 `use` 开头，使用 camelCase**：
```
useProduct.ts
useCart.ts
useAuth.ts
useModal.ts
```

### 基本结构

```typescript
// composables/useProduct.ts

import { ref, computed, readonly } from 'vue'
import type { IProduct } from '~/types'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { logger } from '~/utils/log'

/**
 * 商品逻辑 Composable
 * 
 * 功能：
 * - 加载商品列表
 * - 加载商品详情
 * - 搜索商品
 */
export function useProduct() {
  // 1. 响应式状态
  const products = ref<IProduct[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 2. 计算属性
  const hasProducts = computed(() => products.value.length > 0)
  
  // 3. 方法
  async function loadProducts(params: IProductListParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await itemApiClient.getItemList(params)
      products.value = ProductTransformer.toModelList(response.list)
      logger.info('[useProduct] 加载成功:', products.value.length, '个商品')
    } catch (e: any) {
      error.value = e.message
      logger.error('[useProduct] 加载失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function loadProductDetail(id: string): Promise<IProduct> {
    // ...
  }
  
  // 4. 返回（只读状态 + 方法）
  return {
    // 状态（只读）
    products: readonly(products),
    loading: readonly(loading),
    error: readonly(error),
    
    // 计算属性
    hasProducts,
    
    // 方法
    loadProducts,
    loadProductDetail
  }
}
```

### 状态管理原则

**返回只读状态**：
```typescript
// ✅ 推荐
export function useProduct() {
  const products = ref<IProduct[]>([])
  
  return {
    products: readonly(products),  // 只读，防止外部修改
    updateProducts(newProducts: IProduct[]) {
      products.value = newProducts
    }
  }
}

// ❌ 避免
export function useProduct() {
  const products = ref<IProduct[]>([])
  
  return {
    products,  // 可写，外部可以随意修改
  }
}
```

### 错误处理

**统一的错误处理模式**：
```typescript
export function useProduct() {
  const error = ref<string | null>(null)
  
  async function loadProducts() {
    error.value = null  // 重置错误
    
    try {
      const response = await itemApiClient.getItemList()
      // 处理数据
    } catch (e: any) {
      error.value = e.message
      logger.error('[useProduct] 加载失败:', e)
      
      // 可以选择重新抛出错误，让调用方处理
      throw e
    }
  }
  
  return {
    error: readonly(error),
    loadProducts
  }
}
```

---

## Store 开发规范

### Store 命名

**文件名使用 kebab-case**：
```
stores/cart.ts
stores/user.ts
stores/product.ts
```

### Store 结构（Composition API 风格）

```typescript
// stores/cart.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ICartItem } from '~/types'

/**
 * 购物车 Store
 * 
 * 职责：
 * - 管理购物车状态
 * - 提供购物车操作方法
 * - 持久化购物车数据
 */
export const useCartStore = defineStore('cart', () => {
  // 1. 状态
  const items = ref<ICartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 2. Getters（计算属性）
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })
  
  const isEmpty = computed(() => items.value.length === 0)
  
  // 3. Actions（方法）
  async function fetchCart() {
    loading.value = true
    error.value = null
    
    try {
      const response = await cartApiClient.getCart()
      items.value = CartTransformer.toModelList(response.items)
      logger.info('[CartStore] 加载购物车成功')
    } catch (e: any) {
      error.value = e.message
      logger.error('[CartStore] 加载购物车失败:', e)
    } finally {
      loading.value = false
    }
  }
  
  async function addItem(productId: string, quantity: number) {
    try {
      await cartApiClient.addToCart({ product_id: productId, quantity })
      await fetchCart()  // 重新加载
      logger.info('[CartStore] 添加商品成功')
    } catch (e: any) {
      logger.error('[CartStore] 添加商品失败:', e)
      throw e
    }
  }
  
  async function removeItem(itemId: string) {
    try {
      await cartApiClient.removeItem(itemId)
      items.value = items.value.filter(item => item.id !== itemId)
      logger.info('[CartStore] 删除商品成功')
    } catch (e: any) {
      logger.error('[CartStore] 删除商品失败:', e)
      throw e
    }
  }
  
  function clear() {
    items.value = []
    error.value = null
  }
  
  // 4. 返回
  return {
    // 状态
    items,
    loading,
    error,
    
    // Getters
    itemCount,
    totalPrice,
    isEmpty,
    
    // Actions
    fetchCart,
    addItem,
    removeItem,
    clear
  }
}, {
  // 5. 持久化配置（可选）
  persist: {
    storage: persistedState.localStorage,
    paths: ['items']  // 只持久化 items
  }
})
```

### Store 使用规范

**在 Composable 中使用**：
```typescript
// composables/useCart.ts

export function useCart() {
  const cartStore = useCartStore()
  const message = useMessage()
  
  const addToCart = async (productId: string, quantity: number) => {
    try {
      await cartStore.addItem(productId, quantity)
      message.success('添加成功')
      return true
    } catch (error: any) {
      message.error(error.message)
      return false
    }
  }
  
  return {
    // 透传 Store 状态
    items: computed(() => cartStore.items),
    loading: computed(() => cartStore.loading),
    itemCount: computed(() => cartStore.itemCount),
    
    // 包装后的方法
    addToCart,
    removeItem: cartStore.removeItem,
    clear: cartStore.clear
  }
}
```

---

## API 开发规范

### API Client 结构

```typescript
// infrastructure/http/clients/ItemApiClient.ts

import type { IItemListParams, IItemListResponse, IItemDetailResponse } from '~/types/api'

/**
 * 商品 API 客户端
 */
export class ItemApiClient {
  private http: any
  
  constructor() {
    // 获取 HTTP 实例（由插件注入）
    const nuxtApp = useNuxtApp()
    this.http = nuxtApp.$http
  }
  
  /**
   * 获取商品列表
   * 
   * @param params - 查询参数
   * @returns 商品列表响应
   */
  async getItemList(params: IItemListParams): Promise<IItemListResponse> {
    return await this.http('/items', {
      method: 'GET',
      params  // GET 请求用 params
    })
  }
  
  /**
   * 获取商品详情
   * 
   * @param id - 商品 ID
   * @returns 商品详情
   */
  async getItemDetail(id: string): Promise<IItemDetailResponse> {
    return await this.http(`/items/${id}`, {
      method: 'GET'
    })
  }
  
  /**
   * 搜索商品
   * 
   * @param keyword - 搜索关键词
   * @returns 搜索结果
   */
  async searchItems(keyword: string): Promise<IItemListResponse> {
    return await this.http('/items/search', {
      method: 'POST',
      body: { keyword }  // POST 请求用 body
    })
  }
}

// 导出单例
export const itemApiClient = new ItemApiClient()
```

### API 路径规范

**APIfox 文档路径 → 代码路径转换**：

| APIfox 文档 | 代码中使用 | 说明 |
|------------|-----------|------|
| `/api/h5app/wxapp/login` | `/login` | HTTP 插件自动添加前缀 |
| `/api/h5app/wxapp/member` | `/member` | 去掉固定前缀 |
| `/api/h5app/wxapp/items` | `/items` | 保持一致 |

### Company ID 处理

**自动注入，无需手动传递**：

```typescript
// ✅ 正确：不传 company_id
await authApiClient.login({
  username: '13917609856',
  password: '123456'
  // company_id 由 HTTP 插件自动添加
})

// ❌ 错误：手动传递 company_id
await authApiClient.login({
  username: '13917609856',
  password: '123456',
  company_id: '38'  // ❌ 多余，会重复
})

// ⚠️ 特殊情况：跳过自动注入
this.http('/api/public', {
  method: 'GET',
  skipCompanyId: true  // 跳过自动注入
})
```

### Content-Type 处理

**默认使用 form-urlencoded**：

```typescript
// ✅ 默认情况（form-urlencoded）- 不需要额外配置
this.http('/login', {
  method: 'POST',
  body: params,  // 自动转换为 URLSearchParams
})

// ✅ 特殊情况（JSON）- 明确指定
this.http('/api/special', {
  method: 'POST',
  useJson: true,  // 使用 JSON 格式
  body: params,
})

// ✅ 文件上传（自动识别）
this.http('/upload', {
  method: 'POST',
  body: formData,  // FormData 自动识别，不做转换
})
```

---

## 样式开发规范

### Tailwind CSS 使用

**基础组件样式**：
```vue
<template>
  <!-- 使用 Tailwind 工具类 -->
  <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
    点击我
  </button>
  
  <!-- 响应式设计 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-4 bg-white rounded-lg shadow">卡片内容</div>
  </div>
  
  <!-- 深色模式适配 -->
  <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    内容
  </div>
</template>
```

### 自定义主题类

**使用 `sp-` 前缀**：

```vue
<template>
  <!-- 自定义按钮 -->
  <button class="sp-btn sp-btn-primary">主要按钮</button>
  <button class="sp-btn sp-btn-secondary">次要按钮</button>
  
  <!-- 自定义卡片 -->
  <div class="sp-card">
    <h3 class="sp-card-title">标题</h3>
    <p class="sp-card-content">内容</p>
  </div>
  
  <!-- 商品卡片 -->
  <div class="sp-product-card">
    <img class="sp-product-card-image" src="product.jpg" />
    <div class="sp-product-card-content">
      <h4 class="sp-product-card-title">商品名称</h4>
      <div class="sp-product-card-price">¥299.00</div>
    </div>
  </div>
</template>
```

### 禁止事项

```vue
<!-- ❌ 禁止：使用 <style> 标签 -->
<style scoped>
.custom-button {
  background: red;
}
</style>

<!-- ❌ 禁止：内联样式 -->
<div style="color: red; font-size: 14px;">内容</div>

<!-- ✅ 正确：使用 Tailwind -->
<div class="text-red-500 text-sm">内容</div>
```

---

## 日志规范

### Logger 使用

**导入和使用**：
```typescript
import { logger } from '~/utils/log'

// 调试信息
logger.debug('[模块名] 调试信息', data)

// 一般信息
logger.info('[模块名] 操作成功')

// 警告信息
logger.warn('[模块名] 警告:', warning)

// 错误信息
logger.error('[模块名] 操作失败:', error)
```

### 日志格式规范

**使用清晰的模块前缀**：
```typescript
// ✅ 推荐格式：[模块名] 消息内容
logger.info('[useProduct] 加载商品列表成功:', products.length, '个商品')
logger.warn('[CartStore] 商品库存不足:', productId)
logger.error('[AuthApiClient] 登录失败:', error)

// 常见模块前缀
'[useAuth]'          // Composable
'[CartStore]'        // Store
'[ItemApiClient]'    // API Client
'[ProductTransformer]' // Transformer
'[CartPage]'         // 页面组件
```

### 日志级别使用场景

| 级别 | 使用场景 | 示例 |
|------|---------|------|
| `debug` | 开发调试信息 | 参数值、中间状态 |
| `info` | 正常业务日志 | 操作成功、数据加载 |
| `warn` | 警告信息 | 库存不足、权限不足 |
| `error` | 错误信息 | 请求失败、异常捕获 |

---

## 错误处理规范

### try-catch 模式

```typescript
// Composable 中的错误处理
export function useProduct() {
  const error = ref<string | null>(null)
  
  async function loadProducts() {
    error.value = null
    
    try {
      const response = await itemApiClient.getItemList()
      // 处理成功
    } catch (e: any) {
      error.value = e.message
      logger.error('[useProduct] 加载失败:', e)
      throw e  // 重新抛出，让调用方决定如何处理
    }
  }
  
  return { error: readonly(error), loadProducts }
}

// 页面中的错误处理
<script setup>
const { loadProducts } = useProduct()
const message = useMessage()

async function handleLoad() {
  try {
    await loadProducts()
    message.success('加载成功')
  } catch (error: any) {
    message.error(`加载失败: ${error.message}`)
  }
}
</script>
```

### 全局错误处理

```typescript
// plugins/error-handler.ts

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error, instance, info) => {
    logger.error('[全局错误]', error, info)
    
    // 可以上报到错误监控服务
    // reportError(error)
  })
})
```

---

## 测试规范

### 单元测试

```typescript
// tests/composables/useProduct.test.ts

import { describe, it, expect, vi } from 'vitest'
import { useProduct } from '~/composables/useProduct'

describe('useProduct', () => {
  it('应该正确加载商品列表', async () => {
    const { products, loadProducts } = useProduct()
    
    await loadProducts({ page: 1 })
    
    expect(products.value).toHaveLength(10)
    expect(products.value[0]).toHaveProperty('id')
    expect(products.value[0]).toHaveProperty('name')
  })
  
  it('应该处理加载失败', async () => {
    // Mock API 失败
    vi.spyOn(itemApiClient, 'getItemList').mockRejectedValue(
      new Error('Network Error')
    )
    
    const { error, loadProducts } = useProduct()
    
    await expect(loadProducts()).rejects.toThrow('Network Error')
    expect(error.value).toBe('Network Error')
  })
})
```

---

## 性能优化

### 组件优化

```vue
<script setup>
// 1. 使用 computed 缓存计算结果
const expensiveValue = computed(() => {
  return heavyCalculation(props.data)
})

// 2. 使用 shallowRef 优化大对象
const largeData = shallowRef<LargeObject>({})

// 3. 组件懒加载
const LazyComponent = defineAsyncComponent(() => 
  import('~/components/HeavyComponent.vue')
)
</script>

<template>
  <!-- 4. 使用 v-show 代替 v-if（频繁切换） -->
  <div v-show="isVisible">内容</div>
  
  <!-- 5. 使用 Suspense 和 fallback -->
  <Suspense>
    <LazyComponent />
    <template #fallback>
      <div class="loading">加载中...</div>
    </template>
  </Suspense>
</template>
```

### 请求优化

```typescript
// 1. 使用防抖
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(async (keyword: string) => {
  await searchProducts(keyword)
}, 300)

// 2. 缓存请求结果
const cache = new Map()

async function fetchWithCache(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await fetcher()
  cache.set(key, data)
  return data
}
```

---

**相关文档**：
- `architecture-rules.md` - 架构决策规则
- `ddd-guide.md` - DDD 开发指南

**最后更新**：2025-01-11
