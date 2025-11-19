<script setup lang="ts">
// 默认布局组件 - 使用完整的电商头部
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 简化版头部（仅 Logo 和基本导航） -->
    <HeaderBarSimple />

    <!-- 页面内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer 区域（预留） -->
    <!-- <SpFooter /> -->
  </div>
</template>
