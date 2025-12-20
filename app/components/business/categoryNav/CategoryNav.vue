<template>
  <div class="bg-white flex flex-col p-8 h-full w-full">
    <!-- 关闭按钮 -->
    <div class="flex items-center justify-between px-0 py-4">
      <button class="w-6 h-6 flex items-center justify-center" @click="handleClose">
        <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-[#191a1d]" />
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="flex flex-col gap-8 overflow-auto pb-0 pt-4 px-0 flex-1">
      <!-- 搜索框 -->
      <div class="flex gap-2 items-center pb-[17px] border-b border-[#e5e7eb]">
        <button class="w-5 h-5 flex items-center justify-center">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[#191a1d]" />
        </button>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="甄选手袋礼品"
          class="flex-1 text-sm text-[#99a1af] outline-none border-none bg-transparent"
          @input="handleSearch"
        />
      </div>

      <!-- 分类列表 -->
      <nav class="flex flex-col gap-8">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="category.link"
          class="text-base font-medium text-[#191a1d] leading-5 hover:opacity-70 transition-opacity"
        >
          {{ category.name }}
        </NuxtLink>
      </nav>

      <!-- 底部固定信息 -->
      <div class="mt-auto flex flex-col gap-4">
        <NuxtLink
          to="/customer-service"
          class="text-sm text-[#191a1d] leading-5 underline hover:opacity-70 transition-opacity"
        >
          客户服务
        </NuxtLink>
        <a
          href="tel:400-333-2222"
          class="text-sm text-[#191a1d] leading-5 underline hover:opacity-70 transition-opacity"
        >
          400-333-2222
        </a>
        <button
          class="text-sm text-[#191a1d] leading-5 underline hover:opacity-70 transition-opacity text-left"
          @click="handleChangeRegion"
        >
          配送至：中国大陆
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'CategoryNav',
})

// Props
interface Props {
  /** 是否显示 */
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  search: [keyword: string]
  changeRegion: []
}>()

// 分类数据接口
interface Category {
  id: string | number
  name: string
  link: string
}

// 分类列表
const categories = ref<Category[]>([
  { id: 1, name: '全新系列', link: '/collections/new' },
  { id: 2, name: '手袋', link: '/collections/bags' },
  { id: 3, name: '女士', link: '/collections/women' },
  { id: 4, name: '男士', link: '/collections/men' },
  { id: 5, name: '童装', link: '/collections/kids' },
  { id: 6, name: '旅行', link: '/collections/travel' },
  { id: 7, name: '珠宝与腕表', link: '/collections/jewelry-watches' },
  { id: 8, name: '香水与彩妆', link: '/collections/fragrance-makeup' },
  { id: 9, name: '家居生活', link: '/collections/home-living' },
])

// 搜索关键词
const searchKeyword = ref('')

/**
 * 处理关闭
 */
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 处理搜索
 */
function handleSearch() {
  emit('search', searchKeyword.value)
}

/**
 * 处理更改配送地区
 */
function handleChangeRegion() {
  emit('changeRegion')
}
</script>

<style scoped>
/* 移除输入框自动填充背景色 */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset;
  -webkit-text-fill-color: #99a1af;
}

/* 移除输入框默认样式 */
input:focus {
  outline: none;
}

/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
