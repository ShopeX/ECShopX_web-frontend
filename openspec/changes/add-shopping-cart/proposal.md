# 购物车功能提案

## Why

ECSHOPX Web 目前支持商品展示和浏览，但缺少购物车功能。用户无法将商品添加到购物车中进行批量管理和结算，这是电商平台的核心功能缺失。

## What Changes

- 添加购物车数据管理能力（增、删、改、查）
- 创建购物车组件和页面，支持商品列表展示和数量管理
- 实现购物车状态持久化（本地存储）
- 在商品展示组件中添加"加入购物车"功能
- 添加购物车图标显示商品数量
- 支持购物车商品的价格计算和优惠券应用
- 提供清空购物车和批量删除功能

## Impact

- 影响规格: shopping-cart（新增）
- 影响代码:
  - 新增 `types/api/cart.ts` - 购物车相关类型定义
  - 新增 `stores/cart.ts` - 购物车状态管理
  - 新增 `composables/useCart.ts` - 购物车操作逻辑
  - 新增 `pages/cart/index.vue` - 购物车页面
  - 新增 `components/business/CartItem.vue` - 购物车商品项组件
  - 修改 `components/SpProductCard/main.vue` - 添加购物车按钮
  - 修改 `components/TopBar.vue` - 显示购物车商品数量
  - 修改 `components/SpNavbar.vue` - 更新购物车导航
