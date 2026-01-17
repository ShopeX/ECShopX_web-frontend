---
name: ecshopx-cart
description: "ECShopX 购物车功能开发指南。包含购物车管理、商品添加/删除/修改、购物车页面、迷你购物车等功能。适用场景: (1) 开发购物车核心功能 (2) 实现添加到购物车操作 (3) 购物车页面开发 (4) 购物车状态管理 (5) 购物车数据持久化。采用完整架构方案(Store + Composable)，支持全局状态共享和本地持久化。"
---

# 购物车功能开发

## 概述

购物车是 B2C 商城的核心功能，需要在多个页面访问（Header、商品详情、购物车页等），并支持数据持久化。

**包含功能**：
- 添加商品到购物车
- 更新商品数量
- 删除购物车商品
- 全选/反选商品
- 计算选中商品总价
- 购物车数据持久化
- 迷你购物车（Header 显示）

**架构方案**：**方案 1（完整架构）** - `UI → Composable → Store → API Client → Transformer`

**原因**：
- ✅ 需要跨组件共享状态（Header、详情页、购物车页都要访问）
- ✅ 需要数据持久化（localStorage）
- ✅ 复杂的状态管理

## 架构设计

### 目录结构

```
app/
├── pages/cart/
│   └── index.vue                 # 购物车页面
│
├── components/business/cart/
│   ├── CartItem.vue              # 购物车商品项
│   ├── CartList.vue              # 购物车列表
│   ├── CartSummary.vue           # 购物车结算栏
│   └── MiniCart.vue              # 迷你购物车(Header用)
│
├── composables/
│   └── useCart.ts                # 购物车逻辑封装
│
├── stores/
│   └── cart.ts                   # 购物车状态管理
│
├── infrastructure/
│   ├── http/clients/
│   │   └── CartApiClient.ts      # 购物车 API
│   └── transformers/
│       └── cartTransformer.ts    # 数据转换
│
└── types/
    ├── api/cart.ts               # API 类型
    └── cart.ts                   # 领域类型
```

### 数据流

```
UI 组件
  ↓ 调用
Composable (useCart)
  ↓ 调用
Store (useCartStore) ← 全局状态 + 持久化
  ↓ 调用
API Client (CartApiClient)
  ↓ 返回
Transformer (CartTransformer)
  ↓ 转换
领域模型
  ↓ 更新
Store → Composable → UI (响应式更新)
```

## 功能开发指南

### 1. 类型定义

```typescript
// app/types/api/cart.ts

/** 添加到购物车参数 */
export interface IAddToCartParams {
  item_id: string
  quantity: number
  sku_id?: string
}

/** 更新购物车项参数 */
export interface IUpdateCartItemParams {
  cart_item_id: string
  quantity?: number
  selected?: boolean
}

/** 购物车项 DTO */
export interface ICartItemDTO {
  cart_item_id: string
  item_id: string
  item_name: string
  item_image: string
  price: number
  quantity: number
  stock: number
  selected: boolean
  available: boolean  // 是否可购买（库存充足、商品上架等）
  sku_info?: {
    sku_id: string
    sku_text: string  // 如："颜色:红色;尺码:M"
  }
}

/** 购物车响应 */
export interface ICartResponse {
  items: ICartItemDTO[]
  total_count: number
}
```

```typescript
// app/types/cart.ts

/** 购物车项领域模型 */
export interface ICartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  stock: number
  selected: boolean
  available: boolean
  subtotal: number  // 小计
  skuInfo?: {
    skuId: string
    skuText: string
  }
}
```

### 2. API Client

```typescript
// app/infrastructure/http/clients/CartApiClient.ts

import type { 
  IAddToCartParams, 
  IUpdateCartItemParams, 
  ICartResponse 
} from '~/types/api/cart'

export class CartApiClient {
  private http: any
  
  constructor() {
    const nuxtApp = useNuxtApp()
    this.http = nuxtApp.$http
  }
  
  /**
   * 获取购物车
   */
  async getCart(): Promise<ICartResponse> {
    return await this.http('/cart', {
      method: 'GET'
    })
  }
  
  /**
   * 添加到购物车
   */
  async addToCart(params: IAddToCartParams): Promise<void> {
    return await this.http('/cart/items', {
      method: 'POST',
      body: params
    })
  }
  
  /**
   * 更新购物车项
   */
  async updateCartItem(params: IUpdateCartItemParams): Promise<void> {
    return await this.http(`/cart/items/${params.cart_item_id}`, {
      method: 'PUT',
      body: params
    })
  }
  
  /**
   * 删除购物车项
   */
  async removeCartItem(cartItemId: string): Promise<void> {
    return await this.http(`/cart/items/${cartItemId}`, {
      method: 'DELETE'
    })
  }
  
  /**
   * 清空购物车
   */
  async clearCart(): Promise<void> {
    return await this.http('/cart', {
      method: 'DELETE'
    })
  }
}

export const cartApiClient = new CartApiClient()
```

