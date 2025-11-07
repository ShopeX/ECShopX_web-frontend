# 分页逻辑抽离为 usePagination Composable

## 概述

本次重构将商品列表页面中的分页逻辑抽离为一个通用的 `usePagination` Composable，以提高代码复用性和可维护性。

**重构日期**: 2025-01-09  
**影响范围**: 商品列表页面、未来的订单列表等分页场景

## 重构动机

### 问题背景

在 `app/pages/item/list.vue` 中，分页逻辑包含了大量的状态管理和加载逻辑：

- 数据列表状态 (`products`)
- 分页信息 (`pagination`, `currentPage`, `pageSize`)
- 加载状态 (`pending`, `loadingMore`)
- 错误状态 (`error`)
- 加载函数 (`loadProducts`, `loadMore`)

这些逻辑在其他需要分页的场景（如订单列表、评论列表等）中也会重复出现，导致：

1. **代码重复**：每个页面都需要重写类似的分页逻辑
2. **维护困难**：修改分页逻辑需要在多个地方同步更新
3. **测试成本高**：每个页面都需要单独测试分页功能
4. **不利于统一优化**：如果要优化分页性能或添加新功能，需要修改多个文件

### 重构目标

1. ✅ 提取通用的分页逻辑到独立的 Composable
2. ✅ 支持泛型，适用于不同类型的数据
3. ✅ 保持类型安全，完整的 TypeScript 支持
4. ✅ 简化页面组件代码，提高可读性
5. ✅ 便于在其他场景中复用（订单列表、评论列表等）

## 实施方案

### 1. 创建 `usePagination` Composable

**文件位置**: `app/composables/usePagination.ts`

**核心功能**:

```typescript
export function usePagination<T>(options: IPaginationOptions<T>): IPaginationResult<T>
```

**提供的状态和方法**:

- `items`: 数据列表
- `pagination`: 分页信息（total, current, hasMore）
- `pending`: 加载状态
- `error`: 错误状态
- `loadingMore`: 加载更多状态
- `hasMore`: 是否有更多数据（计算属性）
- `loadMore()`: 加载更多
- `refresh()`: 刷新数据
- `reset()`: 重置状态
- `loadPage()`: 加载指定页

### 2. 重构商品列表页面

**文件位置**: `app/pages/item/list.vue`

**重构前后对比**:

#### 重构前

```typescript
// 手动管理所有状态
const products = ref<IProduct[]>([])
const currentPage = ref(1)
const pageSize = 20
const pagination = ref({ total: 0, current: 1, hasMore: false })
const pending = ref(false)
const error = ref<Error | null>(null)
const loadingMore = ref(false)

// 手动实现加载函数
const loadProducts = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true
    } else {
      pending.value = true
      error.value = null
    }

    const params = buildApiParams()
    const data = await itemApiClient.getItemList(params)
    
    if (data?.list) {
      const newProducts = ProductTransformer.toModelList(data.list)
      
      if (append) {
        products.value.push(...newProducts)
      } else {
        products.value = newProducts
      }

      pagination.value = {
        total: data.total_count || 0,
        current: currentPage.value,
        hasMore: currentPage.value * pageSize < (data.total_count || 0),
      }
      
      if (data.brand_list?.list) {
        brands.value = data.brand_list.list
      }
    }
  } catch (err) {
    error.value = err as Error
    console.error('加载商品失败:', err)
  } finally {
    pending.value = false
    loadingMore.value = false
  }
}

// 手动实现加载更多
const loadMore = async () => {
  if (hasMore.value && !loadingMore.value) {
    currentPage.value++
    await loadProducts(true)
  }
}

// 手动实现刷新
const refresh = () => {
  currentPage.value = 1
  loadProducts()
}
```

#### 重构后

