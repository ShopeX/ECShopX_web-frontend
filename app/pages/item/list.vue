<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 - 移动端优化 -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">商品列表</h1>
        <p class="mt-1 text-sm text-gray-600">发现您喜欢的商品</p>
      </div>
    </div>

    <!-- 筛选器 -->
    <ItemFilter v-model="filterParams" :brands="brands" @change="handleFilterChange" />

    <!-- 主内容区域 - 响应式容器 -->
    <div class="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <!-- 加载状态 -->
      <div v-if="pending && !products.length" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-gray-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p class="text-gray-600 mb-4">{{ error.message || '网络错误，请稍后重试' }}</p>
        <UButton @click="refresh()">重新加载</UButton>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!products.length && !pending" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无商品</h3>
        <p class="text-gray-600">请尝试调整筛选条件</p>
      </div>

      <!-- 商品网格 -->
      <div v-else>
        <!-- 结果统计 - 移动端优化 -->
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <p class="text-xs sm:text-sm text-gray-600">
            共找到 <span class="font-medium">{{ pagination.total }}</span> 件商品
          </p>
          <!-- 移动端视图切换按钮（未来扩展） -->
          <div class="hidden sm:block text-xs text-gray-500">
            {{ products.length }} / {{ pagination.total }}
          </div>
        </div>

        <!-- 商品网格布局 - 响应式优化 -->
        <div
          class="grid gap-3 sm:gap-4 mb-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
        >
          <!-- <SpProductCard
            v-for="product in products"
            :key="product.itemId"
            :product="product"
            loading="lazy"
            class="w-full"
          /> -->
        </div>

        <!-- 加载更多按钮 - 移动端优化 -->
        <div v-if="hasMore" class="text-center px-4">
          <UButton
            :loading="loadingMore"
            @click="loadMore"
            variant="outline"
            size="lg"
            class="w-full sm:w-auto min-w-[200px]"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </UButton>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-else-if="products.length > 0" class="text-center py-4 sm:py-6">
          <p class="text-gray-500 text-xs sm:text-sm">已显示全部商品</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProduct } from '~/components/SpProductCard/types'
import type { IBrand, IItemListParams } from '~/types/api/item'
import { api } from '~/api'
// 不再需要手动转换器，class-transformer自动处理
import { useDebounceFn } from '@vueuse/core'

// SEO 元数据配置
useSeoMeta({
  title: '商品列表 - ECSHOPX',
  description: '浏览我们精选的商品，发现您喜欢的产品。支持品牌筛选、价格区间筛选和多种排序方式。',
  keywords: '商品列表,电商,购物,品牌筛选,价格筛选,ECSHOPX',
  author: 'ECSHOPX',
  robots: 'index,follow',
  ogTitle: '商品列表 - ECSHOPX',
  ogDescription: '浏览我们精选的商品，发现您喜欢的产品。支持品牌筛选、价格区间筛选和多种排序方式。',
  ogType: 'website',
  ogUrl: 'https://ecshopx.com/item/list',
  ogImage: '/images/og-product-list.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: '商品列表 - ECSHOPX',
  twitterDescription: '浏览我们精选的商品，发现您喜欢的产品',
  twitterImage: '/images/twitter-product-list.jpg',
})

// 筛选参数状态
const filterParams = ref({
  brandId: '',
  sort: 'default',
  startPrice: undefined as number | undefined,
  endPrice: undefined as number | undefined,
})

// 动态更新页面标题（基于筛选条件）
const dynamicTitle = computed(() => {
  let title = '商品列表'

  if (filterParams.value.brandId) {
    const brand = brands.value.find((b) => b.attribute_id === filterParams.value.brandId)
    if (brand) {
      title = `${brand.attribute_name} 商品`
    }
  }

  if (filterParams.value.startPrice || filterParams.value.endPrice) {
    const priceRange = []
    if (filterParams.value.startPrice) priceRange.push(`${filterParams.value.startPrice}元起`)
    if (filterParams.value.endPrice) priceRange.push(`${filterParams.value.endPrice}元内`)
    if (priceRange.length > 0) {
      title += ` - ${priceRange.join('')}`
    }
  }

  return `${title} - ECSHOPX`
})

// 监听筛选条件变化，更新SEO标题
watch(
  () => [filterParams.value.brandId, filterParams.value.startPrice, filterParams.value.endPrice],
  () => {
    useSeoMeta({
      title: dynamicTitle.value,
    })
  },
  { deep: true }
)

