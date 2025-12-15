<template>
  <header class="sp-header-bar bg-white w-full">
    <div class="flex items-center justify-between px-32 py-6">
      <!-- 左侧容器 -->
      <div class="flex items-center gap-6 h-5">
        <!-- 搜索按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="搜索"
          @click="handleSearch"
        >
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-[#191a1d]" />
        </button>

        <!-- 菜单按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="菜单"
          @click="handleMenu"
        >
          <Icon name="heroicons:bars-3" class="w-5 h-5 text-[#191a1d]" />
        </button>
      </div>

      <!-- 中间 LOGO -->
      <NuxtLink
        to="/"
        class="font-semibold text-2xl leading-10 tracking-[-0.53px] text-[#191a1d] whitespace-nowrap hover:opacity-80 transition-opacity"
      >
        LOGO
      </NuxtLink>

      <!-- 右侧容器 -->
      <div class="flex items-center justify-end gap-6 h-5">
        <!-- 相机按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="相机"
          @click="handleCamera"
        >
          <Icon name="heroicons:camera" class="w-5 h-5 text-[#191a1d]" />
        </button>

        <!-- 网格视图按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="网格视图"
          @click="handleGrid"
        >
          <Icon name="heroicons:squares-2x2" class="w-5 h-5 text-[#191a1d]" />
        </button>

        <!-- 用户按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="用户"
          @click="handleUser"
        >
          <Icon name="heroicons:user" class="w-5 h-5 text-[#191a1d]" />
        </button>
      </div>
    </div>

    <!-- 底部阴影分割线 -->
    <div class="shadow-[0px_-1px_0px_0px_inset_rgba(255,255,255,0.1)] pointer-events-none"></div>
  </header>
</template>

<script setup lang="ts">
/**
 * HeaderBar 组件
 * 简洁版的头部导航栏，包含搜索、菜单、LOGO、相机、网格视图和用户功能
 */

const router = useRouter()

/**
 * 处理搜索点击
 */
const handleSearch = () => {
  // TODO: 实现搜索功能
  console.log('搜索')
}

/**
 * 处理菜单点击
 */
const handleMenu = () => {
  // TODO: 实现菜单功能
  console.log('菜单')
}

/**
 * 处理相机点击
 */
const handleCamera = () => {
  // TODO: 实现相机功能
  console.log('相机')
}

/**
 * 处理网格视图点击
 */
const handleGrid = () => {
  // TODO: 实现网格视图功能
  console.log('网格视图')
}

/**
 * 处理用户点击
 */
const handleUser = () => {
  router.push('/member')
}
</script>