```typescript
// 使用 usePagination 简化代码
const {
  items: products,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
  loadPage,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const params = buildApiParams(page, pageSize)
    const data = await itemApiClient.getItemList(params)

    // 更新品牌列表
    if (data?.brand_list?.list) {
      brands.value = data.brand_list.list
    }

    if (data?.list) {
      const productList = ProductTransformer.toModelList(data.list)
      return {
        items: productList,
        total: data.total_count || 0,
      }
    }

    return {
      items: [],
      total: 0,
    }
  },
})
```

**代码减少**:
- 删除了约 80 行分页相关代码
- 代码更清晰、更易读
- 状态管理更加统一

### 3. 创建使用文档和示例

**文档位置**:
- `docs/composables/usePagination-guide.md` - 详细使用指南
- `docs/examples/order-list-with-pagination.vue` - 订单列表示例

## 重构成果

### 代码质量提升

#### 1. 代码复用性

```typescript
// ✅ 商品列表
const { items: products, loadMore, refresh } = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => { /* ... */ },
})

// ✅ 订单列表
const { items: orders, loadMore, refresh } = usePagination<IOrder>({
  pageSize: 10,
  fetchFn: async (page, pageSize) => { /* ... */ },
})

// ✅ 评论列表
const { items: comments, loadMore, refresh } = usePagination<IComment>({
  pageSize: 50,
  fetchFn: async (page, pageSize) => { /* ... */ },
})
```

#### 2. 类型安全

```typescript
// ✅ 完整的 TypeScript 类型支持
interface IPaginationOptions<T> {
  pageSize?: number
  initialPage?: number
  fetchFn: (page: number, pageSize: number) => Promise<{
    items: T[]
    total: number
  }>
  immediate?: boolean
}

interface IPaginationResult<T> {
  items: Ref<T[]>
  pagination: Ref<{ total: number; current: number; hasMore: boolean }>
  // ... 更多类型定义
}
```

#### 3. 易于测试

```typescript
// ✅ 可以独立测试 usePagination
describe('usePagination', () => {
  it('should load first page', async () => {
    const { items, pagination, loadPage } = usePagination({
      pageSize: 10,
      fetchFn: mockFetchFn,
    })
    
    await loadPage(1)
    
    expect(items.value).toHaveLength(10)
    expect(pagination.value.total).toBe(100)
  })
})
```

### 性能优化

1. **防止并发请求**: 通过 `pending` 和 `loadingMore` 状态自动防止重复请求
2. **状态管理优化**: 统一的状态管理，避免状态不一致
3. **内存优化**: 提供 `reset()` 方法清空数据，避免内存泄漏

### 可维护性提升

1. **单一职责**: 分页逻辑独立，职责清晰
2. **易于扩展**: 可以轻松添加新功能（如缓存、预加载等）
3. **统一的错误处理**: 集中管理错误状态
4. **简化调试**: 分页逻辑集中在一个文件中，便于调试

## 迁移指南

### 其他页面如何迁移

#### Step 1: 识别分页逻辑

找出页面中的分页相关代码：
- 数据列表状态
- 分页信息
- 加载状态
- 加载函数

#### Step 2: 使用 usePagination 替换

```typescript
// 1. 导入 usePagination
import { usePagination } from '~/composables/usePagination'

// 2. 替换原有的状态和函数
const {
  items,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
} = usePagination<YourDataType>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    // 调用 API
    const data = await apiClient.getData({ page, pageSize })
    
    // 返回标准格式
    return {
      items: data.list,
      total: data.total,
    }
  },
})
```

#### Step 3: 更新模板

```vue
<template>
  <!-- 使用新的状态变量 -->
  <div v-if="pending">加载中...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else>
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
    <button v-if="hasMore" @click="loadMore">加载更多</button>
  </div>
</template>
```

#### Step 4: 测试验证

- 测试首次加载
- 测试加载更多
- 测试刷新
- 测试错误处理

## 最佳实践

### 1. 合理设置 pageSize

