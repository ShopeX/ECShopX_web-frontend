---
name: ecshopx-search
description: "ECShopX 搜索功能开发指南。包含搜索框、搜索建议、搜索结果、搜索历史、热门搜索等功能。适用场景: (1) 开发搜索框组件 (2) 实现搜索建议和自动完成 (3) 搜索结果页开发 (4) 搜索历史管理 (5) 热门搜索展示。混合架构：搜索结果用方案2，搜索历史用方案1（需要持久化）。"
---

# 搜索功能开发

## 概述

搜索是 B2C 商城的重要入口，好的搜索体验能显著提升转化率。

**核心功能**：
- 搜索框 + 实时搜索建议
- 搜索结果展示
- 搜索历史管理（持久化）
- 热门搜索词展示
- 搜索过滤和排序

**架构方案**：**混合架构**
- 搜索结果：方案 2（简化架构）- 不需要跨页面共享
- 搜索历史：方案 1（完整架构）- 需要持久化到 localStorage

## 快速开始

### 基本结构

```
app/
├── components/business/search/
│   ├── SearchBox.vue             # 搜索框
│   ├── SearchSuggestions.vue     # 搜索建议
│   ├── SearchHistory.vue         # 搜索历史
│   ├── HotSearches.vue           # 热门搜索
│   └── SearchFilters.vue         # 搜索筛选
│
├── pages/search/
│   └── index.vue                 # 搜索结果页
│
├── composables/
│   └── useSearch.ts              # 搜索逻辑
│
├── stores/
│   └── searchHistory.ts          # 搜索历史 Store
│
└── infrastructure/http/clients/
    └── SearchApiClient.ts        # 搜索 API
```

## 核心功能实现

### 1. 搜索框组件

```vue
<!-- app/components/business/search/SearchBox.vue -->
<template>
  <div class="relative">
    <div class="relative flex items-center">
      <!-- 搜索输入框 -->
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索商品"
        class="w-full h-10 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        @input="handleInput"
        @focus="showPanel = true"
        @keydown.enter="handleSearch"
      />
      
      <!-- 搜索按钮 -->
      <button 
        class="absolute right-2 text-gray-400 hover:text-primary"
        @click="handleSearch"
      >
        <Icon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
      </button>
    </div>
    
    <!-- 搜索面板（建议 + 历史） -->
    <Transition name="fade">
      <div 
        v-if="showPanel && (hasSuggestions || hasHistory)"
        v-click-outside="closePanel"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto"
      >
        <!-- 搜索建议 -->
        <div v-if="hasSuggestions" class="p-2">
          <div class="text-xs text-gray-500 px-3 py-2">搜索建议</div>
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.keyword"
            class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
            @click="selectSuggestion(suggestion.keyword)"
          >
            <Icon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400" />
            <span v-html="highlightKeyword(suggestion.keyword)"></span>
          </button>
        </div>
        
        <!-- 搜索历史 -->
        <div v-if="hasHistory" class="p-2 border-t">
          <div class="flex items-center justify-between px-3 py-2">
            <span class="text-xs text-gray-500">搜索历史</span>
            <button 
              class="text-xs text-gray-400 hover:text-primary"
              @click="clearHistory"
            >
              清空
            </button>
          </div>
          <button
            v-for="item in historyList"
            :key="item"
            class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
            @click="selectSuggestion(item)"
          >
            <Icon name="i-heroicons-clock" class="w-4 h-4 text-gray-400" />
            <span>{{ item }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'

const router = useRouter()
const { 
  searchSuggestions, 
  loadSuggestions 
} = useSearch()

const { 
  historyList, 
  addHistory, 
  clearAllHistory 
} = useSearchHistory()

const keyword = ref('')
const showPanel = ref(false)
const suggestions = ref<Array<{ keyword: string }>>([])

// 是否有搜索建议
const hasSuggestions = computed(() => suggestions.value.length > 0)

// 是否有搜索历史
const hasHistory = computed(() => historyList.value.length > 0)

// 输入处理（防抖）
const handleInput = useDebounceFn(async () => {
  if (keyword.value.trim().length < 2) {
    suggestions.value = []
    return
  }
  
  suggestions.value = await loadSuggestions(keyword.value)
}, 300)

// 执行搜索
const handleSearch = () => {
  if (!keyword.value.trim()) return
  
  addHistory(keyword.value)
  router.push({
    path: '/search',
    query: { q: keyword.value }
  })
  
  closePanel()
}

// 选择建议词
const selectSuggestion = (word: string) => {
  keyword.value = word
  handleSearch()
}

// 高亮关键词
const highlightKeyword = (text: string): string => {
  if (!keyword.value) return text
  
  const regex = new RegExp(`(${keyword.value})`, 'gi')
  return text.replace(regex, '<span class="text-primary">$1</span>')
}

// 关闭面板
const closePanel = () => {
  showPanel.value = false
}

// 清空历史
const clearHistory = () => {
  clearAllHistory()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 2. 搜索结果页

```vue
<!-- app/pages/search/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 搜索关键词 -->
    <div class="mb-6">
      <h1 class="text-xl">
        搜索结果：
        <span class="text-primary font-bold">{{ searchKeyword }}</span>
        <span class="text-sm text-gray-500 ml-2">
          (共 {{ total }} 个商品)
        </span>
      </h1>
    </div>
    
    <!-- 筛选和排序 -->
    <div class="flex items-center gap-4 mb-6">
      <button
        v-for="sort in sortOptions"
        :key="sort.value"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentSort === sort.value
            ? 'bg-primary text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        ]"
        @click="handleSort(sort.value)"
      >
        {{ sort.label }}
      </button>
    </div>
    
    <!-- 搜索结果 -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ProductCardSkeleton v-for="i in 8" :key="i" />
    </div>
    
    <div v-else-if="hasResults" class="space-y-6">
      <!-- 商品列表 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard 
          v-for="product in results" 
          :key="product.id"
          :product="product"
        />
      </div>
      
      <!-- 分页 -->
      <UPagination
        v-model="currentPage"
        :total="total"
        :page-size="pageSize"
        class="flex justify-center"
        @update:model-value="handlePageChange"
      />
    </div>
    
    <!-- 无结果 -->
    <div v-else class="text-center py-20">
      <div class="text-gray-400 text-6xl mb-4">🔍</div>
      <p class="text-gray-500 mb-2">没有找到相关商品</p>
      <p class="text-sm text-gray-400 mb-6">
        换个关键词试试吧
      </p>
      
      <!-- 热门搜索推荐 -->
      <div v-if="hotSearches.length > 0" class="max-w-md mx-auto">
        <p class="text-sm text-gray-600 mb-3">大家都在搜：</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <NuxtLink
            v-for="hot in hotSearches"
            :key="hot"
            :to="`/search?q=${hot}`"
            class="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
          >
            {{ hot }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { 
  results, 
  loading, 
  total, 
  search 
} = useSearch()

const { hotSearches, loadHotSearches } = useSearchHistory()

const searchKeyword = ref(route.query.q as string || '')
const currentSort = ref('default')
const currentPage = ref(1)
const pageSize = 20

const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '销量', value: 'sales' },
  { label: '价格升序', value: 'price_asc' },
  { label: '价格降序', value: 'price_desc' }
]

