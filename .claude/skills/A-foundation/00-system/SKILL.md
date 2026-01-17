# 00-system: 项目骨架与规范

这是 ECSHOPX 前端项目的核心系统技能包，定义了项目的基础架构、环境配置以及 Git 协作规范。

## 1. 软件架构 (Nuxt 4)

项目基于 **Nuxt 4** 架构，核心源代码位于 `app/` 目录。

### 目录结构规范
- `app/`: 源代码根目录。
  - `components/`: UI 组件，严格按以下子目录划分：
    - `ui/`: 原子级基础组件。**命名规范：`EC` 前缀 + 大驼峰**（如 `ECButton`, `ECInput`, `ECPrice`）。这些组件无业务逻辑，是纯 UI。
    - `business/`: 业务级复合组件。**命名规范：大驼峰**（如 `ProductCard`, `OrderRow`）。这些组件包含特定领域的业务逻辑。
    - `widgets/`: CMS/模板引擎组件。**命名规范：大驼峰**（如 `HeroCarousel`, `HotZone`）。
  - `composables/`: 组合式函数，按功能命名（如 `useAuth`, `useCart`）。
  - `pages/`: 页面路由。
  - `layouts/`: 页面布局。
  - `assets/`: 样式、图片等资产。
- `shared/`: 前后端共享逻辑。
- `public/`: 纯静态资源。

## 2. 环境与配置 (DevOps)

项目采用多环境配置，通过 `.env` 文件和 `runtimeConfig` 管理。

### 环境划分
- **Development (dev)**: 开发环境，对应 `.env.development`。
- **Staging (test)**: 测试/预发布环境，对应 `.env.staging`。
- **Production (prod)**: 生产环境，对应 `.env.production`。

### 配置注入
- **Public Config**: 通过 `runtimeConfig.public` 暴露给前端（如 API Base URL）。
- **Private Config**: 通过 `runtimeConfig` 管理敏感秘钥。

## 3. Git 协作规范

### 分支管理
- `main`: 生产分支，仅接受稳定代码。
- `develop`: 开发主分支。
- `feature/*`: 功能开发分支。
- `hotfix/*`: 紧急修复分支。

### Commit 提交格式 (Conventional Commits)
格式：`<type>(scope): <subject>`
- `feat`: 新功能。
- `fix`: 修复 Bug。
- `docs`: 文档变更。
- `style`: 代码格式调整（不影响逻辑）。
- `refactor`: 重构代码。
- `perf`: 性能优化。
- `chore`: 构建过程或辅助工具变动。

## 4. SEO 规范
- **Metadata**: 页面级 `useSeoMeta` 注入标题、描述和关键字。
- **Semantic HTML**: 强制使用语义化标签（`header`, `main`, `footer`, `article`）。
- **Sitemap**: 自动化生成规则定义。