// 路由和查询参数
const route = useRoute()
const router = useRouter()

// 分页状态
const currentPage = ref(1)
const pageSize = 20

// 数据状态
const products = ref<IProduct[]>([])
const brands = ref<IBrand[]>([])
const pagination = ref({
  total: 0,
  current: 1,
  hasMore: false,
})

// 加载状态
const pending = ref(false)
const loadingMore = ref(false)
const error = ref<Error | null>(null)

// 避免重复请求的标志
const isInternalUrlUpdate = ref(false)

// 计算属性
const hasMore = computed(() => pagination.value.hasMore)

// 防抖处理筛选变化
const debouncedFilterChange = useDebounceFn(() => {
  debugger
  currentPage.value = 1
  // 标记为内部URL更新，避免路由监听器重复触发请求
  isInternalUrlUpdate.value = true
  updateUrlParams()
  loadProducts()
}, 300)

// 注释：现在直接使用 api.item 调用API

// 构建 API 参数
const buildApiParams = (): IItemListParams => {
  return {
    page: currentPage.value.toString(),
    pageSize: pageSize.toString(),
    item_type: 'normal',
    main_category: '',
    is_tdk: '1',
    type: '0',
    company_id: '1', // 从环境变量获取
    ...(filterParams.value.brandId && { brand_id: filterParams.value.brandId }),
    ...(filterParams.value.sort !== 'default' && { sort: filterParams.value.sort }),
    ...(filterParams.value.startPrice && { start_price: filterParams.value.startPrice }),
    ...(filterParams.value.endPrice && { end_price: filterParams.value.endPrice }),
  }
}

// 加载商品数据
const loadProducts = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true
    } else {
      pending.value = true
      error.value = null
    }

    const params = buildApiParams()
    const response = await api.item.getProductList(params)
    debugger
    if (response.data.value?.data) {
      const apiData = response.data.value.data
      // 直接使用class-transformer处理后的数据，已经是IProductListItem格式
      const newProducts = apiData.list
      debugger
      if (append) {
        products.value.push(...newProducts)
      } else {
        products.value = newProducts
      }

      pagination.value = {
        total: apiData.total_count,
        current: currentPage.value,
        hasMore: currentPage.value * pageSize < apiData.total_count,
      }
    }
  } catch (err) {
    error.value = err as Error
    console.error('加载商品失败:', err)
  } finally {
    pending.value = false
    loadingMore.value = false
    // 重置内部URL更新标志
    isInternalUrlUpdate.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (hasMore.value && !loadingMore.value) {
    currentPage.value++
    await loadProducts(true)
  }
}

// 刷新数据
const refresh = () => {
  currentPage.value = 1
  loadProducts()
}

// 处理筛选变化
const handleFilterChange = () => {
  // 使用防抖处理筛选变化，避免频繁请求
  debouncedFilterChange()
}

// 生成缓存键
const getCacheKey = () => {
  const params = buildApiParams()
  return `item-list-${JSON.stringify(params)}`
}

// 更新 URL 参数
const updateUrlParams = () => {
  const query: Record<string, string> = {}

  if (filterParams.value.brandId) {
    query.brand = filterParams.value.brandId.toString()
  }

  if (filterParams.value.sort !== 'default') {
    query.sort = filterParams.value.sort
  }

  if (filterParams.value.startPrice) {
    query.min_price = filterParams.value.startPrice.toString()
  }

  if (filterParams.value.endPrice) {
    query.max_price = filterParams.value.endPrice.toString()
  }

  router.replace({ query })
}

// 从 URL 恢复筛选状态
const restoreFromUrl = () => {
  const query = route.query

  if (query.brand) {
    filterParams.value.brandId = query.brand as string
  }

  if (query.sort) {
    filterParams.value.sort = query.sort as string
  }

  if (query.min_price) {
    filterParams.value.startPrice = Number(query.min_price)
  }

  if (query.max_price) {
    filterParams.value.endPrice = Number(query.max_price)
  }
}

// 从 URL 恢复筛选状态的函数（独立版本，用于SSR）
const getFilterParamsFromUrl = () => {
  const query = route.query
  return {
    brandId: query.brand ? (query.brand as string) : '',
    sort: query.sort ? (query.sort as string) : 'default',
    startPrice: query.min_price ? Number(query.min_price) : undefined,
    endPrice: query.max_price ? Number(query.max_price) : undefined,
  }
}

