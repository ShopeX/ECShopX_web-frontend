<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部导航栏 - 支持 CMS 装修，API 失败时自动使用默认模板 -->
    <TemplateEngine template="header">
      <template #header>
        <HeaderBar />
      </template>
    </TemplateEngine>

    <!-- 页面内容区域 -->
    <main class="mx-auto">
      <slot />
    </main>

    <!-- Footer 区域（预留） -->
    <!-- <SpFooter /> -->
    <!-- <TemplateEngine template="footer">
      <HeaderBarSimple />
    </TemplateEngine> -->
  </div>
</template>

<script setup lang="ts">
// 默认布局组件 - 使用完整的电商头部
</script>
