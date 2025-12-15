<script setup lang="ts">
import { ref } from 'vue'

// Mock Data
const coupons = ref([
  {
    id: '950227479623',
    amount: '9.7折',
    title: '【MUSINSA3%】 满0.01可用',
    validity: '2025-07-22 至 2026-07-22',
    code: '950227479623',
    desc: '全部商品适用'
  },
  {
    id: '020160930378',
    amount: '9.7折',
    title: '【MUSINSA3%】 满0.01可用',
    validity: '2025-07-22 至 2026-07-22',
    code: '020160930378',
    desc: '全部商品适用'
  },
  {
    id: '914150302621',
    amount: '9.7折',
    title: '【MUSINSA3%】 满0.01可用',
    validity: '2025-07-22 至 2026-07-22',
    code: '914150302621',
    desc: '全部商品适用'
  }
])

const isExpanded = ref(true)
const currentPage = ref(1)
const totalCoupons = 3
const pageSize = 9

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="flex gap-6">
    <MemberSidebar />

    <div class="flex-1 bg-white rounded-lg p-8">
      <h2 class="text-lg font-medium text-gray-900 mb-6">我的优惠券</h2>

      <!-- Section Header -->
      <div
        class="flex items-center gap-2 bg-gray-50 px-4 py-3 text-sm text-[#ff0036] mb-6 cursor-pointer select-none"
        @click="isExpanded = !isExpanded"
      >
        <span>可用优惠券({{ coupons.length }})</span>
        <UIcon
          name="i-heroicons-chevron-down"
          class="w-4 h-4 transition-transform duration-200"
          :class="isExpanded ? 'rotate-180' : ''"
        />
      </div>

      <!-- Coupon Grid -->
      <div v-show="isExpanded" class="grid grid-cols-3 gap-6 mb-8">
        <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card relative filter drop-shadow-sm">
          <!-- Top Section -->
          <div class="bg-[#ffb84d] text-white p-6 text-center relative z-10 rounded-t-lg h-32 flex flex-col justify-center items-center">
            <div class="text-3xl font-medium italic mb-1">{{ coupon.amount }}</div>
            <div class="text-xs font-medium mb-1">{{ coupon.title }}</div>
            <div class="text-[10px] opacity-80">{{ coupon.validity }}</div>
            
            <!-- Sawtooth Bottom -->
            <div class="absolute -bottom-1 left-0 w-full h-2 overflow-hidden">
               <div class="w-full h-full bg-[#ffb84d]" style="mask-image: radial-gradient(circle at 10px 0, transparent 5px, black 5.5px); mask-size: 20px 100%; mask-repeat: repeat-x; mask-position: bottom;"></div>
            </div>
          </div>

          <!-- Middle Cutouts -->
          <div class="absolute top-32 -left-1.5 w-3 h-3 bg-white rounded-full z-20"></div>
          <div class="absolute top-32 -right-1.5 w-3 h-3 bg-white rounded-full z-20"></div>

          <!-- Bottom Section -->
          <div class="bg-gray-50 p-4 text-center rounded-b-lg pt-6">
            <div class="text-sm text-gray-600 mb-1">{{ coupon.code }}</div>
            <div class="text-xs text-gray-400">{{ coupon.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-end">
        <Pagination
          :total="totalCoupons"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @update:current-page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupon-card {
  /* Optional: Add specific shadow or transition here */
}
</style>
