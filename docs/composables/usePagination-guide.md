# usePagination Composable 使用指南

## 概述

`usePagination` 是一个通用的分页管理 Composable，用于处理列表数据的分页加载、加载更多、刷新等常见场景。它提供了统一的 API，可以在商品列表、订单列表、评论列表等各种场景中复用。

## 特性

- ✅ **通用性强**：支持泛型，适用于任何类型的列表数据
- ✅ **状态管理**：统一管理加载状态、错误状态、分页信息
- ✅ **加载更多**：内置加载更多功能，自动处理分页逻辑
- ✅ **刷新数据**：支持重置到第一页并刷新数据
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **易于使用**：简洁的 API，开箱即用

## 基本用法

### 1. 商品列表示例

```typescript
import type { IProduct } from '~/types/product'
import { usePagination } from '~/composables/usePagination'

const {
  items: products,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.getItemList({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})

// 立即加载第一页
await loadPage(1)
```

### 2. 订单列表示例

```typescript
import type { IOrder } from '~/types/order'
import { usePagination } from '~/composables/usePagination'

const {
  items: orders,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
} = usePagination<IOrder>({
  pageSize: 10,
  fetchFn: async (page, pageSize) => {
    const data = await orderApiClient.getOrderList({
      page,
      pageSize,
      status: 'all',
    })
    
    return {
      items: data.orders,
      total: data.totalCount,
    }
  },
  immediate: true, // 自动加载第一页
})
```

### 3. 评论列表示例

```typescript
import type { IComment } from '~/types/comment'
import { usePagination } from '~/composables/usePagination'

const productId = ref('123')

const {
  items: comments,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
  reset,
} = usePagination<IComment>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await commentApiClient.getComments({
      productId: productId.value,
      page,
      pageSize,
    })
    
    return {
      items: data.comments,
      total: data.total,
    }
  },
})

// 当商品ID变化时，重置并重新加载
watch(productId, () => {
  reset()
  loadPage(1)
})
```

## API 参考

### 配置选项（IPaginationOptions）

```typescript
interface IPaginationOptions<T> {
  /**
   * 每页大小，默认 20
   */
  pageSize?: number

  /**
   * 初始页码，默认 1
   */
  initialPage?: number

  /**
   * 数据获取函数
   * @param page 当前页码
   * @param pageSize 每页大小
   * @returns 返回数据列表和总数
   */
  fetchFn: (page: number, pageSize: number) => Promise<{
    items: T[]
    total: number
  }>

  /**
   * 是否自动加载首页数据，默认 false
   */
  immediate?: boolean
}
```

### 返回值（IPaginationResult）

```typescript
interface IPaginationResult<T> {
  /**
   * 数据列表
   */
  items: Ref<T[]>

  /**
   * 分页信息
   */
  pagination: Ref<{
    total: number      // 总数据数
    current: number    // 当前页码
    hasMore: boolean   // 是否有更多数据
  }>

  /**
   * 是否正在加载（首次加载或刷新）
   */
  pending: Ref<boolean>

  /**
   * 错误信息
   */
  error: Ref<Error | null>

  /**
   * 是否正在加载更多
   */
  loadingMore: Ref<boolean>

  /**
   * 是否有更多数据（计算属性）
   */
  hasMore: ComputedRef<boolean>

  /**
   * 加载更多数据
   */
  loadMore: () => Promise<void>

  /**
   * 刷新数据（重置到第一页）
   */
  refresh: () => Promise<void>

  /**
   * 重置状态
   */
  reset: () => void

  /**
   * 加载指定页的数据
   * @param page 页码
   * @param append 是否追加到现有数据
   */
  loadPage: (page: number, append?: boolean) => Promise<void>
}
```

## 高级用法

### 1. 结合筛选条件

```vue
<script setup lang="ts">
const filterParams = ref({
  category: '',
  minPrice: 0,
  maxPrice: 0,
})

const {
  items: products,
  refresh,
  loadMore,
  hasMore,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.getItemList({
      page,
      pageSize,
      ...filterParams.value,
    })
    
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})

// 监听筛选条件变化，刷新数据
watch(
  filterParams,
  () => {
    refresh()
  },
  { deep: true }
)
</script>
```

