<template>
  <div class="item-filter">
    <!-- 品牌筛选 -->
    <div v-if="brands.length > 0" class="filter-section">
      <h3 class="section-title">品牌</h3>
      <div class="brand-list">
        <button 
          v-for="brand in brands" 
          :key="brand.id"
          class="brand-item"
          :class="{ active: modelValue.brandId === brand.id }"
          @click="updateFilter('brandId', brand.id)"
        >
          {{ brand.name }}
        </button>
      </div>
    </div>

    <!-- 价格区间 -->
    <div class="filter-section">
      <h3 class="section-title">价格区间</h3>
      <div class="price-range">
        <input 
          type="number" 
          v-model="modelValue.startPrice"
          placeholder="最低价"
          @change="(e) => updateFilter('startPrice', Number((e.target as HTMLInputElement).value))"
        >
        <span class="separator">-</span>
        <input 
          type="number" 
          v-model="modelValue.endPrice"
          placeholder="最高价"
          @change="(e) => updateFilter('endPrice', Number((e.target as HTMLInputElement).value))"
        >
      </div>
    </div>

    <!-- 排序方式 -->
    <div class="filter-section">
      <h3 class="section-title">排序</h3>
      <div class="sort-list">
        <button 
          v-for="sort in sortOptions" 
          :key="sort.value"
          class="sort-item"
          :class="{ active: modelValue.sort === sort.value }"
          @click="updateFilter('sort', sort.value)"
        >
          {{ sort.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IBrand } from '~/types/api/item'

// Props
interface IFilterValue {
  brandId: string | number
  sort: string
  startPrice?: number
  endPrice?: number
}

const props = defineProps<{
  modelValue: IFilterValue
  brands: IBrand[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: IFilterValue): void
  (e: 'change'): void
}>()

// 排序选项
const sortOptions = [
  { label: '默认', value: 'default' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '销量优先', value: 'sales_desc' }
]

// 更新筛选条件
const updateFilter = (key: keyof IFilterValue, value: any) => {
  const newValue = {
    ...props.modelValue,
    [key]: value
  }
  emit('update:modelValue', newValue)
  emit('change')
}
</script>

<style scoped lang="scss">
.item-filter {
  @apply space-y-6 p-4 bg-white rounded-lg;

  .filter-section {
    @apply space-y-3;

    .section-title {
      @apply text-sm font-medium text-gray-900;
    }

    .brand-list {
      @apply flex flex-wrap gap-2;

      .brand-item {
        @apply px-3 py-1 text-sm rounded-full border border-gray-200
          hover:border-primary-500 hover:text-primary-500 transition-colors;

        &.active {
          @apply bg-primary-500 text-white border-primary-500;
        }
      }
    }

    .price-range {
      @apply flex items-center gap-2;

      input {
        @apply w-24 px-3 py-1 text-sm border border-gray-200 rounded
          focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
      }

      .separator {
        @apply text-gray-400;
      }
    }

    .sort-list {
      @apply flex gap-2;

      .sort-item {
        @apply px-3 py-1 text-sm rounded-full border border-gray-200
          hover:border-primary-500 hover:text-primary-500 transition-colors;

        &.active {
          @apply bg-primary-500 text-white border-primary-500;
        }
      }
    }
  }
}
</style> 