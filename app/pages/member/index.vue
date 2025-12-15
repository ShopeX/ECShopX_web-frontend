<script setup lang="ts">
import { ref } from 'vue'

// Mock Data
const userInfo = ref({
  name: '陆凯杰',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  level: '粉丝会员',
  description: '注册即成为粉丝 粉丝会员...',
  coupons: 3,
  points: 147
})

const orderStats = [
  { label: '待付款', icon: 'i-heroicons-credit-card', count: 6 },
  { label: '待收货', icon: 'i-heroicons-truck', count: 0 },
  { label: '待评价', icon: 'i-heroicons-chat-bubble-left-ellipsis', count: 0 },
  { label: '待自提', icon: 'i-heroicons-shopping-bag', count: 0 },
  { label: '售后', icon: 'i-heroicons-shield-check', count: 0 }
]

const mockProducts = [
  {
    id: 1,
    title: '补水护肤品套装女深层清洁保湿水乳官方旗舰店',
    pics: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80'],
    price: 39900,
    market_price: 59900,
    sales: 100,
    stock: 50
  },
  {
    id: 2,
    title: '欧莱雅美眸深邃巨星双头大师眼线笔0.1克+0.5',
    pics: ['https://images.unsplash.com/photo-1515688594390-b649af70d282?w=500&q=80'],
    price: 14000,
    market_price: 18000,
    sales: 230,
    stock: 20
  },
  {
    id: 3,
    title: '阿玛尼迷情挚爱女士香水30毫升',
    pics: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80'],
    price: 63000,
    market_price: 88000,
    sales: 56,
    stock: 5
  }
]


</script>

<template>
  <div class="flex gap-6">
    <!-- Sidebar -->
    <MemberSidebar />

    <!-- Main Content -->
    <div class="flex-1 space-y-4">
      <!-- Top Section: Profile & Stats -->
      <div class="grid grid-cols-3 gap-4">
        <!-- Profile Card -->
        <div class="col-span-1 bg-white rounded-lg p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div class="w-20 h-20 rounded-full bg-gray-100 mb-3 overflow-hidden">
             <img :src="userInfo.avatar" alt="Avatar" class="w-full h-full object-cover" />
          </div>
          <h2 class="text-lg font-medium text-gray-900 mb-1">{{ userInfo.name }}</h2>
          <p class="text-xs text-gray-500 mb-4">{{ userInfo.description }}</p>
          
          <!-- VIP Banner -->
          <div class="w-full bg-[#1a1a2e] text-[#f4d03f] rounded-lg p-3 flex justify-between items-center mt-auto">
            <div class="text-left">
              <div class="text-xs font-bold">尊享VIP</div>
              <div class="text-[10px] opacity-80">天天享受特权</div>
            </div>
            <button class="bg-gradient-to-r from-[#f4d03f] to-[#fcf4a3] text-[#1a1a2e] text-xs font-bold px-3 py-1 rounded-full">
              立即开通
            </button>
          </div>
        </div>

        <!-- Stats Card -->
        <div class="col-span-2 bg-white rounded-lg p-8 flex items-center justify-around">
          <div class="text-center cursor-pointer hover:opacity-80">
            <div class="text-3xl font-bold text-[#ff6b00] mb-1">{{ userInfo.coupons }}</div>
            <div class="text-sm text-gray-500">优惠券</div>
          </div>
          <div class="w-px h-12 bg-gray-100"></div>
          <div class="text-center cursor-pointer hover:opacity-80">
            <div class="text-3xl font-bold text-[#ff6b00] mb-1">{{ userInfo.points }}</div>
            <div class="text-sm text-gray-500">积分</div>
          </div>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="bg-white rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium text-gray-900">我的订单</h3>
          <a href="#" class="text-xs text-gray-500 hover:text-primary-500 flex items-center">
            查看全部 <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 ml-1" />
          </a>
        </div>
        <div class="flex justify-between px-8">
          <div v-for="stat in orderStats" :key="stat.label" class="flex flex-col items-center cursor-pointer group">
            <div class="relative mb-2">
              <UIcon :name="stat.icon" class="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <span
                v-if="stat.count > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border-2 border-white"
              >
                {{ stat.count }}
              </span>
            </div>
            <span class="text-sm text-gray-600 group-hover:text-gray-900">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Favorites & Footprint -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Favorites (Placeholder for now, reusing structure) -->
        <div class="bg-white rounded-lg p-6">
           <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium text-gray-900">我的收藏</h3>
            <a href="#" class="text-xs text-gray-500 hover:text-primary-500 flex items-center">
              查看全部 <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 ml-1" />
            </a>
          </div>
          <div class="text-center py-10 text-gray-400 text-sm">
            暂无收藏商品
          </div>
        </div>

        <!-- Footprint -->
        <div class="bg-white rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium text-gray-900">我的足迹</h3>
            <a href="#" class="text-xs text-gray-500 hover:text-primary-500 flex items-center">
              查看全部 <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 ml-1" />
            </a>
          </div>
          <div class="space-y-3">
            <div v-for="product in mockProducts" :key="product.id" class="flex gap-3 group cursor-pointer">
              <div class="w-16 h-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                <img :src="product.pics[0]" :alt="product.title" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 flex flex-col justify-between py-0.5">
                <h4 class="text-xs text-gray-700 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {{ product.title }}
                </h4>
                <div class="text-red-500 font-medium text-sm">
                  ¥ {{ (product.price / 100).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar if needed */
</style>
