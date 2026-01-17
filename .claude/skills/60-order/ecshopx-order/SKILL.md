---
name: ecshopx-order
description: "ECShopX 订单管理功能开发指南。包含订单列表、订单详情、订单状态、物流跟踪、售后申请等功能。适用场景: (1) 开发订单列表页 (2) 订单详情查看 (3) 订单状态展示 (4) 物流信息查询 (5) 售后流程。采用简化架构，订单数据不需要全局状态。"
---

# 订单管理功能开发

## 概述

订单管理是用户查看购买记录、跟踪物流、申请售后的核心功能。

**核心功能**：
- 订单列表（按状态筛选）
- 订单详情查看
- 订单状态展示
- 物流信息跟踪
- 取消订单
- 确认收货
- 申请售后

**架构方案**：**方案 2（简化架构）** - 订单数据通常只在订单页面使用

## 快速开始

### 基本结构

```
app/
├── pages/orders/
│   ├── index.vue                # 订单列表
│   └── [id].vue                 # 订单详情
│
├── components/business/order/
│   ├── OrderCard.vue            # 订单卡片
│   ├── OrderStatus.vue          # 订单状态
│   ├── OrderItems.vue           # 订单商品
│   └── LogisticsTrack.vue       # 物流跟踪
│
├── composables/
│   └── useOrder.ts              # 订单逻辑
│
└── infrastructure/http/clients/
    └── OrderApiClient.ts        # 订单 API
```

## 核心功能实现

### 1. 订单列表页

```vue
<!-- app/pages/orders/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">我的订单</h1>
    
    <!-- 状态标签 -->
    <div class="flex gap-4 mb-6 overflow-x-auto">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        :class="[
          'px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
          currentStatus === tab.value
            ? 'bg-primary text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        ]"
        @click="changeStatus(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="ml-1">({{ tab.count }})</span>
      </button>
    </div>
    
    <!-- 订单列表 -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg p-6 shadow-sm animate-pulse">
        <div class="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    <div v-else-if="hasOrders" class="space-y-4">
      <OrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        @view-detail="viewDetail"
        @cancel="handleCancel"
        @confirm-receipt="handleConfirmReceipt"
      />
      
      <!-- 分页 -->
      <UPagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :total="total"
        :page-size="pageSize"
        class="flex justify-center mt-6"
        @update:model-value="loadOrders"
      />
    </div>
    
    <!-- 空状态 -->
    <div v-else class="text-center py-20">
      <div class="text-gray-400 text-6xl mb-4">📦</div>
      <p class="text-gray-500 mb-6">暂无订单</p>
      <UButton to="/">去逛逛</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const {
  orders,
  loading,
  total,
  currentPage,
  pageSize,
  totalPages,
  loadOrders,
  cancelOrder,
  confirmReceipt
} = useOrder()

const currentStatus = ref(route.query.status as string || 'all')

const statusTabs = [
  { label: '全部', value: 'all', count: 0 },
  { label: '待付款', value: 'pending', count: 0 },
  { label: '待发货', value: 'paid', count: 0 },
  { label: '待收货', value: 'shipped', count: 0 },
  { label: '已完成', value: 'completed', count: 0 }
]

const hasOrders = computed(() => orders.value.length > 0)

// 加载订单
onMounted(() => {
  loadOrders({ status: currentStatus.value })
})

// 切换状态
const changeStatus = (status: string) => {
  currentStatus.value = status
  currentPage.value = 1
  loadOrders({ status })
  
  // 更新 URL
  router.push({
    query: { status: status !== 'all' ? status : undefined }
  })
}

// 查看详情
const viewDetail = (orderId: string) => {
  router.push(`/orders/${orderId}`)
}

// 取消订单
const handleCancel = async (orderId: string) => {
  if (!confirm('确定要取消订单吗？')) return
  
  try {
    await cancelOrder(orderId)
    useMessage().success('订单已取消')
    loadOrders({ status: currentStatus.value })
  } catch (error: any) {
    useMessage().error(`取消失败: ${error.message}`)
  }
}

// 确认收货
const handleConfirmReceipt = async (orderId: string) => {
  if (!confirm('确认收到商品了吗？')) return
  
  try {
    await confirmReceipt(orderId)
    useMessage().success('已确认收货')
    loadOrders({ status: currentStatus.value })
  } catch (error: any) {
    useMessage().error(`操作失败: ${error.message}`)
  }
}

// SEO
useHead({
  title: '我的订单',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>
```

