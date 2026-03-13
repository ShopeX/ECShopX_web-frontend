# 技术栈总览

## 框架与语言

| 类别       | 技术               | 说明                                                        |
| ---------- | ------------------ | ----------------------------------------------------------- |
| 框架       | **Nuxt 4**         | 基于 Vue 3 的全栈框架，SSR，`compatibilityDate: 2025-11-07` |
| 语言       | **TypeScript 5.3** | 严格模式开启（`strict: true`），verbatimModuleSyntax        |
| 前端运行时 | **Vue 3.4**        | Composition API、`<script setup>`                           |

## 构建与开发工具

| 类别     | 技术                  | 说明                                                      |
| -------- | --------------------- | --------------------------------------------------------- |
| 构建     | **Vite**（Nuxt 内置） | 通过 Nuxt 使用，未单独暴露 Vite 配置文件                  |
| 包管理   | **pnpm 10.13**        | `packageManager` 锁定，engines 要求 Node ^20.19.0         |
| 样式构建 | **PostCSS**           | `postcss.config.js`：`@tailwindcss/postcss`、autoprefixer |
| 类型检查 | **vue-tsc**           | 存在依赖；Nuxt 中 `typeCheck: false`（避免 checker 问题） |

## UI 与组件

| 类别       | 技术                | 说明                                                                                         |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------- |
| UI 库      | **@nuxt/ui 4.x**    | Nuxt 集成，主题在 `app.config.ts` 与 `main.css` 中配置                                       |
| 组件库     | **radix-vue**       | 部分基础组件可能依赖（如无障碍组件）                                                         |
| 自定义组件 | **EC\*** / **BC\*** | EC 为基础组件（ECButton、ECModal、ECForm 等），BC 为业务组件（BCProductCard、BCMiniCart 等） |

## 状态管理

| 类别       | 技术                        | 说明                                               |
| ---------- | --------------------------- | -------------------------------------------------- |
| 状态       | **Pinia 2.x**               | 通过 `@pinia/nuxt` 集成，stores 位于 `app/stores/` |
| 服务端状态 | **useAsyncData / useFetch** | Nuxt 内置，页面数据请求常用                        |

## 样式

| 类别     | 技术               | 说明                                                                                  |
| -------- | ------------------ | ------------------------------------------------------------------------------------- |
| 样式方案 | **Tailwind CSS 4** | 通过 `@tailwindcss/postcss`，入口 `app/assets/css/main.css`                           |
| 主题     | **@theme + :root** | `main.css` 中定义 `@theme`（断点、颜色、圆角、阴影、字体）及 Nuxt UI 的 `--ui-*` 变量 |
| 预处理器 | **Sass**           | 已安装 sass，用于需要 .scss 的场景（具体使用范围未全量扫描）                          |

## 测试

| 类别 | 技术                | 说明                                                 |
| ---- | ------------------- | ---------------------------------------------------- |
| E2E  | **Playwright 1.57** | 配置在 `playwright.config.ts`，测试目录 `tests/e2e/` |
| 单测 | **未检测到**        | 无 Vitest/Jest 等配置与 scripts，待补充              |

## 国际化（i18n）

| 类别 | 技术                      | 说明                                               |
| ---- | ------------------------- | -------------------------------------------------- |
| 方案 | **@nuxtjs/i18n 10.x**     | 懒加载，`langDir: '../app/locales'`                |
| 语言 | **zh（默认）、en、ar**    | 对应 `zh-CN.json`、`en-US.json`、`ar.json`         |
| 策略 | **prefix_except_default** | 默认语言无前缀，其他语言路径带 locale 前缀         |
| 检测 | **detectBrowserLanguage** | 使用 Cookie（`i18n_redirected`），redirectOn: root |

## HTTP 与数据

| 类别        | 技术                             | 说明                                                                        |
| ----------- | -------------------------------- | --------------------------------------------------------------------------- |
| HTTP 客户端 | **axios**                        | 通过 Nuxt 插件 `plugins/http.ts` 封装，注入到 Nuxt 上下文                   |
| API 封装    | **infrastructure/http/clients/** | 按领域拆分：Cart、Item、Auth、Template、Order、Address、Coupon 等 ApiClient |
| 数据转换    | **infrastructure/transformers/** | 如 CartTransformer、authTransformer，将 API 数据转为前端模型/值对象         |
| 值对象      | **shared/value-objects/**        | 如 MoneyValueObject、QuantityValueObject，用于领域建模                      |

## 其他

| 类别     | 技术                             | 说明                                                         |
| -------- | -------------------------------- | ------------------------------------------------------------ |
| 开发工具 | **@nuxt/devtools**               | devtools 启用                                                |
| 实验特性 | **componentIslands, typedPages** | 在 nuxt.config 的 experimental 中开启                        |
| 模板引擎 | **app/templateEngines/**         | 自定义模板/区块（sections、blocks、templates），用于页面搭建 |
