<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 商品筛选组件 -->
    <ProductFilter
      v-model="filterValue"
      :filter-groups="filterGroups"
      :show-filter-panel="showFilterPanel"
      @update:show-filter-panel="showFilterPanel = $event"
      @change="handleFilterChange"
    />

    <!-- 商品列表（示例） -->
    <div class="container mx-auto px-32 py-8">
      <div class="grid grid-cols-4 gap-6">
        <div
          v-for="i in 12"
          :key="i"
          class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div class="aspect-square bg-gray-200 rounded-lg mb-4" />
          <h3 class="text-base font-medium text-gray-900 mb-2">商品名称 {{ i }}</h3>
          <p class="text-sm text-gray-500 mb-2">商品描述信息</p>
          <p class="text-lg font-bold text-red-600">¥1,299</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProductFilterValue, IFilterGroup } from './types'
import { ESortOption } from './types'

/**
 * ProductFilter 组件使用示例
 */

// 筛选值
const filterValue = ref<IProductFilterValue>({
  category: undefined,
  series: [],
  colors: [],
  materials: [],
  sizes: [],
  priceRange: undefined,
  sort: ESortOption.DEFAULT,
})

// 是否显示筛选面板
const showFilterPanel = ref(false)

// 筛选组配置
const filterGroups = ref<IFilterGroup[]>([
  {
    key: 'category',
    label: '分类',
    multiple: false,
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
      { id: '4', label: '钱包与小皮件', value: '4' },
      { id: '5', label: '旅行箱包', value: '5' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
  {
    key: 'series',
    label: '系列',
    multiple: true,
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
      { id: '4', label: '钱包与小皮件', value: '4' },
      { id: '5', label: '旅行箱包', value: '5' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
  {
    key: 'colors',
    label: '颜色',
    multiple: true,
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
      { id: '4', label: '钱包与小皮件', value: '4' },
      { id: '5', label: '旅行箱包', value: '5' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
  {
    key: 'materials',
    label: '材质',
    multiple: true,
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
      { id: '4', label: '钱包与小皮件', value: '4' },
      { id: '5', label: '旅行箱包', value: '5' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
  {
    key: 'sizes',
    label: '尺寸',
    multiple: true,
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
      { id: '4', label: '钱包与小皮件', value: '4' },
      { id: '5', label: '旅行箱包', value: '5' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
  {
    key: 'priceRange',
    label: '价格区间',
    multiple: false,
    options: [
      { id: '1', label: '¥500及以下', value: '0-500' },
      { id: '2', label: '¥500-¥1000', value: '500-1000' },
      { id: '3', label: '¥500-¥1000', value: '1000-3000' },
      { id: '4', label: '¥500-¥1000', value: '3000-5000' },
      { id: '5', label: '¥10000以上', value: '10000-' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
])

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  console.log('筛选值变化:', filterValue.value)

  // 这里可以调用 API 重新加载商品列表
  // 例如：
  // await fetchProducts({
  //   category: filterValue.value.category,
  //   series: filterValue.value.series,
  //   colors: filterValue.value.colors,
  //   materials: filterValue.value.materials,
  //   sizes: filterValue.value.sizes,
  //   priceRange: filterValue.value.priceRange,
  //   sort: filterValue.value.sort,
  // })
}

// 初始化时默认显示筛选面板（仅用于示例）
onMounted(() => {
  showFilterPanel.value = true
})
</script>

