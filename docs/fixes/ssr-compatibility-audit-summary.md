# SSR 兼容性审查总结

**审查日期**: 2025-01-09  
**审查范围**: 全部 composables、stores、pages

## 审查结果

### ✅ 已修复的问题

#### 1. `useMessage.ts` - useToast() SSR 问题（Composable 层）

**问题**: 在模块顶层直接调用 `useToast()`，导致 SSR 环境下报错

**修复方式**:
```typescript
export function useMessage() {
  // SSR 环境下返回空实现
  if (import.meta.server) {
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    }
  }
  
  // 客户端正常使用 useToast
  const toast = useToast()
  return { /* ... */ }
}
```

**影响范围**: 所有使用 `useMessage` 的地方都受益

---

#### 2. `useCart.ts` - 不必要的 Store 延迟初始化

**问题**: 错误地对 Pinia Store 做了延迟初始化处理

**修复前**:
```typescript
// ❌ 不必要的延迟初始化
let _uiStore: ReturnType<typeof useCartUIStore> | null = null
const getUIStore = () => {
  if (import.meta.server) return null
  if (!_uiStore) _uiStore = useCartUIStore()
  return _uiStore
}

// 使用时需要可选链
getUIStore()?.setLoading(true)
const loading = computed(() => getUIStore()?.loading ?? false)
```

**修复后**:
```typescript
// ✅ 直接使用，Pinia 完全支持 SSR
const cartUIStore = useCartUIStore()

// 使用时简洁明了
cartUIStore.setLoading(true)
const loading = computed(() => cartUIStore.loading)
```

**原因**: `@pinia/nuxt` 模块已经完全处理了 SSR，Pinia Stores 可以安全地直接调用

---

#### 3. `SpGoodsCard.vue` - 组件中 useRouter 的 SSR 问题（Component 层）

**问题**: 组件在 `<script setup>` 顶层直接调用 `useRouter()`

**修复前**:
```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()  // ❌ 组件顶层调用，SSR 错误

const navigateToDetail = () => {
  router.push(`/item/${props.info.id}`)
}
</script>
```

**修复后**:
```vue
<script setup>
// ✅ 使用 Nuxt 的 navigateTo 函数（SSR 安全）
const navigateToDetail = () => {
  navigateTo(`/item/${props.info.id}`)
}
</script>
```

**原因**: 
- 即使页面设置了 `ssr: false`，组件模块仍会在服务端被加载
- `useRouter()` 需要 Nuxt 应用上下文，在模块顶层调用会报错
- `navigateTo` 是 Nuxt 提供的全局函数，完全支持 SSR

**影响**: 修复了购物车页面刷新时的路由导航错误

---

### ✅ 通过审查的文件（无需修改）

#### Composables

| 文件 | 检查项 | 结果 | 说明 |
|------|--------|------|------|
| `useAuth.ts` | ✅ | 通过 | 只使用 Pinia Store，安全 |
| `useProduct.ts` | ✅ | 通过 | 只使用 API Client，安全 |
| `useSmsCode.ts` | ✅ | 通过 | 只使用 ref/computed，安全 |
| `useCart.ts` | ✅ | 已修复 | 移除不必要的延迟初始化 |
| `useMessage.ts` | ✅ | 已修复 | 添加 SSR 保护 |
| `usePagination.ts` | ✅ | 通过 | 纯逻辑，无依赖 |
| `useTheme.ts` | ✅ | 通过 | 未检测到问题 |
| `useI18n.ts` | ✅ | 通过 | 未检测到问题 |
| `useGlobal.ts` | ✅ | 通过 | 未检测到问题 |
| `useApp.ts` | ✅ | 通过 | 未检测到问题 |

#### Components

| 文件 | 检查项 | 结果 | 说明 |
|------|--------|------|------|
| `SpGoodsCard.vue` | ✅ | 已修复 | 使用 navigateTo 替代 useRouter |
| 其他组件 | ✅ | 通过 | 未检测到问题 |