### 3. Transformer

```typescript
// app/infrastructure/transformers/cartTransformer.ts

import type { ICartItemDTO } from '~/types/api/cart'
import type { ICartItem } from '~/types/cart'

export class CartTransformer {
  /**
   * DTO → 领域模型
   */
  static toModel(dto: ICartItemDTO): ICartItem {
    return {
      id: dto.cart_item_id,
      productId: dto.item_id,
      productName: dto.item_name,
      productImage: dto.item_image,
      price: dto.price,
      quantity: dto.quantity,
      stock: dto.stock,
      selected: dto.selected,
      available: dto.available,
      subtotal: dto.price * dto.quantity,
      skuInfo: dto.sku_info ? {
        skuId: dto.sku_info.sku_id,
        skuText: dto.sku_info.sku_text
      } : undefined
    }
  }
  
  /**
   * DTO 数组 → 领域模型数组
   */
  static toModelList(dtos: ICartItemDTO[]): ICartItem[] {
    return dtos.map(dto => this.toModel(dto))
  }
}
```

### 4. Store

```typescript
// app/stores/cart.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ICartItem } from '~/types/cart'
import { cartApiClient } from '~/infrastructure/http/clients/CartApiClient'
import { CartTransformer } from '~/infrastructure/transformers/cartTransformer'
import { logger } from '~/utils/log'

/**
 * 购物车 Store
 * 
 * 职责：
 * - 管理购物车状态
 * - 提供购物车操作方法
 * - 持久化购物车数据
 */
export const useCartStore = defineStore('cart', () => {
  // 状态
  const items = ref<ICartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters（计算属性）
  
  /** 购物车商品总数 */
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  /** 选中的商品 */
  const selectedItems = computed(() => {
    return items.value.filter(item => item.selected && item.available)
  })
  
  /** 选中商品总价 */
  const selectedTotal = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.subtotal, 0)
  })
  
  /** 选中商品数量 */
  const selectedCount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  /** 是否全选 */
  const isAllSelected = computed(() => {
    const availableItems = items.value.filter(item => item.available)
    return availableItems.length > 0 && 
           availableItems.every(item => item.selected)
  })
  
  /** 是否为空 */
  const isEmpty = computed(() => items.value.length === 0)
  
  /** 是否可以结算 */
  const canCheckout = computed(() => selectedItems.value.length > 0)
  
  // Actions（方法）
  
  /**
   * 获取购物车
   */
  async function fetchCart() {
    loading.value = true
    error.value = null
    
    try {
      const response = await cartApiClient.getCart()
      items.value = CartTransformer.toModelList(response.items)
      
      logger.info('[CartStore] 加载购物车成功:', items.value.length, '件商品')
    } catch (e: any) {
      error.value = e.message
      logger.error('[CartStore] 加载购物车失败:', e)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 添加到购物车
   */
  async function addItem(productId: string, quantity: number, skuId?: string) {
    try {
      await cartApiClient.addToCart({
        item_id: productId,
        quantity,
        sku_id: skuId
      })
      
      // 重新加载购物车
      await fetchCart()
      
      logger.info('[CartStore] 添加商品成功:', productId)
    } catch (e: any) {
      logger.error('[CartStore] 添加商品失败:', e)
      throw e
    }
  }
  
  /**
   * 更新商品数量
   */
  async function updateQuantity(cartItemId: string, quantity: number) {
    try {
      await cartApiClient.updateCartItem({
        cart_item_id: cartItemId,
        quantity
      })
      
      // 本地更新（乐观更新）
      const item = items.value.find(i => i.id === cartItemId)
      if (item) {
        item.quantity = quantity
        item.subtotal = item.price * quantity
      }
      
      logger.info('[CartStore] 更新数量成功:', cartItemId, quantity)
    } catch (e: any) {
      // 失败时重新加载
      await fetchCart()
      logger.error('[CartStore] 更新数量失败:', e)
      throw e
    }
  }
  
  /**
   * 切换选中状态
   */
  async function toggleSelection(cartItemId: string) {
    const item = items.value.find(i => i.id === cartItemId)
    if (!item) return
    
    try {
      const newSelected = !item.selected
      
      await cartApiClient.updateCartItem({
        cart_item_id: cartItemId,
        selected: newSelected
      })
      
      // 本地更新
      item.selected = newSelected
      
      logger.info('[CartStore] 切换选中:', cartItemId, newSelected)
    } catch (e: any) {
      await fetchCart()
      logger.error('[CartStore] 切换选中失败:', e)
      throw e
    }
  }
  
  /**
   * 全选/反选
   */
  async function toggleSelectAll() {
    const newSelected = !isAllSelected.value
    
    try {
      // 批量更新（需要后端支持批量接口）
      const availableItems = items.value.filter(item => item.available)
      
      for (const item of availableItems) {
        await cartApiClient.updateCartItem({
          cart_item_id: item.id,
          selected: newSelected
        })
        item.selected = newSelected
      }
      
      logger.info('[CartStore] 全选/反选:', newSelected)
    } catch (e: any) {
      await fetchCart()
      logger.error('[CartStore] 全选/反选失败:', e)
      throw e
    }
  }
  
  /**
   * 删除商品
   */
  async function removeItem(cartItemId: string) {
    try {
      await cartApiClient.removeCartItem(cartItemId)
      
      // 本地删除
      items.value = items.value.filter(item => item.id !== cartItemId)
      
      logger.info('[CartStore] 删除商品成功:', cartItemId)
    } catch (e: any) {
      await fetchCart()
      logger.error('[CartStore] 删除商品失败:', e)
      throw e
    }
  }
  
  /**
   * 清空购物车
   */
  async function clear() {
    try {
      await cartApiClient.clearCart()
      items.value = []
      
      logger.info('[CartStore] 清空购物车成功')
    } catch (e: any) {
      logger.error('[CartStore] 清空购物车失败:', e)
      throw e
    }
  }
  
  return {
    // 状态
    items,
    loading,
    error,
    
    // Getters
    itemCount,
    selectedItems,
    selectedTotal,
    selectedCount,
    isAllSelected,
    isEmpty,
    canCheckout,
    
    // Actions
    fetchCart,
    addItem,
    updateQuantity,
    toggleSelection,
    toggleSelectAll,
    removeItem,
    clear
  }
}, {
  // 持久化配置
  persist: {
    storage: persistedState.localStorage,
    paths: ['items']  // 只持久化 items，loading/error 不持久化
  }
})
```