```typescript
// ✅ 根据内容复杂度设置
const { items } = usePagination({
  pageSize: 20, // 商品列表：内容较多，适中的页面大小
})

const { items: orders } = usePagination({
  pageSize: 10, // 订单列表：内容复杂，较小的页面大小
})

const { items: comments } = usePagination({
  pageSize: 50, // 评论列表：内容简单，较大的页面大小
})
```

### 2. 结合筛选条件

```typescript
const filterParams = ref({ category: '', minPrice: 0 })

const { items, refresh } = usePagination({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    // 将筛选参数传递给 API
    const data = await api.getData({
      page,
      pageSize,
      ...filterParams.value,
    })
    return { items: data.list, total: data.total }
  },
})

// 筛选条件变化时刷新
watch(filterParams, () => refresh(), { deep: true })
```

### 3. SSR 支持

```typescript
// 1. 创建 usePagination 实例
const { items, pagination, pending, error, loadPage } = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => { /* ... */ },
})

// 2. SSR 预取数据
const { data: initialData } = await useLazyAsyncData(
  'products-initial',
  async () => {
    const data = await api.getData({ page: 1, pageSize: 20 })
    return { items: data.list, total: data.total }
  },
  { server: true }
)

// 3. 使用预取的数据初始化
if (initialData.value) {
  items.value = initialData.value.items
  pagination.value = { /* ... */ }
}
```

### 4. 错误处理

```typescript
const {
  items,
  error,
  refresh,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    try {
      const data = await api.getData({ page, pageSize })
      return { items: data.list, total: data.total }
    } catch (err) {
      // 自定义错误处理
      console.error('加载失败:', err)
      throw err
    }
  },
})

// 模板中处理错误
// <div v-if="error">
//   {{ error.message }}
//   <button @click="refresh">重试</button>
// </div>
```

## 未来优化方向

### 1. 缓存支持

```typescript
// 计划添加缓存选项
const { items } = usePagination({
  pageSize: 20,
  fetchFn: async (page, pageSize) => { /* ... */ },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 分钟
    key: 'products-list',
  },
})
```

### 2. 预加载支持

```typescript
// 计划添加预加载选项
const { items } = usePagination({
  pageSize: 20,
  fetchFn: async (page, pageSize) => { /* ... */ },
  preload: {
    enabled: true,
    threshold: 0.8, // 滚动到 80% 时预加载下一页
  },
})
```

### 3. 虚拟滚动支持

```typescript
// 计划支持虚拟滚动
const { items } = usePagination({
  pageSize: 20,
  fetchFn: async (page, pageSize) => { /* ... */ },
  virtualScroll: {
    enabled: true,
    itemHeight: 100,
    buffer: 10,
  },
})
```

## 总结

### 成果

1. ✅ 创建了通用的 `usePagination` Composable
2. ✅ 重构了商品列表页面，代码减少约 80 行
3. ✅ 提供了完整的 TypeScript 类型支持
4. ✅ 编写了详细的使用文档和示例
5. ✅ 提供了订单列表的参考实现

### 收益

- **代码复用**: 一次编写，多处使用
- **类型安全**: 完整的 TypeScript 支持
- **易于维护**: 集中管理分页逻辑
- **提高效率**: 减少重复代码，加快开发速度
- **统一体验**: 所有分页场景保持一致的行为

### 下一步

1. 在订单列表中应用 `usePagination`
2. 在评论列表中应用 `usePagination`
3. 根据使用反馈优化 API
4. 添加缓存和预加载功能
5. 编写单元测试

## 相关文件

### 新增文件

- `app/composables/usePagination.ts` - 分页 Composable
- `docs/composables/usePagination-guide.md` - 使用指南
- `docs/examples/order-list-with-pagination.vue` - 订单列表示例
- `docs/refactoring/usePagination-composable-extraction.md` - 本文档

### 修改文件

- `app/pages/item/list.vue` - 使用 usePagination 重构

### 参考资料

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [VueUse](https://vueuse.org/) - 参考了类似的设计模式

