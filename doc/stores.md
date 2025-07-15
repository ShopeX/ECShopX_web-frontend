# 状态管理文档

## 概述

项目使用 Pinia 作为状态管理解决方案，主要管理以下状态：

- 商品数据
- 购物车状态
- 用户信息

## Store 列表

### Product Store

- **文件路径**: `stores/product.ts`
- **功能**:
  - 管理商品列表
  - 商品搜索
  - 商品分类
  - 商品详情缓存

```typescript
// stores/product.ts 的主要结构
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
  }),

  getters: {
    getProductById: (state) => (id) => state.products.find((p) => p.id === id),
    getProductsByCategory: (state) => (category) =>
      state.products.filter((p) => p.category === category),
  },

  actions: {
    async fetchProducts() {
      // 获取商品列表
    },
    async fetchProductById(id) {
      // 获取单个商品
    },
  },
})
```

### Counter Store

- **文件路径**: `stores/counter.ts`
- **功能**:
  - 计数器示例
  - 基础状态管理演示

```typescript
// stores/counter.ts 的主要结构
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
  },

  actions: {
    increment() {
      this.count++
    },
  },
})
```

## Store 使用指南

### 在组件中使用 Store

```vue
<script setup>
import { useProductStore } from '~/stores/product'

const productStore = useProductStore()

// 使用 state
const products = computed(() => productStore.products)

// 使用 getters
const product = computed(() => productStore.getProductById(1))

// 使用 actions
const fetchData = async () => {
  await productStore.fetchProducts()
}
</script>
```

### Store 最佳实践

1. **状态初始化**
   - 在 app.vue 或相关的布局组件中初始化全局状态
   - 在具体页面组件中初始化页面相关状态

2. **状态更新**
   - 通过 actions 修改状态，不直接修改 state
   - 异步操作都放在 actions 中处理

3. **状态订阅**
   - 使用 `watch` 监听状态变化
   - 必要时使用 `storeToRefs` 保持响应性

4. **性能优化**
   - 合理使用 `computed` 缓存计算结果
   - 避免在 getters 中进行复杂计算
   - 使用 `storeToRefs` 解构 store 时保持响应性

## 调试

1. **Vue DevTools**
   - 安装 Vue DevTools 浏览器扩展
   - 在 DevTools 中查看 Pinia 状态
   - 实时监控状态变化

2. **日志**
   - 开发环境下记录状态变化
   - 使用 Pinia 的插件系统添加日志

```typescript
// plugins/pinia-logger.ts
export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(({ store }) => {
    store.$subscribe((mutation, state) => {
      console.log('Pinia mutation:', mutation.type, mutation.storeId, state)
    })
  })
})
```
