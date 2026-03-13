# 配置与命令

## 常用 Scripts（package.json）

| 命令               | 说明                                         |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | 启动开发服务器（Nuxt dev）                   |
| `pnpm build`       | 生产构建                                     |
| `pnpm generate`    | 静态站点生成（SSG）                          |
| `pnpm preview`     | 预览构建产物                                 |
| `pnpm postinstall` | 安装后执行 `nuxt prepare`                    |
| `pnpm lint`        | ESLint 检查（.js/.ts/.vue，遵循 .gitignore） |
| `pnpm lint:fix`    | ESLint 自动修复                              |
| `pnpm format`      | Prettier 格式化整个项目                      |
| `pnpm clean`       | 删除 `node_modules` 与 `.nuxt`               |

说明：当前 package.json 中**未**定义 `test`、`test:e2e` 或 `generate:docs`。E2E 需直接使用 `npx playwright test`（或本地配置的脚本）。

## 路径别名（tsconfig.json）

| 别名       | 映射                                 |
| ---------- | ------------------------------------ |
| `~/*`      | `./app/*`                            |
| `@/*`      | `./app/*`                            |
| `#imports` | `./.nuxt/types/imports`（Nuxt 生成） |

`baseUrl: "."`，TypeScript 的 `include` 含 `./app/**/*` 与 `.nuxt` 类型。

## 环境变量（.env / runtimeConfig）

- 示例见 **.env.example**；实际使用需复制为 `.env` 并按要求修改。
- **NUXT*PUBLIC*\*** 可在客户端与服务端访问，会映射到 `runtimeConfig.public`。
- 无 `NUXT_PUBLIC_` 前缀的变量仅服务端可用。

nuxt.config.ts 中使用的 public 配置示例：

- `runtimeConfig.public.apiBase` ← `NUXT_PUBLIC_API_BASE`（默认 `/api`）
- `runtimeConfig.public.companyId` ← `NUXT_PUBLIC_COMPANY_ID`（用于 HTTP 插件全局注入 `company_id`）
- `runtimeConfig.public.countryCode` ← `NUXT_PUBLIC_COUNTRY_CODE`（可选；未设置时由 HTTP 插件用 i18n cookie 或默认 `zh-CN` 注入 `country_code`）
- `runtimeConfig.public.businessMode` ← `NUXT_PUBLIC_BUSINESS_MODE`（默认 `b2c`）

## 重要工程约束

- **Node**：^20.19.0（engines）
- **pnpm**：^10.13.0（packageManager 锁定 10.13.0）
- **源码目录**：所有业务代码在 `app/`，不要将页面/组件放在根目录。
- **类型**：TypeScript strict 模式，verbatimModuleSyntax，noEmit。
- **Playwright**：`testDir: ./tests/e2e`，`baseURL` 默认 `http://localhost:3000`，`testIdAttribute: 'data-testid'`；CI 下 retries=2、workers=1，本地可复用已有 dev server。

## 配置文件一览

| 文件                 | 用途                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| nuxt.config.ts       | Nuxt 入口、模块、i18n、Vite、runtimeConfig、components/imports 等                 |
| tsconfig.json        | 继承 .nuxt/tsconfig.json，paths、strict、include                                  |
| postcss.config.js    | @tailwindcss/postcss、autoprefixer                                                |
| .eslintrc.js         | @nuxtjs/eslint-config-typescript、prettier，Vue 多词组件名关闭                    |
| .prettierrc          | 无分号、单引号、tabWidth 2、printWidth 100、trailingComma es5、lf                 |
| playwright.config.ts | testDir、baseURL、testIdAttribute、webServer、projects（chromium、Mobile Chrome） |
| app.config.ts        | defineAppConfig，Nuxt UI 的 ui.colors                                             |
| .env.example         | 应用/API/SaaS/Cookie/上传/缓存/调试等变量说明                                     |

## E2E 运行方式

- 配置中 `webServer` 使用 `npm run dev`，端口 3000，`reuseExistingServer: true`。
- 可直接执行：`npx playwright test`（或在 package.json 中自行添加 `test:e2e` 等脚本）。
