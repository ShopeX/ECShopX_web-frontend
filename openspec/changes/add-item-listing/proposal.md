# 添加商品列表功能页（基于 Figma 设计 + Apifox MCP API）

## Why

用户需要浏览和搜索商品的功能页面，这是电商系统的核心功能之一。商品列表页需要提供现代化的商品展示、智能筛选、精准排序和流畅分页功能，为用户提供卓越的商品发现体验。

基于 Figma 设计规范和 Apifox MCP 的真实 API 数据结构，实现符合 ECshopx PC 端设计系统的商品列表页面。

## What Changes

- **UI 设计对标**: 参考 Figma 设计 (ECshopx PC 端) 实现现代化商品列表界面
- **API 集成**: 集成 Apifox MCP 提供的 `/goods/items` 真实 API
- **商品展示**: 支持响应式网格布局，展示商品图片、标题、价格、销量、会员价等信息
- **智能筛选**: 支持品牌、价格区间、分类、排序等多维度筛选功能
- **性能优化**: 支持分页加载、无限滚动和服务端渲染（SSR）
- **状态管理**: URL 查询参数同步，支持书签分享和浏览器导航
- **数据转换**: 实现 API 数据到前端组件的完整转换链路

**设计参考**:

- Figma 设计: https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端?node-id=1119-32&t=92QP5EQXJel12ZF2-4
- API 数据源: Apifox MCP `/goods/items`

## Impact

- **Affected specs**: `item-display` (新增)
- **Affected code**:
  - `app/pages/item/list.vue` - 商品列表页面（Figma 设计实现）
  - `app/components/business/ItemFilter.vue` - 筛选组件（响应式设计）
  - `app/components/SpProductCard/` - 商品卡片组件（现代化设计）
  - `app/api/item.ts` - 商品 API（Apifox MCP 集成）
  - `app/types/api/item.ts` - 类型定义（真实 API 数据结构）
  - `app/transformers/` - 数据转换器（API 响应处理）
- **Dependencies**: Apifox MCP 连接器
