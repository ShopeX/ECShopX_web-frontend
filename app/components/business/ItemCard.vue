<template>
  <div class="item-card" @click="navigateToDetail">
    <!-- 商品图片 -->
    <div class="item-image">
      <img :src="info.img" :alt="info.itemName" loading="lazy" />
    </div>

    <!-- 商品信息 -->
    <div class="item-info">
      <h3 class="title">{{ info.itemName }}</h3>

      <!-- 价格区域 -->
      <div class="price-row">
        <div class="current-price">
          <span class="symbol">¥</span>
          <span class="amount">{{ formatPrice(info.price) }}</span>
        </div>
        <div v-if="info.marketPrice" class="market-price">¥{{ formatPrice(info.marketPrice) }}</div>
      </div>

      <!-- 销量库存 -->
      <div class="stats-row">
        <span class="sales">销量 {{ info.sales }}</span>
        <span v-if="info.limitNum <= 10" class="stock"> 仅剩 {{ info.limitNum }} 件 </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { IProduct } from '@/types/product'

// Props
const props = defineProps<{
  info: IProduct
}>()

// 路由
const router = useRouter()

// 格式化价格
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

// 跳转到详情页
const navigateToDetail = () => {
  router.push(`/item/${props.info.itemId}`)
}
</script>

<style scoped lang="scss">
.item-card {
  @apply cursor-pointer rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow;

  .item-image {
    @apply aspect-square overflow-hidden rounded-t-lg;

    img {
      @apply w-full h-full object-cover;
    }
  }

  .item-info {
    @apply p-3;

    .title {
      @apply text-sm font-medium text-gray-900 mb-2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price-row {
      @apply flex items-baseline gap-2 mb-2;

      .current-price {
        @apply text-red-600;

        .symbol {
          @apply text-sm;
        }

        .amount {
          @apply text-lg font-semibold;
        }
      }

      .market-price {
        @apply text-xs text-gray-400 line-through;
      }
    }

    .stats-row {
      @apply flex items-center justify-between text-xs text-gray-500;

      .stock {
        @apply text-red-600;
      }
    }
  }
}
</style>
