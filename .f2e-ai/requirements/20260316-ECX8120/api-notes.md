# 我的收藏 API 说明（ECX-8120）

## 接口来源与拉取说明

- **Apifox MCP**：当前未通过 Apifox MCP 拉取接口详情，以下根据需求澄清阶段用户提供的信息整理。
- 若需完整请求/响应体与参数说明，请到 Apifox 查看或后续通过 API 文档/MCP 补充。

## 本需求使用的接口

### 会员收藏商品列表

| 项目     | 说明 |
|----------|------|
| 接口名称 | 会员收藏商品列表 |
| 方法     | GET |
| 路径     | `/wxapp/member/collect/item` |
| Apifox 接口 ID | 426274554 |
| Apifox 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274554 |

- **请求**：GET，路径 `/wxapp/member/collect/item`；查询参数以 Apifox 文档为准（如分页、每页条数等）。
- **响应**：列表结构以 Apifox 为准。前端需解析为收藏商品列表，卡片展示字段建议包含：商品 id、图片、名称、价格等，与设计稿及现有 `FavoriteProductCard` 所需字段对齐。

---

## 后续扩展用接口（本需求 S1 不实现）

### 删除收藏商品

| 项目     | 说明 |
|----------|------|
| 接口名称 | 删除收藏商品 |
| 方法     | DELETE |
| 路径     | `/wxapp/member/collect/item` |
| Apifox 接口 ID | 426274555 |
| Apifox 链接 | https://app.apifox.com/link/project/7908795/apis/api-426274555 |

- 用于「移出收藏」等操作，本需求仅列表展示，不调用此接口；后续需求可接入并更新列表或乐观更新。

---

## 待补充（建议后续在 Apifox 或对接时确认）

- [ ] GET 请求的查询参数（分页、每页条数等）
- [ ] GET 响应数据结构体（列表项字段名、类型）
- [ ] DELETE 请求体/路径参数（如 item_id、collect_id 等）
- [ ] 鉴权方式（Cookie、Token、Header）
