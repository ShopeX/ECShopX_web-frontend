<script setup lang="ts">
// 默认布局组件 - 使用统一的 SpHeaderBar
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 统一的电商 Header -->
    <SpHeaderBar />

    <!-- 页面内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer 区域（预留） -->
    <!-- <SpFooter /> -->
  </div>
</template>
