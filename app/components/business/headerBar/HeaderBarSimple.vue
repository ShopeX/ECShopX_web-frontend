<template>
  <header class="sp-header-bar-simple w-full border-b border-gray-200">
    <div class="sp-main-nav bg-white">
      <div class="container mx-auto h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6">
        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0">
          <img src="/images/logo/logo.png" alt="ECSHOPX Logo" class="h-8 lg:h-10" />
        </NuxtLink>

        <!-- 中间导航菜单 -->
        <nav class="hidden lg:flex items-center space-x-8 text-sm font-medium">
          <NuxtLink to="/collections/276" class="hover:text-gray-600 transition-colors">
            肌肤护理
          </NuxtLink>
          <NuxtLink to="/collections/275" class="hover:text-gray-600 transition-colors">
            美妆香氛
          </NuxtLink>
          <div class="relative group">
            <button class="flex items-center space-x-1 hover:text-gray-600 transition-colors">
              <span>时尚美妆</span>
              <Icon name="heroicons:chevron-down-20-solid" class="w-4 h-4" />
            </button>
          </div>
          <NuxtLink to="/pajamas" class="hover:text-gray-600 transition-colors">
            面部护理
          </NuxtLink>
          <NuxtLink to="/bags" class="hover:text-gray-600 transition-colors"> 防晒隔离 </NuxtLink>
          <NuxtLink to="/shoes" class="hover:text-gray-600 transition-colors"> 香水 </NuxtLink>
          <NuxtLink to="/accessories" class="hover:text-gray-600 transition-colors">
            眼部护理
          </NuxtLink>
          <NuxtLink to="/jewelry" class="hover:text-gray-600 transition-colors"> 唇妆 </NuxtLink>
          <NuxtLink to="/blog" class="hover:text-gray-600 transition-colors"> 积分商城 </NuxtLink>
        </nav>

        <!-- 右侧图标 -->
        <div class="flex items-center space-x-4 lg:space-x-6">
          <button class="hover:text-gray-600 transition-colors" aria-label="Search">
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
          </button>
          <button class="hover:text-gray-600 transition-colors" aria-label="Shopping Cart">
            <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
          </button>
          <button class="hover:text-gray-600 transition-colors" aria-label="User Account">
            <Icon name="heroicons:user" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * Simple Header Bar 组件
 * 用于登录、注册等简单页面的头部
 * 包含 Logo、导航菜单和功能图标
 */
</script>
