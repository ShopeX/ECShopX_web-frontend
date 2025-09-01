<!-- pages/products.vue -->
<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <div class="container mx-auto py-4">
      <!-- 过滤器 -->
      <SpFilter
        v-model:params="filterParams"
        :total="total"
        @change="handleFilterChange"
      />

      <!-- 商品列表 -->
      <div class="grid grid-cols-5 gap-4 mt-4">
        <SpProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IFilterParams } from '~/types/filter'
import { EFilterSort } from '~/types/filter'
import type { IProduct } from '~/types/product'

// 过滤参数
const filterParams = ref<IFilterParams>({
  sort: EFilterSort.COMPREHENSIVE
})

// 模拟数据
const total = ref(12)
const products = ref<IProduct[]>([
  {
    id: '1',
    title: '华为MATEBOOK 14S',
    subtitle: '13代处理器、2.5触控屏、超级终端',
    price: 4999,
    originalPrice: 5999,
    memberPrice: 4799,
    imageUrl: '/images/products/matebook.png',
    tags: ['新品', '热销']
  },
  // ... 更多商品数据
])

// 处理过滤器变化
const handleFilterChange = (params: IFilterParams) => {
  console.log('过滤参数变化：', params)
  // 这里可以调用API获取过滤后的商品数据
}
</script> 