<!--
  订单列表页面示例
  
  展示如何使用 usePagination 实现订单列表的分页加载功能
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900">我的订单</h1>
        <p class="mt-1 text-sm text-gray-600">查看和管理您的订单</p>
      </div>
    </div>

    <!-- 订单状态筛选 -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex gap-4 overflow-x-auto py-4">
          <button
            v-for="status in orderStatuses"
            :key="status.value"
            :class="[
              'px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
              filterParams.status === status.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
            @click="handleStatusChange(status.value)"
          >
            {{ status.label }}
            <span v-if="status.count" class="ml-1 text-sm">({{ status.count }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 加载状态 -->
      <div v-if="pending && !orders.length" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-gray-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p class="text-gray-600 mb-4">{{ error.message || '网络错误，请稍后重试' }}</p>
        <UButton @click="refresh()">重新加载</UButton>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!orders.length && !pending" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
        <p class="text-gray-600 mb-4">您还没有任何订单</p>
        <UButton to="/">去购物</UButton>
      </div>

      <!-- 订单列表 -->
      <div v-else class="space-y-4">
        <!-- 结果统计 -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-600">
            共找到 <span class="font-medium">{{ pagination.total }}</span> 个订单
          </p>
        </div>

        <!-- 订单卡片 -->
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- 订单头部 -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">订单号：{{ order.orderNumber }}</span>
              <span class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
            </div>
            <span :class="['text-sm font-medium', getStatusColor(order.status)]">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <!-- 订单商品列表 -->
          <div class="px-6 py-4">
            <div
              v-for="item in order.items"
              :key="item.itemId"
              class="flex gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <!-- 商品图片 -->
              <img
                :src="item.imageUrl"
                :alt="item.name"
                class="w-20 h-20 object-cover rounded"
                loading="lazy"
              />
              <!-- 商品信息 -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
                <p class="text-sm text-gray-500 mt-1">{{ item.spec }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-gray-900">¥{{ item.price.toFixed(2) }}</span>
                  <span class="text-sm text-gray-500">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单底部 -->
          <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div class="text-sm">
              <span class="text-gray-500">订单金额：</span>
              <span class="text-lg font-medium text-red-600">¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="flex gap-2">
              <UButton variant="outline" size="sm" @click="handleViewDetail(order.orderId)">
                查看详情
              </UButton>
              <UButton
                v-if="order.status === 'pending_payment'"
                variant="solid"
                size="sm"
                @click="handlePay(order.orderId)"
              >
                去支付
              </UButton>
              <UButton
                v-if="order.status === 'pending_receive'"
                variant="solid"
                size="sm"
                @click="handleConfirmReceipt(order.orderId)"
              >
                确认收货
              </UButton>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div v-if="hasMore" class="text-center">
          <UButton
            :loading="loadingMore"
            @click="loadMore"
            variant="outline"
            size="lg"
            class="w-full sm:w-auto min-w-[200px]"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </UButton>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-else-if="orders.length > 0" class="text-center py-6">
          <p class="text-gray-500 text-sm">已显示全部订单</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

// ========== 类型定义 ==========

interface IOrderItem {
  itemId: string
  name: string
  spec: string
  imageUrl: string
  price: number
  quantity: number
}

interface IOrder {
  orderId: string
  orderNumber: string
  status: 'pending_payment' | 'pending_ship' | 'pending_receive' | 'completed' | 'cancelled'
  items: IOrderItem[]
  totalAmount: number
  createdAt: string
}

// ========== SEO 配置 ==========

useSeoMeta({
  title: '我的订单 - ECSHOPX',
  description: '查看和管理您的订单，随时了解订单状态',
  robots: 'noindex,nofollow', // 订单页不需要被搜索引擎索引
})

// ========== 状态管理 ==========

// 订单状态选项
const orderStatuses = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '待支付', value: 'pending_payment', count: 0 },
  { label: '待发货', value: 'pending_ship', count: 0 },
  { label: '待收货', value: 'pending_receive', count: 0 },
  { label: '已完成', value: 'completed', count: 0 },
  { label: '已取消', value: 'cancelled', count: 0 },
])