### 2. 订单详情页

```vue
<!-- app/pages/orders/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
    </div>
    
    <div v-else-if="orderDetail" class="space-y-6">
      <!-- 订单状态 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <OrderStatus :status="orderDetail.status" />
      </div>
      
      <!-- 物流信息 -->
      <div 
        v-if="orderDetail.logisticsInfo"
        class="bg-white rounded-lg p-6 shadow-sm"
      >
        <h2 class="font-medium mb-4">物流信息</h2>
        <LogisticsTrack :logistics="orderDetail.logisticsInfo" />
      </div>
      
      <!-- 收货地址 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="font-medium mb-4">收货信息</h2>
        <div class="space-y-2 text-sm">
          <p>
            <span class="text-gray-600">收货人：</span>
            {{ orderDetail.address.consignee }} {{ orderDetail.address.mobile }}
          </p>
          <p>
            <span class="text-gray-600">收货地址：</span>
            {{ orderDetail.address.fullAddress }}
          </p>
        </div>
      </div>
      
      <!-- 商品清单 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="font-medium mb-4">商品清单</h2>
        <OrderItems :items="orderDetail.items" />
      </div>
      
      <!-- 订单信息 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="font-medium mb-4">订单信息</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">订单号：</span>
            <span>{{ orderDetail.orderNo }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">下单时间：</span>
            <span>{{ formatDate(orderDetail.createdAt) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">商品金额：</span>
            <span>¥{{ orderDetail.itemsTotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">运费：</span>
            <span>¥{{ orderDetail.shippingFee.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>实付金额：</span>
            <span class="text-primary">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex gap-4">
        <UButton 
          v-if="orderDetail.status === 'pending'"
          block
          @click="handlePay"
        >
          去支付
        </UButton>
        
        <UButton 
          v-if="orderDetail.status === 'shipped'"
          block
          @click="handleConfirmReceipt"
        >
          确认收货
        </UButton>
        
        <UButton 
          v-if="canCancel"
          variant="outline"
          block
          @click="handleCancel"
        >
          取消订单
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string

const {
  orderDetail,
  loading,
  loadOrderDetail,
  cancelOrder,
  confirmReceipt
} = useOrder()

const canCancel = computed(() => 
  ['pending', 'paid'].includes(orderDetail.value?.status || '')
)

onMounted(() => {
  loadOrderDetail(orderId)
})

const handlePay = () => {
  router.push(`/payment/${orderId}`)
}

const handleCancel = async () => {
  if (!confirm('确定要取消订单吗？')) return
  
  try {
    await cancelOrder(orderId)
    useMessage().success('订单已取消')
    loadOrderDetail(orderId)
  } catch (error: any) {
    useMessage().error(`取消失败: ${error.message}`)
  }
}

const handleConfirmReceipt = async () => {
  if (!confirm('确认收到商品了吗？')) return
  
  try {
    await confirmReceipt(orderId)
    useMessage().success('已确认收货')
    loadOrderDetail(orderId)
  } catch (error: any) {
    useMessage().error(`操作失败: ${error.message}`)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>
```

### 3. 订单 Composable

