# 目录结构

## 根目录关键项

```
ecshopx-web/
├── app/                    # 源码目录（Nuxt srcDir）
├── tests/                  # E2E 测试
├── nuxt.config.ts          # Nuxt 主配置
├── playwright.config.ts    # Playwright 配置
├── tsconfig.json           # TypeScript 配置
├── postcss.config.js       # PostCSS（Tailwind）
├── .eslintrc.js            # ESLint
├── .prettierrc             # Prettier
├── .env.example            # 环境变量示例
└── package.json
```

## app/ 目录结构（核心）

```
app/
├── assets/                 # 静态资源
│   └── css/
│       └── main.css        # 全局样式、Tailwind、@theme、Nuxt UI 主题
├── components/             # 组件（自动导入）
│   ├── EC*/                # 基础组件（ECButton、ECModal、ECForm、ECSelect、ECToast 等）
│   ├── BC*/                # 业务组件（BCProductCard、BCMiniCart、BCHeaderBar 等）
│   ├── Sp*.vue             # 其他业务组件（SpNavbar、SpFilter 等）
│   ├── templateEngines/    # 由 nuxt.config 的 components.dirs 单独指定
│   └── ...
├── composables/            # 组合式函数（自动导入）
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useAddress.ts
│   ├── useTheme.ts
│   └── ...
├── config/                 # 应用配置
│   ├── themes/             # 主题类型与默认主题
│   ├── templates/          # 模板配置（如 cart.json）
│   └── locales/
├── infrastructure/         # 基础设施层
│   ├── http/
│   │   └── clients/       # API 客户端（Cart、Item、Auth、Order 等）
│   └── transformers/      # API 响应转换
├── locales/                # i18n 语言文件
│   ├── zh-CN.json
│   ├── en-US.json
│   └── ar.json
├── middleware/             # 路由中间件
│   ├── auth.global.ts
│   ├── init.ts
│   └── ...
├── pages/                  # 文件系统路由
│   ├── index.vue
│   ├── account/            # 账户相关页
│   ├── cart/
│   ├── products/[id].vue
│   └── collections/[id].vue
├── plugins/                # Nuxt 插件
│   ├── http.ts             # HTTP 封装
│   ├── auth-init.ts
│   └── app-init.ts
├── shared/                 # 共享领域逻辑
│   ├── value-objects/      # 值对象
│   └── errors/
├── stores/                 # Pinia 状态
│   ├── cart.ts
│   ├── cartUI.ts
│   ├── user/               # 待确认是否有子目录
│   └── ...
├── templateEngines/        # 模板引擎（页面搭建）
│   ├── sections/
│   ├── blocks/
│   └── templates/
├── types/                  # 全局类型
│   ├── api/                # API 请求/响应类型
│   ├── cart.ts
│   ├── product.ts
│   ├── filter.ts
│   └── nuxt.d.ts
├── utils/                  # 工具函数（自动导入）
├── app.config.ts           # 应用级配置（如 Nuxt UI 颜色）
└── ...
```

## tests/ 目录

```
tests/
└── e2e/                    # Playwright E2E
    ├── home.spec.ts
    ├── collections.spec.ts
    ├── product-detail.spec.ts
    ├── search.spec.ts
    └── checkout.spec.ts
```

## 建议排除目录（分析/扫描时）

- `node_modules/`
- `.nuxt/`、`.output/`、`.data/`、`dist/`、`.nitro/`、`.cache/`
- `playwright-report/`、`test-results/`、`playwright/.cache`
- `.env`、`.env.*`（保留 `.env.example` 参考）
- `*.log`、`logs/`

## 路径别名（tsconfig / Nuxt 自动）

- `~/*`、`@/*` → `./app/*`
- `#imports` → Nuxt 自动导入类型

组件与 composables 通过 Nuxt 的 `components.dirs`、`imports.dirs` 自动导入，无需手写路径（可直接使用 `<ECButton>`、`useCart()` 等）。