// SSR 数据预取
const {
  data: initialData,
  pending: initialPending,
  error: initialError,
} = await useLazyAsyncData(
  'item-list-initial',
  async () => {
    // 从 URL 恢复筛选状态（使用独立函数）
    const urlParams = getFilterParamsFromUrl()

    // 构建 API 参数（内联版本，避免依赖外部变量）
    const params: IItemListParams = {
      page: '1',
      pageSize: pageSize.toString(),
      item_type: 'goods',
      main_category: '',
      is_tdk: '1',
      type: 'list',
      company_id: '1',
      ...(urlParams.brandId && { brand_id: urlParams.brandId }),
      ...(urlParams.sort !== 'default' && { sort: urlParams.sort }),
      ...(urlParams.startPrice && { start_price: urlParams.startPrice }),
      ...(urlParams.endPrice && { end_price: urlParams.endPrice }),
    }

    const response = await api.item.getProductList(params)

    if (response.data.value?.data) {
      const apiData = response.data.value.data
      // 直接使用class-transformer处理后的数据
      const productList = apiData.list

      return {
        products: productList,
        pagination: {
          total: apiData.total_count,
          current: 1,
          hasMore: pageSize < apiData.total_count,
        },
        urlParams, // 返回URL参数用于初始化状态
      }
    }

    return {
      products: [],
      pagination: { total: 0, current: 1, hasMore: false },
      urlParams,
    }
  },
  {
    server: true, // 启用服务端渲染
    default: () => ({
      products: [],
      pagination: { total: 0, current: 1, hasMore: false },
      urlParams: getFilterParamsFromUrl(),
    }),
  }
)

// 使用 SSR 预取的数据初始化状态
if (initialData.value) {
  products.value = initialData.value.products
  pagination.value = initialData.value.pagination

  // 从SSR数据初始化筛选参数
  if (initialData.value.urlParams) {
    filterParams.value = { ...initialData.value.urlParams }
  }
}

// 设置初始加载状态
pending.value = initialPending.value
error.value = initialError.value as Error | null

// 初始化数据
onMounted(async () => {
  // 如果SSR没有数据，则在客户端加载
  if (!products.value.length && !error.value) {
    // 如果还没有从SSR初始化筛选参数，则从URL恢复
    if (
      !filterParams.value.brandId &&
      !filterParams.value.startPrice &&
      !filterParams.value.endPrice &&
      filterParams.value.sort === 'default'
    ) {
      restoreFromUrl()
    }
    await loadProducts()
  }

  // 模拟品牌数据（实际应该从 API 获取）
  brands.value = [
    {
      attribute_id: '1',
      attribute_name: 'Apple',
      company_id: '1',
      shop_id: '1',
      attribute_type: 'brand',
      attribute_memo: '',
      attribute_sort: '1',
      distributor_id: '1',
      is_show: '1',
      is_image: '0',
      image_url: '',
      created: Date.now(),
      updated: Date.now(),
      attribute_code: null,
      attribute_show: null,
    },
    {
      attribute_id: '2',
      attribute_name: 'Samsung',
      company_id: '1',
      shop_id: '1',
      attribute_type: 'brand',
      attribute_memo: '',
      attribute_sort: '2',
      distributor_id: '1',
      is_show: '1',
      is_image: '0',
      image_url: '',
      created: Date.now(),
      updated: Date.now(),
      attribute_code: null,
      attribute_show: null,
    },
    {
      attribute_id: '3',
      attribute_name: 'Huawei',
      company_id: '1',
      shop_id: '1',
      attribute_type: 'brand',
      attribute_memo: '',
      attribute_sort: '3',
      distributor_id: '1',
      is_show: '1',
      is_image: '0',
      image_url: '',
      created: Date.now(),
      updated: Date.now(),
      attribute_code: null,
      attribute_show: null,
    },
    {
      attribute_id: '4',
      attribute_name: 'Xiaomi',
      company_id: '1',
      shop_id: '1',
      attribute_type: 'brand',
      attribute_memo: '',
      attribute_sort: '4',
      distributor_id: '1',
      is_show: '1',
      is_image: '0',
      image_url: '',
      created: Date.now(),
      updated: Date.now(),
      attribute_code: null,
      attribute_show: null,
    },
  ]
})

// 监听路由变化
watch(
  () => route.query,
  () => {
    // 如果是内部更新URL，跳过处理避免重复请求
    if (isInternalUrlUpdate.value) {
      isInternalUrlUpdate.value = false
      return
    }

    restoreFromUrl()
    currentPage.value = 1
    loadProducts()
  },
  { deep: true }
)
</script>
