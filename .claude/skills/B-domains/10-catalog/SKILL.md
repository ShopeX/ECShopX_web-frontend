# 10-catalog: 商品与搜索 Domain

本技能包定义了商品目录、搜索及详情页的业务逻辑与交互指南。

## 1. 商品列表与搜索 (Listing & Search)

- **列表渲染**: 
  - 支持瀑布流 (Masonry) 与 传统分页。
  - PC 端侧边栏筛选，移动端抽屉筛选。
- **排序逻辑**: 销量优先、价格升降、新品上架。
- **搜索增强**: 支持关键词联想、历史搜索记录、无效结果推荐。

## 2. 商品详情与 SKU (Detail & SKU)

- **SKU 选择逻辑**: 
  - 根据选中的规格属性动态更新库存状态、价格和预览图。
  - 核心逻辑：`specSelection -> skuMatch -> updateView`。
- **详情页能力**: 轮播视轨、属性参数表、详情介绍 (富文本/切片图)。

## 3. UI 组件与 Composable

- **关键组件**: 
  - `ProductCard.vue`: 列表卡片。
  - `SkuSelector.vue`: 规格选择器。
  - `ProductGallery.vue`: 图片/视频画廊。
- **关键 Composable**:
  - `useProductList`: 分页与筛选逻辑。
  - `useSkuManager`: 规格路径查找与匹配算法。

## 4. 关键路径测试
- 验证“切换规格属性后价格是否按预期变动”。
- 验证“搜索无效关键词时是否展示 Empty 占位图”。