// 筛选参数
const filterParams = ref({
  status: 'all',
})

// 路由
const route = useRoute()
const router = useRouter()

// ========== 使用分页 Composable ==========

const {
  items: orders,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
} = usePagination<IOrder>({
  pageSize: 10,
  fetchFn: async (page, pageSize) => {
    // 模拟 API 调用
    // 实际项目中应该调用：await orderApiClient.getOrderList({ page, pageSize, status })
    
    const mockData = await new Promise<{ orders: IOrder[]; total: number }>((resolve) => {
      setTimeout(() => {
        // 模拟数据
        const orders: IOrder[] = Array.from({ length: Math.min(10, 35 - (page - 1) * 10) }, (_, i) => ({
          orderId: `${page}-${i + 1}`,
          orderNumber: `ORD${Date.now()}${page}${i}`,
          status: ['pending_payment', 'pending_ship', 'pending_receive', 'completed'][
            Math.floor(Math.random() * 4)
          ] as IOrder['status'],
          items: [
            {
              itemId: `item-${i}`,
              name: `商品名称 ${i + 1}`,
              spec: '规格：默认',
              imageUrl: `/images/products/product-${(i % 6) + 1}.png`,
              price: 99.99 + i * 10,
              quantity: Math.floor(Math.random() * 3) + 1,
            },
          ],
          totalAmount: 99.99 + i * 10,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }))

        resolve({
          orders: filterParams.value.status === 'all' 
            ? orders 
            : orders.filter(o => o.status === filterParams.value.status),
          total: 35,
        })
      }, 500)
    })

    return {
      items: mockData.orders,
      total: mockData.total,
    }
  },
})

// ========== 工具函数 ==========

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 获取订单状态颜色
 */
const getStatusColor = (status: IOrder['status']) => {
  const colorMap = {
    pending_payment: 'text-orange-600',
    pending_ship: 'text-blue-600',
    pending_receive: 'text-green-600',
    completed: 'text-gray-600',
    cancelled: 'text-red-600',
  }
  return colorMap[status] || 'text-gray-600'
}

/**
 * 获取订单状态标签
 */
const getStatusLabel = (status: IOrder['status']) => {
  const labelMap = {
    pending_payment: '待支付',
    pending_ship: '待发货',
    pending_receive: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return labelMap[status] || '未知'
}

// ========== 事件处理 ==========

/**
 * 处理状态变化
 */
const handleStatusChange = (status: string) => {
  filterParams.value.status = status
  debouncedRefresh()
  updateUrlParams()
}

/**
 * 查看订单详情
 */
const handleViewDetail = (orderId: string) => {
  router.push(`/order/${orderId}`)
}

/**
 * 去支付
 */
const handlePay = (orderId: string) => {
  router.push(`/payment?orderId=${orderId}`)
}

/**
 * 确认收货
 */
const handleConfirmReceipt = async (orderId: string) => {
  if (confirm('确认收到商品了吗？')) {
    // 调用确认收货 API
    // await orderApiClient.confirmReceipt(orderId)
    
    // 刷新列表
    refresh()
  }
}

/**
 * 更新 URL 参数
 */
const updateUrlParams = () => {
  const query: Record<string, string> = {}
  
  if (filterParams.value.status !== 'all') {
    query.status = filterParams.value.status
  }
  
  router.replace({ query })
}

/**
 * 从 URL 恢复筛选状态
 */
const restoreFromUrl = () => {
  const query = route.query
  
  if (query.status) {
    filterParams.value.status = query.status as string
  }
}

/**
 * 防抖刷新
 */
const debouncedRefresh = useDebounceFn(() => {
  refresh()
}, 300)

// ========== 生命周期 ==========

onMounted(() => {
  // 从 URL 恢复筛选状态
  restoreFromUrl()
  
  // 加载第一页数据
  refresh()
})

// 监听路由变化
watch(
  () => route.query,
  () => {
    restoreFromUrl()
    refresh()
  },
  { deep: true }
)
</script>

