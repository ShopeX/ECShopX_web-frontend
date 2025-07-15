<template>
  <div class="min-h-screen bg-[#f7f7fa]">
    <!-- 顶部导航 -->
    <TopBar />
    <Header />

    <!-- 主要内容区域 -->
    <main class="container mx-auto px-4">
      <div class="flex gap-6">
        <!-- 左侧分类导航 -->
        <CategoryNav />

        <!-- 右侧内容 -->
        <div class="flex-1">
          <!-- Banner -->
          <Banner />

          <!-- 甄选推荐 -->
          <ProductSection
            title="甄选推荐"
            :products="recommendProducts"
            more-link="/category/recommend"
          />

          <!-- 热销商品 -->
          <ProductSection title="热销商品" :products="hotProducts" more-link="/category/hot" />

          <!-- 平板专区 -->
          <ProductSection
            title="平板专区"
            :products="tabletProducts"
            more-link="/category/tablet"
          />

          <!-- 音频专区 -->
          <ProductSection title="音频专区" :products="audioProducts" more-link="/category/audio" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags?: string[]
}

// 模拟商品数据
const recommendProducts = ref<Product[]>([
  {
    id: 1,
    name: 'HUAWEI Mate 60 Pro',
    description: '超感光XMAGE影像',
    price: 6999,
    originalPrice: 7999,
    image: '/images/products/phones/pure-phone.png',
    tags: ['新品', '热销'],
  },
  {
    id: 2,
    name: 'HUAWEI P60 Art',
    description: '艺术影像旗舰',
    price: 8988,
    image: '/images/products/featured-product.png',
    tags: ['限量版'],
  },
  {
    id: 3,
    name: 'HUAWEI MatePad Pro 13.2"',
    description: '创作无界',
    price: 5199,
    originalPrice: 5499,
    image: '/images/products/tablets/matebook.png',
    tags: ['新品'],
  },
  {
    id: 4,
    name: 'HUAWEI FreeBuds Pro 3',
    description: '双单元动圈 | 至臻音质',
    price: 1499,
    image: '/images/products/audio/headphone-1.png',
    tags: ['热销'],
  },
])

const hotProducts = ref<Product[]>([
  {
    id: 5,
    name: 'HUAWEI WATCH 4 Pro',
    description: '血压检测 | 心电图',
    price: 3999,
    image: '/images/products/wearables/watch-1.png',
    tags: ['新品'],
  },
  {
    id: 6,
    name: 'HUAWEI Vision Smart TV',
    description: '4K超高清 | 智慧屏',
    price: 6999,
    originalPrice: 7499,
    image: '/images/banners/main-banner.png',
    tags: ['限时优惠'],
  },
  {
    id: 7,
    name: 'HUAWEI MateBook X Pro',
    description: '13代酷睿 | 3.1K原色全面屏',
    price: 9999,
    image: '/images/products/tablets/tablet-1.png',
    tags: ['新品'],
  },
  {
    id: 8,
    name: 'HUAWEI nova 11 Pro',
    description: '前后双像素追焦',
    price: 3999,
    originalPrice: 4299,
    image: '/images/products/phones/pure-phone.png',
    tags: ['热销'],
  },
])

const tabletProducts = ref<Product[]>([
  {
    id: 9,
    name: 'HUAWEI MatePad Pro 11"',
    description: '创作无界',
    price: 3999,
    image: '/images/products/tablets/matebook.png',
    tags: ['新品'],
  },
  {
    id: 10,
    name: 'HUAWEI MatePad Air',
    description: '轻薄办公',
    price: 2999,
    originalPrice: 3299,
    image: '/images/products/tablets/tablet-1.png',
    tags: ['热销'],
  },
  {
    id: 11,
    name: 'HUAWEI MatePad Paper',
    description: '墨水屏平板',
    price: 3999,
    image: '/images/products/tablets/matebook.png',
    tags: ['新品'],
  },
  {
    id: 12,
    name: 'HUAWEI MatePad SE',
    description: '学习娱乐平板',
    price: 1299,
    originalPrice: 1499,
    image: '/images/products/tablets/tablet-1.png',
    tags: ['特惠'],
  },
])

const audioProducts = ref<Product[]>([
  {
    id: 13,
    name: 'HUAWEI FreeBuds Pro 3',
    description: '双单元动圈 | 至臻音质',
    price: 1499,
    image: '/images/products/audio/headphone-1.png',
    tags: ['新品'],
  },
  {
    id: 14,
    name: 'HUAWEI FreeBuds 5',
    description: '半开放式设计 | 舒适体验',
    price: 999,
    originalPrice: 1099,
    image: '/images/products/audio/headphone-1.png',
    tags: ['热销'],
  },
  {
    id: 15,
    name: 'HUAWEI Sound Joy',
    description: '便携音箱 | 40W大音量',
    price: 699,
    image: '/images/products/audio/headphone-1.png',
    tags: ['新品'],
  },
  {
    id: 16,
    name: 'HUAWEI FreeLace Pro',
    description: '主动降噪 | 24小时续航',
    price: 499,
    originalPrice: 599,
    image: '/images/products/audio/headphone-1.png',
    tags: ['特惠'],
  },
])
</script>

<style scoped lang="scss">
.home-page {
  @apply min-h-screen bg-gray-50;
}

.main-content {
  @apply container mx-auto px-4 py-6 flex gap-6;
}
</style>
