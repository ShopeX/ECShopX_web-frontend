---
name: ApiFox to Implementation
description: ApiFox 接口文档转前端实现的标准流程。包含接口检索、类型生成、API Client 封装、Transformer 实现、Mock 联调。当涉及 ApiFox、API 接口、接口文档、类型定义、Mock 联调时触发。
---

# 11-apifox-to-impl: ApiFox 接口转实现

本技能包定义了如何通过 ApiFox MCP 将接口文档标准化、健壮地转化为前端请求逻辑的流程。

## 1. 检索阶段 (Discovery)

1. **接口定位**: 根据业务需求，使用 `search_endpoints` 找到对应的 API 定义。
2. **文档阅读**: 识别必填字段、Query 参数、Body 结构以及成功/失败的响应格式。

## 2. 类型定义阶段 (Typing)

1. **结构提取**: 从接口定义中提取 JSON Schema。
2. **TS 转化**: 手动或自动化将 Schema 转化为 TypeScript `Interface`，存放于 `shared/types/api/`。

## 3. 开发阶段 (Coding)

1. **包裹函数**: 创建对应的 Composable 函数（如 `useProductDetail`）。
2. **处理逻辑**:
   - 使用 Axios 或 useFetch 发起请求。
   - 实现前置数据转换 (Transformer)（如果接口字段与 UI 需求不匹配）。
   - 注入统一的错误处理。

## 4. 联调阶段 (Debug)

- **Mock 模式**: 如果后端未就绪，切换至 ApiFox 的 Mock URL 进行业务流程跑通。
- **真机联调**: 切换至 Dev 环境 API，验证实际数据的展示逻辑。
- **自动化验证**: 编写单元测试验证 Transformer 逻辑的覆盖面。
