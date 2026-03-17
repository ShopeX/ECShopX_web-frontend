<template>
  <!-- 布局与 account/index.vue 保持一致 -->
  <div class="bg-white min-h-screen">
    <ClientOnly>
      <!-- PC 端布局：与 index.vue 一致 -->
      <div class="hidden md:block content-stretch flex items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full">
        <div class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative">
          <!-- 左侧菜单 -->
          <div class="w-64 shrink-0">
            <AccountMenu v-model="activeMenu" @logout="handleLogout" />
          </div>

          <!-- 右侧内容区域 -->
          <div class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
            <div class="bg-white content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
              <div class="relative shrink-0 w-full">
                <!-- 标题：与 index 一致 16px #101828 -->
                <div class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative w-full">
                  <h2 class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[#101828] whitespace-nowrap">优惠券</h2>
                </div>
              </div>

              <!-- Tab 切换 -->
              <div class="relative shrink-0 w-full border-b border-[#e5e7eb] flex gap-4 items-center">
                <button
                  type="button"
                  class="min-h-[44px] flex items-center gap-0.5 relative cursor-pointer pb-0 pt-0"
                  @click="activeTab = 'available'"
                >
                  <span
                    class="text-sm leading-5"
                    :class="activeTab === 'available' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'"
                    >可用优惠券</span
                  ><span
                    class="text-xs leading-4"
                    :class="activeTab === 'available' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                  >({{ availableList.length }})</span
                  >
                  <div
                    v-if="activeTab === 'available'"
                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191a1d]"
                  />
                </button>
                <button
                  type="button"
                  class="min-h-[44px] flex items-center gap-0.5 relative cursor-pointer pb-0 pt-0"
                  @click="activeTab = 'unavailable'"
                >
                  <span
                    class="text-sm leading-5"
                    :class="activeTab === 'unavailable' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'"
                    >不可用优惠券</span
                  ><span
                    class="text-xs leading-4"
                    :class="activeTab === 'unavailable' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                  >({{ unavailableList.length }})</span
                  >
                  <div
                    v-if="activeTab === 'unavailable'"
                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191a1d]"
                  />
                </button>
              </div>

              <!-- 优惠券列表 -->
              <div class="relative shrink-0 w-full content-stretch flex flex-col gap-[16px] items-start">
                <div v-if="loading" class="py-16 text-center text-[#4a5565] w-full">加载中...</div>
                <div
                  v-else-if="currentList.length > 0"
                  class="grid grid-cols-2 gap-4 w-full"
                >
                  <LazyCouponCard
                    v-for="coupon in currentList"
                    :key="coupon.id"
                    :amount="coupon.amount"
                    :title="coupon.title"
                    :description="coupon.description"
                    :threshold-text="coupon.thresholdText"
                    :expire-text="coupon.expireText"
                  />
                </div>
                <div v-else class="py-16 text-center text-[#4a5565] text-sm w-full font-['Noto_Sans_SC:Regular',sans-serif]">暂无优惠券</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- H5 端布局 (显示于移动端，隐藏于 PC 端) -->
      <div class="flex flex-col min-h-screen md:hidden" data-testid="coupons-page">
        <!-- FilterBar：优惠券 + 下拉箭头，与 Figma 2956:17728 一致，左右 padding 16px -->
        <div
          class="bg-white flex items-center justify-between px-4 py-4 shrink-0 border-b border-[#e5e7eb]"
        >
          <Icon name="ph:caret-left" class="w-6 h-6 text-[#191a1d] shrink-0" @click="router.back()" />
          <div class="flex items-center gap-2 flex-1 justify-center">
            <span class="text-base font-medium text-[#191a1d] leading-5">优惠券</span>
            <Icon name="ph:caret-down" class="w-4 h-4 text-[#191a1d]" />
          </div>
          <div class="w-6 shrink-0" />
        </div>

        <!-- Tab 切换：与 Figma 3375:4415 一致，h-11、2px 下划线、#e5e7eb 底边 -->
        <div
          class="bg-white flex items-center shrink-0 border-b border-[#e5e7eb] px-4"
        >
          <button
            type="button"
            class="flex-1 min-h-[44px] flex items-center justify-center gap-0.5 relative cursor-pointer"
            data-testid="coupons-tab-available"
            :aria-selected="activeTab === 'available' ? 'true' : 'false'"
            @click="activeTab = 'available'"
          >
            <span
              class="text-sm leading-5"
              :class="activeTab === 'available' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'"
              >可用优惠券</span
            ><span
              class="text-xs leading-4"
              :class="activeTab === 'available' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
            >({{ availableList.length }})</span
            >
            <div
              v-if="activeTab === 'available'"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-0.5 bg-[#191a1d]"
            />
          </button>
          <button
            type="button"
            class="flex-1 min-h-[44px] flex items-center justify-center gap-0.5 relative cursor-pointer"
            data-testid="coupons-tab-unavailable"
            :aria-selected="activeTab === 'unavailable' ? 'true' : 'false'"
            @click="activeTab = 'unavailable'"
          >
            <span
              class="text-sm leading-5"
              :class="activeTab === 'unavailable' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'"
              >不可用优惠券</span
            ><span
              class="text-xs leading-4"
              :class="activeTab === 'unavailable' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
            >({{ unavailableList.length }})</span
            >
            <div
              v-if="activeTab === 'unavailable'"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-0.5 bg-[#191a1d]"
            />
          </button>
        </div>

        <!-- H5 列表区域 -->
        <div class="flex-1 p-4 overflow-y-auto">
          <div v-if="loading" class="py-16 text-center text-gray-500">加载中...</div>
          <div
            v-else-if="currentList.length > 0"
            class="flex flex-col gap-4"
            data-testid="coupons-list"
          >
            <LazyCouponCard
              v-for="coupon in currentList"
              :key="coupon.id"
              :amount="coupon.amount"
              :title="coupon.title"
              :description="coupon.description"
              :threshold-text="coupon.thresholdText"
              :expire-text="coupon.expireText"
            />
          </div>

          <div v-else class="py-16 text-center text-gray-500" data-testid="coupons-empty">
            暂无优惠券
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'
import { useUserCoupons } from '~/composables/useUserCoupons'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const activeMenu = ref('coupons')

// 优惠券数据
const { coupons, availableList, unavailableList, loading, fetchCoupons } = useUserCoupons()

// Tab 状态: 'available' | 'unavailable'
const activeTab = ref<'available' | 'unavailable'>('available')

// 当前选中的优惠券列表（PC 与 H5 共用，按 Tab 切换）
const currentList = computed(() => {
  return activeTab.value === 'available' ? availableList.value : unavailableList.value
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(() => {
  fetchCoupons()
})
</script>
