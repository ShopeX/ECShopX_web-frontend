<template>
  <div class="bg-[#f3f4f6] flex flex-col items-start p-[32px] relative self-stretch shrink-0 w-[256px]">
    <div class="mb-4">
      <h2 class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[48px] relative shrink-0 text-[24px] text-[color:var(--color黑,#191a1d)] whitespace-nowrap">我的账户</h2>
    </div>

    <nav class="flex flex-col w-full">
      <div v-for="item in menuItems" :key="item.key" class="py-[16px]">
        <button
          type="button"
          class="flex w-full items-center justify-between p-[16px] text-left transition-colors"
          :class="item.key === activeMenu ? 'bg-white' : 'hover:bg-white/70'"
          :data-testid="`account-menu-item-${item.key}`"
          @click="handleMenuClick(item.key, item.path)"
        >
          <span class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[color:var(--color亚黑,#364153)] whitespace-nowrap">{{ item.label }}</span>
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-[#364153]" />
        </button>
      </div>

      <div class="py-[16px]">
        <button
          type="button"
          class="flex w-full items-center justify-between p-[16px] text-left transition-colors hover:bg-white/70"
          data-testid="account-menu-item-logout"
          @click="handleLogout"
        >
          <span class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[color:var(--color亚黑,#364153)] whitespace-nowrap">退出登录</span>
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-[#364153]" />
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

const menuItems = [
  { key: 'profile', label: '个人中心', path: '/account' },
  { key: 'points', label: '我的积分', path: '/account/points' },
  { key: 'orders', label: '我的订单', path: '/account/orders' },
  { key: 'coupons', label: '我的优惠券', path: '/account/coupons' },
  { key: 'favorites', label: '我的收藏', path: '/account/favorites' },
  { key: 'address', label: '收货地址', path: '/account/address' },
  { key: 'reviews', label: '我的评价', path: '/account/reviews' },
] as const

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
