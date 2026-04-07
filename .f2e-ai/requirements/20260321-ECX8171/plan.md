# 开发计划 — 20260321-ECX8171 物流详情组件

## 与 Handbook 对齐

| 约束 | 本计划的应用 |
|------|-------------|
| 页面与业务代码放在 `app/` | 所有实现仅改 `app/pages/account/**`、`app/composables/**`、`app/infrastructure/**`、`app/types/**` |
| 组件命名 PascalCase | 新增物流组件使用 PascalCase，放在 `app/pages/account/components/` |
| HTTP 请求走 ApiClient | 在 `OrderApiClient.ts` 中新增物流查询方法，不在页面中直接调用 `$api` |
| 数据转换放 transformer | 在 `orderTransformer.ts` 中新增物流轨迹转换，统一映射接口字段 |
| 样式使用 Tailwind | PC/H5 UI 还原全部使用现有 Tailwind 体系 |
| E2E 使用 `data-testid` | 所有新组件、关键按钮、容器、状态位补全稳定测试标识 |
| lint/format 按项目约定 | 执行后用项目命令兜底检查格式与关键测试 |

## 执行检查清单

- 文件放置是否符合 `app/` 目录约定
- 新增组件 / composable / client / transformer 是否按现有命名风格
- 是否复用现有订单详情与订单列表结构，而不是平行新建重复模块
- 是否补全 `data-testid`
- 是否只实现已确认范围：订单列表页 + 订单详情页 + PC/H5 双端物流详情组件

## 文件改动清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `app/pages/account/components/OrderLogisticsPanel.vue` | 通用物流详情内容组件，承载标题、单号、公司、时间线、关闭按钮 |
| `app/pages/account/components/OrderLogisticsDialog.vue` | 物流详情容器组件，负责 PC 抽屉 / H5 底部弹层、遮罩、开关态 |

### 修改文件

| 文件 | 改动内容 |
|------|---------|
| `app/infrastructure/http/clients/OrderApiClient.ts` | 新增 `getOrderLogistics(params)`，对接 `POST /wxapp/trackerpull` |
| `app/types/api/order.ts` | 新增物流查询响应类型与统一物流轨迹类型 |
| `app/infrastructure/transformers/orderTransformer.ts` | 新增 `toTrackerPullTraces()`，将 `AcceptTime` / `AcceptStation` 转为前端轨迹模型 |
| `app/composables/useOrders.ts` | 实现列表页 `viewLogistics(orderId)`，接入物流弹层状态与数据获取 |
| `app/composables/useOrderDetail.ts` | 实现详情页物流弹层状态与数据获取，复用同一套查询逻辑 |
| `app/pages/account/orders/index.vue` | 接入物流详情容器，补全触发按钮与 data-testid |
| `app/pages/account/orders/[id].vue` | 接入物流详情容器，保留现有详情页结构并补充物流查看触发 |
| `app/pages/account/components/OrderDetailLogistics.vue` | 仅做必要复用或保留内嵌物流区块，不把弹层逻辑塞进现有区块组件 |

## 详细步骤

### Step 1：补齐类型与 HTTP Client

- 在 `app/types/api/order.ts` 新增：
  - `IApiTrackerPullTrace`
  - `ITrackerPullResponse`
- 在 `app/infrastructure/http/clients/OrderApiClient.ts` 新增：
  - `getOrderLogistics({ orderId, orderType })`
- 请求方式按 Apifox 定义走 `POST /wxapp/trackerpull`
- 参数先按现有订单模块口径默认 `order_type: 'normal'`

验证：
- TypeScript 类型无明显冲突
- 请求方法、路径、query/header 对齐 Apifox

### Step 2：补齐物流轨迹转换

- 在 `app/infrastructure/transformers/orderTransformer.ts` 新增 `toTrackerPullTraces(raw)`
- 将接口字段映射为统一结构：
  - `AcceptTime -> time`
  - `AcceptStation -> content`
- 兼容空数组与无效值，保证组件侧拿到稳定数组

验证：
- 转换后结构可直接复用现有物流时间线展示逻辑
- 空轨迹时返回 `[]`

### Step 3：抽离通用物流详情容器与内容组件

- 新建 `OrderLogisticsPanel.vue`
  - 负责标题、关闭图标、快递单号、复制按钮、物流公司、轨迹区、底部关闭按钮
  - 补全 `data-testid`
- 新建 `OrderLogisticsDialog.vue`
  - PC 使用现有 Nuxt UI `USlideover` 或等效抽屉能力
  - H5 使用底部弹层结构
  - 统一承载 loading / empty / error / content 四类状态
- 以 Figma 为真值复核：
  - PC 节点 `2307:5536`
  - H5 节点 `2955:11931`

验证：
- PC 为右侧抽屉
- H5 为底部弹层
- 标题、文案、层级、关闭按钮、底部按钮与设计稿一致

### Step 4：在订单列表页接入复用入口

- 在 `app/composables/useOrders.ts` 实现：
  - 物流弹层开关状态
  - 当前选中订单 ID
  - 打开时调用 `getOrderLogistics`
- 在 `app/pages/account/orders/index.vue` 接入弹层组件
- 保持现有订单列表交互不回归

验证：
- 列表页点击“查看物流”可以打开物流详情
- 查询失败 / 空态可见，且可关闭

### Step 5：在订单详情页接入复用入口

- 在 `app/composables/useOrderDetail.ts` 增加与列表页一致的物流查询能力
- 在 `app/pages/account/orders/[id].vue` 接入同一套 `OrderLogisticsDialog`
- 现有 `OrderDetailLogistics.vue` 作为详情页内嵌区块可保留，弹层用于“查看物流”动作

验证：
- 详情页点击“查看物流”与列表页打开同一套组件
- 同一订单在两个入口展示的物流数据结构一致

### Step 6：补全复制、空态、失败态与测试标识

- 复制快递单号使用浏览器剪贴板 API
- 空轨迹展示空态文案
- 接口失败展示错误态文案和关闭操作
- 所有关键节点补全 `data-testid`

验证：
- 对齐 `TC-07`、`TC-08`、`TC-10`
- 不引入无测试标识的新关键交互

## 验证计划

1. `git diff --check`
2. 针对新增 / 修改文件执行 `pnpm exec prettier --check`
3. 运行与本需求相关的 Node 测试或页面级测试
4. 如本地 dev server 可用，使用 Playwright / 浏览器手测覆盖：
   - 列表页打开物流详情
   - 详情页打开物流详情
   - PC 抽屉 / H5 弹层
   - 复制、空态、失败态

## 风险与边界

- `order_type` 枚举未完全明确，先按现有订单场景默认 `normal`
- 本次不扩展到订单以外页面
- 不回写 `requirement.md`、`ui-notes.md`、`api-notes.md`
- 若联调发现接口口径与 Apifox 不一致，先修正对接层，不扩展 UI 范围