### 5. Composable

```typescript
// app/composables/useCart.ts

import { computed } from 'vue'
import { useCartStore } from '~/stores/cart'
import { logger } from '~/utils/log'

/**
 * 购物车逻辑封装
 * 
 * 职责：
 * - 封装 Store 操作
 * - 添加 UI 层错误处理
 * - 提供便捷的方法
 */
export function useCart() {
  const cartStore = useCartStore()
  const message = useMessage()
  
  /**
   * 添加到购物车（带提示）
   */
  const addToCart = async (
    productId: string, 
    quantity: number = 1, 
    skuId?: string
  ): Promise<boolean> => {
    try {
      await cartStore.addItem(productId, quantity, skuId)
      message.success('已加入购物车')
      return true
    } catch (error: any) {
      message.error(`添加失败: ${error.message}`)
      return false
    }
  }
  
  /**
   * 更新数量（带提示）
   */
  const updateQuantity = async (
    cartItemId: string, 
    quantity: number
  ): Promise<boolean> => {
    try {
      await cartStore.updateQuantity(cartItemId, quantity)
      return true
    } catch (error: any) {
      message.error(`更新失败: ${error.message}`)
      return false
    }
  }
  
  /**
   * 删除商品（带确认）
   */
  const removeItem = async (cartItemId: string): Promise<boolean> => {
    try {
      await cartStore.removeItem(cartItemId)
      message.success('已删除')
      return true
    } catch (error: any) {
      message.error(`删除失败: ${error.message}`)
      return false
    }
  }
  
  /**
   * 增加数量
   */
  const increaseQuantity = async (cartItemId: string): Promise<void> => {
    const item = cartStore.items.find(i => i.id === cartItemId)
    if (!item) return
    
    if (item.quantity >= item.stock) {
      message.warning('已达库存上限')
      return
    }
    
    await updateQuantity(cartItemId, item.quantity + 1)
  }
  
  /**
   * 减少数量
   */
  const decreaseQuantity = async (cartItemId: string): Promise<void> => {
    const item = cartStore.items.find(i => i.id === cartItemId)
    if (!item) return
    
    if (item.quantity <= 1) {
      message.warning('数量不能少于1')
      return
    }
    
    await updateQuantity(cartItemId, item.quantity - 1)
  }
  
  return {
    // Store 状态（只读）
    items: computed(() => cartStore.items),
    loading: computed(() => cartStore.loading),
    itemCount: computed(() => cartStore.itemCount),
    selectedTotal: computed(() => cartStore.selectedTotal),
    selectedCount: computed(() => cartStore.selectedCount),
    isAllSelected: computed(() => cartStore.isAllSelected),
    isEmpty: computed(() => cartStore.isEmpty),
    canCheckout: computed(() => cartStore.canCheckout),
    
    // 方法（带 UI 逻辑）
    addToCart,
    updateQuantity,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    toggleSelection: cartStore.toggleSelection,
    toggleSelectAll: cartStore.toggleSelectAll,
    fetchCart: cartStore.fetchCart,
    clear: cartStore.clear
  }
}
```

