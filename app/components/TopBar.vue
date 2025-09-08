<template>
  <div class="w-full h-10 bg-black text-white">
    <div class="container mx-auto h-full flex items-center justify-between px-4">
      <!-- 左侧导航 -->
      <div class="flex items-center space-x-4">
        <NuxtLink to="/" class="text-sm">首页</NuxtLink>
        <div class="flex items-center space-x-2">
          <img src="/icons/qrcode.svg" alt="二维码" class="w-4 h-4" />
          <span class="text-sm text-secondary">手机逛</span>
        </div>
      </div>

      <!-- 右侧导航 -->
      <div class="flex items-center space-x-6">
        <NuxtLink to="/login" class="text-sm">登录/注册</NuxtLink>
        <NuxtLink to="/coupons" class="text-sm">领券中心</NuxtLink>
        <NuxtLink to="/member" class="text-sm">会员中心</NuxtLink>
        <NuxtLink to="/merchant" class="text-sm">商家入驻</NuxtLink>
        <div class="flex items-center bg-red-500 px-4 h-full">
          <img src="/icons/cart.svg" alt="购物车" class="w-5 h-5 mr-2" />
          <span class="text-sm">我的购物车</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 顶部导航栏组件逻辑
</script>
