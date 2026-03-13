# 代码规范

以下基于当前仓库代表性文件归纳，供一致性与 AI 复用参考。

## 命名约定

### 组件

- **EC\***：基础/通用 UI 组件（ECButton、ECModal、ECForm、ECSelect、ECToast、ECCheckbox、ECPagination、ECLoading 等），多位于 `components/EC*/` 目录，部分含 `index.ts`、`types.ts`、`README.md`。
- **BC\***：业务组件（BCProductCard、BCMiniCart、BCHeaderBar、BCProductFilter、BCCouponCard 等），与业务领域强相关。
- **Sp\***：如 SpNavbar、SpFilter，业务相关。
- Vue 文件名：PascalCase（与 Nuxt 自动导入一致）；ESLint 中 `vue/multi-word-component-names` 已关闭，单词组件名可用。

### 目录与文件

- **stores**：小写文件名，如 `cart.ts`、`cartUI.ts`，导出 `useXxxStore`。
- **composables**：`useXxx.ts` 命名，如 `useAuth.ts`、`useCart.ts`、`useAddress.ts`。
- **infrastructure/http/clients**：`XxxApiClient.ts`，导出类与单例（如 `cartApiClient`）。
- **transformers**：`xxxTransformer.ts`，如 `cartTransformer.ts`、`authTransformer.ts`。
- **types**：集中放在 `types/`，按领域分子目录（如 `types/api/`）。

### 类型与接口

- 接口：大驼峰，常见前缀 `I`（如 `ICartItemModel`、`IAddCartRequest`）或在 types 文件中直接命名。
- 类型与接口集中在 `types/` 或组件目录下的 `types.ts`。

## 模块划分与导入

- **页面**：使用 `useAsyncData` / `useFetch` 拉取数据，使用 composables（如 `useCart`、`useAuth`）与 stores，不直接依赖 HTTP 客户端；业务逻辑尽量放在 composables 或 stores。
- **HTTP**：仅通过 `infrastructure/http/clients` 的 ApiClient 发请求；数据增强使用 `infrastructure/transformers`，领域模型与值对象使用 `shared/value-objects`。
- **别名**：统一使用 `~/` 引用 app 下模块（如 `~/stores/cart`、`~/infrastructure/http/clients`），与 tsconfig 的 `~/*`、`@/*` 一致。
- **自动导入**：composables、utils、components 由 Nuxt 自动导入，无需手写 import（除类型或明确需要时）。

## HTTP 全局参数（请求封装约定）

通过 `app/plugins/http.ts` 发出的请求会**自动**携带以下全局参数，业务侧无需在每次请求中显式传入：

| 参数           | GET 请求   | POST/PUT/PATCH（有 body） |
| -------------- | ---------- | ------------------------- |
| `company_id`   | Query 参数 | Body 参数                 |
| `country_code` | Query 参数 | Body 参数                 |

- **取值**：`company_id` 来自 `runtimeConfig.public.companyId`；`country_code` 优先 `runtimeConfig.public.countryCode`，未设置时使用 i18n cookie（`i18n_redirected`），再默认 `zh-CN`。
- **跳过注入**：个别请求不需要携带时，可在请求 options 中传 `skipCompanyId: true` 或 `skipCountryCode: true`（与 `$fetch` 的 options 同层）。
- 新建 ApiClient 或直接使用 `$http` 时，无需在 query/body 里重复添加上述两字段。

## 样式约定

- **Tailwind**：优先使用 Tailwind 工具类；主题与设计令牌在 `app/assets/css/main.css` 的 `@theme` 与 `:root` 中定义（如 `--color-brand-*`、`--ui-primary`、`--radius-jd*`、`--shadow-jd*`）。
- **Nuxt UI**：通过 `app.config.ts` 的 `ui.colors` 与 main.css 中的 `[data-variant][data-color]` 等覆盖主题。
- **组件内样式**：需自定义时使用 `<style scoped>` 或 Tailwind 类；EC 组件中存在通过 `className` prop 传入类名的做法（如 ECButton）。
- **行数截断**：使用项目内工具类 `.line-clamp-1`、`.line-clamp-2`、`.line-clamp-3`（main.css 已定义）。

## Vue 与 TypeScript

- **单文件组件**：`<script setup lang="ts">`，Props 使用 `defineProps<Props>()` 与 `withDefaults`，类型与接口可在同文件或 `types.ts` 中定义。
- **Props 命名**：小驼峰（如 `filterGroups`、`showFilterPanel`），模板中可使用 `kebab-case`（如 `show-filter-panel`）。
- **事件**：`@update:show-filter-panel`、`@change` 等，与 v-model 或业务语义一致。
- **Store**：Pinia `defineStore`，state/actions/getters 清晰分层；可从 localStorage 恢复状态（如 cart store）。

## E2E 与可测性

- **选择器**：Playwright 配置使用 `testIdAttribute: 'data-testid'`，优先使用 `data-testid` 作为稳定选择器。
- **约定**：关键页面容器、列表、表单、按钮等应设置语义化 `data-testid`（如 `data-testid="collections-page"`、`data-testid="collections-product-grid"`、`data-testid="collections-filter"`），便于 E2E 与后续 AI 生成用例。
- 测试文件位于 `tests/e2e/*.spec.ts`，按场景拆分（home、collections、product-detail、search、checkout）。

## 其他

- **日志**：`utils/log` 存在封装；生产环境 ESLint 对 `no-console`、`no-debugger` 为 warn。
- **格式化**：Prettier 统一（无分号、单引号、2 空格、printWidth 100、LF），与 ESLint 通过 eslint-config-prettier 配合。
- **文档**：部分组件目录含 README.md、QUICK_START.md，说明用途与用法，可延续该习惯。
