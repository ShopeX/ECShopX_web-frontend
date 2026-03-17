<template>
  <div class="relative w-full bg-white">
    <div
      class="relative flex w-full items-center justify-between bg-white p-4"
      data-name="FilterBar"
      data-node-id="2896:3722"
    >
      <button
        v-if="showBack"
        type="button"
        class="absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#191a1d]"
        aria-label="back"
        @click="$emit('back')"
      >
        <Icon name="ph:caret-left" class="h-5 w-5" />
      </button>

      <div
        class="relative flex shrink-0 items-center justify-start"
        data-name="Container"
        data-node-id="2896:3723"
      >
        <button
          type="button"
          class="flex items-center gap-2"
          data-name="Button"
          data-node-id="2896:3724"
          @click="handleToggle"
        >
          <span
            class="font-['Noto_Sans_SC',sans-serif] text-[16px] font-medium leading-5 text-[#191a1d]"
            data-node-id="2896:3726"
          >
            {{ title }}
          </span>
          <span
            class="flex h-4 w-4 items-center justify-center overflow-hidden"
            data-name="箭头"
            data-node-id="2896:3727"
          >
            <Icon
              name="ph:caret-down"
              class="h-4 w-4 text-[#191a1d] transition-transform"
              :class="isExpanded ? 'rotate-180' : ''"
            />
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="resolvedMenuItems.length > 0 && isExpanded"
      class="absolute left-0 right-0 top-full z-40 flex min-h-[calc(100vh-52px)] w-full flex-col items-start bg-white px-4"
      data-name="CartSheet"
      data-node-id="2905:6290"
    >
      <div class="w-full">
        <div class="flex w-full flex-col items-start">
          <button
            v-for="item in resolvedMenuItems"
            :key="item.key"
            type="button"
            class="flex w-full items-center justify-start border-b border-[#e5e7eb] py-4 text-left"
            :data-node-id="item.nodeId"
            @click="handleSelect(item)"
          >
            <span
              class="block w-full font-['Noto_Sans_SC',sans-serif] text-[16px] font-medium leading-5"
              :class="item.key === resolvedActiveKey ? 'text-[#191a1d]' : 'text-[#4a5565]'"
            >
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useModal } from '~/composables/useModal'

interface FilterMenuItem {
  key: string
  label: string
  path?: string
  nodeId?: string
  action?: 'logout'
}

const props = withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    modelValue?: boolean
    activeKey?: string
    menuItems?: FilterMenuItem[]
  }>(),
  {
    showBack: false,
    modelValue: false,
    activeKey: '',
    menuItems: () => [],
  }
)

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const { confirm } = useModal()
const innerExpanded = ref(props.modelValue)

const defaultMenuItems: FilterMenuItem[] = [
  { key: 'profile', label: '个人中心', path: '/account', nodeId: '2905:6314' },
  { key: 'orders', label: '我的订单', path: '/account/orders', nodeId: '2910:6315' },
  { key: 'coupons', label: '优惠券', path: '/account/coupons', nodeId: '2910:6318' },
  { key: 'favorites', label: '我的收藏', path: '/account/favorites', nodeId: '2910:6321' },
  { key: 'address', label: '收货地址', path: '/account/address', nodeId: '2910:6324' },
  { key: 'reviews', label: '我的评价', path: '/account/reviews', nodeId: '2910:6327' },
  { key: 'logout', label: '退出登录', action: 'logout', nodeId: '2910:6330' },
]

const emit = defineEmits<{
  back: []
  click: []
  select: [item: FilterMenuItem]
  'update:modelValue': [value: boolean]
}>()

watch(
  () => props.modelValue,
  (value) => {
    innerExpanded.value = value
  }
)

const resolvedMenuItems = computed(() => (props.menuItems.length > 0 ? props.menuItems : defaultMenuItems))

const activeRouteKey = computed(() => {
  const match = defaultMenuItems.find((item) => item.path && route.path === item.path)
  return match?.key ?? 'profile'
})

const resolvedActiveKey = computed(() => props.activeKey || activeRouteKey.value)

const isExpanded = computed(() => innerExpanded.value)

function handleToggle() {
  emit('click')
  innerExpanded.value = !innerExpanded.value
  emit('update:modelValue', innerExpanded.value)
}

async function handleSelect(item: FilterMenuItem) {
  emit('select', item)
  innerExpanded.value = false
  emit('update:modelValue', false)

  if (item.action === 'logout') {
    confirm({
      title: '退出登录',
      content: '您是否确定退出？',
      onConfirm: async () => {
        await logout()
        router.push('/account/login')
      },
    })
    return
  }

  if (item.path && route.path !== item.path) {
    await router.push(item.path)
  }
}
</script>
