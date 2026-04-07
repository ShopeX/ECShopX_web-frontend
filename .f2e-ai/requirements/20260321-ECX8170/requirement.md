# 需求文档 — 20260321-ECX8170

## 需求来源

- 平台：Teambition
- 任务号：ECX-8170
- 任务标题：订单详情页
- 创建时间：2026-03-20

## 原文摘要

订单详情页功能开发，涵盖详情展示、操作按钮及物流轨迹，适配 PC 与 H5 双端。

## 分类

- 类型：新功能页面开发
- 模块：订单 / 个人中心

## 目标用户 / 场景

已登录用户在个人中心查看某笔订单的详细信息，包括：商品列表、订单金额、收货地址、订单状态及可执行操作、物流轨迹。

## 核心能力

1. **订单基本信息展示**：订单号、下单时间、商品列表、金额明细、收货地址、订单状态
2. **操作按钮**：根据订单状态动态展示可操作项（取消订单、确认收货、申请退款等）
3. **物流轨迹**：展示物流状态与时间线

## 验收标准

- 按 Figma 设计稿（PC + H5）还原度验收
- PC 端与 H5 端分别对齐对应设计稿

## 约束

- 复用现有接口，不新增后端接口
- PC + H5 双端均需实现

## 优先级

- 来自 Teambition Sprint，无明确截止日期，优先级待确认

## 待确认项

- 操作按钮的完整状态枚举（哪些状态对应哪些按钮）
- 物流轨迹数据来自哪个字段（待 API 分析后确认）

## 设计稿

| 端 | Figma 链接 |
|----|------------|
| PC | https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2297-2119&t=XCGAZqc3OpvqfI6Z-11 |
| H5 | https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2945-3802&t=XCGAZqc3OpvqfI6Z-4 |

## API 信息

| 字段 | 内容 |
|------|------|
| 接口名称 | 获取订单详情 |
| 方法 | GET |
| 路径 | /wxapp/order/{order_id} |
| 接口 ID | 426273535 |
| 文档地址 | https://app.apifox.com/link/project/7908795/apis/api-426273535 |