#### Stores

| 文件 | 检查项 | 结果 | 说明 |
|------|--------|------|------|
| `cartUI.ts` | ✅ | 通过 | 纯 Pinia Store，SSR 安全 |
| `user.ts` | ✅ | 通过 | 纯 Pinia Store，SSR 安全 |
| `product.ts` | ✅ | 通过 | 纯 Pinia Store，SSR 安全 |
| `counter.ts` | ✅ | 通过 | 纯 Pinia Store，SSR 安全 |

#### Pages

| 文件 | 检查项 | 结果 | 说明 |
|------|--------|------|------|
| `pages/cart/index.vue` | ✅ | 通过 | 组件内使用 composables，安全 |
| `pages/login/index.vue` | ✅ | 通过 | 组件内使用 useRouter，安全 |
| `pages/item/list.vue` | ✅ | 通过 | 组件内使用 useRoute/useRouter，安全 |

---

## SSR 兼容性规则总结

### ✅ 安全的做法

1. **在 Vue 组件的 `<script setup>` 中直接使用**
   ```vue
   <script setup>
   const route = useRoute()  // ✅ 安全
   const router = useRouter()  // ✅ 安全
   const store = useXxxStore()  // ✅ 安全（@pinia/nuxt 已处理）
   </script>
   ```

2. **在 Composable 函数内部使用 Pinia Store**
   ```typescript
   export function useCart() {
     const cartUIStore = useCartUIStore()  // ✅ 安全
     // ...
   }
   ```

3. **需要 Nuxt 上下文的 Composable 做 SSR 保护**
   ```typescript
   export function useXxx() {
     if (import.meta.server) {
       // 返回空实现或默认值
       return { /* ... */ }
     }
     const nuxtComposable = useNuxtComposable()
     return { /* ... */ }
   }
   ```

### ❌ 危险的做法

1. **在 Composable 顶层直接调用需要 Nuxt 上下文的 composables**
   ```typescript
   // ❌ 错误：会在 SSR 时报错
   const toast = useToast()
   
   export function useMessage() {
     return {
       success: (msg) => toast.add({ /* ... */ })
     }
   }
   ```

2. **在组件顶层直接调用 useRouter/useRoute**
   ```vue
   <script setup>
   // ❌ 错误：组件加载时会在 SSR 报错
   const router = useRouter()
   const route = useRoute()
   </script>
   ```

3. **错误地对 Pinia Store 做延迟初始化**
   ```typescript
   // ❌ 不必要：Pinia 已经支持 SSR
   let _store = null
   const getStore = () => {
     if (import.meta.server) return null
     if (!_store) _store = useXxxStore()
     return _store
   }
   ```

---

## 需要 SSR 保护的 Nuxt Composables

以下 composables 需要 Nuxt 应用上下文，如果在 composable 模块顶层使用，需要做 SSR 保护：

### Nuxt 核心
- ✅ `useRoute()` - 需要保护（如果在 composable 顶层使用）
- ✅ `useRouter()` - 需要保护
- ✅ `useCookie()` - 需要保护
- ✅ `useRequestHeaders()` - 需要保护
- ✅ `useRequestEvent()` - 需要保护

### Nuxt UI
- ✅ `useToast()` - **需要保护**（已在 useMessage 中处理）
- ✅ `useModal()` - 需要保护
- ✅ `useNotification()` - 需要保护

### Pinia
- ❌ `useXxxStore()` - **不需要保护**（@pinia/nuxt 已处理）

---

## 测试验证

### 测试场景

1. ✅ **购物车页面刷新** - 不再报 SSR 错误（修复了 useRouter 问题）
2. ✅ **商品卡片点击** - 路由导航正常工作
3. ✅ **登录页面访问** - 正常工作
4. ✅ **商品列表页面** - 正常工作
5. ✅ **所有消息提示** - 正常显示

### 测试命令

```bash
# 开发环境测试
pnpm dev

# 生产构建测试
pnpm build
pnpm preview
```

---

