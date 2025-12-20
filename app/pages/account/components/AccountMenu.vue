<template>
  <div class="bg-white flex flex-col p-8 w-full">
    <!-- 标题 -->
    <div class="mb-4">
      <h2 class="text-2xl font-medium text-[#191a1d] leading-[48px]">我的账户</h2>
    </div>

    <!-- 菜单列表 -->
    <nav class="flex flex-col">
      <!-- 个人中心 -->
      <div class="py-4">
        <button
          :class="[
            'w-full flex items-center justify-between p-4 transition-colors',
            activeMenu === 'profile' ? 'bg-[#f3f4f6]' : 'hover:bg-gray-50',
          ]"
          @click="handleMenuClick('profile', '/account')"
        >
          <span class="text-base font-medium text-[#364153]">个人中心</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>

      <!-- 我的订单 -->
      <div class="py-4">
        <button
          :class="[
            'w-full flex items-center justify-between p-4 transition-colors',
            activeMenu === 'orders' ? 'bg-[#f3f4f6]' : 'hover:bg-gray-50',
          ]"
          @click="handleMenuClick('orders', '/account/orders')"
        >
          <span class="text-base font-medium text-[#364153]">我的订单</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>

      <!-- 优惠券 -->
      <div class="py-4">
        <button
          :class="[
            'w-full flex items-center justify-between p-4 transition-colors',
            activeMenu === 'coupons' ? 'bg-[#f3f4f6]' : 'hover:bg-gray-50',
          ]"
          @click="handleMenuClick('coupons', '/account/coupons')"
        >
          <span class="text-base font-medium text-[#364153]">优惠券</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>

      <!-- 我的收藏 -->
      <div class="py-4">
        <button
          :class="[
            'w-full flex items-center justify-between p-4 transition-colors',
            activeMenu === 'favorites' ? 'bg-[#f3f4f6]' : 'hover:bg-gray-50',
          ]"
          @click="handleMenuClick('favorites', '/account/favorites')"
        >
          <span class="text-base font-medium text-[#364153]">我的收藏</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>

      <!-- 收货地址 -->
      <div class="py-4">
        <button
          :class="[
            'w-full flex items-center justify-between p-4 transition-colors',
            activeMenu === 'address' ? 'bg-[#f3f4f6]' : 'hover:bg-gray-50',
          ]"
          @click="handleMenuClick('address', '/account/address')"
        >
          <span class="text-base font-medium text-[#364153]">收货地址</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>

      <!-- 我的评价 -->
      <div class="py-4">
        <button
          :class="[
            'w-full flex items-center justify-between p-4 transition-colors',
            activeMenu === 'reviews' ? 'bg-[#f3f4f6]' : 'hover:bg-gray-50',
          ]"
          @click="handleMenuClick('reviews', '/account/reviews')"
        >
          <span class="text-base font-medium text-[#364153]">我的评价</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>

      <!-- 退出登录 -->
      <div class="py-4">
        <button
          class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          @click="handleLogout"
        >
          <span class="text-base font-medium text-[#364153]">退出登录</span>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 transform" />
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useModal } from '~/composables/useModal'

// Props
interface Props {
  /** 当前激活的菜单项 */
  modelValue?: string
}

defineOptions({
  name: 'AccountMenu',
})

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'profile',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  logout: []
}>()

const router = useRouter()
const route = useRoute()
const { logout } = useAuth()
const { confirm } = useModal()

// 当前激活的菜单
const activeMenu = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

/**
 * 处理菜单点击
 */
function handleMenuClick(menuKey: string, path: string) {
  activeMenu.value = menuKey

  // 如果不在当前路由，则跳转
  if (route.path !== path) {
    router.push(path)
  }
}

/**
 * 处理退出登录
 */
function handleLogout() {
  confirm({
    title: '退出登录',
    content: '您是否确定退出？',
    onConfirm: async () => {
      try {
        await logout()
        emit('logout')
        // 跳转到登录页
        router.push('/account/login')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
  })
}
</script>

<style scoped>
/* Noto Sans SC 字体已在全局引入，这里不需要额外设置 */
</style>
