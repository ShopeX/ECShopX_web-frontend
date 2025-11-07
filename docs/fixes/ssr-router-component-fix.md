# 组件中 useRouter 的 SSR 问题修复

**修复日期**: 2025-01-09  
**问题**: 购物车页面刷新时报 SSR 错误

## 问题描述

### 错误信息

```
[Vue Router warn]: uncaught error during route navigation:
ERROR [nuxt] A composable that requires access to the Nuxt instance was called 
outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function.
```

### 问题根源

**文件**: `app/components/SpGoodsCard.vue`

**问题代码**:
```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()  // ❌ 在组件顶层调用

const navigateToDetail = () => {
  router.push(`/item/${props.info.id}`)
}
</script>
```

### 为什么会报错？

1. **组件在 SSR 时被加载**
   - 即使页面设置了 `ssr: false`，组件模块仍会在服务端被导入和解析
   - 在模块加载时，`<script setup>` 中的顶层代码会立即执行

2. **useRouter 需要 Nuxt 上下文**
   - `useRouter()` 需要访问 Nuxt 应用实例
   - 在 SSR 环境下，如果在模块顶层调用，Nuxt 上下文不可用

3. **触发时机**
   - 当导航到购物车页面时
   - Nuxt 会加载页面及其依赖的组件
   - 即使页面本身禁用了 SSR，组件代码仍会在服务端执行

## 解决方案

### 方案 1：使用 navigateTo（推荐）✅

```vue
<script setup>
// ✅ 不需要导入 useRouter
const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

// ✅ 直接使用 Nuxt 提供的 navigateTo 函数
const navigateToDetail = () => {
  navigateTo(`/item/${props.info.id}`)
}
</script>
```

**优点**:
- ✅ SSR 安全 - `navigateTo` 是 Nuxt 提供的全局函数，完全支持 SSR
- ✅ 代码更简洁 - 无需导入和初始化
- ✅ 功能完整 - 支持所有路由导航功能

### 方案 2：延迟调用 useRouter（备选）

```vue
<script setup>
const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

// ✅ 在函数内部调用
const navigateToDetail = () => {
  const router = useRouter()  // 延迟到实际使用时调用
  router.push(`/item/${props.info.id}`)
}
</script>
```

**缺点**:
- ⚠️ 每次调用都会获取 router 实例（虽然性能影响很小）
- ⚠️ 代码不如方案 1 简洁

### 方案 3：条件性初始化（不推荐）

```vue
<script setup>
const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

// ⚠️ 只在客户端初始化
const router = import.meta.client ? useRouter() : null

const navigateToDetail = () => {
  if (import.meta.client) {
    router?.push(`/item/${props.info.id}`)
  }
}
</script>
```

**缺点**:
- ❌ 代码复杂
- ❌ 需要处理 null 情况
- ❌ 不如方案 1 简洁

## 实施修复

### 修复前

```vue
<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

const router = useRouter()  // ❌ SSR 错误

const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

const navigateToDetail = () => {
  router.push(`/item/${props.info.id}`)
}
</script>
```

### 修复后

```vue
<script setup>
const props = defineProps({
  info: {
    type: Object,
    required: true
  }
})

// 格式化价格
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

// 跳转到详情页 - 使用 navigateTo 替代 useRouter（SSR 安全）
const navigateToDetail = () => {
  navigateTo(`/item/${props.info.id}`)
}
</script>
```

**改进**:
- ✅ 移除了 `import { useRouter } from 'vue-router'`
- ✅ 移除了 `const router = useRouter()`
- ✅ 使用 `navigateTo()` 替代 `router.push()`
- ✅ 代码更简洁，减少 3 行

## navigateTo vs useRouter

### navigateTo 的优势

| 特性 | navigateTo | useRouter |
|------|-----------|-----------|
| SSR 支持 | ✅ 完全支持 | ⚠️ 需要在组件实例中使用 |
| 使用方式 | 全局函数，直接调用 | 需要导入和初始化 |
| 代码简洁性 | ✅ 更简洁 | ⚠️ 需要额外代码 |
| 功能完整性 | ✅ 支持所有导航功能 | ✅ 支持所有导航功能 |
| 推荐使用场景 | 组件、Composables | 复杂路由操作 |

### navigateTo 使用示例

```typescript
// 基本导航
navigateTo('/about')

// 带参数
navigateTo('/user/123')

// 外部链接
navigateTo('https://example.com', { external: true })

// 打开新窗口
navigateTo('/page', { open: { target: '_blank' } })

// 替换当前路由（不添加历史记录）
navigateTo('/page', { replace: true })

// 编程式导航对象
navigateTo({
  path: '/search',
  query: { q: 'nuxt' }
})
```

## 最佳实践

### ✅ 推荐做法

1. **组件中优先使用 navigateTo**
   ```vue
   <script setup>
   const goToPage = () => {
     navigateTo('/page')  // ✅ 简洁、SSR 安全
   }
   </script>
   ```

2. **复杂路由操作才使用 useRouter**
   ```vue
   <script setup>
   const handleComplexNavigation = () => {
     const router = useRouter()  // ✅ 在函数内部调用
     
     // 复杂的路由操作
     if (someCondition) {
       router.replace('/page1')
     } else {
       router.push('/page2')
     }
     
     // 使用路由守卫
     router.beforeEach((to, from) => {
       // ...
     })
   }
   </script>
   ```

3. **页面组件可以直接使用 useRouter**
   ```vue
   <!-- pages/xxx.vue -->
   <script setup>
   const router = useRouter()  // ✅ 页面组件中安全
   
   watch(() => route.query, () => {
     // 监听查询参数变化
   })
   </script>
   ```

### ❌ 避免的做法

1. **在组件顶层使用 useRouter**
   ```vue
   <script setup>
   const router = useRouter()  // ❌ 可能导致 SSR 错误
   </script>
   ```

2. **在可复用组件中使用 vue-router**
   ```vue
   <script setup>
   import { useRouter } from 'vue-router'  // ❌ 应该用 Nuxt 的 useRouter
   </script>
   ```

## 检查清单

排查组件 SSR 问题时，检查以下几点：

- [ ] 组件是否在 `<script setup>` 顶层调用了 `useRouter()`？
- [ ] 组件是否在 `<script setup>` 顶层调用了 `useRoute()`？
- [ ] 组件是否在 `<script setup>` 顶层调用了其他 Nuxt composables？
- [ ] 是否可以使用 `navigateTo` 替代 `router.push/replace`？
- [ ] 组件是否会在多个页面中使用（包括 SSR 页面）？

## 相关文档

- [Nuxt navigateTo](https://nuxt.com/docs/api/utils/navigate-to)
- [Nuxt useRouter](https://nuxt.com/docs/api/composables/use-router)
- [Vue Router](https://router.vuejs.org/)

## 总结

### 问题原因
- 组件在 `<script setup>` 顶层直接调用 `useRouter()`
- 即使页面禁用 SSR，组件代码仍会在服务端执行

### 解决方案
- 使用 `navigateTo()` 替代 `router.push()`
- `navigateTo` 是 Nuxt 提供的 SSR 安全的导航函数

### 最佳实践
- ✅ 组件中优先使用 `navigateTo`
- ✅ 复杂路由操作在函数内部调用 `useRouter()`
- ✅ 页面组件可以直接使用 `useRouter()`

### 影响
- ✅ 修复了购物车页面刷新时的 SSR 错误
- ✅ 代码更简洁（减少 3 行代码）
- ✅ 提高了组件的 SSR 兼容性

