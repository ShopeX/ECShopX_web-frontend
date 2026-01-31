<template>
  <div class="bg-white flex flex-col p-8 h-full w-full" data-testid="search-drawer">
    <!-- 关闭按钮 -->
    <div class="flex items-center justify-between px-0 py-4">
      <button
        class="w-6 h-6 flex items-center justify-center"
        data-testid="search-drawer-close"
        @click="handleClose"
      >
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
          ref="inputRef"
          v-model="keyword"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="flex-1 text-sm text-[#99a1af] outline-none border-none bg-transparent"
          data-testid="search-input"
          @keydown.enter="handleSearch"
        />
        <button
          v-if="keyword"
          class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          data-testid="search-clear"
          @click="keyword = ''"
        >
          <UIcon name="i-heroicons-x-circle" class="w-5 h-5" />
        </button>
      </div>

      <!-- 热门搜索和历史搜索 - PC 两列并排 -->
      <div class="grid gap-8" :class="isMobile ? 'grid-cols-1' : 'grid-cols-2'">
        <!-- 热门搜索 -->
        <div data-testid="hot-keywords-section">
          <h2 class="text-base font-medium text-[#191a1d] leading-5 mb-8">
            {{ $t('search.hotKeywords') }}
          </h2>
          <div class="flex" :class="isMobile ? 'flex-wrap gap-3' : 'flex-col gap-4'">
            <button
              v-for="item in hotKeywords"
              :key="item"
              type="button"
              class="inline-flex items-center justify-center px-2 py-1 text-sm font-medium text-[#191a1d] bg-[#f3f4f6] hover:bg-gray-200 transition-colors self-start"
              data-testid="hot-keyword-tag"
              @click="handleTagClick(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <!-- 历史搜索 -->
        <div data-testid="history-keywords-section">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-base font-medium text-[#191a1d] leading-5">
              {{ $t('search.historyKeywords') }}
            </h2>
            <button
              v-if="historyKeywords.length > 0"
              type="button"
              class="text-xs text-gray-400 hover:text-gray-600"
              data-testid="clear-history"
              @click="handleClearHistory"
            >
              {{ $t('search.clearHistory') }}
            </button>
          </div>
          <div class="flex" :class="isMobile ? 'flex-wrap gap-3' : 'flex-col gap-4'">
            <button
              v-for="item in historyKeywords"
              :key="item"
              type="button"
              class="inline-flex items-center justify-center px-2 py-1 text-sm font-medium text-[#191a1d] bg-[#f3f4f6] hover:bg-gray-200 transition-colors self-start"
              data-testid="history-keyword-tag"
              @click="handleTagClick(item)"
            >
              {{ item }}
            </button>
            <p v-if="historyKeywords.length === 0" class="text-sm text-gray-400">
              {{ $t('search.noHistory') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchHistory } from '~/composables/useSearchHistory'

defineOptions({
  name: 'BCSearchDrawer',
})

interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 热门搜索关键词 */
  hotKeywords?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  hotKeywords: () => ['手袋', '双十二', '新品', '手表', '香水彩妆', '珠宝腕表', '手提袋'],
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  search: [keyword: string]
  close: []
}>()

// Responsive detection
const isMobile = ref(false)

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})

// Search history
const { historyKeywords, addHistory, clearHistory } = useSearchHistory()

// Local state
const keyword = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// Focus input when opened
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)

// Methods
function handleClose() {
  emit('close')
  emit('update:modelValue', false)
}

function handleSearch() {
  const trimmedKeyword = keyword.value.trim()
  if (!trimmedKeyword) return

  addHistory(trimmedKeyword)
  emit('search', trimmedKeyword)
  handleClose()
}

function handleTagClick(tag: string) {
  keyword.value = tag
  addHistory(tag)
  emit('search', tag)
  handleClose()
}

function handleClearHistory() {
  clearHistory()
}
</script>
