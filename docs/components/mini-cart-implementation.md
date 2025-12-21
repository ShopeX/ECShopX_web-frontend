# MiniCart 组件实现总结

## 概述

根据 Figma 设计（node-id=1801-532）实现了一个从右往左弹出的 Mini 购物车组件，交互方式与 CategoryNav 组件类似，并复用了购物车页面的业务逻辑。

## 实现内容

### 1. 新增组件

#### MiniCart.vue
主要的 Mini 购物车组件，包含以下功能：
- 从右往左的侧边栏弹出效果
- 显示购物车商品列表
- 全选/取消全选功能
- 显示优惠和总计
- 前往结算按钮
- 查看购物袋按钮（跳转到购物车页面）
- 空购物车状态
- 加载状态

**路径**: `app/components/business/cart/MiniCart.vue`

#### MiniCartItem.vue
Mini 购物车的商品项组件，包含以下功能：
- 商品图片展示
- 商品信息展示（名称、款号、款式、尺寸、数量、价格）
- 选中状态标记（左上角复选框）
- 数量调整器（+/- 按钮）
- 折后价显示

**路径**: `app/components/business/cart/MiniCartItem.vue`

### 2. 修改的文件

#### default.vue 布局
添加了 Mini 购物车侧边栏：
```vue
<!-- Mini 购物车侧边栏 -->
<USlideover v-model:open="showMiniCart" side="right">
  <template #content>
    <MiniCart
      v-model="showMiniCart"
      @close="showMiniCart = false"
    />
  </template>
</USlideover>
```

**路径**: `app/layouts/default.vue`

#### HeaderBar.vue
修改了购物车图标的点击事件：
- 原来：点击后跳转到 `/cart` 页面
- 现在：点击后触发 `openMiniCart` 事件，打开 Mini 购物车侧边栏

**路径**: `app/components/business/headerBar/HeaderBar.vue`

#### index.ts
添加了 MiniCart 和 MiniCartItem 的导出：
```typescript
export { default as MiniCart } from './MiniCart.vue'
export { default as MiniCartItem } from './MiniCartItem.vue'
```

**路径**: `app/components/business/cart/index.ts`

### 3. 文档

#### MiniCart.md
详细的组件使用文档，包括：
- 功能特性
- 使用示例
- Props 和 Events
- 组件结构
- 设计规范
- 业务逻辑复用说明
- 交互说明
- 状态管理
- 注意事项

**路径**: `app/components/business/cart/MiniCart.md`

#### MiniCartExample.vue
组件使用示例，展示如何在页面中使用 MiniCart 组件。

**路径**: `app/components/business/cart/MiniCartExample.vue`

## 设计实现

### Figma 设计对照

根据 Figma 设计稿（node-id=1801-532）实现，主要包括：

1. **布局结构**
   - 顶部：标题栏（购物袋 (数量) + 关闭按钮）
   - 中间：商品列表（可滚动）
   - 底部：全选、优惠总计、按钮组

2. **商品项设计**
   - 96x96px 的商品图片
   - 左上角选中状态标记
   - 商品信息（名称、款号、款式、尺寸、数量、价格）
   - 右侧数量调整器（120px 宽）

3. **颜色规范**
   - 背景色：`#ffffff`
   - 主文字：`#191a1d`
   - 次要文字：`#4a5565`
   - 优惠价：`#d0112f`
   - 主题色：`#0f0f10`
   - 边框：`#e5e7eb`

4. **字体规范**
   - 标题：Noto Sans SC Medium 20px
   - 商品名称：Noto Sans SC Medium 16px
   - 正文：Noto Sans SC Regular 14px
   - 价格：Inter Medium 16px

### 交互设计

1. **打开方式**
   - 点击 HeaderBar 中的购物车图标
   - 从右往左滑出侧边栏

2. **关闭方式**
   - 点击右上角关闭按钮
   - 点击遮罩层
   - 点击"查看购物袋"或"前往结算"按钮

3. **商品操作**
   - 点击商品图片左上角复选框：选中/取消选中
   - 点击 +/- 按钮：调整数量

4. **全选操作**
   - 点击底部"全选"复选框：全选/取消全选

## 业务逻辑复用

MiniCart 组件完全复用了 `useCart` composable 中的业务逻辑：

```typescript
const {
  cartUI,           // 购物车 UI 数据
  loading,          // 加载状态
  loadCart,         // 加载购物车
  toggleItemSelection,    // 切换商品选中
  toggleAllSelection,     // 全选/取消全选
  updateQuantity,         // 更新数量
} = useCart()
```

