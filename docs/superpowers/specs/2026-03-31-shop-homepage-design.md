# 店铺首页设计文档

**日期：** 2026-03-31
**场景：** BBC（B2B2C）商城端 — 分销商/店铺独立首页

---

## 背景

平台支持 BBC 模式，每个分销商（distributor）拥有独立的店铺。现有商品 API 支持通过 `distributor_id` 参数过滤返回对应店铺的数据。需要创建店铺首页页面，风格与平台主页 `index.vue` 保持一致。

---

## 路由

```
/shop/[id]
```

- `id` 即 `distributor_id`，数字类型
- 例：`/shop/12345`

---

## 页面结构

与平台主页 `index.vue` 完全一致：

1. **Hero Banner** — 静态 fallback 数据（暂不对接模板装修 API，后续统一改造）
2. **热门商品** — 该店铺前 4 个商品（传 `distributor_id`）
3. **新品推荐** — 该店铺第 5~12 个商品（传 `distributor_id`）
4. **品牌资讯** — 静态 mock 数据（与 index.vue 相同）

---

## 架构与数据流

```
/shop/[id].vue
  ├── route.params.id → distributorId
  ├── useHomeData(distributorId)
  │     └── loadProducts({ distributor_id: distributorId, ... })
  └── 渲染（复用 index.vue 相同组件）
        WCHeroBanner / BCProductCard / BCNewsCard
```

---

## 改动文件清单

### 1. `app/infrastructure/http/clients/ItemApiClient.ts`

`IItemListParams` 接口增加可选字段：

```ts
distributor_id?: string
```

`getItemList` 方法中透传该参数：

```ts
...(params.distributor_id && { distributor_id: params.distributor_id }),
```

### 2. `app/composables/useHomeData.ts`

`useHomeData` 接受可选参数 `distributorId`：

```ts
export function useHomeData(distributorId?: string) {
  // loadProducts 调用时加入 distributor_id
}
```

`index.vue` 调用时不传参，行为零变化。

### 3. `app/pages/shop/[id].vue`（新建）

- 从 `route.params.id` 取 `distributorId`
- 调用 `useHomeData(distributorId)`
- 模板结构与 `index.vue` 一致
- Hero Banner 使用静态 fallback（不调用 templateApiClient）

---

## 约束

- `index.vue` 零改动，`useHomeData()` 不传参时行为完全不变
- `TemplateApiClient` 本次不涉及，店铺 Banner 用静态 fallback，后续模板装修时统一改造
- 复用现有组件：`WCHeroBanner`、`BCProductCard`、`BCNewsCard`、`ECButton`
