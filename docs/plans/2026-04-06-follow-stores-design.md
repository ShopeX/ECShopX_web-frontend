# 关注店铺页面设计说明

## 目标

新增“关注店铺”页面，对接会员收藏店铺列表接口，按 Figma 完成 PC 页面，并补充可用的 H5 适配。

## 范围

- 新增账户中心页面路由：`/account/follow-stores`
- 对接接口：
  - `GET /wxapp/member/collect/distribution`
  - `DELETE /wxapp/member/collect/distribution`
- 新增账户中心左侧菜单项“关注店铺”
- 新增 H5 菜单项“关注店铺”
- 仅在 BBC 模式下展示“关注店铺”菜单入口
- 页面展示 loading / empty / error / list 四种状态

## BBC 模式约束

项目内 BBC 场景统一通过 `getBusinessMode() === 'b2b'` 判断。

因此：

- PC 左侧菜单中，“关注店铺”仅在 `b2b` 模式出现
- H5 过滤菜单中，“关注店铺”仅在 `b2b` 模式出现
- 页面路由本身可保留，但在非 `b2b` 模式下不应通过菜单暴露入口

## 页面结构

### PC

沿用 `default` layout 的站点头尾，仅新增账户中心内容区：

- 左侧：`AccountMenu`
- 右侧：页面标题“关注店铺”
- 主内容：店铺卡片列表

每张店铺卡片：

- 左侧店铺信息区
  - 店铺 logo
  - 店铺名称
  - 店铺标语/描述
  - “进入店铺”按钮
  - “联系客服”按钮
- 右侧商品预览区
  - 最多展示 4 个商品
  - 每个商品含图片、名称、价格

### H5

无对应 Figma，采用项目现有账户页模式适配：

- 顶部：`AccountH5FilterBar`
- 内容区：单列店铺卡片
- 卡片上半区展示店铺信息和操作按钮
- 卡片下半区使用 2 列商品网格

## 交互约定

- “进入店铺”跳转到 `/shop/{distributorId}`
- “联系客服”仅保留视觉按钮和占位事件，不接真实客服链路
- 本期不在页面上提供“取消关注”按钮
- 删除收藏店铺接口仅封装到 client，供后续扩展

## 数据方案

### API Client

新增店铺收藏 client，职责仅负责请求：

- `getCollectDistributionList(params?)`
- `removeCollectDistributions(distributionIds, isEmpty?)`

### Transformer

新增店铺收藏 transformer，把接口原始结构映射成页面模型。

推荐页面模型：

```ts
interface IFollowedStoreCard {
  id: string
  distributorId: string
  storeName: string
  slogan: string
  logo: string
  items: Array<{
    id: string
    itemId: string
    title: string
    image: string
    priceText: string
  }>
}
```

字段兼容策略：

- 店铺 ID：`distribution_id || distributor_id || id`
- 店铺名称：`store_name || shop_name || distributor_name || name`
- 店铺 logo：`logo || store_logo || logo_image || shop_logo`
- 店铺标语：`slogan || description || subtitle || intro`
- 商品列表：`items || item_infos || goods_list || list`
- 商品 ID：`item_id || goods_id || id`
- 商品名称：`item_name || name || title`
- 商品图片：`image || pic || image_default_id`
- 商品价格：`price || sale_price || sales_price || amount`

## 组件拆分

- 页面：`app/pages/account/follow-stores.vue`
- 组合式函数：`app/composables/useFollowedStores.ts`
- HTTP Client：`app/infrastructure/http/clients/CollectDistributionApiClient.ts`
- Transformer：`app/infrastructure/transformers/collectDistributionTransformer.ts`
- 页面卡片组件：`app/pages/account/components/FollowedStoreCard.vue`

## 菜单改动

需要同步以下入口逻辑：

- `app/pages/account/components/AccountMenu.vue`
- `app/pages/account/components/AccountH5FilterBar.vue`
- 各账户页内本地 `menuItems` 计算属性

注意统一抽取或统一追加规则，避免 PC / H5 / 各页面本地菜单再次分叉。

## 测试策略

新增测试覆盖：

- API client 是否请求正确路径和方法
- transformer 是否把店铺与商品字段映射正确
- 页面结构是否包含标题、列表、空态、H5 容器
- 菜单是否仅在 `b2b` 模式下出现“关注店铺”

## 风险

- Apifox 未在当前上下文中展开响应字段细节，transformer 需要做兼容解析
- 如果真实接口的商品预览字段和现有兼容集合不同，需要二次补齐映射
