<template>
  <NuxtLayout :name="layoutName">
    <div class="min-h-screen bg-white">
      <!-- 1. Hero Banner Section -->
      <WCHeroBanner 
        v-if="heroItems.length > 0"
        :items="heroItems" 
      />

      <!-- 2. Main Content -->
      <main class="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        
        <!-- 热门商品 (Popular Items) -->
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

        <!-- 新品推荐 (New Arrivals) -->
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
              @add-to-cart="onAddToCart"
            />
          </div>
        </section>

        <!-- Brand News / Promotion Banner from Figma -->
        <section 
          class="relative w-full h-[400px] bg-gray-100 mb-20 overflow-hidden"
          data-testid="home-brand-news-section"
        >
          <img 
            src="https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/6a972ef93ca7d853d4560ed4e42a0ed1adaa8806.png" 
            class="w-full h-full object-cover"
            data-testid="home-brand-news-image"
          />
          <div class="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-center p-8">
            <p 
              class="text-white text-lg max-w-2xl font-light italic leading-relaxed"
              data-testid="home-brand-news-quote"
            >
              “当我听音乐时，我想要求一种平衡的声音，能够揭示每一层，让我更深地沉浸在当下。”
            </p>
            <ECButton 
              variant="dark" 
              class="mt-8 !bg-white !text-black hover:!bg-gray-100 !rounded-full"
              data-testid="home-brand-news-btn"
            >
              发现更多
            </ECButton>
          </div>
        </section>

        <!-- 品牌资讯 (Brand News) -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-brand-news-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">品牌资讯</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCNewsCard 
              v-for="item in brandNews" 
              :key="item.id"
              :item="item"
            />
          </div>
        </section>

      </main>

      <!-- Loading State -->
      <div v-if="pending" data-testid="home-loading" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import WCHeroBanner from '~/components/WCHeroBanner/WCHeroBanner.vue'
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import ECButton from '~/components/ECButton/ECButton.vue'
import BCNewsCard from '~/components/BCNewsCard/BCNewsCard.vue'
import { useHomeData } from '~/composables/useHomeData'

const route = useRoute()
const { pageConfig, products, pending, fetchHomeData } = useHomeData()

// Determine layout based on query parameter
const layoutName = computed(() => (route.query.designMode === '1' ? 'design' : 'default'))

// Disable default layout wrapping
definePageMeta({
  layout: false,
})

// Data Transformation for UI
const heroItems = computed(() => {
  // If API has real banner config, use it. Otherwise use dummy from Figma.
  const config = pageConfig.value?.widgets?.find((w: any) => w.type === 'carousel')
  if (config?.data?.items) {
    return config.data.items.map((item: any) => ({
      image: item.image,
      title: item.title || '声音可见',
      subtitle: item.subtitle || '音乐便更有吸引力。舒适度更优秀，悦耳如昔。',
      link: item.link || '#'
    }))
  }
  
  // Fallback to Figma design data
  return [
    {
      image: 'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
      title: '声音可见',
      subtitle: '音乐便更有吸引力。舒适度更优秀，悦耳如昔。虚像 Beoplay Eleven无性耳机，每一个音符都细腻如丝。',
      link: '/product/1'
    }
  ]
})

// Brand News Mock Data from Figma Node 1518:351
const brandNews = [
  {
    id: 1,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image: 'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png'
  },
  {
    id: 2,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image: 'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/499903fe1e08c926b9231a740b55d96768d41d0f.png'
  },
  {
    id: 3,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image: 'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/ddb47e30da9c615963fd4aa5722a61a678e08f5e.png'
  },
  {
    id: 4,
    title: '终极时尚造型指南：掌握个人风格的艺术',
    summary: '在时尚的广阔海洋中，每个人都是独特的岛屿，而服装搭配是连接这些岛屿的桥梁。',
    image: 'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/4a239fb9fcf5109253fd99820cdc96bdb98f7229.png'
  }
]

const popularProducts = computed(() => {
  return products.value.slice(0, 4)
})

const newArrivals = computed(() => {
  return products.value.slice(4, 12)
})

// Lifecycle
onMounted(() => {
  fetchHomeData()
})

// Actions
function onAddToCart(product: any) {
  console.log('Add to cart:', product)
  // TODO: Integrate with useCart
}
</script>