```typescript
// app/composables/useOrder.ts

import { ref, computed, readonly } from 'vue'
import type { IOrder, IOrderDetail } from '~/types/order'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import { logger } from '~/utils/log'

export function useOrder() {
  const orders = ref<IOrder[]>([])
  const orderDetail = ref<IOrderDetail | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = 10
  
  const totalPages = computed(() => Math.ceil(total.value / pageSize))
  
  /**
   * 加载订单列表
   */
  async function loadOrders(params?: { status?: string }) {
    loading.value = true
    
    try {
      const response = await orderApiClient.getOrderList({
        page: currentPage.value,
        pageSize,
        status: params?.status
      })
      
      orders.value = response.list.map(order => ({
        id: order.order_id,
        orderNo: order.order_no,
        status: order.status,
        totalAmount: order.total_amount,
        itemsCount: order.items_count,
        items: order.items,
        createdAt: order.created_at
      }))
      
      total.value = response.total
      
      logger.info('[useOrder] 加载订单列表成功:', orders.value.length)
    } catch (e: any) {
      logger.error('[useOrder] 加载订单列表失败:', e)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 加载订单详情
   */
  async function loadOrderDetail(orderId: string) {
    loading.value = true
    
    try {
      const response = await orderApiClient.getOrderDetail(orderId)
      
      orderDetail.value = {
        id: response.order_id,
        orderNo: response.order_no,
        status: response.status,
        items: response.items,
        address: response.address,
        itemsTotal: response.items_total,
        shippingFee: response.shipping_fee,
        totalAmount: response.total_amount,
        logisticsInfo: response.logistics,
        createdAt: response.created_at
      }
      
      logger.info('[useOrder] 加载订单详情成功:', orderId)
    } catch (e: any) {
      logger.error('[useOrder] 加载订单详情失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 取消订单
   */
  async function cancelOrder(orderId: string) {
    try {
      await orderApiClient.cancelOrder(orderId)
      logger.info('[useOrder] 取消订单成功:', orderId)
      return true
    } catch (e: any) {
      logger.error('[useOrder] 取消订单失败:', e)
      throw e
    }
  }
  
  /**
   * 确认收货
   */
  async function confirmReceipt(orderId: string) {
    try {
      await orderApiClient.confirmReceipt(orderId)
      logger.info('[useOrder] 确认收货成功:', orderId)
      return true
    } catch (e: any) {
      logger.error('[useOrder] 确认收货失败:', e)
      throw e
    }
  }
  
  return {
    orders: readonly(orders),
    orderDetail: readonly(orderDetail),
    loading: readonly(loading),
    total: readonly(total),
    currentPage,
    pageSize,
    totalPages,
    
    loadOrders,
    loadOrderDetail,
    cancelOrder,
    confirmReceipt
  }
}
```

## 订单状态流转

```typescript
// 订单状态
export enum OrderStatus {
  Pending = 'pending',      // 待付款
  Paid = 'paid',           // 已付款（待发货）
  Shipped = 'shipped',     // 已发货（待收货）
  Completed = 'completed', // 已完成
  Cancelled = 'cancelled', // 已取消
  Refunding = 'refunding', // 退款中
  Refunded = 'refunded'    // 已退款
}

// 状态流转
Pending → Paid → Shipped → Completed
   ↓        ↓        ↓
Cancelled  Refunding  Refunding
           ↓          ↓
         Refunded   Refunded
```

## 开发检查清单

- [ ] 订单列表页
- [ ] 订单详情页
- [ ] 订单状态筛选
- [ ] 订单卡片组件
- [ ] 订单状态组件
- [ ] 物流跟踪组件
- [ ] 取消订单功能
- [ ] 确认收货功能
- [ ] 分页功能

## 常见问题

**Q: 订单列表如何优化性能？**
A: 使用分页加载，默认每页 10 条。移动端可以考虑无限滚动。

**Q: 物流信息如何实时更新？**
A: 进入详情页时查询一次，不需要实时轮询。用户可以手动刷新。

**Q: 如何处理订单超时？**
A: 后端定时任务处理，前端显示倒计时提示用户。

---

**相关 Skills**：
- `ecshopx-payment` - 支付功能
- `ecshopx-account` - 账号管理

**最后更新**：2025-01-12