const hasResults = computed(() => results.value.length > 0)

// 监听路由变化
watch(() => route.query.q, (newKeyword) => {
  if (newKeyword) {
    searchKeyword.value = newKeyword as string
    performSearch()
  }
}, { immediate: true })

// 执行搜索
const performSearch = async () => {
  await search({
    keyword: searchKeyword.value,
    page: currentPage.value,
    pageSize: pageSize,
    sortBy: currentSort.value
  })
}

// 排序
const handleSort = (sortValue: string) => {
  currentSort.value = sortValue
  currentPage.value = 1
  performSearch()
}

// 翻页
const handlePageChange = (page: number) => {
  currentPage.value = page
  performSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 加载热门搜索
onMounted(() => {
  loadHotSearches()
})

// SEO
useHead({
  title: computed(() => `${searchKeyword.value} - 搜索结果`),
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>
```

### 3. 搜索 Composable

```typescript
// app/composables/useSearch.ts

import { ref, readonly } from 'vue'
import type { IProduct } from '~/types/product'
import { searchApiClient } from '~/infrastructure/http/clients/SearchApiClient'
import { ProductTransformer } from '~/infrastructure/transformers/productTransformer'
import { logger } from '~/utils/log'

export function useSearch() {
  const results = ref<IProduct[]>([])
  const loading = ref(false)
  const total = ref(0)
  
  /**
   * 搜索商品
   */
  async function search(params: {
    keyword: string
    page?: number
    pageSize?: number
    sortBy?: string
  }) {
    loading.value = true
    
    try {
      const response = await searchApiClient.search(params)
      
      results.value = ProductTransformer.toModelList(response.list)
      total.value = response.total
      
      logger.info('[useSearch] 搜索成功:', params.keyword, results.value.length, '个结果')
    } catch (e: any) {
      logger.error('[useSearch] 搜索失败:', e)
      results.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 加载搜索建议
   */
  async function loadSuggestions(keyword: string): Promise<Array<{ keyword: string }>> {
    try {
      const response = await searchApiClient.getSuggestions(keyword)
      return response.suggestions || []
    } catch (e: any) {
      logger.error('[useSearch] 加载建议失败:', e)
      return []
    }
  }
  
  return {
    results: readonly(results),
    loading: readonly(loading),
    total: readonly(total),
    
    search,
    loadSuggestions
  }
}
```

### 4. 搜索历史 Store

```typescript
// app/stores/searchHistory.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchApiClient } from '~/infrastructure/http/clients/SearchApiClient'
import { logger } from '~/utils/log'

const MAX_HISTORY = 10  // 最多保存 10 条历史

export const useSearchHistoryStore = defineStore('searchHistory', () => {
  const history = ref<string[]>([])
  const hotSearches = ref<string[]>([])
  
  /**
   * 添加搜索历史
   */
  function addHistory(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) return
    
    // 去重
    history.value = history.value.filter(item => item !== trimmed)
    
    // 添加到开头
    history.value.unshift(trimmed)
    
    // 限制数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    
    logger.info('[SearchHistory] 添加历史:', trimmed)
  }
  
  /**
   * 清空搜索历史
   */
  function clearHistory() {
    history.value = []
    logger.info('[SearchHistory] 清空历史')
  }
  
  /**
   * 加载热门搜索
   */
  async function loadHotSearches() {
    try {
      const response = await searchApiClient.getHotSearches()
      hotSearches.value = response.hot_searches || []
      
      logger.info('[SearchHistory] 加载热门搜索:', hotSearches.value.length)
    } catch (e: any) {
      logger.error('[SearchHistory] 加载热门搜索失败:', e)
    }
  }
  
  return {
    history: computed(() => history.value),
    hotSearches: computed(() => hotSearches.value),
    
    addHistory,
    clearHistory,
    loadHotSearches
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['history']  // 只持久化历史，热门搜索不持久化
  }
})
```

### 5. Composable 封装

```typescript
// app/composables/useSearchHistory.ts

import { computed } from 'vue'
import { useSearchHistoryStore } from '~/stores/searchHistory'

export function useSearchHistory() {
  const store = useSearchHistoryStore()
  
  return {
    historyList: computed(() => store.history),
    hotSearches: computed(() => store.hotSearches),
    
    addHistory: store.addHistory,
    clearAllHistory: store.clearHistory,
    loadHotSearches: store.loadHotSearches
  }
}
```

## 开发检查清单

**组件开发**：
- [ ] 搜索框组件（带建议）
- [ ] 搜索结果页
- [ ] 搜索历史展示
- [ ] 热门搜索展示
- [ ] 无结果状态

**功能实现**：
- [ ] 实时搜索建议（防抖）
- [ ] 关键词高亮
- [ ] 搜索历史持久化
- [ ] 热门搜索加载
- [ ] 搜索结果排序
- [ ] 搜索结果分页

**用户体验**：
- [ ] 输入防抖（300ms）
- [ ] 搜索历史去重
- [ ] 键盘导航支持
- [ ] 移动端适配
- [ ] 加载状态展示

## 性能优化

### 搜索防抖

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(async (keyword: string) => {
  await loadSuggestions(keyword)
}, 300)
```

### 请求取消

```typescript
let abortController: AbortController | null = null

async function search(keyword: string) {
  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }
  
  abortController = new AbortController()
  
  try {
    const response = await fetch('/api/search', {
      signal: abortController.signal,
      // ...
    })
  } catch (e) {
    if (e.name === 'AbortError') {
      // 请求被取消
      return
    }
    throw e
  }
}
```

## 常见问题

**Q: 搜索建议何时触发？**
A: 输入 2 个字符以上，防抖 300ms 后触发。

**Q: 搜索历史如何去重？**
A: 添加新历史时，先移除已存在的相同关键词，再添加到开头。

**Q: 如何实现搜索结果高亮？**
A: 在后端返回时标记高亮字段，或前端用正则替换关键词。

**Q: 热门搜索多久更新一次？**
A: 每次进入搜索页面时加载，后端可以做缓存（如 5 分钟）。

---

**相关 Skills**：
- `ecshopx-catalog` - 商品目录（搜索结果复用商品卡片）
- `ecshopx-system` - 系统架构

**最后更新**：2025-01-12
