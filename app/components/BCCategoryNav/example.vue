<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">CategoryNav 组件使用示例</h1>
    
    <!-- 触发按钮 -->
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      @click="showCategoryNav = true"
    >
      打开分类导航
    </button>

    <!-- 分类导航侧边栏 -->
    <USlideover v-model="showCategoryNav" side="left">
      <BCCategoryNav
        v-model="showCategoryNav"
        @close="handleClose"
        @search="handleSearch"
        @changeRegion="handleChangeRegion"
      />
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BCCategoryNav from './BCCategoryNav.vue'

const showCategoryNav = ref(false)

/**
 * 处理关闭
 */
function handleClose() {
  console.log('分类导航已关闭')
  showCategoryNav.value = false
}

/**
 * 处理搜索
 */
function handleSearch(keyword: string) {
  console.log('搜索关键词:', keyword)
  // 这里可以实现搜索逻辑，例如：
  // - 跳转到搜索结果页
  // - 显示搜索建议
  // - 过滤分类列表
}

/**
 * 处理更改配送地区
 */
function handleChangeRegion() {
  console.log('更改配送地区')
  // 这里可以实现地区选择逻辑，例如：
  // - 打开地区选择弹窗
  // - 跳转到地区设置页面
}
</script>