## 最佳实践建议

### 1. 创建 Composable 时的检查清单

- [ ] 是否使用了需要 Nuxt 上下文的 composables？
- [ ] 如果是，是否在函数内部使用而不是模块顶层？
- [ ] 是否需要添加 SSR 保护？
- [ ] Pinia Stores 可以直接使用，无需特殊处理

### 1.5 创建组件时的检查清单

- [ ] 组件是否在 `<script setup>` 顶层调用了 `useRouter()`？
- [ ] 组件是否在 `<script setup>` 顶层调用了 `useRoute()`？
- [ ] 是否可以使用 `navigateTo` 替代 `router.push/replace`？
- [ ] 组件是否会在多个页面中使用（包括 SSR 页面）？

### 2. 代码审查要点

```typescript
// ✅ 推荐：在函数内部使用
export function useXxx() {
  const router = useRouter()  // ✅ OK
  // ...
}

// ❌ 避免：在模块顶层使用
const router = useRouter()  // ❌ SSR 错误
export function useXxx() {
  // ...
}

// ✅ 需要在顶层使用时，添加 SSR 保护
export function useXxx() {
  if (import.meta.server) {
    return { /* 空实现 */ }
  }
  const router = useRouter()
  return { /* ... */ }
}
```

### 3. Pinia Store 使用指南

```typescript
// ✅ 正确：直接使用，无需延迟初始化
export function useCart() {
  const cartUIStore = useCartUIStore()  // ✅ 完全安全
  
  const loadCart = async () => {
    cartUIStore.setLoading(true)  // ✅ 直接调用
    // ...
  }
}

// ❌ 错误：不必要的延迟初始化
export function useCart() {
  let _store = null
  const getStore = () => {
    if (import.meta.server) return null  // ❌ 不需要
    if (!_store) _store = useCartUIStore()
    return _store
  }
}
```

---

## 技术要点

### @pinia/nuxt 的 SSR 支持

`@pinia/nuxt` 模块提供了完整的 SSR 支持：

1. **状态序列化** - 服务端状态自动传递到客户端
2. **状态恢复** - 客户端自动恢复服务端状态
3. **自动注入** - Store 实例自动注入到 Nuxt 上下文

因此，Pinia Stores **不需要任何特殊的 SSR 处理**。

### import.meta.server

- 编译时标志，Nuxt 会在构建时替换为 `true` 或 `false`
- 死代码消除（DCE）会移除不会执行的分支
- 服务端和客户端会生成不同的代码

---

## 相关文档

- [Nuxt 3 SSR Context](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Pinia SSR](https://pinia.vuejs.org/ssr/)
- [@pinia/nuxt](https://pinia.vuejs.org/ssr/nuxt.html)
- [Nuxt navigateTo](https://nuxt.com/docs/api/utils/navigate-to)
- [修复文档: useMessage SSR 兼容](./ssr-compatible-useMessage.md)
- [修复文档: 组件 useRouter SSR 问题](./ssr-router-component-fix.md)

---

## 总结

✅ **修复内容**:
1. `useMessage` - 添加 SSR 保护（Composable 层）
2. `useCart` - 简化代码，移除不必要的延迟初始化（Composable 层）
3. `SpGoodsCard.vue` - 使用 `navigateTo` 替代 `useRouter`（Component 层）

✅ **无需修改**:
- 所有 Pinia Stores - 完全支持 SSR
- 其他 Composables - 没有 SSR 问题
- 页面组件 - 使用方式正确（页面组件中可以直接用 useRouter）

✅ **核心原则**:
- 只有需要 Nuxt 上下文的 composables 才需要 SSR 保护
- Pinia Stores 完全支持 SSR，可以直接使用
- **可复用组件优先使用 `navigateTo` 而不是 `useRouter`**
- 页面组件中可以直接使用 `useRouter`（因为只在客户端实例化）

🎉 **结论**: 项目的 SSR 兼容性问题已全部解决，涵盖了 Composable 层和 Component 层！