### 2. SSR 支持

```vue
<script setup lang="ts">
// 1. 创建 usePagination 实例
const {
  items: products,
  pagination,
  pending,
  error,
  loadPage,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.getItemList({
      page,
      pageSize,
    })
    
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})

// 2. SSR 预取数据
const { data: initialData } = await useLazyAsyncData(
  'products-initial',
  async () => {
    const data = await itemApiClient.getItemList({
      page: '1',
      pageSize: '20',
    })
    
    return {
      products: ProductTransformer.toModelList(data.list),
      pagination: {
        total: data.total_count,
        current: 1,
        hasMore: 20 < data.total_count,
      },
    }
  },
  { server: true }
)

// 3. 使用预取的数据初始化状态
if (initialData.value) {
  products.value = initialData.value.products
  pagination.value = initialData.value.pagination
}

// 4. 客户端加载
onMounted(() => {
  if (!products.value.length) {
    loadPage(1)
  }
})
</script>
```

### 3. 防抖加载

```typescript
import { useDebounceFn } from '@vueuse/core'

const searchKeyword = ref('')

const {
  items: products,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.search({
      keyword: searchKeyword.value,
      page,
      pageSize,
    })
    
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})

// 使用防抖处理搜索
const debouncedSearch = useDebounceFn(() => {
  refresh()
}, 300)

watch(searchKeyword, () => {
  debouncedSearch()
})
```

### 4. 错误处理

```vue
<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="pending && !products.length">
      加载中...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error">
      <p>{{ error.message }}</p>
      <button @click="refresh()">重试</button>
    </div>

    <!-- 数据列表 -->
    <div v-else>
      <div v-for="product in products" :key="product.id">
        {{ product.name }}
      </div>

      <!-- 加载更多 -->
      <button
        v-if="hasMore"
        :disabled="loadingMore"
        @click="loadMore()"
      >
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>
```

### 5. 无限滚动

```vue
<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const {
  items: products,
  hasMore,
  loadMore,
  loadingMore,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    // ... 获取数据
  },
  immediate: true,
})

// 加载更多触发器
const loadMoreTrigger = ref<HTMLElement>()

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value && !loadingMore.value) {
      loadMore()
    }
  }
)
</script>

<template>
  <div>
    <div v-for="product in products" :key="product.id">
      {{ product.name }}
    </div>

    <!-- 触发器元素 -->
    <div ref="loadMoreTrigger" />

    <!-- 加载状态 -->
    <div v-if="loadingMore">加载中...</div>
  </div>
</template>
```

## 最佳实践

### 1. 合理设置 pageSize

```typescript
// ✅ 推荐：根据场景设置合理的页面大小
const { items } = usePagination({
  pageSize: 20, // 商品列表
})

const { items: orders } = usePagination({
  pageSize: 10, // 订单列表（内容较多）
})

const { items: comments } = usePagination({
  pageSize: 50, // 评论列表（内容较少）
})
```

### 2. 统一错误处理

```typescript
const {
  items,
  error,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    try {
      const data = await itemApiClient.getItemList({ page, pageSize })
      return {
        items: ProductTransformer.toModelList(data.list),
        total: data.total_count,
      }
    } catch (err) {
      // 统一的错误处理
      console.error('加载商品失败:', err)
      throw err
    }
  },
})
```

### 3. 合理使用 immediate

```typescript
// ✅ 适合使用 immediate: true 的场景
// - 页面加载时立即显示数据
// - 不需要等待其他条件
const { items } = usePagination({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    // ...
  },
  immediate: true,
})

// ✅ 适合手动加载的场景
// - 需要等待用户操作
// - 需要等待其他数据加载完成
// - 需要从 SSR 预取数据
const { items, loadPage } = usePagination({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    // ...
  },
  immediate: false,
})

// 在合适的时机手动加载
onMounted(() => {
  loadPage(1)
})
```

