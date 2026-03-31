<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-white">
      <!-- 1. Hero Banner Section -->
      <WCHeroBanner v-if="heroItems.length > 0" :items="heroItems" />

      <!-- 2. Main Content -->
      <main class="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <!-- 热门商品 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-popular-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">热门商品</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCProductCard
              v-for="product in popularProducts"
              :key="product.itemId"
              :product="product"
              mode="popular"
            />
          </div>
        </section>

        <!-- 新品推荐 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-new-arrival-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">新品</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCProductCard
              v-for="product in newArrivals"
              :key="product.itemId"
              :product="product"
              mode="new"
            />
          </div>
        </section>

        <!-- 品牌资讯 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-brand-news-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">品牌资讯</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCNewsCard v-for="item in brandNews" :key="item.id" :item="item" />
          </div>
        </section>
      </main>

      <!-- Loading State -->
      <div
        v-if="pending"
        data-testid="home-loading"
        class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import WCHeroBanner from '~/components/WCHeroBanner/WCHeroBanner.vue'
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import BCNewsCard from '~/components/BCNewsCard/BCNewsCard.vue'
import { useHomeData } from '~/composables/useHomeData'

const route = useRoute()
const distributorId = route.params.id as string

const { products, pending, fetchHomeData } = useHomeData(distributorId)

definePageMeta({
  layout: false,
})

const heroItems = [
  {
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
    title: '声音可见',
    subtitle: '音乐便更有吸引力。舒适度更优秀，悦耳如昔。',
    link: '#',
  },
]

const brandNews = [
  {
    id: 1,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
  },
  {
    id: 2,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/499903fe1e08c926b9231a740b55d96768d41d0f.png',
  },
  {
    id: 3,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/ddb47e30da9c615963fd4aa5722a61a678e08f5e.png',
  },
  {
    id: 4,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/4a239fb9fcf5109253fd99820cdc96bdb98f7229.png',
  },
]

const popularProducts = computed(() => products.value.slice(0, 4))
const newArrivals = computed(() => products.value.slice(4, 12))

onMounted(() => {
  fetchHomeData()
})
</script>
