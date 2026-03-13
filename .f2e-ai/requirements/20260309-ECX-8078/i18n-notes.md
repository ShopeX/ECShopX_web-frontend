# 20260309-ECX-8078 多语言说明

## 范围

仅处理本需求计划涉及且含用户可见中文的文件：

- `app/pages/payment/index.vue`
- `app/composables/usePayment.ts`

## Key 规范（当前规则）

- 使用 `scripts/generate_i18n_key.py` 生成：**md5(文件相对路径) 前 8 位 + `.` + md5(中文原文) 前 6 位**，格式为 `8位hex.6位hex`。
- 示例：`python3 generate_i18n_key.py "app/pages/payment/index.vue" "支付码"` → `eab46cc2.c8d2a2`。

## 规范 key 映射表（支付页与 usePayment）

| 规范 key        | 原 key                     | 中文                                       | 所在文件      |
| --------------- | -------------------------- | ------------------------------------------ | ------------- |
| eab46cc2.941324 | payment.noOrderId          | 缺少订单号，请从结算页或订单列表进入支付。 | index.vue     |
| eab46cc2.983adc | payment.toCart             | 返回购物车                                 | index.vue     |
| eab46cc2.b2ec2a | payment.orderSubmitSuccess | 订单提交成功，请尽快付款。                 | index.vue     |
| eab46cc2.b7071d | payment.remainingTime      | 剩余支付时间                               | index.vue     |
| eab46cc2.b1862e | payment.orderAmountLabel   | 订单金额                                   | index.vue     |
| eab46cc2.a8d60c | payment.selectMethodBelow  | 请选择以下支付方式                         | index.vue     |
| eab46cc2.9246fe | payment.pendingPay         | 待支付                                     | index.vue     |
| eab46cc2.ae94de | payment.payNow             | 去支付                                     | index.vue     |
| eab46cc2.a841e4 | payment.scanToPay          | 使用微信扫码支付                           | index.vue     |
| eab46cc2.03d763 | payment.openApp            | 打开手机端微信                             | index.vue     |
| eab46cc2.d7ce53 | payment.scanContinue       | 扫一扫继续付款                             | index.vue     |
| eab46cc2.c8d2a2 | payment.qrcodeAlt          | 支付码                                     | index.vue     |
| eab46cc2.eb5dc9 | payment.success            | 支付成功                                   | index.vue     |
| eab46cc2.27a3ff | payment.viewOrder          | 查看订单                                   | index.vue     |
| eab46cc2.3a2c9f | payment.continueShopping   | 继续购物                                   | index.vue     |
| eab46cc2.201d09 | payment.timeout            | 支付超时，请重试或返回                     | index.vue     |
| eab46cc2.4548cc | payment.failed             | 支付失败                                   | index.vue     |
| eab46cc2.132c5c | payment.retry              | 重试                                       | index.vue     |
| 9233eff9.f7af5c | payment.errorLoadMethods   | 获取支付方式失败                           | usePayment.ts |
| 9233eff9.6331d2 | payment.errorLoadOrder     | 获取订单信息失败                           | usePayment.ts |
| 9233eff9.874265 | payment.errorNoQrcode      | 未获取到支付码                             | usePayment.ts |
| 9233eff9.bd87f5 | payment.errorPaymentInfo   | 获取支付信息失败                           | usePayment.ts |

- 前缀 `eab46cc2` 对应路径 `app/pages/payment/index.vue`，`9233eff9` 对应 `app/composables/usePayment.ts`。
- 支付页仍使用 `common.back`、`product.loading`、`product.adding`、`orders.retry` 等公共 key，未改为规范 key。
- 语言包中保留 `payment.orderSummary`、`payment.selectMethod`、`payment.backToAccount`（本页未使用，供其他模块）。

## 语言包路径

- `app/locales/zh-CN.json`
- `app/locales/en-US.json`
- `app/locales/ar.json`

## 脚本执行记录

- **generate_i18n_key.py**：对上述 22 条中文按「文件路径 + 中文」执行生成，得到规范 key 后已写入源码与三语言包，并移除已迁移的 `payment.*` 条目。