### 4. 状态重置

```typescript
const categoryId = ref('1')

const {
  items,
  reset,
  loadPage,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.getItemList({
      categoryId: categoryId.value,
      page,
      pageSize,
    })
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})

// 当分类变化时，重置状态
watch(categoryId, () => {
  reset() // 清空数据和状态
  loadPage(1) // 重新加载
})
```

## 与其他 Composables 结合

### 1. 结合 useRoute 实现 URL 同步

```typescript
const route = useRoute()
const router = useRouter()

// 从 URL 读取分类 ID
const categoryId = computed(() => route.query.category as string || '')

const {
  items,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.getItemList({
      categoryId: categoryId.value,
      page,
      pageSize,
    })
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})

// 监听 URL 变化
watch(categoryId, () => {
  refresh()
})

// 更新 URL
const updateCategory = (category: string) => {
  router.push({ query: { category } })
}
```

### 2. 结合 useDebounceFn 实现防抖搜索

```typescript
import { useDebounceFn } from '@vueuse/core'

const searchKeyword = ref('')

const {
  items,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    // ... 搜索逻辑
  },
})

const debouncedRefresh = useDebounceFn(refresh, 300)

watch(searchKeyword, debouncedRefresh)
```

## 常见问题

### Q1: 如何处理并发请求？

A: `usePagination` 内部已经通过 `pending` 和 `loadingMore` 状态来防止并发请求。在加载过程中，再次调用 `loadMore` 会被忽略。

### Q2: 如何实现下拉刷新？

```typescript
const {
  items,
  refresh,
  pending,
} = usePagination<IProduct>({ /* ... */ })

const handlePullRefresh = async () => {
  await refresh()
  // 刷新完成后的处理
}
```

### Q3: 如何缓存数据？

建议在外层使用 Pinia Store 来缓存数据：

```typescript
// stores/product.ts
export const useProductStore = defineStore('product', () => {
  const cachedProducts = ref<IProduct[]>([])
  
  const {
    items,
    refresh,
  } = usePagination<IProduct>({
    pageSize: 20,
    fetchFn: async (page, pageSize) => {
      // ... 获取数据
    },
  })
  
  // 监听数据变化，更新缓存
  watch(items, (newItems) => {
    cachedProducts.value = newItems
  })
  
  return {
    items,
    cachedProducts,
    refresh,
  }
})
```

## 迁移指南

### 从手动分页逻辑迁移

**重构前：**

```typescript
const products = ref<IProduct[]>([])
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)

const loadProducts = async () => {
  loading.value = true
  try {
    const data = await itemApiClient.getItemList({
      page: currentPage.value,
      pageSize,
    })
    products.value = ProductTransformer.toModelList(data.list)
    total.value = data.total_count
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  currentPage.value++
  const data = await itemApiClient.getItemList({
    page: currentPage.value,
    pageSize,
  })
  products.value.push(...ProductTransformer.toModelList(data.list))
}
```

**重构后：**

```typescript
const {
  items: products,
  pagination,
  pending: loading,
  loadMore,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const data = await itemApiClient.getItemList({ page, pageSize })
    return {
      items: ProductTransformer.toModelList(data.list),
      total: data.total_count,
    }
  },
})
```

## 总结

`usePagination` 提供了一个统一、类型安全、易于使用的分页解决方案。通过抽象通用的分页逻辑，可以大大减少代码重复，提高开发效率和代码质量。

### 核心优势

1. **代码复用**：一次编写，到处使用
2. **类型安全**：完整的 TypeScript 支持
3. **状态管理**：统一的状态管理，避免状态不一致
4. **易于测试**：清晰的 API，易于编写单元测试
5. **可扩展性**：灵活的配置，支持各种使用场景

### 适用场景

- ✅ 商品列表
- ✅ 订单列表
- ✅ 评论列表
- ✅ 用户列表
- ✅ 文章列表
- ✅ 任何需要分页的列表场景

