<template>
  <div
    class="relative flex size-full flex-col items-start justify-between bg-white px-4 py-8 lg:px-8 lg:py-0"
  >
    <!-- 顶部区域 -->
    <div class="relative w-full shrink-0 lg:pt-8">
      <div
        class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full"
      >
        <!-- 标题栏 -->
        <div
          class="content-stretch flex items-center justify-between px-0 py-[16px] relative shrink-0 w-full"
        >
          <div class="relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[20px] text-[#191a1d] text-nowrap"
              >
                {{ t('b60e45d1.346eab', { count: cartUI.itemCount }) }}
              </p>
            </div>
          </div>
          <!-- 关闭按钮 -->
          <button
            class="relative shrink-0 size-[24px] hover:opacity-70 transition-opacity"
            @click="handleClose"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-[#191a1d]" />
          </button>
        </div>

        <!-- 商品列表容器 -->
        <div
          class="content-stretch flex flex-col gap-[32px] items-start overflow-auto pb-0 pt-[16px] px-0 relative shrink-0 w-full max-h-[calc(100vh-400px)]"
        >
          <!-- 加载状态 -->
          <div v-if="!initialized || loading" class="flex justify-center py-10 w-full">
            <ECLoading />
          </div>

          <!-- 空购物车状态 -->
          <div
            v-else-if="initialized && cartUI.isEmpty"
            class="flex flex-col items-center justify-center py-10 w-full"
          >
            <svg
              class="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p class="text-base text-gray-600 mb-2">{{ t('b60e45d1.fa0a45') }}</p>
            <p class="text-sm text-gray-400">{{ t('b60e45d1.723c28') }}</p>
          </div>

          <!-- 商品列表 -->
          <BCMiniCartItem
            v-for="item in cartUI.items"
            v-else
            :key="item.id"
            :item="item"
            :loading="loading"
            @toggle-selection="handleToggleSelection"
            @quantity-change="handleQuantityChange"
          />
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <div v-if="!cartUI.isEmpty" class="relative w-full shrink-0 lg:pb-8">
      <div
        class="relative flex w-full flex-col items-start gap-4 px-0 pb-0 pt-6 lg:gap-4 lg:pt-4"
      >
        <!-- 全选 -->
        <div
          class="border-[0px_0px_1px] border-[#e5e7eb] border-solid content-stretch flex gap-[8px] items-center pb-[17px] pt-0 px-0 relative shrink-0 w-full"
        >
          <div
            class="shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[16px] flex items-center justify-center cursor-pointer"
            :class="[
              cartUI.isAllSelected && cartUI.itemCount > 0
                ? 'bg-black border border-black'
                : 'bg-white border border-[#191a1d]',
            ]"
            @click="handleToggleAll"
          >
            <svg
              v-if="cartUI.isAllSelected && cartUI.itemCount > 0"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative"
            >
              <p
                class="font-['Noto_Sans_SC'] font-normal leading-[20px] relative shrink-0 text-[14px] text-[#191a1d] text-nowrap"
              >
                {{ t('b60e45d1.66eeac') }}
              </p>
            </div>
          </div>
        </div>

        <!-- 优惠和总计 -->
        <div
          class="content-stretch flex h-[20px] items-center justify-between pl-0 pr-[0.008px] py-0 relative shrink-0 w-full"
        >
          <!-- 优惠 -->
          <div class="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex font-['Noto_Sans_SC'] font-normal items-center leading-[20px] relative text-[14px] text-[#d0112f] text-nowrap w-full"
            >
              <p class="relative shrink-0">{{ t('b60e45d1.dd2fd1') }}</p>
              <p class="relative shrink-0">{{ cartUI.discountFeeDisplay }}</p>
            </div>
          </div>
          <!-- 商品总计 -->
          <div class="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-end leading-[20px] relative text-[#191a1d] text-nowrap w-full"
            >
              <p class="font-['Noto_Sans_SC'] font-normal relative shrink-0 text-[14px]">
                {{ t('b60e45d1.e2c2bc') }}
              </p>
              <p class="font-['Inter'] font-medium not-italic relative shrink-0 text-[16px]">
                {{ cartUI.finalTotalDisplay }}
              </p>
            </div>
          </div>
        </div>

        <!-- 按钮组 -->
        <div
          class="content-stretch flex flex-col gap-[16px] h-[118px] items-start relative shrink-0 w-full"
        >
          <!-- 前往结算按钮 -->
          <button
            class="bg-[#0f0f10] relative shrink-0 w-full hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!cartUI.canCheckout || loading"
            @click="handleCheckout"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-white"
              >
                {{ t('b60e45d1.f7f353') }}
              </p>
            </div>
          </button>

          <!-- 查看购物袋按钮 -->
          <button
            class="basis-0 bg-white border border-[#0f0f10] border-solid grow min-h-px min-w-px relative shrink-0 w-full hover:bg-gray-50 transition-colors"
            @click="handleViewCart"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative size-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-[#191a1d] text-center text-nowrap"
              >
                {{ t('b60e45d1.f67520') }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Mini 购物车组件
 *
 * 从右往左弹出的购物车抽屉，用于快速查看和管理购物车
 * 参照 Figma 设计实现，复用购物车页面的逻辑
 */

import { ECLoading } from '~/components/ECLoading'
import BCMiniCartItem from '~/components/BCMiniCartItem/BCMiniCartItem.vue'

defineOptions({
  name: 'MiniCart',
})

// Props
interface Props {
  /** 是否显示 */
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const { cartUI, loading, loadCart, toggleItemSelection, toggleAllSelection, updateQuantity } =
  useCart()

// 追踪是否完成首次加载
const initialized = ref(false)

/**
 * 监听 modelValue 变化，打开时加载购物车数据
 */
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue && !initialized.value) {
      await loadCart()
      initialized.value = true
    }
  },
  { immediate: true }
)

/**
 * 处理关闭
 */
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 切换商品选中状态
 */
async function handleToggleSelection(itemId: string) {
  await toggleItemSelection(itemId)
}

/**
 * 全选/取消全选
 */
async function handleToggleAll() {
  await toggleAllSelection(!cartUI.value.isAllSelected)
}

/**
 * 更新商品数量
 */
async function handleQuantityChange(itemId: string, quantity: number) {
  await updateQuantity(itemId, quantity)
}

/**
 * 前往结算
 */
function handleCheckout() {
  if (!cartUI.value.canCheckout) return
  handleClose()
  const checkoutPath = localePath('/checkout')
  if (route.path === checkoutPath) {
    router.replace({ path: checkoutPath, query: { t: Date.now().toString() } })
  } else {
    router.push(checkoutPath)
  }
}

/**
 * 查看购物袋
 */
function handleViewCart() {
  handleClose()
  router.push(localePath('/cart'))
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
