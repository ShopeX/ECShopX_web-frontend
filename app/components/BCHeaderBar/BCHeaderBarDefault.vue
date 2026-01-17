<template>
  <header class="sp-header-bar w-full">
    <!-- 顶部信息栏 - 黑色背景 -->
    <div class="sp-top-bar text-sm bg-black text-white hidden lg:block">
      <div class="container mx-auto h-10 flex items-center justify-between px-4">
        <!-- 左侧导航 -->
        <div class="flex items-center space-x-6 text-sm">
          <NuxtLink to="/" class="hover:text-gray-300 transition-colors"> 网站首页 </NuxtLink>
          <div class="hidden xl:flex items-center space-x-2">
            <span class="text-gray-300">中国大陆版</span>
            <span class="text-gray-400">-</span>
            <span class="text-gray-300">上海</span>
          </div>
          <div v-if="!isLoggedIn" class="flex items-center space-x-2">
            <NuxtLink to="/account/login" class="hover:text-gray-300 transition-colors">
              请登录
            </NuxtLink>
          </div>
          <div v-else class="flex items-center space-x-2">
            <span>{{ userInfo?.username }}</span>
            <span v-if="userInfo?.isPlusVip" class="text-xs bg-yellow-600 px-1 rounded">PLUS</span>
          </div>
        </div>

        <!-- 右侧导航菜单 -->
        <nav class="flex items-center space-x-4 xl:space-x-6 text-sm">
          <NuxtLink
            to="/cart"
            class="hover:text-gray-300 transition-colors flex items-center space-x-1 relative"
          >
            <span>购物车</span>
            <span
              v-if="cartCount > 0"
              class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-600 rounded-full"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </NuxtLink>
          <NuxtLink to="/member/orders" class="hover:text-gray-300 transition-colors">
            我的订单
          </NuxtLink>
          <NuxtLink to="/member" class="hover:text-gray-300 transition-colors"> 个人中心 </NuxtLink>
          <NuxtLink
            to="/enterprise"
            class="hover:text-gray-300 transition-colors hidden xl:inline-block"
          >
            企业采购
          </NuxtLink>
          <NuxtLink
            to="/merchant"
            class="hover:text-gray-300 transition-colors hidden xl:inline-block"
          >
            商家服务
          </NuxtLink>
          <NuxtLink
            to="/sitemap"
            class="hover:text-gray-300 transition-colors hidden xl:inline-block"
          >
            网站导航
          </NuxtLink>
          <NuxtLink
            to="/mobile"
            class="hover:text-gray-300 transition-colors hidden xl:flex items-center space-x-1"
          >
            <img src="/icons/qrcode-gray.svg" alt="手机版" class="w-4 h-4" />
            <span>手机版</span>
          </NuxtLink>
          <NuxtLink
            to="/accessibility"
            class="hover:text-gray-300 transition-colors hidden xl:inline-block"
          >
            网站无障碍
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- 主导航栏 - 白色背景 -->
    <div class="sp-main-nav shadow-sm bg-white border-b border-gray-200">
      <div class="container mx-auto h-16 lg:h-20 flex items-center justify-between px-4">
        <!-- 移动端汉堡菜单按钮 -->
        <button
          class="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          @click="toggleMobileMenu"
          aria-label="菜单"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0">
          <img src="/images/logo/logo.png" alt="ECSHOPX Logo" class="h-8 lg:h-12" />
        </NuxtLink>

        <!-- 搜索框 - 桌面端 -->
        <div class="hidden lg:flex flex-1 max-w-2xl mx-6 xl:mx-12">
          <div class="w-full">
            <div class="relative">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索商品"
                class="w-full h-10 pl-4 pr-24 rounded-sm border border-red-500 focus:outline-none focus:border-red-600"
                @keyup.enter="handleSearch"
              />
              <button
                class="absolute right-0 top-0 h-10 w-20 bg-red-500 text-white rounded-r-sm hover:bg-red-600 transition-colors"
                @click="handleSearch"
              >
                搜索
              </button>
            </div>
            <!-- 热门搜索 -->
            <div v-if="hotKeywords.length > 0" class="mt-2 text-sm text-gray-500 hidden xl:block">
              <span>热门搜索：</span>
              <button
                v-for="keyword in hotKeywords"
                :key="keyword"
                class="hover:text-red-500 ml-2 transition-colors"
                @click="handleHotKeywordClick(keyword)"
              >
                {{ keyword }}
              </button>
            </div>
          </div>
        </div>

        <!-- 搜索按钮 - 移动端和平板 -->
        <button
          class="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          @click="toggleSearch"
          aria-label="搜索"
        >
          <img src="/icons/search.svg" alt="搜索" class="w-5 h-5" />
        </button>

        <!-- 右侧功能区 -->
        <div class="flex items-center space-x-4 lg:space-x-6">
          <NuxtLink
            to="/cart"
            class="flex items-center space-x-2 hover:text-red-500 transition-colors relative"
          >
            <img src="/icons/cart.svg" alt="购物车" class="w-6 h-6" />
            <div class="hidden lg:flex flex-col">
              <span class="text-sm">购物车</span>
              <span v-if="cartCount > 0" class="text-xs text-red-500">{{ cartCount }}件</span>
            </div>
            <!-- 移动端购物车数量角标 -->
            <span
              v-if="cartCount > 0"
              class="lg:hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </NuxtLink>

          <!-- 用户菜单 - 移动端 -->
          <NuxtLink
            to="/member"
            class="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            aria-label="个人中心"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- 移动端搜索框 -->
      <div v-if="showMobileSearch" class="lg:hidden border-t border-gray-200 px-4 py-3">
        <div class="relative">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索商品"
            class="w-full h-10 pl-4 pr-20 rounded-sm border border-red-500 focus:outline-none focus:border-red-600"
            @keyup.enter="handleSearch"
          />
          <button
            class="absolute right-0 top-0 h-10 w-16 bg-red-500 text-white rounded-r-sm hover:bg-red-600 transition-colors"
            @click="handleSearch"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端菜单抽屉 -->
    <Transition name="slide">
      <div
        v-if="showMobileMenu"
        class="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
        @click="closeMobileMenu"
      >
        <div
          class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl overflow-y-auto"
          @click.stop
        >
          <!-- 菜单头部 -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div v-if="!isLoggedIn">
              <NuxtLink
                to="/account/login"
                class="text-red-500 font-medium"
                @click="closeMobileMenu"
              >
                请登录
              </NuxtLink>
            </div>
            <div v-else class="flex items-center space-x-2">
              <span class="font-medium">{{ userInfo?.username }}</span>
              <span v-if="userInfo?.isPlusVip" class="text-xs bg-yellow-600 text-white px-1 rounded"
                >PLUS</span
              >
            </div>
            <button
              class="p-2 hover:bg-gray-100 rounded-md"
              @click="closeMobileMenu"
              aria-label="关闭"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 菜单列表 -->
          <nav class="py-2">
            <NuxtLink to="/" class="block px-4 py-3 hover:bg-gray-100" @click="closeMobileMenu">
              网站首页
            </NuxtLink>
            <NuxtLink
              to="/member/orders"
              class="block px-4 py-3 hover:bg-gray-100"
              @click="closeMobileMenu"
            >
              我的订单
            </NuxtLink>
            <NuxtLink
              to="/member"
              class="block px-4 py-3 hover:bg-gray-100"
              @click="closeMobileMenu"
            >
              个人中心
            </NuxtLink>
            <NuxtLink
              to="/enterprise"
              class="block px-4 py-3 hover:bg-gray-100"
              @click="closeMobileMenu"
            >
              企业采购
            </NuxtLink>
            <NuxtLink
              to="/merchant"
              class="block px-4 py-3 hover:bg-gray-100"
              @click="closeMobileMenu"
            >
              商家服务
            </NuxtLink>
            <NuxtLink
              to="/sitemap"
              class="block px-4 py-3 hover:bg-gray-100"
              @click="closeMobileMenu"
            >
              网站导航
            </NuxtLink>
            <NuxtLink
              to="/accessibility"
              class="block px-4 py-3 hover:bg-gray-100"
              @click="closeMobileMenu"
            >
              网站无障碍
            </NuxtLink>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useCartStore } from '~/stores/cart'

