# ECshopX Web 项目手册

本手册基于对当前工作区前端项目的分析产出，供新人上手与 AI 技能复用。

## 项目概览

- **项目名称**：ecshopx-website
- **类型**：Nuxt 4 全栈/前端电商站点（SSR）
- **源码目录**：`app/`（由 `nuxt.config.ts` 的 `srcDir: 'app'` 指定）
- **包管理**：pnpm，Node ^20.19.0

## 手册文档索引

| 文档                               | 说明                                                               |
| ---------------------------------- | ------------------------------------------------------------------ |
| [tech-stack.md](./tech-stack.md)   | 技术栈总览：框架、语言、构建、UI、状态管理、样式、测试、i18n、HTTP |
| [structure.md](./structure.md)     | 目录结构：关键目录树、用途、建议排除目录                           |
| [configs.md](./configs.md)         | 配置与命令：scripts、路径别名、环境变量、工程约束                  |
| [conventions.md](./conventions.md) | 代码规范：命名、模块划分、样式、E2E 选择器约定                     |

## 快速定位

- 页面与路由：`app/pages/`
- 组件：`app/components/`（含 EC* 基础组件、BC* 业务组件、templateEngines）
- 状态：`app/stores/`（Pinia）
- HTTP 与转换：`app/infrastructure/http/clients/`、`app/inrastructure/transformers/`
- 国际化：`app/locales/` + Nuxt i18n
- E2E 测试：`tests/e2e/`，Playwright，默认 `data-testid` 选择器

## 使用说明

- 新人可先阅读 **tech-stack** 与 **structure**，再按 **configs** 跑命令、按 **conventions** 写代码。
- 信息不足处已标为「未检测到」或「待补充」，请随项目演进更新本手册。
