<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部导航栏 - 支持 CMS 装修，API 失败时自动使用默认模板 -->
    <div class="header-container sticky top-0 z-50 bg-white">
      <TemplateEngine template="header">
        <template #header>
          <HeaderBar @open-category-nav="handleOpenCategoryNav" />
        </template>
      </TemplateEngine>
    </div>

    <!-- 页面内容区域 -->
    <main class="mx-auto">
      <slot />
    </main>

    <!-- Footer 区域 -->
    <Footer />

    <!-- 分类导航侧边栏 -->
    <USlideover v-model:open="showCategoryNav" side="left">
      <template #content>
        <CategoryNav
          v-model="showCategoryNav"
          @close="showCategoryNav = false"
          @search="handleCategorySearch"
          @change-region="handleChangeRegion"
        />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Footer } from '~/components/business/footer'
import { CategoryNav } from '~/components/business/categoryNav'

// 默认布局组件 - 使用完整的电商头部

const router = useRouter()

// 分类导航侧边栏状态
const showCategoryNav = ref(false)

// 手动处理打开分类导航
const handleOpenCategoryNav = () => {
  showCategoryNav.value = true
}

/**
 * 处理分类导航搜索
 */
const handleCategorySearch = (keyword: string) => {
  console.log('分类搜索:', keyword)
  // TODO: 实现搜索逻辑，例如跳转到搜索结果页
  if (keyword.trim()) {
    showCategoryNav.value = false
    router.push({
      path: '/search',
      query: { q: keyword },
    })
  }
}

/**
 * 处理更改配送地区
 */
const handleChangeRegion = () => {
  console.log('更改配送地区')
  // TODO: 实现地区选择逻辑，例如打开地区选择弹窗
}
</script>
