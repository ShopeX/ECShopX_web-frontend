# 商品详情页

## 背景

商品详情页（`/products/[id]`）是购物流程的核心页面，展示商品图片、规格选择、价格等信息。当前页面已有完整功能，本次优化目标是：**i18n 国际化 + 代码规范化**。

## 设计参考

- **PC 端**：[Figma node-id=1731-401](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=1731-401)
- **H5 端**：[Figma node-id=2869-32112](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2869-32112)

## 现有功能模块

| 模块 | PC 端 | H5 端 |
|------|-------|-------|
| 图片展示 | 左侧缩略图导航 + 主图 | 滑动切换 + 指示点 |
| 商品信息 | 标题、价格、收藏按钮 | ✅ |
| 规格选择 | 图片规格 / 文字规格选择器 | ✅ |
| 操作按钮 | 内嵌在详情区 | 底部固定栏 |
| 手风琴详情 | 商品详情、可配信息 | ✅ |
| 推荐商品 | 推荐区域 | ✅ |

## 验收标准（AC）

### AC1：i18n 国际化

- [ ] 所有硬编码中文使用 `$t()` 国际化
- [ ] 支持 zh-CN / en-US / ar 三种语言
- [ ] RTL 布局适配（阿拉伯语）

### AC2：状态文案

- [ ] 加载状态：`加载中...` → `$t('product.loading')`
- [ ] 错误状态：`加载商品详情失败` → `$t('product.loadError')`
- [ ] 商品不存在：`商品不存在` → `$t('product.notFound')`
- [ ] 返回按钮：`返回` → `$t('common.back')`

### AC3：操作按钮

- [ ] 加入购物袋：`加入购物袋` / `加入中...` → `$t('product.addToCart')` / `$t('product.adding')`
- [ ] 立即购买：`立即购买` → `$t('product.buyNow')`

### AC4：手风琴详情

- [ ] 商品详情：`商品详情` → `$t('product.details')`
- [ ] 可配信息：`可配信息` → `$t('product.deliveryInfo')`

## i18n 文案 Keys

| Key | 中文 | English | العربية |
|-----|------|---------|---------|
| `product.loading` | 加载中... | Loading... | جاري التحميل... |
| `product.loadError` | 加载商品详情失败 | Failed to load product | فشل تحميل المنتج |
| `product.notFound` | 商品不存在 | Product not found | المنتج غير موجود |
| `product.addToCart` | 加入购物袋 | Add to Bag | أضف إلى الحقيبة |
| `product.adding` | 加入中... | Adding... | جاري الإضافة... |
| `product.buyNow` | 立即购买 | Buy Now | اشترِ الآن |
| `product.details` | 商品详情 | Product Details | تفاصيل المنتج |
| `product.deliveryInfo` | 可配信息 | Delivery Info | معلومات التوصيل |
| `product.recommendations` | 推荐商品 | Recommendations | منتجات مقترحة |
| `common.back` | 返回 | Back | رجوع |

## 测试点

### Happy Path

1. 访问商品详情页 → 显示商品信息
2. 切换规格 → 更新价格和库存
3. 点击加入购物袋 → 加入成功提示
4. 点击立即购买 → 跳转结算页

### 响应式测试

1. PC 端（≥1024px）→ 左侧缩略图 + 右侧详情
2. H5 端（<1024px）→ 全屏图片滑动 + 底部操作栏

## 技术备注

- **页面**：`app/pages/products/[id].vue`
- **Composable**：`useProduct`（已有）
- **响应式断点**：`lg:` (1024px) 区分 PC/H5
- **RTL**：使用 `ms-` / `me-` / `start-` / `end-` 替代 `ml-` / `mr-`
