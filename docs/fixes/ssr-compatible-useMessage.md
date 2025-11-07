# SSR 兼容的 useMessage 修复方案

## 问题描述

购物车页面刷新时出现 SSR 错误：

```
[nuxt] A composable that requires access to the Nuxt instance was called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function.
```

### 问题根源

1. **`useMessage` 直接调用 `useToast()`**
   - `useToast()` 是 Nuxt UI 提供的 composable，需要 Nuxt 实例
   - 在 SSR 环境下，Nuxt 上下文不可用

2. **模块加载时机问题**
   - 即使页面设置了 `ssr: false`，模块仍会在服务端被加载和解析
   - 如果在模块顶层直接调用需要 Nuxt 实例的 composables，就会报错

3. **影响范围广泛**
   - `useMessage` 在很多地方使用（购物车、登录、商品等）
   - 如果在每个使用的地方都做特殊处理，会导致大量重复代码

## 解决方案对比

### ❌ 方案 1：在每个使用的地方做延迟初始化（不推荐）

```typescript
// useCart.ts - 每个使用 useMessage 的地方都需要这样处理
export function useCart() {
  let _message: ReturnType<typeof useMessage> | null = null
  const getMessage = () => {
    if (import.meta.server) {
      return null
    }
    if (!_message) {
      _message = useMessage()
    }
    return _message
  }

  // 使用时
  getMessage()?.success('操作成功')
  getMessage()?.error('操作失败')
}
```

**缺点：**
- ❌ 每个使用 `useMessage` 的地方都需要重复这段代码
- ❌ 代码冗余，难以维护
- ❌ 容易遗漏，导致新页面出现同样的问题
- ❌ 可选链调用（`?.`）使代码不够清晰

### ✅ 方案 2：在 useMessage 本身做 SSR 兼容（推荐）

```typescript
// useMessage.ts - 一次修复，全局受益
export function useMessage() {
  // SSR 环境下返回空实现（no-op）
  if (import.meta.server) {
    return {
      success: (message: string) => {},
      error: (message: string) => {},
      warning: (message: string) => {},
      info: (message: string) => {},
    }
  }

  // 客户端环境下使用 Nuxt UI Toast
  const toast = useToast()

  return {
    success(message: string) {
      toast.add({ title: '成功', description: message, color: 'success' })
    },
    error(message: string) {
      toast.add({ title: '错误', description: message, color: 'error' })
    },
    warning(message: string) {
      toast.add({ title: '警告', description: message, color: 'warning' })
    },
    info(message: string) {
      toast.add({ title: '提示', description: message, color: 'info' })
    },
  }
}
```

**优点：**
- ✅ 一次修复，所有使用 `useMessage` 的地方都受益
- ✅ 代码简洁，无需特殊处理
- ✅ SSR 安全：服务端返回空实现，不会报错
- ✅ 客户端正常工作：消息提示正常显示
- ✅ 易于维护：逻辑集中在一个地方

## 实施步骤

### 步骤 1：修复 `useMessage` 使其 SSR 兼容

**文件**: `app/composables/useMessage.ts`

```typescript
export function useMessage() {
  // SSR 环境下返回空实现
  if (import.meta.server) {
    return {
      success: (message: string) => {},
      error: (message: string) => {},
      warning: (message: string) => {},
      info: (message: string) => {},
    }
  }

  // 客户端环境下使用 Nuxt UI Toast
  const toast = useToast()

  return {
    success(message: string) {
      toast.add({
        title: '成功',
        description: message,
        color: 'success',
      })
    },
    error(message: string) {
      toast.add({
        title: '错误',
        description: message,
        color: 'error',
      })
    },
    warning(message: string) {
      toast.add({
        title: '警告',
        description: message,
        color: 'warning',
      })
    },
    info(message: string) {
      toast.add({
        title: '提示',
        description: message,
        color: 'info',
      })
    },
  }
}
```

### 步骤 2：恢复 `useCart` 等文件的简洁调用

**文件**: `app/composables/useCart.ts`

```typescript
export function useCart() {
  // ✅ 现在可以直接调用，无需特殊处理
  const message = useMessage()

  // ... 使用
  const addToCart = async () => {
    try {
      // ...
      message.success('已添加到购物车')
    } catch (err) {
      message.error('添加失败')
    }
  }
}
```

