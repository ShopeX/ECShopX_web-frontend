<template>
  <NuxtLayout :name="layoutName">
    <div class="min-h-screen bg-gray-50">
      <TemplateEngine template="index">
        <template #carousel-xxxx1>
          <div class="section-widget">test</div>
        </template>
      </TemplateEngine>
      <!-- <PageBuilder :widgets="pageConfig.widgets" /> -->
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import PageBuilder from '~/components/PageBuilder.vue'

const route = useRoute()

// Determine layout based on query parameter
const layoutName = computed(() => (route.query.designMode === '1' ? 'design' : 'default'))

// Disable default layout wrapping
definePageMeta({
  layout: false,
})

// Mock Page Configuration
const pageConfig = ref({
  title: '商城首页',
  widgets: [
    {
      id: 'w1',
      type: 'carousel' as const,
      data: {
        items: [
          {
            image: '/images/banners/main-banner.png',
            title: '华为 Vision 智慧屏 4',
            link: '/product/1',
          },
          {
            image: '/images/products/phones/pure-phone.png',
            title: '华为 Mate 60 Pro',
            link: '/product/2',
          },
          {
            image: '/images/products/tablets/matebook.png',
            title: '华为 MatePad Pro',
            link: '/product/3',
          },
        ],
      },
    },
    {
      id: 'w2',
      type: 'banner' as const,
      data: {
        image: '/images/banners/main-banner.png',
        link: '/activity/sale',
        title: '年中大促',
      },
      style: {
        marginTop: '20px',
        marginBottom: '20px',
      },
    },
    {
      id: 'w3',
      type: 'product_list' as const,
      data: {
        title: '热销商品',
        items: [
          {
            id: 1,
            title: '华为 Mate 60 Pro',
            pics: ['/images/products/phones/pure-phone.png'],
            price: 699900,
            market_price: 799900,
            sales: 1000,
            stock: 50,
          },
          {
            id: 2,
            title: '华为 MatePad Pro',
            pics: ['/images/products/tablets/matebook.png'],
            price: 499900,
            sales: 500,
            stock: 100,
          },
          {
            id: 3,
            title: '华为 Vision 智慧屏 4',
            pics: ['/images/banners/main-banner.png'],
            price: 399900,
            sales: 200,
            stock: 20,
          },
          {
            id: 4,
            title: '华为 FreeBuds Pro 3',
            pics: ['/images/products/phones/pure-phone.png'],
            price: 129900,
            sales: 3000,
            stock: 200,
          },
          {
            id: 5,
            title: '华为 Watch GT 4',
            pics: ['/images/products/tablets/matebook.png'],
            price: 158800,
            sales: 1500,
            stock: 80,
          },
        ],
      },
    },
    {
      id: 'w4',
      type: 'hot_zone' as const,
      data: {
        image: '/images/banners/main-banner.png',
        zones: [
          {
            link: '/product/1',
            left: 10,
            top: 10,
            width: 30,
            height: 80,
            title: '左侧热区',
          },
          {
            link: '/product/2',
            left: 50,
            top: 20,
            width: 40,
            height: 60,
            title: '右侧热区',
          },
        ],
      },
    },
  ],
})
</script>
