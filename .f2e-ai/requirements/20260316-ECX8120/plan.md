# ECX-8120 我的收藏页 开发计划

## 与 handbook 对齐

- **技术栈**：Nuxt 4 + Vue 3 + TypeScript，Tailwind，`~/` 别名；页面在 `app/pages/account/`，组件在 `app/pages/account/components/` 或 `app/components/`。
- **HTTP**：仅通过 `app/infrastructure/http/clients` 的 ApiClient 发请求；数据转换用 `app/infrastructure/transformers`；全局参数 `company_id` / `country_code` 由 `plugins/http.ts` 自动注入。
- **E2E**：Playwright，`testIdAttribute: 'data-testid'`；页面容器、FilterBar、列表、卡片、空状态使用与 `test.spec.ts` 一致的 `data-testid`。
- **命名**：ApiClient 为 `XxxApiClient.ts`，transformers 为 `xxxTransformer.ts`；composables 为 `useXxx.ts`；页面 `<script setup lang="ts">`，Props 小驼峰。
- **样式**：Tailwind 优先，颜色/间距与 `ui-notes.md`、Figma H5 节点 2956:19198 一致（#191a1d、#0f0f10、#f6f6f6、16px 水平 padding 等）。
- **UI 还原**：布局与样式以 Figma H5 节点为准，实现时通过 Figma MCP（如 `get_design_context`）核对尺寸、间距、字体、颜色。

---

## 1. 目标与范围

- 实现 **H5 端**「我的收藏」列表页：路由 `/account/favorites`，本需求仅交付 H5/移动端布局与展示。
- 能力：展示收藏商品列表；数据来自 `GET /wxapp/member/collect/item`；两列网格、FilterBar「我的收藏」、空状态；**不实现**移出收藏、加购等操作。
- 验收：与 `.f2e-ai/requirements/20260316-ECX8120/test.spec.ts` 及 `requirement.md` 验收标准一致。

---

## 2. 接口与数据

### 2.1 接口

- **需求约定**：`GET /wxapp/member/collect/item`（见 `api-notes.md`）。
- **现状**：项目中无 collect 相关 ApiClient。
- **动作**：
  - 在 `app/infrastructure/http/clients/` 下新增 `CollectApiClient.ts`（或 `MemberCollectApiClient.ts`），提供方法如 `getCollectItemList(params?)`，请求 `GET /wxapp/member/collect/item`；查询参数（分页、每页条数等）以 Apifox 文档为准，首屏可先不传或传默认值。
  - 在 `app/infrastructure/transformers/` 下新增 `collectItemTransformer.ts`（或 `favoriteProductTransformer.ts`），将接口列表项转为前端模型（至少含 id、name、price、image 等，与 `FavoriteProductCard` 所需字段及 ui-notes 对齐）；若 Apifox 响应体未拉取到，实现时按后端实际字段做映射并在代码中注释说明。
  - 在 `app/infrastructure/transformers/index.ts` 中导出新 transformer（若项目有统一导出习惯）。

### 2.2 类型

- 在 `app/types/` 下新增或扩展类型：如 `ICollectItemApiResponse`、前端列表项模型（如 `IFavoriteProduct`），与现有 `FavoriteProductCard` 的 Product 接口兼容。

---

## 3. 页面与布局（H5）

**UI 还原约定**：布局与样式以 Figma H5 节点 2956:19198 及 ui-notes 为准；实现时通过 Figma MCP 核对 FilterBar、卡片、间距等。

### 3.1 页面文件

- **文件**：`app/pages/account/favorites.vue`。
- **动作**：
  - 根容器增加 `data-testid="account-favorites-page"`。
  - 使用 `useAsyncData` / `useFetch` 调用 CollectApiClient 的 `getCollectItemList`，经 transformer 得到列表数据；替换当前硬编码的 `products` 模拟数据。
  - 增加 H5 专用布局：在移动端 viewport（如宽度 ≤768px 或 375 逻辑宽度）下，不展示左侧 `AccountMenu` 或改为抽屉/顶部返回（与 account 其他 H5 页一致）；主区域为：FilterBar（标题「我的收藏」+ 下拉箭头，与 ui-notes 一致）+ 两列网格列表 + 空状态。
  - 可通过媒体查询或 `useMediaQuery` 等区分：小屏用 H5 布局（两列、16px 水平 padding），大屏可保留现有 PC 布局或本需求仅保证 H5 正常（与需求「仅 H5」一致）。

### 3.2 FilterBar

- 标题「我的收藏」+ 下拉箭头（若设计稿有）；左右 padding 16px；容器设置 `data-testid="account-favorites-filter-bar"`。
- 样式与 ui-notes、Figma 节点 2956:19392 一致。

### 3.3 收藏列表

- 列表容器：`data-testid="account-favorites-list"`；两列网格，行内左右 16px padding，与设计稿一致。
- 单卡：使用现有 `FavoriteProductCard`，传入 transformer 产出之 product；**本需求不展示「移出收藏」**：通过为 `FavoriteProductCard` 增加 prop（如 `showRemoveButton?: boolean`，默认 true），在收藏页传入 `false`，卡片内不渲染该按钮。
- 每个卡片根元素或外层包裹设置 `data-testid="account-favorites-item"`；点击整卡或卡片内可点击区域时跳转商品详情（如 `/products/:id`），与 test.spec.ts 中「点击收藏卡片可进入商品详情」一致。

### 3.4 空状态

- 当列表长度为 0 时展示空状态；容器 `data-testid="account-favorites-empty"`；文案如「暂无收藏商品」或与 account 其他空状态统一。

---

## 4. 组件改动

### 4.1 FavoriteProductCard

- **文件**：`app/pages/account/components/FavoriteProductCard.vue`。
- **动作**：增加可选 prop `showRemoveButton`（默认 `true`）；当 `showRemoveButton === false` 时不渲染「移出收藏」按钮；保持现有样式与 Product 接口不变，便于后续需求接入移出收藏。

---

## 5. 验证与测试

- 本地 H5 viewport（375×667）访问 `/account/favorites`：有数据时两列列表可见、无数据时空状态可见、无「移出收藏」按钮、点击卡片可进详情。
- 运行 `.f2e-ai/requirements/20260316-ECX8120/test.spec.ts` 中用例（若 Playwright 配置支持从该目录运行，或复制到 `tests/e2e/` 后执行）：全部通过。
- 与 Figma H5 节点 2956:19198 对照：布局、间距、字体、颜色一致。

---

## 6. 与测试用例映射

| 测试用例 | 计划对应 |
|----------|----------|
| H5 我的收藏页可访问且布局正确 | §3.1 根容器与 data-testid；§3.2 FilterBar |
| 有数据时展示收藏列表（两列网格） | §2 接口与 transformer；§3.3 列表与 FavoriteProductCard |
| 无数据时展示空状态 | §3.4 空状态容器与文案 |
| 本需求不展示「移出收藏」按钮 | §4.1 FavoriteProductCard showRemoveButton=false |
| 点击收藏卡片可进入商品详情 | §3.3 卡片点击跳转 `/products/:id` |
