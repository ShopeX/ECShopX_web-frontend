<template>
  <header class="w-full h-[88px] bg-white">
    <div class="container mx-auto h-full flex items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex-shrink-0">
        <img src="/images/logo/logo.png" alt="Logo" class="h-14" />
      </NuxtLink>

      <!-- 导航菜单 -->
      <nav class="flex items-center space-x-8 ml-16">
        <NuxtLink to="/" class="text-dark text-base hover:text-red-500">首页</NuxtLink>
        <NuxtLink to="/category/1" class="text-dark text-base hover:text-red-500">十三香</NuxtLink>
        <NuxtLink to="/category/2" class="text-dark text-base hover:text-red-500">麻辣鲜</NuxtLink>
        <NuxtLink to="/category/3" class="text-dark text-base hover:text-red-500"
          >烧烤系列</NuxtLink
        >
        <NuxtLink to="/category/4" class="text-dark text-base hover:text-red-500">炖料</NuxtLink>
      </nav>

      <!-- 搜索框 -->
      <div class="flex items-center border border-gray-200 rounded-[18px] px-4 py-2 w-[320px]">
        <input
          type="text"
          placeholder="搜索商品"
          class="flex-1 outline-none border-none bg-transparent text-sm"
        />
        <img src="/icons/search.svg" alt="搜索" class="w-[18px] h-[18px] cursor-pointer" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 主导航栏组件逻辑
</script>
