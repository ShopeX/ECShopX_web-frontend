<template>
  <div class="sp-brand-filter">
    <div class="filter-header">
      <h3 class="title">品牌</h3>
      <button v-if="showMore" class="more-btn" @click="toggleExpand">
        {{ isExpanded ? '收起' : '更多' }}
        <Icon :name="isExpanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
      </button>
    </div>

    <div class="brand-list" :class="{ expanded: isExpanded }">
      <div class="brand-item" 
           :class="{ active: modelValue === '' }"
           @click="handleSelect('')">
        全部
      </div>
      <div v-for="brand in brands" 
           :key="brand.id" 
           class="brand-item"
           :class="{ active: modelValue === brand.id }"
           @click="handleSelect(brand.id)">
        {{ brand.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IBrand } from '@/types/api/item'

const props = defineProps<{
  modelValue: string | number
  brands: IBrand[]
  maxDisplay?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// 是否展开
const isExpanded = ref(false)

// 是否显示更多按钮
const showMore = computed(() => {
  return props.brands.length > (props.maxDisplay || 10)
})

// 选择品牌
const handleSelect = (id: string | number) => {
  emit('update:modelValue', id)
}

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.sp-brand-filter {
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .title {
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }

    .more-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0;
      font-size: 12px;
      color: #666;
      background: none;
      border: none;
      cursor: pointer;

      &:hover {
        color: var(--primary-color);
      }
    }
  }

  .brand-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 36px;
    overflow: hidden;
    transition: max-height 0.3s;

    &.expanded {
      max-height: none;
    }

    .brand-item {
      padding: 6px 12px;
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: var(--primary-color);
        background: #f0f0f0;
      }

      &.active {
        color: #fff;
        background: var(--primary-color);
      }
    }
  }
}
</style> 