这确保了：
- MiniCart 和购物车页面的数据一致性
- 业务规则的统一性
- 代码的可维护性

## 技术实现

### 1. 侧边栏实现
使用 Nuxt UI 的 `USlideover` 组件：
```vue
<USlideover v-model:open="showMiniCart" side="right">
  <template #content>
    <MiniCart v-model="showMiniCart" @close="showMiniCart = false" />
  </template>
</USlideover>
```

### 2. 状态管理
- 使用 `ref` 管理侧边栏的显示/隐藏状态
- 使用 `watch` 监听 `modelValue` 变化，在打开时自动加载购物车数据
- 使用 `initialized` 标记首次加载状态

### 3. 数据加载
```typescript
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue && !initialized.value) {
      await loadCart()
      initialized.value = true
    }
  },
  { immediate: true }
)
```

### 4. 事件通信
- 父组件 → 子组件：通过 `modelValue` prop 控制显示/隐藏
- 子组件 → 父组件：通过 `update:modelValue` 和 `close` 事件通知状态变化

## 与 CategoryNav 的对比

| 特性 | CategoryNav | MiniCart |
|------|-------------|----------|
| 弹出方向 | 从左往左 | 从右往左 |
| 触发方式 | 点击菜单图标 | 点击购物车图标 |
| 主要功能 | 分类导航 | 购物车管理 |
| 数据加载 | 静态数据 | 动态加载 |
| 业务逻辑 | 简单导航 | 复杂购物车逻辑 |
| 侧边栏位置 | `side="left"` | `side="right"` |

## 使用方式

### 在布局中使用（推荐）

已在 `app/layouts/default.vue` 中集成，所有使用该布局的页面都可以通过点击 HeaderBar 的购物车图标打开 MiniCart。

### 在单独页面中使用

```vue
<template>
  <div>
    <button @click="showMiniCart = true">打开购物车</button>
    
    <USlideover v-model="showMiniCart" side="right">
      <MiniCart v-model="showMiniCart" @close="showMiniCart = false" />
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MiniCart } from '~/components/business/cart'

const showMiniCart = ref(false)
</script>
```

## 测试建议

1. **功能测试**
   - 点击购物车图标，验证侧边栏从右往左弹出
   - 验证商品列表正确显示
   - 验证选中/取消选中功能
   - 验证全选/取消全选功能
   - 验证数量调整功能
   - 验证优惠和总计计算正确
   - 验证"前往结算"按钮跳转
   - 验证"查看购物袋"按钮跳转

2. **状态测试**
   - 验证空购物车状态显示
   - 验证加载状态显示
   - 验证数据加载失败的处理

3. **交互测试**
   - 验证关闭按钮功能
   - 验证点击遮罩层关闭
   - 验证滚动功能

4. **响应式测试**
   - 验证在不同屏幕尺寸下的显示效果

## 注意事项

1. **依赖项**
   - 需要 Nuxt UI 的 `USlideover` 组件
   - 需要 `useCart` composable
   - 需要购物车相关的 API 配置

2. **性能优化**
   - 只在首次打开时加载数据
   - 使用 `computed` 计算衍生数据
   - 避免不必要的重新渲染

3. **用户体验**
   - 加载状态提示
   - 空状态提示
   - 错误处理（由 `useCart` 处理）

## 后续优化建议

1. **功能增强**
   - 添加商品删除功能
   - 添加商品收藏功能
   - 添加优惠券选择功能
   - 添加商品推荐

2. **性能优化**
   - 虚拟滚动（商品数量很多时）
   - 图片懒加载
   - 防抖处理数量调整

3. **用户体验**
   - 添加动画效果
   - 添加骨架屏
   - 添加成功/失败的 Toast 提示

## 相关文件

- `app/components/business/cart/MiniCart.vue` - 主组件
- `app/components/business/cart/MiniCartItem.vue` - 商品项组件
- `app/components/business/cart/MiniCart.md` - 组件文档
- `app/components/business/cart/MiniCartExample.vue` - 使用示例
- `app/layouts/default.vue` - 布局集成
- `app/components/business/headerBar/HeaderBar.vue` - 触发入口
- `app/composables/useCart.ts` - 业务逻辑
- `app/pages/cart/index.vue` - 购物车页面（参考）

## 参考资料

- Figma 设计稿：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端?node-id=1801-532
- CategoryNav 组件：`app/components/business/categoryNav/CategoryNav.vue`
- 购物车页面：`app/pages/cart/index.vue`
- useCart composable：`app/composables/useCart.ts`

