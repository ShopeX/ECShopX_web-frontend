# 结算页相关 API 说明

**来源**：需求方提供的 Apifox 接口清单。**未通过 Apifox MCP 拉取**，以下为整理后的接口列表，具体请求/响应以 Apifox 项目 6771549 文档为准。

---

## 接口清单

| 说明               | 方法 | 路径                         | 接口ID    | 链接                                                                     |
| ------------------ | ---- | ---------------------------- | --------- | ------------------------------------------------------------------------ |
| 获取地址列表       | GET  | /member/addresslist          | 368677479 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677479) |
| 获取省市区列表     | GET  | /espier/address              | 368677480 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677480) |
| 新增收货地址       | POST | /member/address              | 368677481 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677481) |
| 更新收货地址       | PUT  | /member/address/{address_id} | 368677482 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677482) |
| 获取自提点列表     | GET  | /distributor/pickuplocation  | 368677484 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677484) |
| 计算订单金额       | POST | /getFreightFee               | 368677485 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677485) |
| 获取可用优惠券列表 | GET  | /user/newGetCardList         | 368677486 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677486) |
| 创建订单（H5/APP） | POST | /order_new                   | 368677487 | [Apifox](https://app.apifox.com/link/project/6771549/apis/api-368677487) |

> 说明：本需求仅使用 Web 场景（PC 与移动端 H5），接口文档中的「H5/APP」以实际调用的 H5 场景为准，不涉及 APP 或小程序。

---

## 与结算页能力对应关系

- **地址**：地址列表、省市区、新增、更新 → 收货地址选择/新增/编辑
- **自提**：自提点列表 → 门店自提时的门店选择
- **金额与优惠**：计算订单金额、可用优惠券列表 → 费用明细、优惠券选择与抵扣展示
- **下单**：创建订单（本需求仅 Web/H5 调用）→ 提交订单并跳转支付

---

## 使用建议

- 请求体、响应体、错误码等以 Apifox 项目内文档为准，实现前请核对最新接口定义。
- 若项目已有 `AddressApiClient`、`CouponApiClient`、`OrderApiClient` 等，可在此需求下扩展或复用，并与上述路径保持一致（注意 baseURL 与项目 runtimeConfig）。
