<!-- 
优化后的商品列表页面示例
展示如何使用实体层简化页面逻辑
-->

<template>
  <div class="product-list">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading">加载中...</div>

    <!-- 商品列表 -->
    <div v-else class="products-grid">
      <ProductCard v-for="product in products" :key="product.itemId" :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from '~/api'
import type { IProductListItem } from '~/entities'

// 🎯 使用实体化API，页面逻辑极简
const { data, pending, error } = await useLazyAsyncData('products-optimized', () =>
  api.item.getProductList({
    page: '1',
    pageSize: '20',
    item_type: 'goods',
    main_category: '',
    is_tdk: '1',
    type: 'list',
    company_id: '1',
  })
)

// 🎯 直接使用类型安全的实体数据，无需任何转换
const products = computed<IProductListItem[]>(() => data.value?.list || [])

const total = computed(() => data.value?.total_count || 0)
</script>

<!-- 
商品卡片组件也相应简化
-->
<template name="ProductCard">
  <div class="product-card">
    <!-- 🎯 直接使用实体的计算属性，逻辑清晰 -->
    <img :src="product.image" :alt="product.itemName" />

    <h3>{{ product.itemName }}</h3>
    <p>{{ product.description }}</p>

    <!-- 🎯 价格显示逻辑封装在实体中 -->
    <div class="price">
      <span class="current">{{ product.priceDisplay }}</span>
      <span v-if="product.originalPriceDisplay" class="original">
        {{ product.originalPriceDisplay }}
      </span>
    </div>

    <!-- 🎯 折扣、标签等业务逻辑都在实体中 -->
    <div class="tags">
      <span v-for="tag in product.tags" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>

    <!-- 🎯 销量显示格式化在实体中 -->
    <div class="sales">{{ product.salesDisplay }}</div>

    <!-- 🎯 库存状态逻辑封装在实体中 -->
    <div class="stock" :class="product.stockStatus">
      {{ product.stockStatusText }}
    </div>
  </div>
</template>

<script setup name="ProductCard">
// 🎯 组件只需要接收类型安全的实体数据
interface Props {
  product: IProductListItem
}

defineProps<Props>()
</script>
