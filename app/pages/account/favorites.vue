<template>
  <div class="bg-white min-h-screen">
    <!-- PC 端布局：与 account/index.vue 一致 -->
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
              <div class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative w-full">
                <h2 class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#101828] text-[16px] whitespace-nowrap">我的收藏</h2>
              </div>
            </div>

            <!-- 加载中 -->
            <div v-if="loading" class="py-16 text-center text-[#4a5565] font-['Noto_Sans_SC:Regular',sans-serif] text-[14px] w-full">加载中...</div>
            <!-- 收藏商品网格 - 每行 4 个 -->
            <div v-else-if="productList.length > 0" class="relative shrink-0 w-full content-stretch flex flex-col gap-[16px] items-start">
              <div
                v-for="(row, rowIndex) in productRows"
                :key="rowIndex"
                class="grid grid-cols-4 gap-6 w-full"
              >
                <FavoriteProductCard
                  v-for="product in row"
                  :key="product.id"
                  :product="product"
                  @remove="handleRemoveFavorite"
                />
              </div>
            </div>
            <!-- 空状态 -->
            <div v-else class="py-16 text-center text-[#4a5565] font-['Noto_Sans_SC:Regular',sans-serif] text-[14px] w-full">
              暂无收藏商品
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 端布局（本需求验收范围） -->
    <ClientOnly>
      <div
        class="flex flex-col min-h-screen md:hidden overflow-x-hidden"
        data-testid="account-favorites-page"
      >
        <!-- FilterBar：我的收藏 + 下拉箭头，左右 padding 16px -->
        <div
          class="bg-white flex items-center justify-between px-4 py-4 shrink-0 border-b border-[#e5e7eb]"
          data-testid="account-favorites-filter-bar"
        >
          <Icon name="ph:caret-left" class="w-6 h-6 text-[#191a1d] shrink-0" @click="router.back()" />
          <div class="flex items-center gap-2 flex-1 justify-center">
            <span class="text-base font-medium text-[#191a1d] leading-5">我的收藏</span>
            <Icon name="ph:caret-down" class="w-4 h-4 text-[#191a1d]" />
          </div>
          <div class="w-6 shrink-0" />
        </div>

        <!-- 收藏列表：两列网格，16px 水平 padding -->
        <div class="flex-1 px-4 py-4 overflow-y-auto">
          <div v-if="loading" class="py-16 text-center text-[#4a5565]">加载中...</div>
          <div
            v-else-if="productList.length > 0"
            class="grid grid-cols-2 gap-4"
            data-testid="account-favorites-list"
          >
            <NuxtLink
              v-for="product in productList"
              :key="product.id"
              :to="`/products/${product.id}`"
              class="block"
              data-testid="account-favorites-item"
            >
              <FavoriteProductCard :product="product" :show-remove-button="false" />
            </NuxtLink>
          </div>
          <div
            v-else
            class="py-16 text-center text-[#4a5565] text-sm"
            data-testid="account-favorites-empty"
          >
            暂无收藏商品
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
import { collectApiClient } from '~/infrastructure/http/clients/CollectApiClient'
import {
  CollectItemTransformer,
  type IFavoriteProduct,
} from '~/infrastructure/transformers/collectItemTransformer'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const activeMenu = ref('favorites')

const productList = ref<IFavoriteProduct[]>([])
const loading = ref(false)

// PC 端每行 4 个的二维数组
const productRows = computed(() => {
  const rows: IFavoriteProduct[][] = []
  for (let i = 0; i < productList.value.length; i += 4) {
    rows.push(productList.value.slice(i, i + 4))
  }
  return rows
})

async function fetchFavorites() {
  loading.value = true
  try {
    const res = await collectApiClient.getCollectItemList()
    productList.value = CollectItemTransformer.toFavoriteList(res?.data ?? res)
  } catch (err) {
    console.error('获取收藏列表失败:', err)
    productList.value = []
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  console.log('用户已退出登录')
}

function handleRemoveFavorite(_productId: string | number) {
  // 本需求 S1 不实现移出收藏，保留方法签名供 PC 端现有卡片使用
}

onMounted(() => {
  fetchFavorites()
})
</script>
