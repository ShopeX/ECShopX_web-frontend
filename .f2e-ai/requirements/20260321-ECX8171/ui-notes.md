# UI Notes — 20260321-ECX8171 物流详情组件

> Figma MCP 拉取成功，已获取 PC / H5 对应节点的结构信息与截图上下文。
> 设计稿来源：
> - PC：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2307-5536
> - H5：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2955-11931

---

## 设计节点

| 端 | fileKey | nodeId |
|----|---------|--------|
| PC | `clySPKbja8yL0BQnFke6oi` | `2307:5536` |
| H5 | `clySPKbja8yL0BQnFke6oi` | `2955:11931` |

---

## 现有接入场景

基于当前代码，已经存在两个明确的物流查看入口 / 展示场景：

| 场景 | 现状 | 文件 |
|------|------|------|
| 订单列表页“查看物流”按钮 | 已有按钮与 `viewLogistics(orderId)` 占位逻辑，尚未实现 | `app/pages/account/orders/index.vue` / `app/composables/useOrders.ts` |
| 订单详情页物流区块 / 查看物流动作 | 已有 `OrderDetailLogistics.vue` 展示区块与 `logistics` 动作入口 | `app/pages/account/orders/[id].vue` / `app/pages/account/components/OrderDetailLogistics.vue` / `app/pages/account/components/OrderDetailActions.vue` |

这两个场景可以作为“多个页面 / 场景复用”的第一批落地点。

---

## 视觉结构拆解

### 通用内容结构

1. 顶部标题栏：标题“物流详情” + 右上角关闭按钮
2. 信息区：
   - 快递单号
   - 单号右侧复制图标
   - 物流公司
3. 轨迹区：
   - 浅灰背景容器
   - 纵向时间线
   - 每个节点包含时间与物流描述
   - 最新状态在顶部，视觉强调更强
4. 底部操作区：
   - 全宽主按钮“关闭”

### PC 端形态

- 黑色半透明遮罩
- 右侧白色抽屉面板
- 抽屉宽度约 `560px`
- 内容区与底部按钮留有稳定内边距

### H5 端形态

- 黑色半透明遮罩
- 底部白色弹层
- 顶部圆角
- 内容纵向滚动，底部保留全宽关闭按钮

---

## 与现有组件的关系

### 现有可复用基础

| 组件 | 文件 | 当前职责 |
|------|------|---------|
| `OrderDetailLogistics.vue` | `app/pages/account/components/OrderDetailLogistics.vue` | 已承载“物流轨迹列表”展示，但形态更接近详情页内嵌区块 |
| `OrderDetailActions.vue` | `app/pages/account/components/OrderDetailActions.vue` | 已提供 `logistics` 事件入口 |

### UI 侧改造建议

更合适的方向是将现有物流展示拆成两层：

1. **物流详情内容组件**
   - 负责标题、单号、物流公司、轨迹列表、关闭按钮
   - 纯展示 + 事件透出
2. **物流详情容器组件**
   - PC 负责右侧抽屉外壳
   - H5 负责底部弹层外壳
   - 控制打开 / 关闭、遮罩、滚动锁定等行为

这样可以避免把现有 `OrderDetailLogistics.vue` 直接硬改成某一个页面专属实现。

---

## 页面路由 / 容器建议

| 场景 | 文件建议 | 说明 |
|------|---------|------|
| 订单列表页触发物流详情 | `app/pages/account/orders/index.vue` | 点击“查看物流”后打开通用物流详情容器 |
| 订单详情页触发物流详情 | `app/pages/account/orders/[id].vue` | 保留当前详情页物流区块，或改为点击按钮后统一打开物流详情容器 |

若产品不要求详情页内嵌区块常驻展示，可进一步统一成“点击后打开弹层 / 抽屉”的单一交互。

---

## 待确认的 UI 细节

- 订单详情页是否保留现有页面内嵌物流区块，同时再提供弹层 / 抽屉查看
- 复制快递单号后是否需要 toast 文案
- PC 抽屉与 H5 弹层是否允许轨迹列表独立滚动
- 关闭方式是否统一支持：右上角关闭、遮罩关闭、底部按钮关闭
