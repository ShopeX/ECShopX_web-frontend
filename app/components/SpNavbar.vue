<!-- 顶部导航栏组件 -->
<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="container mx-auto px-4">
      <!-- 顶部信息栏 -->
      <div class="h-9 flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-6">
          <span>欢迎来到ECshopX商城！</span>
          <NuxtLink v-if="!isLoggedIn" to="/account/login" class="hover:text-primary-500">
            请登录
          </NuxtLink>
          <template v-else>
            <span>{{ userInfo.username }}</span>
            <button class="hover:text-primary-500" @click="handleLogout">退出</button>
          </template>
        </div>
        <div class="flex items-center space-x-6">
          <NuxtLink
            v-for="item in topMenus"
            :key="item.key"
            :to="item.path"
            class="hover:text-primary-500"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>

      <!-- 主导航栏 -->
      <div class="h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <img src="/images/logo/logo.png" alt="ECshopX Logo" class="h-10" />
        </NuxtLink>

        <!-- 搜索框 -->
        <div class="flex-1 max-w-xl mx-12">
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索商品"
              class="w-full h-10 pl-4 pr-12 rounded-sm border border-primary-500 focus:outline-none"
              @keyup.enter="handleSearch"
            />
            <button
              class="absolute right-0 top-0 h-10 w-16 bg-primary-500 text-white rounded-r-sm hover:bg-primary-600"
              @click="handleSearch"
            >
              搜索
            </button>
          </div>
          <!-- 热门搜索 -->
          <div class="mt-2 text-sm text-gray-500">
            <span>热门搜索：</span>
            <a
              v-for="(keyword, index) in hotKeywords"
              :key="keyword"
              href="#"
              class="hover:text-primary-500 ml-2"
              @click.prevent="
                searchKeyword = keyword
                handleSearch()
              "
            >
              {{ keyword }}
            </a>
          </div>
        </div>

        <!-- 用户操作区 -->
        <div class="flex items-center space-x-8">
          <NuxtLink
            v-for="item in userActions"
            :key="item.key"
            :to="item.path"
            class="flex flex-col items-center hover:text-primary-500"
          >
            <span class="text-2xl">
              <Icon :name="item.icon" />
            </span>
            <span class="text-sm mt-1">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 分类导航 -->
      <div class="h-10 flex items-center space-x-8">
        <div class="relative group">
          <button class="flex items-center space-x-2 h-10 px-6 bg-primary-500 text-white">
            <span>全部商品分类</span>
            <UIcon name="i-heroicons-chevron-down" />
          </button>
          <!-- 分类下拉菜单 -->
          <div
            class="absolute left-0 top-full w-60 bg-white shadow-lg hidden group-hover:block z-50"
          >
            <div v-for="category in categories" :key="category.id" class="relative group/item">
              <NuxtLink
                :to="`/category/${category.id}`"
                class="flex items-center justify-between px-4 h-10 hover:bg-gray-50"
              >
                <span>{{ category.name }}</span>
                <Icon
                  v-if="category.children?.length"
                  name="i-heroicons-chevron-right"
                  class="text-gray-400"
                />
              </NuxtLink>
              <!-- 二级分类 -->
              <div
                v-if="category.children?.length"
                class="absolute left-full top-0 w-60 bg-white shadow-lg hidden group-hover/item:block"
              >
                <NuxtLink
                  v-for="subCategory in category.children"
                  :key="subCategory.id"
                  :to="`/category/${subCategory.id}`"
                  class="block px-4 h-10 leading-10 hover:bg-gray-50"
                >
                  {{ subCategory.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-8">
          <div v-for="nav in mainNavs" :key="nav.key" class="relative group">
            <NuxtLink
              :to="nav.path"
              class="relative py-2 text-gray-700 hover:text-primary-500 transition-colors duration-300"
            >
              <span class="flex items-center gap-1">
                {{ nav.label }}
                <Icon
                  v-if="nav.children?.length"
                  name="i-heroicons-chevron-down"
                  class="w-3 h-3 transition-transform duration-300 group-hover:rotate-180"
                />
              </span>
              <!-- Hover Line Animation -->
              <span
                class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"
              ></span>
            </NuxtLink>

            <!-- Dropdown Menu -->
            <div
              v-if="nav.children?.length"
              class="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-40 hidden group-hover:block z-50"
            >
              <div
                class="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-2 animate-slide-up"
              >
                <NuxtLink
                  v-for="child in nav.children"
                  :key="child.key"
                  :to="child.path"
                  class="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 用户登录状态
const isLoggedIn = ref(false)
const userInfo = ref({
  username: '张三',
})

// 搜索相关
const searchKeyword = ref('')
const hotKeywords = ['iPhone 15', '华为Mate 60', '小米14', '耳机', '手表']

// 顶部菜单
const topMenus = [
  { key: 'member', label: '会员中心', path: '/member' },
  { key: 'order', label: '我的订单', path: '/member/orders' },
  { key: 'favorite', label: '我的收藏', path: '/member/favorites' },
  { key: 'help', label: '帮助中心', path: '/help' },
]

// 用户操作区
const userActions = [
  { key: 'message', label: '消息', path: '/member/messages', icon: 'i-heroicons-bell' },
  { key: 'cart', label: '购物车', path: '/cart', icon: 'i-heroicons-shopping-cart' },
  { key: 'user', label: '我的', path: '/member', icon: 'i-heroicons-user' },
]

// 主导航
const mainNavs = [
  { key: 'skin-care', label: '肌肤护理', path: '/category/skin-care' },
  { key: 'beauty-fragrance', label: '美妆香氛', path: '/category/beauty-fragrance' },
  {
    key: 'fashion-beauty',
    label: '时尚美妆',
    path: '/category/fashion-beauty',
    children: [
      { key: 'skincare', label: '面部护理', path: '/category/fashion-beauty/skincare' },
      { key: 'makeup', label: '彩妆香氛', path: '/category/fashion-beauty/makeup' },
      { key: 'perfume', label: '大牌香水', path: '/category/fashion-beauty/perfume' },
    ],
  },
  { key: 'face-care', label: '面部护理', path: '/category/face-care' },
  { key: 'sun-protection', label: '防晒隔离', path: '/category/sun-protection' },
  { key: 'perfume', label: '香水', path: '/category/perfume' },
  { key: 'eye-care', label: '眼部护理', path: '/category/eye-care' },
  { key: 'lip-makeup', label: '唇妆', path: '/category/lip-makeup' },
  { key: 'points-mall', label: '积分商城', path: '/points-mall' },
]

// 分类数据
const categories = [
  {
    id: '1',
    name: '手机数码',
    children: [
      { id: '1-1', name: '手机' },
      { id: '1-2', name: '平板' },
      { id: '1-3', name: '笔记本' },
    ],
  },
  {
    id: '2',
    name: '服装配饰',
    children: [
      { id: '2-1', name: '男装' },
      { id: '2-2', name: '女装' },
      { id: '2-3', name: '童装' },
    ],
  },
  {
    id: '3',
    name: '家用电器',
    children: [
      { id: '3-1', name: '电视' },
      { id: '3-2', name: '空调' },
      { id: '3-3', name: '洗衣机' },
    ],
  },
]

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value) return
  navigateTo(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
}

// 处理退出登录
const handleLogout = () => {
  // TODO: 实现退出登录逻辑
  isLoggedIn.value = false
}
</script>
