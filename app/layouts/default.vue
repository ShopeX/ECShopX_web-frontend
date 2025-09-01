<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-gray-900">
              ECSHOPX
            </NuxtLink>
          </div>

          <!-- 导航菜单 -->
          <nav class="flex items-center space-x-8">
            <NuxtLink 
              to="/item/list" 
              class="text-gray-500 hover:text-gray-900"
            >
              商品列表
            </NuxtLink>
            <!-- 其他导航项 -->
          </nav>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="py-6">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500">
          © 2024 ECSHOPX. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 布局组件不需要额外的逻辑
</script>
