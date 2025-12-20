<template>
  <div class="w-full bg-white">
    <!-- 内容容器 -->
    <div class="w-full max-w-[1440px] mx-auto px-8 sm:px-16 lg:px-32 py-8 sm:py-12 lg:py-16">
      <!-- 标题 -->
      <div
        class="flex flex-col font-medium justify-center leading-none w-full text-2xl text-[#191a1d] mb-8"
      >
        <h2 class="block leading-[48px]">全部商品</h2>
      </div>

      <!-- 筛选栏：排序和筛选按钮 -->
      <div class="flex h-[42px] items-center justify-between w-full mb-8">
        <!-- 左侧：排序选择器 -->
        <div class="relative flex items-center gap-2">
          <span class="text-sm text-[#99a1af] font-normal leading-5">排序：</span>
          <button
            class="flex items-center gap-2 text-sm font-medium leading-5 text-[#191a1d] hover:opacity-80 transition-opacity"
            @click="toggleSortDropdown"
          >
            <span>{{ currentSortLabel }}</span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="size-3 transition-transform"
              :class="{ 'rotate-180': showSortDropdown }"
            />
          </button>

          <!-- 排序下拉菜单 -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showSortDropdown"
              class="absolute left-0 top-full mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px]"
            >
              <div
                v-for="option in sortOptions"
                :key="option.value"
                class="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                :class="{
                  'text-[#191a1d] font-medium': localValue.sort === option.value,
                  'text-[#99a1af]': localValue.sort !== option.value,
                }"
                @click="handleSortChange(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </Transition>
        </div>

        <!-- 右侧：筛选按钮 -->
        <button
          class="flex items-center gap-2 text-sm font-medium leading-5 text-[#191a1d] hover:opacity-80 transition-opacity"
          @click="toggleFilterPanel"
        >
          <span>筛选</span>
          <UIcon name="i-heroicons-funnel" class="size-4" />
        </button>
      </div>

      <!-- 筛选面板 -->
      <div v-if="showFilterPanel" class="flex items-start justify-between w-full gap-8 py-4">
        <!-- 渲染每个筛选组 -->
        <div v-for="group in filterGroups" :key="group.key" class="flex flex-col gap-4 items-start">
          <!-- 筛选组标题 -->
          <div class="flex items-center justify-center">
            <p class="text-sm font-medium leading-5 text-[#99a1af] whitespace-nowrap">
              {{ group.label }}
            </p>
          </div>

          <!-- 筛选选项列表 -->
          <div class="flex flex-col gap-4 items-start">
            <!-- "全部" 选项 -->
            <div
              class="flex gap-2.5 items-center cursor-pointer"
              @click="handleSelectAll(group.key)"
            >
              <div
                class="flex flex-col items-start size-5"
                :class="
                  isAllSelected(group.key)
                    ? 'bg-black pb-0 pt-0.5 px-0.5'
                    : 'bg-white border border-[#191a1d] shadow-sm'
                "
              >
                <Icon
                  v-if="isAllSelected(group.key)"
                  name="i-heroicons-check"
                  class="size-4 text-white"
                />
              </div>
              <p
                class="text-sm font-medium leading-5 text-right whitespace-nowrap"
                :class="isAllSelected(group.key) ? 'text-[#191a1d]' : 'text-[#99a1af]'"
              >
                全部
              </p>
            </div>

            <!-- 其他选项 -->
            <div
              v-for="option in group.options"
              :key="option.id"
              class="flex gap-2.5 items-center cursor-pointer"
              @click="handleOptionToggle(group.key, option.value)"
            >
              <div
                class="size-4 border border-[#191a1d] shadow-sm flex items-center justify-center"
                :class="isOptionSelected(group.key, option.value) ? 'bg-black' : 'bg-white'"
              >
                <Icon
                  v-if="isOptionSelected(group.key, option.value)"
                  name="i-heroicons-check"
                  class="size-3 text-white"
                />
              </div>
              <p class="text-sm font-medium leading-5 text-[#191a1d] text-right whitespace-nowrap">
                {{ option.label }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProductFilterProps, IProductFilterEmits, IProductFilterValue } from './types'