### 6. 购物车页面

```vue
<!-- app/pages/cart/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">购物车</h1>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
    </div>
    
    <!-- 购物车内容 -->
    <template v-else-if="!isEmpty">
      <!-- 表头 -->
      <div class="hidden md:grid grid-cols-12 gap-4 py-4 border-b font-medium">
        <div class="col-span-1">
          <input 
            type="checkbox" 
            :checked="isAllSelected"
            @change="handleSelectAll"
          />
        </div>
        <div class="col-span-5">商品信息</div>
        <div class="col-span-2 text-center">单价</div>
        <div class="col-span-2 text-center">数量</div>
        <div class="col-span-1 text-center">小计</div>
        <div class="col-span-1 text-center">操作</div>
      </div>
      
      <!-- 商品列表 -->
      <div class="space-y-4 mt-4">
        <CartItem
          v-for="item in items"
          :key="item.id"
          :item="item"
          @update-quantity="handleUpdateQuantity"
          @toggle-selection="handleToggleSelection"
          @remove="handleRemove"
        />
      </div>
      
      <!-- 结算栏 -->
      <CartSummary
        :selected-count="selectedCount"
        :selected-total="selectedTotal"
        :can-checkout="canCheckout"
        class="mt-6"
        @checkout="handleCheckout"
      />
    </template>
    
    <!-- 空状态 -->
    <div v-else class="text-center py-20">
      <div class="text-gray-400 text-6xl mb-4">🛒</div>
      <p class="text-gray-500 mb-6">购物车是空的</p>
      <UButton to="/item/list">去逛逛</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const {
  items,
  loading,
  isEmpty,
  selectedCount,
  selectedTotal,
  isAllSelected,
  canCheckout,
  fetchCart,
  toggleSelection,
  toggleSelectAll,
  increaseQuantity,
  decreaseQuantity,
  removeItem
} = useCart()

// 加载购物车
onMounted(() => {
  fetchCart()
})

// 全选/反选
const handleSelectAll = async () => {
  await toggleSelectAll()
}

// 切换选中
const handleToggleSelection = async (itemId: string) => {
  await toggleSelection(itemId)
}

// 更新数量
const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  const item = items.value.find(i => i.id === itemId)
  if (!item) return
  
  if (quantity > item.quantity) {
    await increaseQuantity(itemId)
  } else if (quantity < item.quantity) {
    await decreaseQuantity(itemId)
  }
}

// 删除商品
const handleRemove = async (itemId: string) => {
  if (!confirm('确定要删除这件商品吗？')) return
  await removeItem(itemId)
}

// 去结算
const handleCheckout = () => {
  if (!canCheckout.value) {
    return
  }
  router.push('/checkout')
}

// SEO
useHead({
  title: '购物车',
  meta: [
    { name: 'description', content: '查看和管理您的购物车' }
  ]
})
</script>
```

