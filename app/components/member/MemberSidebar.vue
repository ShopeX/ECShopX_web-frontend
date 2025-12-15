<script setup lang="ts">
const route = useRoute()

const menuItems = [
  {
    title: '会员信息',
    icon: 'i-heroicons-user',
    items: [
      { label: '个人资料', path: '/member' },
      { label: '更改密码', path: '/member/password' },
      { label: '收货地址', path: '/member/address' }
    ]
  },
  {
    title: '我的订单',
    icon: 'i-heroicons-clipboard-document-list',
    items: [
      { label: '所有订单', path: '/member/orders' },
      { label: '售后订单', path: '/member/after-sales' }
    ]
  },
  {
    title: '我的资产',
    icon: 'i-heroicons-wallet',
    items: [
       { label: '我的优惠券', path: '/member/coupons' },
       { label: '我的收藏', path: '/member/favorites' },
       { label: '我的足迹', path: '/member/footprint' },
       { label: '我的积分', path: '/member/points' }
    ]
  }
]

const isActive = (path: string) => {
  if (path === '/member' && route.path === '/member') return true
  if (path !== '/member' && route.path.startsWith(path)) return true
  return false
}
</script>

<template>
  <aside class="w-64 flex-shrink-0">
    <div class="bg-white rounded-lg p-6 space-y-8">
      <div v-for="(group, idx) in menuItems" :key="idx">
        <div class="flex items-center gap-2 mb-4 font-medium text-gray-900">
          <UIcon :name="group.icon" class="w-5 h-5 text-gray-500" />
          <span>{{ group.title }}</span>
        </div>
        <ul class="space-y-3 pl-7">
          <li v-for="(item, itemIdx) in group.items" :key="itemIdx">
            <NuxtLink
              :to="item.path"
              class="block text-sm transition-colors hover:text-primary-500"
              :class="isActive(item.path) ? 'text-primary-500 font-medium' : 'text-gray-600'"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