import { ESortOption } from './types'

/**
 * 商品筛选组件
 *
 * 提供商品筛选功能，包括排序和多维度筛选
 */

// Props
const props = withDefaults(defineProps<IProductFilterProps>(), {
  showFilterPanel: false,
})

// Emits
const emit = defineEmits<IProductFilterEmits>()

// 本地筛选值
const localValue = ref<IProductFilterValue>({ ...props.modelValue })

// 显示排序下拉菜单
const showSortDropdown = ref(false)

// 排序下拉菜单引用
const sortDropdownRef = ref<HTMLElement | null>(null)

// 排序选项
const sortOptions = [
  { value: ESortOption.DEFAULT, label: '默认' },
  { value: ESortOption.PRICE_ASC, label: '价格从低到高' },
  { value: ESortOption.PRICE_DESC, label: '价格从高到低' },
  { value: ESortOption.SALES, label: '销量' },
  { value: ESortOption.NEW, label: '上新' },
]

// 当前排序标签
const currentSortLabel = computed(() => {
  const option = sortOptions.find((opt) => opt.value === localValue.value.sort)
  return option?.label || '价格'
})

/**
 * 切换排序下拉菜单
 */
function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value
}

/**
 * 切换筛选面板
 */
function toggleFilterPanel() {
  emit('update:showFilterPanel', !props.showFilterPanel)
}

/**
 * 处理排序变化
 */
function handleSortChange(sort: ESortOption) {
  localValue.value.sort = sort
  showSortDropdown.value = false
  emitChange()
}

/**
 * 判断选项是否被选中
 */
function isOptionSelected(groupKey: string, value: string | number): boolean {
  const groupValue = localValue.value[groupKey as keyof IProductFilterValue]

  if (Array.isArray(groupValue)) {
    return groupValue.includes(value)
  }
  return groupValue === value
}

/**
 * 判断是否选中"全部"
 */
function isAllSelected(groupKey: string): boolean {
  const groupValue = localValue.value[groupKey as keyof IProductFilterValue]

  if (Array.isArray(groupValue)) {
    return groupValue.length === 0
  }
  return !groupValue
}

/**
 * 处理选择"全部"
 */
function handleSelectAll(groupKey: string) {
  const key = groupKey as keyof IProductFilterValue
  const groupValue = localValue.value[key]

  if (Array.isArray(groupValue)) {
    localValue.value[key] = [] as any
  } else {
    localValue.value[key] = undefined as any
  }

  emitChange()
}

/**
 * 处理选项切换
 */
function handleOptionToggle(groupKey: string, value: string | number) {
  const key = groupKey as keyof IProductFilterValue
  const groupValue = localValue.value[key]

  // 查找对应的筛选组
  const group = props.filterGroups.find((g) => g.key === groupKey)
  const isMultiple = group?.multiple !== false

  if (isMultiple) {
    // 多选
    const currentValues = (groupValue as (string | number)[]) || []
    const index = currentValues.indexOf(value)

    if (index > -1) {
      // 已选中，取消选择
      currentValues.splice(index, 1)
    } else {
      // 未选中，添加选择
      currentValues.push(value)
    }

    localValue.value[key] = [...currentValues] as any
  } else {
    // 单选
    if (groupValue === value) {
      // 已选中，取消选择
      localValue.value[key] = undefined as any
    } else {
      // 选中新选项
      localValue.value[key] = value as any
    }
  }

  emitChange()
}

/**
 * 发送变化事件
 */
function emitChange() {
  emit('update:modelValue', { ...localValue.value })
  emit('change')
}

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = { ...newValue }
  },
  { deep: true }
)

/**
 * 点击外部关闭排序下拉菜单
 */
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (showSortDropdown.value && !target.closest('.relative')) {
      showSortDropdown.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
