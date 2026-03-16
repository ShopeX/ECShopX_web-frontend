# API 说明：ECX-8122 收货地址列表页

## 接口来源

- **Apifox 项目**：`7908795`（链接格式：`https://app.apifox.com/link/project/7908795/apis/api-{接口ID}`）
- **来源方式**：用户在对话中提供接口名称、方法、路径及 Apifox 链接
- **Apifox MCP 拉取结果**：未执行。以下内容根据用户提供的清单整理，请求/响应结构体建议后续从 Apifox 或接口文档补充。

---

## 1. 会员地址列表

| 项 | 值 |
| --- | --- |
| 方法 | `GET` |
| 路径 | `/wxapp/member/addresslist` |
| 接口 ID | `426274548` |
| 说明 | 获取会员收货地址列表 |
| 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274548 |

### 请求参数

待从 Apifox 或接口文档补充。

### 请求/响应数据结构体

待从 Apifox 或接口文档补充。

---

## 2. 地址详情

| 项 | 值 |
| --- | --- |
| 方法 | `GET` |
| 路径 | `/wxapp/member/address/{address_id}` |
| 接口 ID | `426274549` |
| 说明 | 获取单条收货地址详情 |
| 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274549 |

### 路径参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `address_id` | string | 地址 ID |

### 请求/响应数据结构体

待从 Apifox 或接口文档补充。

---

## 3. 修改收货地址

| 项 | 值 |
| --- | --- |
| 方法 | `PUT` |
| 路径 | `/wxapp/member/address/{address_id}` |
| 接口 ID | `426274550` |
| 说明 | 修改指定收货地址 |
| 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274550 |

### 路径参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `address_id` | string | 地址 ID |

### 请求 Body / 响应数据结构体

待从 Apifox 或接口文档补充。

---

## 4. 删除地址

| 项 | 值 |
| --- | --- |
| 方法 | `DELETE` |
| 路径 | `/wxapp/member/address/{address_id}` |
| 接口 ID | `426274551` |
| 说明 | 删除指定收货地址 |
| 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274551 |

### 路径参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `address_id` | string | 地址 ID |

### 请求/响应数据结构体

待从 Apifox 或接口文档补充。

---

## 5. 添加收货地址

| 项 | 值 |
| --- | --- |
| 方法 | `POST` |
| 路径 | `/wxapp/member/address` |
| 接口 ID | `426274552` |
| 说明 | 新增收货地址 |
| 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274552 |

### 请求 Body / 响应数据结构体

待从 Apifox 或接口文档补充。

---

## 汇总

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 地址列表 | GET | `/wxapp/member/addresslist` |
| 地址详情 | GET | `/wxapp/member/address/{address_id}` |
| 修改地址 | PUT | `/wxapp/member/address/{address_id}` |
| 删除地址 | DELETE | `/wxapp/member/address/{address_id}` |
| 添加地址 | POST | `/wxapp/member/address` |

**说明**：设为默认等能力若由后端提供，可能为上述某接口的请求字段（如 `is_default`）或独立接口，需结合接口文档确认。