## 技术原理

### SSR 环境判断

```typescript
if (import.meta.server) {
  // 服务端代码
} else {
  // 客户端代码
}
```

- `import.meta.server`: Nuxt 提供的编译时标志
- 在构建时会被替换为 `true` 或 `false`
- 死代码消除（Dead Code Elimination）会移除不会执行的分支

### 空实现模式（No-op Pattern）

在 SSR 环境下返回空函数，好处：

1. **类型兼容**：返回值类型与客户端一致
2. **调用安全**：可以正常调用，不会报错
3. **零性能开销**：服务端不会执行任何操作
4. **代码一致性**：使用方无需区分环境

## 测试验证

### 测试场景

1. ✅ **购物车页面刷新** - 不再报 SSR 错误
2. ✅ **从其他页面跳转** - 正常工作
3. ✅ **所有购物车操作** - 消息提示正常显示
4. ✅ **登录页面** - 消息提示正常工作
5. ✅ **商品列表** - 消息提示正常工作

### 测试步骤

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 访问购物车页面并刷新
# http://localhost:3000/cart

# 3. 检查控制台是否有 SSR 错误
# ✅ 应该没有错误

# 4. 测试购物车操作（添加、删除等）
# ✅ 消息提示应该正常显示

# 5. 构建生产版本
pnpm build

# 6. 预览生产版本
pnpm preview

# 7. 再次测试所有场景
# ✅ 应该都正常工作
```

## 最佳实践

### 1. Composables 的 SSR 兼容设计原则

所有可能在 SSR 环境下被调用的 composables 都应该：

```typescript
export function useXxx() {
  // ✅ 检查 SSR 环境
  if (import.meta.server) {
    // 返回空实现或默认值
    return {
      // 提供与客户端相同的 API
    }
  }

  // 客户端实现
  const nuxtComposable = useNuxtComposable()
  
  return {
    // 实际功能
  }
}
```

### 2. 需要 SSR 兼容的常见场景

- ✅ 使用 Nuxt UI composables（`useToast`, `useModal` 等）
- ✅ 访问浏览器 API（`window`, `document`, `localStorage` 等）
- ✅ 使用仅客户端的第三方库

### 3. 不需要 SSR 兼容的场景

- ❌ 纯数据处理函数
- ❌ 只在客户端调用的 composables（在 `onMounted` 中使用）
- ❌ 页面已经设置了 `ssr: false`，且 composable 只在该页面使用

## 相关文件

### 修改的文件

- ✅ `app/composables/useMessage.ts` - 添加 SSR 兼容逻辑
- ✅ `app/composables/useCart.ts` - 恢复简洁的直接调用方式

### 受益的文件

所有使用 `useMessage` 的文件都受益：

- `app/pages/cart/index.vue` - 购物车页面
- `app/pages/login/index.vue` - 登录页面
- `app/composables/useCart.ts` - 购物车业务逻辑
- `app/composables/useAuth.ts` - 认证业务逻辑（未来）
- `app/composables/useProduct.ts` - 商品业务逻辑（未来）
- ... 所有其他使用 `useMessage` 的地方

## 性能影响

### 服务端

- ✅ 零性能开销：空函数调用几乎无开销
- ✅ 代码体积：死代码消除后，客户端代码不会包含在服务端包中

### 客户端

- ✅ 无性能影响：与修复前完全一致
- ✅ 代码体积：与修复前完全一致

## 总结

### 关键要点

1. ✅ **在根源处修复**：在 `useMessage` 本身做 SSR 兼容，而不是在每个使用的地方
2. ✅ **空实现模式**：SSR 环境返回空实现，保持 API 一致性
3. ✅ **一次修复，全局受益**：所有使用 `useMessage` 的地方都自动受益
4. ✅ **代码简洁**：使用方无需做任何特殊处理

### 推广应用

这个模式可以应用到其他类似的 composables：

- `useModal` - 如果封装了 Nuxt UI 的模态框
- `useNotification` - 如果封装了其他通知组件
- `useLocalStorage` - 如果使用了浏览器 API
- ... 其他需要 SSR 兼容的 composables

### 参考资料

- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [SSR Context](https://nuxt.com/docs/guide/going-further/runtime-config#access-runtime-config)
- [import.meta.server](https://nuxt.com/docs/api/advanced/import-meta)

