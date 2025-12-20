<template>
  <div class="bg-[#f3f4f6] min-h-screen">
    <div class="container mx-auto px-32 py-8">
      <div class="flex gap-8">
        <!-- 左侧菜单 -->
        <div class="w-64 shrink-0">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="flex-1">
          <div class="bg-white p-8 flex flex-col gap-4">
            <!-- 标题 -->
            <div class="flex items-center justify-between">
              <h2 class="text-base font-medium text-[#191a1d] leading-5">我的收藏</h2>
            </div>

            <!-- 收藏商品网格 - 每行 4 个 -->
            <div class="flex flex-col gap-4">
              <div
                v-for="(row, rowIndex) in productRows"
                :key="rowIndex"
                class="grid grid-cols-4 gap-6 pb-4"
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
            <div v-if="products.length === 0" class="py-16 text-center text-gray-500">
              暂无收藏商品
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()

// 当前激活的菜单项
const activeMenu = ref('favorites')

// 商品数据接口
interface Product {
  id: string | number
  name: string
  price: number
  image: string
}

// 收藏商品列表（模拟数据）
const products = ref<Product[]>([
  {
    id: 1,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 2,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 3,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 4,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 5,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 6,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 7,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
  {
    id: 8,
    name: '明基大包套耳机',
    price: 1999.0,
    image: '/images/products/audio/headphone-1.png',
  },
])

// 将商品列表转换为每行 4 个的二维数组
const productRows = computed(() => {
  const rows: Product[][] = []
  for (let i = 0; i < products.value.length; i += 4) {
    rows.push(products.value.slice(i, i + 4))
  }
  return rows
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}

/**
 * 处理移出收藏
 */
function handleRemoveFavorite(productId: string | number) {
  const index = products.value.findIndex((p) => p.id === productId)
  if (index !== -1) {
    products.value.splice(index, 1)
    // 这里可以调用 API 来更新后端数据
    console.log('移出收藏:', productId)
  }
}
</script>
