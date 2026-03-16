<template>
  <div class="bg-white min-h-screen">
    <!-- H5 头部 (仅移动端显示) -->
    <div class="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
      <div class="flex items-center gap-2 cursor-pointer" @click="toggleMobileMenu">
        <h1 class="text-base font-medium text-gray-900">我的订单</h1>
        <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-900" />
      </div>
    </div>

    <!-- H5 下拉菜单 (背景遮罩) -->
    <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-20 bg-black/50" @click="showMobileMenu = false">
      <div class="bg-white p-4 animate-slide-down">
        <div class="grid grid-cols-1 gap-4">
          <div 
            v-for="item in menuItems" 
            :key="item.key" 
            class="py-3 border-b border-gray-50 text-base flex justify-between items-center"
            @click="navigateTo(item.path)"
          >
            <span :class="item.key === activeMenu ? 'text-black font-medium' : 'text-gray-600'">{{ item.label }}</span>
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <div class="content-stretch flex items-start justify-center lg:px-[128px] lg:py-[32px] relative shrink-0 w-full">
      <div class="content-stretch flex flex-[1_0_0] lg:gap-[64px] items-start min-h-px min-w-px relative">
        <!-- PC 左侧菜单 -->
        <div class="hidden lg:block w-64 shrink-0">
          <AccountMenu v-model="activeMenu" />
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- 状态 Tabs -->
          <div class="bg-white sticky top-[49px] lg:static lg:top-0 z-10 border-b border-gray-100 lg:border-none">
            <div class="flex overflow-x-auto no-scrollbar items-center px-4 py-2 lg:px-0">
              <template v-for="(tab, index) in tabs" :key="tab.key">
                <button
                  class="py-2 whitespace-nowrap text-sm transition-colors relative"
                  :class="currentStatus === tab.key ? 'text-black font-medium' : 'text-gray-500 hover:text-gray-800'"
                  @click="changeStatus(tab.key)"
                >
                  {{ tab.label }}
                </button>
                <div v-if="index < tabs.length - 1" class="h-4 w-px bg-gray-300 mx-3 lg:mx-6 shrink-0"></div>
              </template>
            </div>
          </div>

          <!-- 订单列表 -->
          <div class="p-4 lg:p-0">
            <!-- 加载中 -->
            <div v-if="loading && orders.length === 0" class="space-y-4 pt-4">
              <div v-for="i in 3" :key="i" class="border border-gray-100 p-4 rounded-lg">
                <div class="flex justify-between mb-4">
                  <USkeleton class="h-4 w-32" />
                  <USkeleton class="h-4 w-16" />
                </div>
                <div class="flex gap-4">
                  <USkeleton class="h-20 w-20" />
                  <div class="flex-1 space-y-2">
                    <USkeleton class="h-4 w-full" />
                    <USkeleton class="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-20 text-gray-500">
              <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 mb-4 opacity-20" />
              <p>暂无相关订单</p>
            </div>

            <!-- 列表内容 -->
            <div v-else class="pt-6">
              <div v-for="order in orders" :key="order.orderId" class="border-b border-gray-100 py-6 lg:py-8 lg:px-0 hover:bg-gray-50/50 transition-colors">
                <!-- 订单头 -->
                <div class="flex flex-col mb-4">
                  <div class="text-base font-medium mb-4" :class="getStatusColorClass(order.status)">
                    {{ order.statusText }}
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-building-storefront" class="w-5 h-5 text-gray-400" />
                    <span class="text-sm font-medium text-gray-900">店铺名称</span>
                  </div>
                </div>

                <!-- 商品列表 -->
                <div class="space-y-4 border-b border-gray-100 pb-4">
                  <div v-for="item in order.items" :key="item.itemId" class="flex gap-4 items-start">
                    <img :src="item.itemImage" class="w-24 h-24 lg:w-[96px] lg:h-[96px] object-cover rounded bg-gray-50 shrink-0" />
                    <div class="flex-1 flex flex-col h-24 justify-between min-w-0">
                      <div class="flex justify-between items-start">
                        <h3 class="text-sm font-medium text-gray-900 truncate pr-4 max-w-[70%]">{{ item.itemName }}</h3>
                        <span class="text-sm text-gray-900 whitespace-nowrap">¥ {{ item.price.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between items-end mt-auto">
                        <p class="text-xs text-gray-500 truncate max-w-[70%]">{{ item.specName }}</p>
                        <span class="text-sm text-gray-900">数量:{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 订单汇总与操作 -->
                <div class="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="flex items-center justify-end lg:justify-start gap-4 text-sm text-gray-600">
                    <span>数量: {{ getTotalQuantity(order) }}</span>
                    <span>总计: <span class="text-base font-medium text-black">¥ {{ order.totalAmount.toFixed(2) }}</span></span>
                  </div>
                  
                  <div class="flex gap-3 justify-end w-full lg:w-auto">
                    <button 
                      v-if="order.canCancel" 
                      class="flex-1 lg:flex-none lg:min-w-[120px] px-4 py-3 border border-black text-xs font-medium text-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      @click="cancelOrder(order.orderId)"
                    >
                      取消订单
                    </button>
                    <button 
                      v-if="order.canPay" 
                      class="flex-1 lg:flex-none lg:min-w-[120px] px-4 py-3 bg-black text-xs font-medium text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                      @click="payNow(order.orderId)"
                    >
                      立即支付
                    </button>
                    <button 
                      v-if="order.canConfirmReceipt" 
                      class="flex-1 lg:flex-none lg:min-w-[120px] px-4 py-3 bg-black text-xs font-medium text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                      @click="confirmReceipt(order.orderId)"
                    >
                      确认收货
                    </button>
                    <button 
                      v-if="order.canDelete" 
                      class="flex-1 lg:flex-none lg:min-w-[120px] px-4 py-3 border border-black text-xs font-medium text-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      @click="deleteOrder(order.orderId)"
                    >
                      删除订单
                    </button>
                    <button 
                      v-if="order.canApplyAftersales" 
                      class="flex-1 lg:flex-none lg:min-w-[120px] px-4 py-3 border border-black text-xs font-medium text-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      @click="applyAftersales(order.orderId)"
                    >
                      申请售后
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 (PC) -->
            <div v-if="totalPages > 1 && !loading" class="hidden lg:flex justify-end mt-10">
              <ECPagination
                :total="total"
                :page-size="pageSize"
                :current-page="currentPage"
                @update:current-page="handlePageChange"
              />
            </div>

            <!-- 加载更多 (H5) -->
            <div v-if="hasMore && !loading" class="lg:hidden py-8 flex justify-center">
              <button @click="loadMore" class="text-sm text-gray-400">加载更多...</button>
            </div>
            <div v-else-if="loading && orders.length > 0" class="lg:hidden py-8 flex justify-center">
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { OrderStatus } from '~/types/api/order'
import { useOrders } from '~/composables/useOrders'
import AccountMenu from './components/AccountMenu.vue'

definePageMeta({
  layout: 'default',
})

const router = useRouter()

const {
  orders,
  loading,
  currentStatus,
  currentPage,
  pageSize,
  total,
  totalPages,
  hasMore,
  isEmpty,
  loadOrders,
  changeStatus,
  loadMore,
  cancelOrder,
  confirmReceipt,
  deleteOrder,
  payNow,
} = useOrders()

// 状态定义
const activeMenu = ref('orders')
const showMobileMenu = ref(false)

const tabs = [
  { key: OrderStatus.ALL, label: '全部订单' },
  { key: OrderStatus.PENDING_PAYMENT, label: '待支付' },
  { key: OrderStatus.SHIPPED, label: '待收货' },
  { key: OrderStatus.PENDING_PICKUP, label: '待自提' },
  { key: OrderStatus.AFTER_SALES, label: '售后' },
  { key: OrderStatus.PENDING_REVIEW, label: '待评价' },
]

const menuItems = [
  { key: 'profile', label: '个人中心', path: '/account' },
  { key: 'orders', label: '我的订单', path: '/account/orders' },
  { key: 'coupons', label: '我的优惠券', path: '/account/coupons' },
  { key: 'favorites', label: '我的收藏', path: '/account/favorites' },
  { key: 'address', label: '收货地址', path: '/account/address' },
  { key: 'reviews', label: '我的评价', path: '/account/reviews' },
]

// 计算属性/辅助函数
function getTotalQuantity(order: any) {
  return order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
}

function getStatusColorClass(status: string) {
  switch (status) {
    case 'pending_payment': return 'text-red-500'
    case 'pending_shipment': return 'text-orange-500'
    case 'pending_pickup': return 'text-blue-600'
    case 'shipped': return 'text-blue-500'
    case 'completed': return 'text-green-500'
    case 'cancelled': return 'text-gray-400'
    default: return 'text-black'
  }
}

function handlePageChange(page: number) {
  loadOrders(currentStatus.value, page)
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function applyAftersales(orderId: string) {
  // TODO: 后续实现售后逻辑跳转
  const toast = useToastMessage()
  toast.show('申请售后功能开发中')
}

// 初始化
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes slide-down {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-down {
  animation: slide-down 0.2s ease-out forwards;
}
</style>
