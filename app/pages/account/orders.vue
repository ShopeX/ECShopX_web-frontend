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
          <!-- 状态 Tabs（对齐 Figma：14px，激活 black/medium，未激活 #99a1af，分隔线 20px 高 #99a1af，左右 32px） -->
          <div class="bg-white sticky top-[49px] lg:static lg:top-0 z-10 border-b border-[#e5e7eb] lg:border-none">
            <div class="flex overflow-x-auto no-scrollbar items-center px-4 py-2 lg:px-0">
              <template v-for="(tab, index) in tabs" :key="tab.key">
                <button
                  type="button"
                  class="py-2 whitespace-nowrap text-[14px] leading-5 transition-colors px-4 lg:px-8 first:lg:pl-0 last:lg:pr-0"
                  :class="currentStatus === tab.key ? 'text-[#191a1d] font-medium' : 'text-[#99a1af] hover:text-[#364153]'"
                  @click="changeStatus(tab.key)"
                >
                  {{ tab.label }}
                </button>
                <div v-if="index < tabs.length - 1" class="h-5 w-px bg-[#99a1af] shrink-0" aria-hidden="true"></div>
              </template>
            </div>
          </div>

          <!-- 订单列表（对齐 Figma：白底卡片、32px 间距、16px 状态标题、店铺行、款号/款式/尺寸 12px、按钮 h-50 与边框样式） -->
          <div class="p-4 lg:p-0">
            <!-- 加载中 -->
            <div v-if="loading && orders.length === 0" class="space-y-4 pt-4">
              <div v-for="i in 3" :key="i" class="border border-[#e5e7eb] p-4 lg:p-8">
                <div class="flex justify-between mb-4">
                  <USkeleton class="h-4 w-32" />
                  <USkeleton class="h-4 w-16" />
                </div>
                <div class="flex gap-4 lg:gap-8">
                  <USkeleton class="h-20 w-20 lg:h-24 lg:w-24" />
                  <div class="flex-1 space-y-2">
                    <USkeleton class="h-4 w-full" />
                    <USkeleton class="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-20 text-[#6b7280]">
              <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 mb-4 opacity-20" />
              <p class="text-[14px]">暂无相关订单</p>
            </div>

            <!-- 列表内容 -->
            <div v-else class="pt-8 pb-8 flex flex-col gap-12 lg:gap-16">
              <div v-for="order in orders" :key="order.orderId" class="bg-white w-full flex flex-col gap-6 lg:gap-8">
                <!-- 状态与店铺 -->
                <div>
                  <!-- 状态标题 -->
                  <p class="text-[16px] font-medium leading-5 text-[#191a1d] mb-4">
                    {{ order.statusText }}
                  </p>
                  <!-- 店铺行 -->
                  <div class="flex items-center gap-[10px]">
                    <svg class="w-5 h-5 text-[#191a1d]" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.9995 6.88428C19.9983 6.4752 19.9323 6.06898 19.804 5.6811L19.7873 5.59126L18.0671 1.37718C17.9084 0.966999 17.6298 0.615667 17.2687 0.370135C16.9076 0.124602 16.4812 -0.00343601 16.0463 0.00312995H4.09294C3.65601 -0.0212692 3.22264 0.0947131 2.85461 0.334538C2.48659 0.574363 2.2027 0.925786 2.04344 1.33869L0.208829 5.61282L0.192581 5.69757C0.0655586 6.08567 0.000583713 6.49186 0.000114432 6.90074C0.00250163 7.43765 0.114873 7.96821 0.330117 8.45885C0.545361 8.94948 0.858791 9.38951 1.25057 9.75109L1.25515 17.1552C1.27117 18.1801 2.09596 19 3.10463 19L3.13038 18.9998H3.13164L16.8764 18.9917H16.8939C17.9055 18.9917 18.7328 18.1707 18.7514 17.1439V9.73382C19.5305 9.01103 19.9953 7.98417 19.9995 6.88428ZM1.37907 6.09646L1.40448 6.01902L1.40997 5.99039L3.18977 1.84354L3.19915 1.82175L3.20773 1.79961C3.33074 1.4807 3.64026 1.26636 3.97782 1.26636L4.02405 1.26763L4.0585 1.2696H16.0463L16.0692 1.26949L16.0784 1.26937C16.4454 1.26937 16.7693 1.49311 16.9118 1.86117L18.5831 5.95538L18.5917 6.0021L18.6184 6.08348C18.7036 6.33993 18.7479 6.6085 18.7495 6.87907C18.7455 7.85492 18.2127 8.74151 17.3724 9.18573C16.9785 9.38715 16.5434 9.49232 16.1022 9.49281L16.0663 9.49258H16.0104C15.6199 9.49258 15.2339 9.40779 14.8784 9.24394C14.5229 9.08009 14.2062 8.84097 13.9497 8.5427L13.0035 7.44257L12.0616 8.54629C11.5469 9.14956 10.8003 9.49757 9.99874 9.50127C9.60854 9.50099 9.22292 9.41601 8.86787 9.25203C8.51282 9.08806 8.19657 8.84891 7.94043 8.5507L6.99709 7.45289L6.05422 8.55116C5.58286 9.09992 4.91835 9.44016 4.20267 9.49919L3.94304 9.50487L3.88457 9.50545C3.46256 9.50545 3.03964 9.40494 2.66867 9.21842C1.79788 8.77362 1.25423 7.88344 1.25023 6.90202C1.25045 6.62825 1.29395 6.35629 1.37907 6.09646ZM17.5016 17.1203C17.4953 17.4538 17.2227 17.7252 16.8756 17.7251L3.1044 17.7334C2.77897 17.7334 2.51007 17.4652 2.50504 17.1544L2.50149 11.4058H2.50217V10.5205C2.97159 10.6962 3.46938 10.7811 3.9697 10.7708V10.7753H3.97908C4.55128 10.7753 5.11681 10.6509 5.6375 10.4105C6.1582 10.1702 6.62194 9.81951 6.99744 9.38211C7.37084 9.8167 7.83182 10.1652 8.34932 10.4042C8.86683 10.6432 9.42887 10.767 9.9976 10.7675H10.0189C10.5863 10.7649 11.1465 10.6392 11.662 10.3989C12.1774 10.1586 12.6361 9.80931 13.0071 9.37445C13.384 9.81266 13.8499 10.1632 14.3729 10.4021C14.8959 10.641 15.4637 10.7626 16.0374 10.7586H16.0506C16.5453 10.7649 17.037 10.6796 17.5015 10.507V12.4825H17.5013L17.5016 17.1203Z" fill="currentColor"/>
                    </svg>
                    <span class="text-[14px] font-medium text-[#191a1d]">店铺名称</span>
                  </div>
                </div>

                <!-- 商品列表 -->
                <div class="flex flex-col gap-6 lg:gap-8 border-b border-[#e5e7eb] pb-6 lg:pb-8">
                  <div
                    v-for="item in order.items"
                    :key="item.itemId"
                    class="flex gap-4 lg:gap-8 items-start"
                  >
                    <img
                      :src="item.itemImage"
                      class="w-24 h-24 lg:w-[96px] lg:h-[96px] object-cover bg-[#f9fafb] shrink-0"
                      alt=""
                    />
                    <div class="flex-1 min-w-0 flex lg:flex-row flex-col gap-4 lg:gap-[32px]">
                      <div class="flex-[1_0_0] min-w-0 flex flex-col gap-1">
                        <h3 class="text-[14px] font-medium leading-5 text-[#101828]">
                          {{ item.itemName }}
                        </h3>
                        <p v-if="item.skuNo" class="text-[12px] leading-4 text-[#364153]">款号: {{ item.skuNo }}</p>
                        <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">款式: {{ item.style }}</p>
                        <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">尺寸: {{ item.size }}</p>
                        <template v-if="!item.skuNo && !item.style && !item.size && item.specName">
                          <p class="text-[12px] leading-4 text-[#364153]">{{ item.specName }}</p>
                        </template>
                      </div>
                      <div class="flex items-center lg:items-start justify-between min-w-[138px] shrink-0">
                        <span class="text-[14px] leading-5 text-[#191a1d] min-w-[40px]">数量: {{ item.quantity }}</span>
                        <span class="text-[14px] leading-5 text-[#191a1d] min-w-[66px] text-right">¥ {{ item.price.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 订单汇总与操作 -->
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="flex items-center justify-end lg:justify-start gap-8 text-[14px] text-[#364153]">
                    <span>数量: {{ getTotalQuantity(order) }}</span>
                    <span>总计: <span class="font-medium text-[16px] text-[#191a1d]">¥ {{ order.totalAmount.toFixed(2) }}</span></span>
                  </div>
                  <div class="flex flex-wrap gap-4 justify-end w-full lg:w-auto">
                    <button
                      v-if="order.canCancel"
                      type="button"
                      class="border border-[#0f0f10] px-[33px] py-[17px] text-[12px] font-medium leading-4 text-[#191a1d] hover:bg-gray-50 transition-colors"
                      @click="cancelOrder(order.orderId)"
                    >
                      取消订单
                    </button>
                    <button
                      v-if="order.canPay"
                      type="button"
                      class="h-[50px] px-8 py-4 bg-[#0f0f10] text-[12px] font-medium leading-4 text-white hover:opacity-90 transition-opacity flex items-center justify-center"
                      @click="payNow(order.orderId)"
                    >
                      立即支付
                    </button>
                    <button
                      v-if="order.canConfirmReceipt"
                      type="button"
                      class="h-[50px] px-8 py-4 bg-[#0f0f10] text-[12px] font-medium leading-4 text-white hover:opacity-90 transition-opacity flex items-center justify-center"
                      @click="confirmReceipt(order.orderId)"
                    >
                      确认收货
                    </button>
                    <button
                      v-if="order.canDelete"
                      type="button"
                      class="border border-[#0f0f10] px-[33px] py-[17px] text-[12px] font-medium leading-4 text-[#191a1d] hover:bg-gray-50 transition-colors"
                      @click="deleteOrder(order.orderId)"
                    >
                      删除订单
                    </button>
                    <button
                      v-if="order.canApplyAftersales"
                      type="button"
                      class="border border-[#0f0f10] px-[33px] py-[17px] text-[12px] font-medium leading-4 text-[#191a1d] hover:bg-gray-50 transition-colors"
                      @click="applyAftersales(order.orderId)"
                    >
                      申请售后
                    </button>
                    <button
                      v-if="order.status === 'completed'"
                      type="button"
                      class="border border-[#0f0f10] px-[33px] py-[17px] text-[12px] font-medium leading-4 text-[#191a1d] hover:bg-gray-50 transition-colors"
                      @click="viewLogistics(order.orderId)"
                    >
                      查看物流
                    </button>
                    <button
                      v-if="order.status === 'completed'"
                      type="button"
                      class="h-[50px] px-8 py-4 bg-[#0f0f10] text-[12px] font-medium leading-4 text-white hover:opacity-90 transition-opacity flex items-center justify-center"
                      @click="goReview(order.orderId)"
                    >
                      立即评价
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
  { key: 'coupons', label: '优惠券', path: '/account/coupons' },
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
  const toast = useToastMessage()
  toast.show('申请售后功能开发中')
}

function viewLogistics(orderId: string) {
  const toast = useToastMessage()
  toast.show('查看物流功能开发中')
}

function goReview(orderId: string) {
  const toast = useToastMessage()
  toast.show('立即评价功能开发中')
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
