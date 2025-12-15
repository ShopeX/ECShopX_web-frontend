<script setup lang="ts">
import { ref } from 'vue'

// Mock Data
const tabs = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待收货', value: 'pending_receipt' },
  { label: '待自提', value: 'pending_pickup' },
  { label: '待评价', value: 'pending_review' }
]

const currentTab = ref('all')
const currentPage = ref(1)
const pageSize = 10
const totalOrders = 25 // Mock total count

const orders = ref([
  {
    id: '4977706000120064',
    date: '2025-08-17 17:39:46',
    shopName: '云店',
    status: '已取消',
    recipient: 'leo',
    totalAmount: 526.64,
    items: [
      {
        id: 1,
        name: 'INTO YOU心慕与你女主角唇泥雾面哑光丝绒唇',
        spec: '颜色:W5',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80'
      },
      {
        id: 2,
        name: '基础款标志开衫粉色',
        spec: '尺码:S,颜色:粉色',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=100&q=80'
      }
    ]
  },
  {
    id: '4968449000260064',
    date: '2025-08-08 11:14:32',
    shopName: '云店',
    status: '已取消',
    recipient: 'leo',
    totalAmount: 48.00,
    items: [
      {
        id: 3,
        name: 'INTO YOU心慕与你轻雾印色唇釉丝绒哑光口红小',
        spec: '颜色:C01',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&q=80'
      },
      {
        id: 4,
        name: 'INTO YOU心慕与你女主角唇泥雾面哑光丝绒唇',
        spec: '颜色:W5',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80'
      }
    ]
  }
])

const handleTabChange = (tab: string) => {
  currentTab.value = tab
  currentPage.value = 1
  // TODO: Fetch data for new tab
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  // TODO: Fetch data for new page
}
</script>

<template>
  <div class="flex gap-6">
    <MemberSidebar />

    <div class="flex-1 bg-white rounded-lg p-8">
      <h2 class="text-lg font-medium text-gray-900 mb-6">我的订单</h2>

      <!-- Tabs -->
      <div class="flex gap-8 border-b border-gray-100 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="pb-3 text-sm font-medium transition-colors relative"
          :class="currentTab === tab.value ? 'text-[#ff0036]' : 'text-gray-600 hover:text-gray-900'"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
          <div
            v-if="currentTab === tab.value"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff0036]"
          ></div>
        </button>
      </div>

      <!-- Table Header -->
      <div class="grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm text-gray-500 mb-4">
        <div class="col-span-6 text-center">订单详情</div>
        <div class="col-span-2 text-center">收货人</div>
        <div class="col-span-2 text-center">金额</div>
        <div class="col-span-1 text-center">状态</div>
        <div class="col-span-1 text-center">操作</div>
      </div>

      <!-- Order List -->
      <div class="space-y-6">
        <div v-for="order in orders" :key="order.id" class="border border-gray-200 rounded-lg overflow-hidden">
          <!-- Order Header -->
          <div class="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex gap-6">
            <span>{{ order.date }}</span>
            <span>订单编号：<span class="text-gray-900">{{ order.id }}</span></span>
            <span>{{ order.shopName }}</span>
          </div>

          <!-- Order Body -->
          <div class="grid grid-cols-12">
            <!-- Items Column -->
            <div class="col-span-6 border-r border-gray-100">
              <div
                v-for="(item, idx) in order.items"
                :key="item.id"
                class="p-4 flex gap-4"
                :class="idx !== order.items.length - 1 ? 'border-b border-gray-100' : ''"
              >
                <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm text-gray-900 line-clamp-2 mb-1">{{ item.name }}</h4>
                  <p class="text-xs text-gray-500">{{ item.spec }}</p>
                </div>
                <div class="text-sm text-gray-500">x {{ item.quantity }}</div>
              </div>
            </div>

            <!-- Info Columns (Merged vertically) -->
            <div class="col-span-2 flex items-center justify-center border-r border-gray-100 p-4 text-sm text-gray-600">
              {{ order.recipient }}
            </div>
            <div class="col-span-2 flex items-center justify-center border-r border-gray-100 p-4 text-sm font-medium text-gray-900">
              ¥ {{ order.totalAmount.toFixed(2) }}
            </div>
            <div class="col-span-1 flex flex-col items-center justify-center border-r border-gray-100 p-4 gap-2">
              <span class="text-sm text-gray-500">{{ order.status }}</span>
              <a href="#" class="text-xs text-gray-900 hover:text-primary-500">订单详情</a>
            </div>
            <div class="col-span-1 flex items-center justify-center p-4">
              <!-- Placeholder for actions -->
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-8">
        <Pagination
          :total="totalOrders"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @update:current-page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
