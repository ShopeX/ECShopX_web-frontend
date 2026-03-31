# BCShopHeader 店铺首页 Header 组件设计文档

**日期：** 2026-03-31
**Figma：** https://www.figma.com/design/ixUbMD4w9ovN2KJJn3I2P0/BBC-PC端?node-id=5018-4014
**全页参考：** https://www.figma.com/design/ixUbMD4w9ovN2KJJn3I2P0/BBC-PC端?node-id=5019-4142

---

## 背景

BBC 模式下，店铺首页、商品列表页、商品详情页需要在平台 `BCHeaderBar` 下方展示店铺专属 Header，包含店铺信息、搜索框、分类导航、关注/联系按钮。

---

## 使用页面

| 页面 | 路由 |
|------|------|
| 店铺首页 | `/shop/[id]` |
| 店铺商品列表 | `/shop/[id]/items` |
| 商品详情（带店铺上下文） | `/products/[id]`（通过 query 携带 distributor_id） |

---

## 文件结构

```
app/components/BCShopHeader/
  BCShopHeader.vue      # 主组件（PC优先，H5预留）
  types.ts              # Props / Emits 类型定义

app/pages/shop/[id]/
  items.vue             # 店铺商品列表页（新建，复用 collections/[id].vue 逻辑）
```

---

## Props & Emits

```ts
// types.ts
export interface BCShopHeaderProps {
  distributorId: string   // 店铺ID，用于搜索跳转路由
  logo: string            // 店铺 Logo 图片 URL
  name: string            // 店铺名称
  tagline: string         // 店铺描述文案
  categories: string[]    // 分类导航列表（暂静态传入）
  followed?: boolean      // 初始关注状态，默认 false
}

export interface BCShopHeaderEmits {
  follow: [isFollowed: boolean]   // 关注/取消关注，携带最新状态
  contact: []                     // 联系客服点击
}
```

---

## 视觉规格（来自 Figma）

| 区域 | 规格 |
|------|------|
| 容器背景 | `#f6f6f6`，全宽，`px-[16px] py-[24px]` |
| 内容区 | `max-w full flex items-center justify-between` |
| 左：Logo | 36×36px 图片 |
| 左：店铺名 | 14px Medium `#191A1D` |
| 左：描述 | 12px Regular `#99A1AF` |
| 中：搜索框 | 500px 宽，白底，`border #E5E7EB`，高 40px |
| 中：搜索占位 | 14px Regular `#99A1AF` |
| 中："搜本店"按钮 | 背景 `#E5E7EB`，12px `#4A5565` |
| 中：分类导航 | 12px Regular `#4A5565`，`gap-[16px]` |
| 右："关注店铺" | 边框 `#0F0F10`，内含 ♡ icon + 文字 |
| 右："已关注" | 填充 `#0F0F10`，白色文字，✓ icon |
| 右："联系客服" | 填充 `#0F0F10`，白色文字，耳机 icon |

---

## 交互逻辑

### 搜索

```
用户按回车 / 点击"搜本店"
  ↓
当前路由 === /shop/[distributorId]/items
  → router.replace({ query: { ...currentQuery, q: keyword } })   // 页内刷新
其他路由
  → router.push(`/shop/${distributorId}/items?q=${keyword}`)      // 跳转
```

### 关注按钮

```
本地 isFollowed ref（初始值来自 props.followed）
点击切换 → isFollowed = !isFollowed → emit('follow', isFollowed)
未关注：边框按钮，♡ icon，文字"关注店铺"
已关注：填充深色，✓ icon，文字"已关注"
```

### 联系客服

```
点击 → emit('contact')
```

---

## H5 预留

- PC 布局块包裹 `class="hidden lg:block"` 或用响应式类区分
- H5 UI 后续设计到位后在同文件补充移动端区块
- 不引入额外抽象，H5 布局在同一 `.vue` 文件内用响应式 Tailwind 类处理

---

## 新增路由页面

### `app/pages/shop/[id]/items.vue`

- 店铺商品列表页，URL: `/shop/[id]/items?q=xxx`
- 复用 `useHomeData(distributorId)` 加载商品
- 接收 `q` query param 做关键词过滤（透传给商品 API）
- 包含 `BCShopHeader`（当前页，搜索走 `router.replace`）

---

## 测试策略

沿用项目 `node:test` 静态源码断言风格：

```
app/components/BCShopHeader/shop-header.test.js
```

验证项：
- `BCShopHeaderProps` 中存在 `distributorId`、`logo`、`name`、`tagline`、`categories`、`followed`
- 模板中存在 `data-testid="shop-header"`、`data-testid="shop-header-search"`、`data-testid="shop-header-follow"`、`data-testid="shop-header-contact"`
- emit 声明包含 `follow` 和 `contact`

---

## 集成方式（shop/[id].vue）

```vue
<BCHeaderBar ... />
<BCShopHeader
  :distributor-id="distributorId"
  :logo="shopInfo.logo"
  :name="shopInfo.name"
  :tagline="shopInfo.tagline"
  :categories="shopInfo.categories"
  :followed="shopInfo.followed"
  @follow="onFollow"
  @contact="onContact"
/>
<!-- 店铺内容 -->
```

`shopInfo` 暂用静态 mock，后续对接 API 时由父页面传入。

---

## 约束

- 不改动 `BCHeaderBar`
- 不改动 `index.vue`（平台主页）
- 搜索不依赖新 API，使用已有商品列表 API 加 `keywords` 参数
- `items.vue` 暂用 mock 数据，不实现完整筛选 UI（那是单独的需求）