/**
 * SpHeaderBar 组件 Props
 */
interface Props {
  /** 是否显示热门搜索 */
  showHotKeywords?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHotKeywords: true,
})

const userStore = useUserStore()
const cartStore = useCartStore()

/**
 * 用户登录状态
 */
const isLoggedIn = computed(() => userStore.isLoggedIn)

/**
 * 用户信息
 */
const userInfo = computed(() => userStore.userInfo)

/**
 * 购物车商品数量
 */
const cartCount = computed(() => cartStore.totalItems)

/**
 * 搜索关键词
 */
const searchKeyword = ref('')

/**
 * 移动端菜单显示状态
 */
const showMobileMenu = ref(false)

/**
 * 移动端搜索框显示状态
 */
const showMobileSearch = ref(false)

/**
 * 热门搜索关键词
 */
const hotKeywords = computed(() => {
  if (!props.showHotKeywords) return []
  return ['iPhone 15', '华为Mate 60', '小米14', '耳机', '手表']
})

/**
 * 处理搜索
 */
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  navigateTo(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
  showMobileSearch.value = false
}

/**
 * 处理热门关键词点击
 */
const handleHotKeywordClick = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

/**
 * 处理登出
 */
const handleLogout = async () => {
  if (import.meta.client) {
    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    const result = await userStore.logout()
    if (result.success) {
      navigateTo('/auth/login')
    }
  }
}

/**
 * 切换移动端菜单
 */
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showMobileSearch.value = false
  }
}

/**
 * 关闭移动端菜单
 */
const closeMobileMenu = () => {
  showMobileMenu.value = false
}

/**
 * 切换移动端搜索框
 */
const toggleSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
  if (showMobileSearch.value) {
    showMobileMenu.value = false
  }
}

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  // 注意：大部分初始化逻辑已移至 app/plugins/auth-init.ts
  // 这里可以保留一些组件特有的加载逻辑，或者干脆留空
})
</script>

<style scoped>
/* SpHeaderBar 组件样式 */

/* 移动端抽屉菜单动画 */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease;
}

.slide-enter-active > div,
.slide-leave-active > div {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from > div,
.slide-leave-to > div {
  transform: translateX(-100%);
}

.slide-enter-to > div,
.slide-leave-from > div {
  transform: translateX(0);
}
</style>
