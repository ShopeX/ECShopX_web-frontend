<template>
  <div class="w-full flex flex-col bg-white">
    <!-- Tab 切换区域 -->
    <div class="flex justify-center py-8 lg:pt-16 lg:pb-8 px-0 lg:px-32">
      <div class="flex gap-8 lg:gap-8 items-start justify-center">
        <button
          class="flex flex-col items-center justify-center pb-2 relative"
          @click="activeTab = 'recommended'"
        >
          <h2
            class="text-[20px] lg:text-2xl leading-5 lg:leading-[48px] whitespace-nowrap font-medium lg:font-medium"
            :class="
              activeTab === 'recommended' ? 'text-[#191a1d]' : 'text-[#4a5565] lg:font-normal'
            "
          >
            {{ t('c23b194b.e86a4d') }}
          </h2>
          <!-- 移动端和PC端都显示的底部边框 -->
          <div
            v-if="activeTab === 'recommended'"
            class="absolute bottom-0 left-0 right-0 h-[1px] bg-[#191a1d]"
          ></div>
        </button>
        <button
          v-if="showRecentTab"
          class="flex flex-col items-center justify-center pb-2 relative"
          @click="activeTab = 'recent'"
        >
          <h2
            class="text-[20px] lg:text-2xl leading-5 lg:leading-[48px] whitespace-nowrap"
            :class="[
              activeTab === 'recent' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565] font-normal',
            ]"
          >
            {{ t('c23b194b.3debde') }}
          </h2>
          <!-- 移动端和PC端都显示的底部边框 -->
          <div
            v-if="activeTab === 'recent'"
            class="absolute bottom-0 left-0 right-0 h-[1px] bg-[#191a1d]"
          ></div>
        </button>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="pb-8 lg:pb-16 w-full">
      <!-- 移动端：横向滚动，无左右padding -->
      <div class="lg:hidden overflow-x-auto scrollbar-hide">
        <div class="flex" style="width: max-content">
          <div
            v-for="(product, index) in displayProducts"
            :key="product.id || index"
            class="flex flex-col items-start overflow-hidden w-[165px]"
          >
            <NuxtLink :to="`/products/${product.id}`" class="w-full">
              <!-- 商品图片 -->
              <div class="aspect-square w-full relative">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  loading="lazy"
                />
              </div>

              <!-- 商品信息 -->
              <div
                class="bg-[#f6f6f6] flex flex-col gap-3 items-center px-6 py-8 w-full text-center"
              >
                <h2
                  class="text-sm font-medium leading-5 text-[#191a1d] w-full min-w-full line-clamp-2"
                >
                  {{ product.name }}
                </h2>
                <div class="h-6 flex flex-col justify-center w-full">
                  <p class="text-sm leading-5 text-[#191a1d]">￥{{ formatPrice(product.price) }}</p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- PC端：五列 Grid，商品不足 5 个时也保持设计稿卡片宽度 -->
      <div class="hidden lg:grid lg:grid-cols-5 items-start w-full">
        <div
          v-for="(product, index) in displayProducts"
          :key="product.id || index"
          class="flex flex-col items-start overflow-hidden"
        >
          <NuxtLink :to="`/products/${product.id}`" class="w-full">
            <!-- 商品图片 -->
            <div class="aspect-square w-full relative">
              <img
                :src="product.image"
                :alt="product.name"
                class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                loading="lazy"
              />
            </div>

            <!-- 商品信息 -->
            <div class="bg-[#f6f6f6] flex flex-col gap-3 items-center px-6 py-8 w-full text-center">
              <h2 class="text-sm font-medium leading-5 text-[#191a1d] w-full min-w-full">
                {{ product.name }}
              </h2>
              <div class="h-6 flex flex-col justify-center w-full">
                <p class="text-sm leading-[14px] text-[#191a1d]">
                  ￥{{ formatPrice(product.price) }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductRecommendation } from './types'

const { t } = useI18n()

interface Props {
  recommendedProducts?: ProductRecommendation[]
  recentProducts?: ProductRecommendation[]
  showRecentTab?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  recommendedProducts: () => [],
  recentProducts: () => [],
  showRecentTab: true,
})

const activeTab = ref<'recommended' | 'recent'>('recommended')
const canShowRecentTab = computed(() => props.showRecentTab)

const displayProducts = computed(() => {
  if (!canShowRecentTab.value && activeTab.value === 'recent') {
    activeTab.value = 'recommended'
  }

  if (!canShowRecentTab.value) {
    return props.recommendedProducts.slice(0, 5)
  }

  const products =
    activeTab.value === 'recommended' ? props.recommendedProducts : props.recentProducts

  // 限制最多显示 5 个商品
  return products.slice(0, 5)
})

const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 文字截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
