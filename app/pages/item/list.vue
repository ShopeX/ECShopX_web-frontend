<template>
  <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
    <!-- 筛选区域 -->
    <div class="sticky top-0 z-10">
      <ItemFilter
        v-model="filterParams"
        :brands="brands"
        @change="handleFilterChange"
      />
    </div>

    <!-- 列表区域 -->
    <div class="space-y-6">
      <!-- 加载中 -->
      <div 
        v-if="pending" 
        class="flex items-center justify-center py-12 text-gray-500"
      >
        加载中...
      </div>

      <!-- 错误状态 -->
      <div 
        v-else-if="error" 
        class="flex flex-col items-center justify-center py-12 text-gray-500"
      >
        <p>加载失败，请重试</p>
        <button 
          @click="handleRefresh"
          class="mt-2 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          重新加载
        </button>
      </div>

      <!-- 列表内容 -->
      <template v-else>
        <!-- 有数据 -->
        <div 
          v-if="items.length > 0" 
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <SpProductCard
            v-for="item in items"
            :key="item.itemId"
            :product="item"
            :show-member-price="true"
          />
        </div>

        <!-- 空状态 -->
        <div 
          v-else 
          class="flex items-center justify-center py-12 text-gray-500"
        >
          暂无商品
        </div>

        <!-- 加载更多 -->
        <div 
          v-if="hasMore" 
          class="flex justify-center pt-6"
        >
          <button
            :disabled="loadingMore"
            @click="loadMore"
            class="px-6 py-2 text-sm text-white bg-red-500 rounded-full
              hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IItemListParams } from '~/types/api/item'
import { useItemApi } from '~/api/item'
import ItemFilter from '~/components/business/ItemFilter.vue'
import SpProductCard from '~/components/SpProductCard.vue'

// 路由
const route = useRoute()
const router = useRouter()

// API
const itemApi = useItemApi()

// 状态管理
const items = ref<any[]>([])
const brands = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const loadingMore = ref(false)

// 筛选条件
const filterParams = ref({
  brandId: '',
  sort: 'default',
  startPrice: undefined as number | undefined,
  endPrice: undefined as number | undefined
})

// 计算属性
const hasMore = computed(() => {
  return items.value.length < total.value
})

// 获取查询参数
const getQueryParams = (page: number): IItemListParams => ({
  page,
  pageSize,
  item_type: 'normal',
  brand_id: filterParams.value.brandId || undefined,
  sort: filterParams.value.sort === 'default' ? undefined : filterParams.value.sort,
  start_price: filterParams.value.startPrice,
  end_price: filterParams.value.endPrice
})

// 初始化筛选条件
const initFilterParams = () => {
  const { brand_id, sort, start_price, end_price } = route.query
  
  filterParams.value = {
    brandId: brand_id ? String(brand_id) : '',
    sort: sort ? String(sort) : 'default',
    startPrice: start_price ? Number(start_price) : undefined,
    endPrice: end_price ? Number(end_price) : undefined
  }
}

// 初始化数据（SSR）
const { data, pending, error, refresh } = useAsyncData(
  'items',
  async () => {
    try {
      // 从 URL 更新筛选条件
      initFilterParams()
      const params = getQueryParams(1)
      const response = await itemApi.getList(params)
      console.log('response',response)
      if (response.data.value) {

        return {
          list:response.data.value.list,
          total_count: response.data.value.total_count,
          brand_list: response.data.value.brand_list
        }
      }
      return null
    } catch (error) {
      console.error('获取商品列表失败:', error)
      return null
    }
  },
  {
    // 监听查询参数变化
    watch: [
      () => route.query.brand_id,
      () => route.query.sort,
      () => route.query.start_price,
      () => route.query.end_price
    ]
  }
)

// 处理刷新按钮点击
const handleRefresh = () => {
  refresh()
}

// 监听数据变化
watchEffect(() => {
  console.log('data.value', data.value)
  if (data.value) {
    items.value = data.value.list
    total.value = data.value.total_count
    if (data.value.brand_list) {
      brands.value = data.value.brand_list
    }
  }
})

// 加载更多
const loadMore = async () => {
  if (loadingMore.value) return
  
  loadingMore.value = true
  try {
    currentPage.value++
    const params = getQueryParams(currentPage.value)
    const { data } = await itemApi.getList(params)
  
    if (data.value) {
      // 使用转换器处理新数据
     
      items.value = [...items.value, ...data.value.list]
      total.value = data.value.total_count
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    // 失败时回退页码
    currentPage.value--
  } finally {
    loadingMore.value = false
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  // 重置页码
  currentPage.value = 1
  // 更新 URL
  updateQuery()
}

// 更新查询参数
const updateQuery = () => {
  const query = {
    ...route.query,
    brand_id: filterParams.value.brandId || undefined,
    sort: filterParams.value.sort === 'default' ? undefined : filterParams.value.sort,
    start_price: filterParams.value.startPrice,
    end_price: filterParams.value.endPrice
  }

  // 移除undefined的参数
  const filteredQuery: Record<string, string | number> = {}
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filteredQuery[key] = String(value)
    }
  })

  router.replace({ query: filteredQuery })
}
</script>