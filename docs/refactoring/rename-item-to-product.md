# 商品模块重命名：item → product

## 重构动机

将商品模块从 `item` 重命名为 `product`，同时将 `SpProductCard` 简化为 `ProductCard`，使命名更加规范和直观。

## 重构内容

### 1. 目录重命名

**重构前**:
```
~/components/business/item/
  ├── SpProductCard/
  │   ├── index.vue
  │   ├── index.ts
  │   └── types.ts
  ├── ItemCard.vue
  └── ItemFilter/
```

**重构后**:
```
~/components/business/product/
  ├── ProductCard/          ✅ 从 SpProductCard 重命名
  │   ├── index.vue
  │   ├── index.ts
  │   └── types.ts
  ├── ItemCard.vue          ✅ 保留用于兼容
  └── ItemFilter/
```

### 2. 组件命名变化

| 原组件名 | 新组件名 | 说明 |
|---------|---------|------|
| `SpProductCard` | `ProductCard` | ✅ 简化命名，更直观 |
| `ItemCard` | `ItemCard` | ✅ 保留，用于简单场景 |
| `ItemFilter` | `ItemFilter` | ✅ 保留，命名合理 |

### 3. 导入路径变化

| 文件 | 原路径 | 新路径 |
|------|-------|-------|
| 类型导入 | `~/components/business/item/SpProductCard/types` | `~/components/business/product/ProductCard/types` |
| 组件使用 | `<SpProductCard />` | `<ProductCard />` |

### 4. 更新的文件

#### 组件使用（1个文件）

**`app/pages/item/list.vue`**:
```vue
<!-- 修改前 -->
<script setup>
import type { IProduct } from '~/components/business/item/SpProductCard/types'
</script>

<template>
  <SpProductCard :product="product" />
</template>

<!-- 修改后 -->
<script setup>
import type { IProduct } from '~/components/business/product/ProductCard/types'
</script>

<template>
  <ProductCard :product="product" />
</template>
```

#### Composables（1个文件）

**`app/composables/useProduct.ts`**:
```typescript
// 修改前
import type { IProduct } from '~/components/business/item/SpProductCard/types'

// 修改后
import type { IProduct } from '~/components/business/product/ProductCard/types'
```

#### Transformers（1个文件）

**`app/infrastructure/transformers/productTransformer.ts`**:
```typescript
// 修改前
import type { IProduct } from '~/components/business/item/SpProductCard/types'

// 修改后
import type { IProduct } from '~/components/business/product/ProductCard/types'
```

#### 模块导出（1个文件）

**`app/components/business/product/index.ts`**:
```typescript
/**
 * Product 模块统一导出
 */

export { default as ProductCard } from './ProductCard/index.vue'
export { default as ItemCard } from './ItemCard.vue'
export { default as ItemFilter } from './ItemFilter/ItemFilter.vue'

// 兼容旧名称（渐进式迁移）
export { default as SpProductCard } from './ProductCard/index.vue'
```

## 命名对比

### 重构前的问题

1. **`item` vs `product`**
   - ❌ `item` 在电商领域不够明确
   - ❌ 可能与"商品项"（cart item）混淆

2. **`SpProductCard`**
   - ❌ `Sp` 前缀含义不明
   - ❌ 命名冗长
   - ❌ 与 `ProductCard` 的关系不清晰

### 重构后的优势

1. **`product` 模块**
   - ✅ 电商领域通用命名
   - ✅ 语义清晰明确
   - ✅ 与 `ProductCard` 自然对应

2. **`ProductCard`**
   - ✅ 简洁直观
   - ✅ 符合前端组件命名惯例
   - ✅ 易于理解和使用

## 兼容性

### 渐进式迁移

在 `product/index.ts` 中保留了旧名称的导出：

```typescript
// 兼容旧名称
export { default as SpProductCard } from './ProductCard/index.vue'
```

**优点**:
- ✅ 不会立即破坏现有代码
- ✅ 允许逐步迁移
- ✅ 降低重构风险

**建议**:
- 新代码使用 `ProductCard`
- 旧代码逐步迁移
- 未来版本移除兼容导出

## Nuxt 自动导入

### 组件自动导入

由于配置了 `pattern: '**/*.vue'`，Nuxt 会自动识别：

```
~/components/business/product/ProductCard/index.vue 
→ <ProductCard />
```

**注意**: 
- ✅ 组件名基于**目录名**（`ProductCard`），不是文件名（`index.vue`）
- ✅ 自动全局可用，无需手动导入
- ✅ 重启开发服务器后生效

### 类型导入

类型需要**手动导入**，路径已更新：

```typescript
import type { IProduct } from '~/components/business/product/ProductCard/types'
```

## 目录结构对比

### 重构前

```
~/components/business/
├── auth/
├── cart/
└── item/              ❌ 命名不够明确
    ├── SpProductCard/ ❌ Sp 前缀含义不明
    ├── ItemCard.vue
    └── ItemFilter/
```

### 重构后

```
~/components/business/
├── auth/
├── cart/
└── product/           ✅ 语义清晰
    ├── ProductCard/   ✅ 命名简洁直观
    ├── ItemCard.vue   ✅ 保留用于兼容
    └── ItemFilter/
```

## 验证步骤

### 1. 清理缓存

```bash
rm -rf .nuxt
```

### 2. 重启开发服务器

```bash
pnpm run dev
```

### 3. 测试页面

访问以下页面，确认组件正常工作：

- ✅ `/item/list` - 商品列表页（使用 ProductCard）
- ✅ 商品卡片正常显示
- ✅ 商品交互功能正常
- ✅ 无组件解析警告

### 4. 检查控制台

浏览器控制台应该：
- ✅ 无组件解析错误
- ✅ 无类型错误
- ✅ 所有功能正常

## 最佳实践建议

### 1. 模块命名

```
✅ 使用领域通用术语
  - product（商品）
  - cart（购物车）
  - user（用户）
  - order（订单）

❌ 避免模糊或技术性名称
  - item（不够具体）
  - data（太宽泛）
  - component（无意义）
```

### 2. 组件命名

```
✅ 简洁明了
  - ProductCard
  - UserAvatar
  - OrderList

❌ 避免冗余前缀
  - SpProductCard（Sp 无意义）
  - AppUserAvatar（App 冗余）
  - TheOrderList（The 不必要）
```

### 3. 文件组织

```
✅ 按业务模块组织
  components/business/product/
  components/business/cart/

✅ 复杂组件使用目录
  ProductCard/
    ├── index.vue
    ├── types.ts
    └── composables/

✅ 简单组件使用单文件
  ItemCard.vue
```

## 相关文档

- [商品模块文档](../../app/components/business/README.md)
- [组件自动导入配置](../fixes/nuxt-component-auto-import-final.md)
- [SpProductCard 移动重构](./move-spproductcard-to-business-item.md)

## 总结

### 重构前的问题
- ❌ `item` 命名不够明确
- ❌ `SpProductCard` 命名冗长
- ❌ 语义不清晰

### 重构后的改进
- ✅ `product` 语义清晰
- ✅ `ProductCard` 简洁直观
- ✅ 符合前端命名规范
- ✅ 保留兼容性支持

### 影响范围
- 📝 4个文件的导入路径更新
- 📝 1个组件使用更新
- 📝 文档更新

---

**重构日期**: 2025-01-09  
**重构人员**: AI Assistant  
**状态**: ✅ 已完成

