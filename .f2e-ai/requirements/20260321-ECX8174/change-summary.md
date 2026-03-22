# Change Summary — ECX-8174 申请售后组件

## 需求与计划摘要

开发申请售后表单组件（`AftersalesModal`），支持 PC 居中弹窗 + H5 底部 Sheet 双端布局，
调用 `POST /wxapp/aftersales` 提交售后申请，按 Figma 节点 2848:4096（PC）/ 2952:6658（H5）1:1 还原。

## 改动范围

### 新增文件

| 文件 | 说明 |
|------|------|
| `app/infrastructure/http/clients/AftersalesApiClient.ts` | 封装 `POST /wxapp/aftersales`，query 参数传递 |
| `app/pages/account/components/AftersalesModal.vue` | 售后申请弹窗组件，PC/H5 双端，含 stepper/select/textarea/校验/提交 |
| `.f2e-ai/requirements/20260321-ECX8174/` | 需求文档、ui-notes、api-notes、test.spec.ts、plan.md |

### 修改文件

| 文件 | 说明 |
|------|------|
| `app/infrastructure/http/clients/index.ts` | 追加 `AftersalesApiClient` 导出 |
| `app/locales/zh-CN.json` | 新增 19 个 `0747dfee.*` i18n key |
| `app/locales/en-US.json` | 同上（英文） |
| `app/locales/ar.json` | 同上（阿拉伯文） |
| `app/pages/account/orders/[id].vue` | 集成 AftersalesModal，`openAftersales()` 函数，`@aftersales` 事件绑定 |
| `app/pages/account/orders/index.vue` | 同上，列表页集成，`@submitted` 刷新列表 |

## 关键逻辑与接口变化

- **API**：`POST /wxapp/aftersales`，全参数 query 传递（order_id / item_id / reason / detail / aftersales_type / description）
- **售后类型枚举**：`ONLY_REFUND` / `REFUND_GOODS` / `EXCHANGING_GOODS`
- **表单校验**：`aftersalesType` 和 `reason` 为必填，提交前前端校验，行内错误提示
- **i18n key 格式**：`{md5(filePath)[0:8]}.{md5(text)[0:6]}`，AftersalesModal 前缀 `0747dfee`
- **双端弹窗**：PC `flex items-center justify-center`（居中），H5 `items-end`（底部 Sheet）+ `rounded-t-[16px]`

## 测试与验收情况

- 11 个 Playwright 测试用例已写入 `test.spec.ts`（TC01–TC11）
- 覆盖：弹窗开关、字段交互、stepper、表单校验、提交成功/失败
- 本次未执行 e2e 运行，需后续联调验证

## 遗留问题与后续建议

1. **图片上传**：当前接口无图片参数，待后端确认独立上传接口后补充凭证图片功能
2. **退款数量**：接口无 `quantity` 参数，stepper 仅前端展示，如需传递需后端配合
3. **退款理由枚举**：当前硬编码 5 项，建议后端提供枚举接口或配置化
4. **e2e 测试**：需在真实环境或 Mock 服务下执行 `test.spec.ts` 完成验收
