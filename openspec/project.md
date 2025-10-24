# Project Context

## Purpose

ECSHOPX Web 是基于 Nuxt 4 的新一代电商解决方案，提供现代化的电商网站体验，支持商品展示、筛选、购买等核心电商功能。

## Tech Stack

- **框架**: Nuxt 4 + Vue 3 (Composition API)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS + Nuxt UI 3.3
- **状态管理**: Pinia
- **组件库**: Radix Vue + 自定义 sp- 前缀组件
- **包管理**: pnpm 10.13.0+
- **运行时**: Node.js 20.18.0+
- **HTTP 客户端**: Axios
- **类型反射**: reflect-metadata

## Project Conventions

### Code Style

- **TypeScript 严格模式**: 启用 strict: true，所有代码必须类型安全
- **组件规范**: 使用 `<script setup>` 语法，PascalCase 组件名，kebab-case 文件名
- **样式规范**:
  - 禁止使用 `<style>` 标签写自定义 CSS
  - 必须使用 Tailwind CSS 类名
  - 自定义样式通过 `sp-` 前缀类名在 `sp-theme.css` 中定义
- **命名约定**:
  - 自定义组件: `sp-` 前缀 (如 `sp-btn`, `sp-card`)
  - 业务组件: 存放在 `components/business/`
  - UI 组件: 存放在 `components/ui/`
- **格式化**: 使用 Prettier + ESLint (@nuxtjs/eslint-config-typescript)

### Architecture Patterns

- **文件路由**: 使用 Nuxt 4 的文件系统路由
- **组合式 API**: 所有组件和 composables 使用 Composition API
- **数据流**: API 调用 → 数据转换器 (transformers/) → Store → 组件
- **类型安全**: API 响应和组件 props 必须定义 TypeScript 接口
- **模块化**:
  - API 接口定义在 `types/api/`
  - 数据转换器在 `transformers/`
  - 工具函数在 `utils/`
  - 状态管理在 `stores/`

### Testing Strategy

- 组件测试使用 Vue Test Utils
- 工具函数和 Store 的单元测试
- 页面级集成测试
- API 集成测试

### Git Workflow

- 语义化提交信息
- 提交前运行 `pnpm lint:fix` 和 `pnpm format`
- 功能分支开发，合并前进行代码审查

## Domain Context

- **电商领域**: 商品管理、分类筛选、品牌管理、购物车、订单处理
- **京东风格设计**: UI 采用京东 PC 商城的设计风格和交互模式
- **SaaS 架构**: 支持多公司模式，通过环境变量配置
- **响应式设计**: 支持桌面端和移动端适配
- **SEO 友好**: 服务端渲染，优化搜索引擎收录

## Important Constraints

- **无自定义 CSS**: 严格禁止使用自定义样式，必须通过 Tailwind 和 sp- 类名实现
- **类型安全**: 所有代码必须通过 TypeScript 严格模式检查
- **性能优先**: 考虑组件渲染性能和用户体验
- **可维护性**: 代码结构清晰，遵循既定架构模式
- **Node.js 版本**: 严格要求 Node.js 20.18.0+
- **包管理器**: 必须使用 pnpm，不支持 npm 或 yarn

## External Dependencies

- **API 服务**: 通过 `NUXT_PUBLIC_API_BASE` 配置的后端 API
- **图片上传**: `NUXT_PUBLIC_UPLOAD_URL` 配置的上传服务
- **CDN**: 静态资源可能通过 CDN 分发
- **环境变量**: 依赖 .env 文件配置，支持开发/测试/生产环境区分
