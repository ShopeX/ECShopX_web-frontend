---
name: Foundation - Infrastructure
description: Standards for API request layers, Pinia state management, performance optimization, and ApiFox data mocking.
---

# 02-infra: 基础设施集成

本技能包定义了项目与外部服务（API、状态、性能监控）交互的基础设施规范。

## 1. API 请求层 (Axios & useFetch)

- **统一封装**: 所有的 API 请求必须封装在 `app/composables/` (页面级/模块级) 或 `shared/api/` (通用级) 中。
- **类型安全**: 虽然移除了 `openspec`，但必须为每个接口手动定义 `Request` 和 `Response` 类型。
- **错误拦截**: 请求层必须包含统一的错误处理逻辑：
  - `401`: 自动重定向至登录。
  - `403/500`: 展示全局错误提示。

## 2. 状态管理 (Pinia)

- **Store 类型**: 优先使用 **Setup Store** 风格（使用 `ref`, `computed`, `function`）。
- **持久化**: 购物车、用户 Token、偏好设置等关键数据通过 `pinia-plugin-persistedstate` 进行本地持久化。
- **命名规范**: 文件名即为 Store ID（如 `useUserStore` -> `user.ts`）。

## 3. 性能优化 (Performance)

- **SSR 决策**: 
  - 静态内容（商品详情、文章）使用 SSR 以利于 SEO。
  - 用户私有数据（订单列表、个人中心）使用 CSR 以减轻服务器负担。
- **图片优化**: 使用 `NuxtImg` 或图片懒加载。
- **指标监控**: 定期配合 Lighthouse 进行性能审计，确保 LCP < 2.5s。

## 4. 数据 Mock (ApiFox)

- 接口文档即代码：在后端未完成时，必须通过 ApiFox MCP 提取文档并切换到 Mock URL 进行前端并行开发。
