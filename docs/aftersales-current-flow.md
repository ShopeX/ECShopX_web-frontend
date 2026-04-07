# 售后申请当前流程

本文档描述当前前端“申请售后”功能的实际执行流程，基于仓库当前实现整理，便于后续按业务继续调整。

## 1. 入口行为

- 订单列表页点击“申请售后”按钮后，不会立即调用提交接口。
- 订单详情页点击“申请售后”按钮后，也不会立即调用提交接口。
- 当前行为只是收集订单内可售后商品数据，然后打开售后面板。

相关文件：

- `app/pages/account/orders/index.vue`
- `app/pages/account/orders/[id].vue`
- `app/pages/account/components/AftersalesPanel.vue`

## 2. 打开售后面板后的初始化逻辑

打开面板后，前端会先重置本地表单状态：

- 默认选中第一个商品
- 每个商品退款数量默认设为 `1`
- 清空退款原因
- 清空补充描述
- 清空已选图片

当前不会在面板打开后额外请求 `wxapp/aftersales/item/price`。

退款金额展示逻辑当前为前端本地计算：

- `退款金额 = 当前选中商品单价 × 当前退款数量`

相关文件：

- `app/pages/account/components/AftersalesPanel.vue`
- `app/pages/account/components/AftersalesFormContent.vue`

## 3. 商品与数量交互

面板内支持：

- 切换当前申请售后的商品
- 修改当前商品的退款数量

这些操作只更新前端本地状态，不会请求后端价格接口。

当前数量变更只影响：

- 页面展示的退款金额
- 最终提交时 `detail[0][num]`

## 4. 图片上传逻辑

当前图片逻辑分成两步：

1. 用户选图后，前端先生成本地预览图
2. 然后调用图片上传接口，把图片上传成可提交 URL

当前接入的图片上传接口：

- `POST /wxapp/espier/uploadlocal`

当前上传参数：

- `images`: 图片的 Data URL 字符串
- `filetype`: 文件 MIME 类型
- `group`: 固定为 `aftersales`
- `newfilename`: 原文件名

当前上传成功后：

- 前端从响应中提取 `image_url`
- 保存到本地 `uploadedUrl`
- 提交售后时把多个 URL 用英文逗号拼成 `evidence_pic`

当前限制：

- 最多上传 3 张图
- 如果图片仍在上传中，点击提交会先提示，不会发起售后申请

相关文件：

- `app/pages/account/components/AftersalesPanel.vue`
- `app/infrastructure/http/clients/AftersalesApiClient.ts`

## 5. 提交售后申请逻辑

用户点击“提交”后，前端会先做基础校验：

- 必须选中商品
- 必须选择退款原因
- 图片不能处于上传中

校验通过后，调用：

- `POST /wxapp/aftersales`

当前提交字段如下：

- `order_id`
- `aftersales_type`
- `reason`
- `description`
- `evidence_pic`
- `freight`
- `return_type`
- `detail[0][id]`
- `detail[0][num]`

当前固定值如下：

- `aftersales_type = REFUND_GOODS`
- `freight = 0`
- `return_type = logistics`

其中：

- `detail[0][id]` 取当前选中订单商品项的 `itemId`
- `detail[0][num]` 取当前选中的退款数量
- `evidence_pic` 为已上传图片 URL 的逗号拼接字符串；如果没上传图片则为空字符串

相关文件：

- `app/pages/account/components/AftersalesPanel.vue`
- `app/infrastructure/http/clients/AftersalesApiClient.ts`

## 6. 当前实现中的业务假设

当前前端实现默认以下业务前提：

- 一次提交只针对一个商品项
- 当前只走“退货退款”类型，即 `REFUND_GOODS`
- 当前回寄方式固定为 `logistics`
- 当前运费固定传 `0`
- 退款金额只作为前端展示信息，不参与提交

如果后续业务要改成：

- 支持仅退款 / 换货
- 支持多商品同时申请
- 支持回寄方式切换
- 支持运费录入
- 支持后端真实退款金额计算

则需要同步调整：

- `AftersalesPanel.vue`
- `AftersalesFormContent.vue`
- `AftersalesApiClient.ts`

## 7. 相关源码位置

- 面板容器与提交逻辑：`app/pages/account/components/AftersalesPanel.vue`
- 表单内容区：`app/pages/account/components/AftersalesFormContent.vue`
- 售后 API 封装：`app/infrastructure/http/clients/AftersalesApiClient.ts`
- 订单列表入口：`app/pages/account/orders/index.vue`
- 订单详情入口：`app/pages/account/orders/[id].vue`