### 7. 迷你购物车组件

```vue
<!-- app/components/business/cart/MiniCart.vue -->
<template>
  <div class="relative">
    <!-- 购物车图标 -->
    <button 
      class="relative p-2 hover:bg-gray-100 rounded-lg"
      @click="toggleCart"
    >
      <Icon name="i-heroicons-shopping-cart" class="w-6 h-6" />
      
      <!-- 商品数量角标 -->
      <span 
        v-if="itemCount > 0"
        class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ itemCount > 99 ? '99+' : itemCount }}
      </span>
    </button>
    
    <!-- 下拉面板 -->
    <Transition name="fade">
      <div 
        v-if="isOpen"
        v-click-outside="closeCart"
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium">购物车</h3>
            <span class="text-sm text-gray-500">{{ itemCount }} 件商品</span>
          </div>
          
          <!-- 商品列表（最多显示 3 个） -->
          <div v-if="!isEmpty" class="space-y-3 max-h-60 overflow-y-auto">
            <div 
              v-for="item in displayItems" 
              :key="item.id"
              class="flex gap-3"
            >
              <img 
                :src="item.productImage" 
                :alt="item.productName"
                class="w-16 h-16 rounded object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">{{ item.productName }}</p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-primary font-medium">¥{{ item.price }}</span>
                  <span class="text-sm text-gray-500">×{{ item.quantity }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="itemCount > 3" class="text-center text-sm text-gray-500">
              还有 {{ itemCount - 3 }} 件商品...
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            购物车是空的
          </div>
          
          <!-- 底部按钮 -->
          <div class="mt-4 pt-4 border-t">
            <div class="flex items-center justify-between mb-3">
              <span>合计：</span>
              <span class="text-lg font-bold text-primary">
                ¥{{ selectedTotal.toFixed(2) }}
              </span>
            </div>
            
            <UButton 
              block 
              size="lg"
              :disabled="isEmpty"
              @click="goToCart"
            >
              去购物车结算
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { items, isEmpty, itemCount, selectedTotal } = useCart()

const isOpen = ref(false)

// 最多显示 3 个商品
const displayItems = computed(() => items.value.slice(0, 3))

const toggleCart = () => {
  isOpen.value = !isOpen.value
}

const closeCart = () => {
  isOpen.value = false
}

const goToCart = () => {
  closeCart()
  router.push('/cart')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## 开发检查清单

购物车功能开发前确认：

**类型定义**：
- [ ] API 类型 (`types/api/cart.ts`)
- [ ] 领域类型 (`types/cart.ts`)

**基础设施层**：
- [ ] Cart API Client
- [ ] Cart Transformer
- [ ] 测试 API 调用

**Store**：
- [ ] 创建 cartStore
- [ ] 实现所有 actions
- [ ] 配置持久化
- [ ] 测试状态更新

**Composable**：
- [ ] 创建 useCart
- [ ] 封装 UI 逻辑
- [ ] 添加错误提示

**组件**：
- [ ] 购物车页面
- [ ] 购物车商品项组件
- [ ] 购物车结算栏
- [ ] 迷你购物车
- [ ] 空状态展示

**测试**：
- [ ] 测试添加到购物车
- [ ] 测试数量修改
- [ ] 测试删除商品
- [ ] 测试全选功能
- [ ] 测试数据持久化
- [ ] 测试多页面状态同步

## 常见问题

**Q: 购物车数据什么时候加载？**
A: 应用启动时自动加载（在 `app.vue` 或插件中），确保 Header 的迷你购物车能立即显示数量。

**Q: 如何处理未登录用户的购物车？**
A: 可以先存储在 localStorage，登录后合并到服务端。

**Q: 数量修改是否需要防抖？**
A: 建议添加防抖，避免频繁请求。可以在 Composable 中使用 `useDebounceFn`。

**Q: 购物车数据多久同步一次？**
A: 进入购物车页面时同步一次。其他操作（添加、修改、删除）都会立即同步。

---

**相关 Skills**：
- `ecshopx-system` - 系统基础架构
- `ecshopx-catalog` - 商品目录
- `ecshopx-checkout` - 结账流程

**最后更新**：2025-01-11
