# SpProductCard 组件重构：移至 business/item 模块

## 重构动机

`SpProductCard` 是商品卡片组件，原本位于 `~/components/SpProductCard/`，但从业务逻辑来看，它应该属于商品模块的一部分，更适合放在 `~/components/business/item/` 目录中。

## 重构内容

### 1. 目录结构调整

**重构前**:
```
~/components/
  ├── SpProductCard/
  │   ├── index.ts
  │   ├── index.vue
  │   └── types.ts
  └── business/
      └── item/
          ├── ItemCard.vue
          └── ItemFilter/
```

**重构后**:
```
~/components/business/item/
  ├── SpProductCard/
  │   ├── index.ts
  │   ├── index.vue
  │   └── types.ts
  ├── ItemCard.vue
  └── ItemFilter/
```

### 2. 导入路径更新

更新了所有引用 `SpProductCard` 类型的文件：

| 文件 | 原导入路径 | 新导入路径 |
|------|-----------|-----------|
| `app/pages/item/list.vue` | `~/components/SpProductCard/types` | `~/components/business/item/SpProductCard/types` |
| `app/composables/useProduct.ts` | `~/components/SpProductCard/types` | `~/components/business/item/SpProductCard/types` |
| `app/infrastructure/transformers/productTransformer.ts` | `~/components/SpProductCard/types` | `~/components/business/item/SpProductCard/types` |

### 3. 模块导出更新

更新 `business/item/index.ts`:

```typescript
/**
 * Item 模块统一导出
 * 
 * 商品相关业务组件：
 * - ItemCard - 商品卡片展示组件（简单版）
 * - ItemFilter - 商品筛选组件（已重构为模块化）
 * - SpProductCard - 商品卡片展示组件（完整版，带价格、图片等）
 */

export { default as ItemCard } from './ItemCard.vue'
export { default as ItemFilter } from './ItemFilter/ItemFilter.vue'
export { default as SpProductCard } from './SpProductCard/index.vue'
```

## 组件对比

### ItemCard vs SpProductCard

| 特性 | ItemCard | SpProductCard |
|------|----------|---------------|
| **用途** | 简单的商品卡片 | 完整的商品展示卡片 |
| **复杂度** | 🟢 简单（~70行） | 🟡 中等（~240行） |
| **显示内容** | 基本信息 | 完整信息（价格、折扣、规格等） |
| **使用场景** | 简单列表 | 商品列表页、搜索结果 |

## 优势

### 1. 更好的代码组织

```
business/item/
  ├── ItemCard.vue          # 简单卡片
  ├── SpProductCard/        # 完整卡片（目录组件）
  └── ItemFilter/           # 筛选组件
```

所有商品相关组件集中在一个模块中，便于维护和查找。

### 2. 符合业务模块划分

- `business/auth/` - 认证相关
- `business/cart/` - 购物车相关
- `business/item/` - 商品相关 ✅

### 3. 清晰的模块边界

```typescript
// 统一从 item 模块导入
import { ItemCard, ItemFilter, SpProductCard } from '~/components/business/item'
```

## 验证

### 1. 自动导入验证

由于配置了 `pattern: '**/*.vue'`，Nuxt 会自动递归扫描并导入：

```vue
<template>
  <!-- ✅ 自动可用，无需手动导入 -->
  <SpProductCard :product="product" />
</template>
```

### 2. 类型导入验证

```typescript
// ✅ 类型导入路径已更新
import type { IProduct } from '~/components/business/item/SpProductCard/types'
```

### 3. 功能验证

- ✅ 商品列表页正常显示
- ✅ 商品卡片样式正常
- ✅ 商品交互功能正常

## 注意事项

### 1. Nuxt 自动导入

组件名仍然是 `SpProductCard`（不会变成 `ItemSpProductCard`），因为配置了 `pathPrefix: false`。

### 2. 类型导入

类型需要**手动导入**，路径已更新为新位置：

```typescript
import type { IProduct } from '~/components/business/item/SpProductCard/types'
```

### 3. 缓存清理

移动组件后建议清理缓存：

```bash
rm -rf .nuxt
pnpm run dev
```

## 后续优化建议

### 1. 考虑统一命名

目前有两个商品卡片组件：
- `ItemCard` - 简单版
- `SpProductCard` - 完整版

**建议**:
```
business/item/
  ├── ProductCard/          # 重命名为 ProductCard（基础版）
  ├── ProductCardDetail/    # 重命名为 ProductCardDetail（详细版）
  └── ItemFilter/
```

### 2. 考虑合并组件

如果 `ItemCard` 和 `SpProductCard` 功能接近，可以考虑：
- 合并为一个组件
- 通过 props 控制显示级别（`variant: 'simple' | 'detailed'`）

### 3. 添加组件文档

在 `SpProductCard/` 目录下添加 `README.md`，说明：
- 组件用途
- Props 说明
- 使用示例
- 与 ItemCard 的区别

## 相关文件

- `app/components/business/item/SpProductCard/` - 组件位置
- `app/components/business/item/index.ts` - 模块导出
- `app/components/business/README.md` - 模块文档
- `app/pages/item/list.vue` - 使用示例

## 总结

### 重构前
- ❌ 商品组件分散在不同位置
- ❌ 模块边界不清晰
- ❌ 难以统一管理

### 重构后
- ✅ 所有商品组件集中在 `business/item/`
- ✅ 模块边界清晰
- ✅ 便于维护和扩展
- ✅ 符合业务模块划分原则

---

**重构日期**: 2025-01-09  
**重构人员**: AI Assistant  
**影响范围**: 3个文件的导入路径  
**状态**: ✅ 已完成

