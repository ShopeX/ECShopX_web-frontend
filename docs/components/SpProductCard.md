# SpProductCard 商品卡片组件

## 概述

`SpProductCard` 是基于 Figma 设计创建的商品卡片组件，用于在商品列表中展示商品信息。组件采用简洁的设计风格，支持商品图片、名称、价格等基本信息展示。

## 设计特性

- ✅ 基于 Figma 设计规范
- ✅ 响应式布局适配
- ✅ 悬停动画效果
- ✅ 支持多种价格类型（原价、活动价、会员价）
- ✅ 图片懒加载和错误处理
- ✅ 使用项目 sp- 前缀样式规范

## 基本用法

### 在页面中使用

```vue
<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    <SpProductCard
      v-for="product in products"
      :key="product.itemId"
      :product="product"
      :show-member-price="true"
      :show-sales="false"
    />
  </div>
</template>

<script setup lang="ts">
import type { IProduct } from '~/types/product'

const products: IProduct[] = [
  // 商品数据
]
</script>
```

## Props 属性

| 属性名            | 类型       | 默认值  | 说明               |
| ----------------- | ---------- | ------- | ------------------ |
| `product`         | `IProduct` | 必填    | 商品数据对象       |
| `showMemberPrice` | `boolean`  | `true`  | 是否显示会员价标签 |
| `showSales`       | `boolean`  | `false` | 是否显示销量信息   |

## 商品数据结构

组件使用 `IProduct` 接口，主要字段包括：

```typescript
interface IProduct {
  itemId: string // 商品ID
  itemName: string // 商品名称
  img: string // 主图URL
  imgs: string[] // 图片列表
  price: number // 原价（元）
  activityPrice: number // 活动价（元）
  memberPrice: number // 会员价（元）
  sales: number // 销量
  // ... 其他字段
}
```

## 价格显示逻辑

组件按以下优先级显示价格：

1. **活动价** - 如果存在且大于0，优先显示
2. **会员价** - 如果启用会员价显示且存在
3. **原价** - 默认价格

当显示优惠价格时，会同时显示原价并加删除线。

## 样式定制

### 使用 sp- 前缀类名

组件使用项目规范的 `sp-` 前缀类名：

- `.sp-product-card` - 卡片容器
- `.sp-product-image` - 图片区域
- `.sp-product-info` - 信息区域
- `.sp-product-title` - 商品标题
- `.sp-product-price` - 价格区域
- `.sp-member-badge` - 会员价标签
- `.sp-activity-badge` - 活动价标签

### 响应式设计

- **移动端** (< 640px): 紧凑布局，较小字体
- **桌面端** (≥ 768px): 悬停动画效果

## 功能特性

### 图片处理

- 支持懒加载 (`loading="lazy"`)
- 图片加载失败时显示占位图
- 悬停时图片缩放效果

### 价格标签

- 会员价标签（红色）
- 活动价标签（橙色）
- 自动判断是否显示

### 交互效果

- 悬停时卡片上浮
- 图片缩放动画
- 平滑过渡效果

## 在商品列表中使用

结合现有的商品列表页面：

```vue
<!-- app/pages/item/list.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 商品网格 -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <SpProductCard
        v-for="item in items"
        :key="item.itemId"
        :product="item"
        :show-member-price="true"
      />
    </div>
  </div>
</template>
```

## 注意事项

1. **图片资源**: 确保商品图片URL有效，组件会自动处理加载失败的情况
2. **价格单位**: 组件显示美元价格格式，如需要人民币可修改 `formatPrice` 函数
3. **路由链接**: 点击卡片会跳转到 `/item/{itemId}` 页面
4. **性能优化**: 使用图片懒加载，适合大量商品列表展示

## 更新记录

- **v1.0.0** - 初始版本，基于 Figma 设计创建
- 支持基本商品信息展示
- 响应式布局和交互动画
- 多价格类型支持
