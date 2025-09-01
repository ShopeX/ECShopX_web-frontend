# 项目目录结构

## 根目录结构

```
ecshopx-web/
├── .nuxt/               # Nuxt 自动生成的文件
├── app/                 # 主要应用代码目录
├── content/            # 内容文件目录
├── public/             # 静态资源目录
├── server/             # 服务端代码目录
├── shared/             # 共享代码目录
├── docs/               # 项目文档
├── nuxt.config.ts      # Nuxt 配置文件
├── tailwind.config.ts  # Tailwind CSS 配置文件
├── tsconfig.json       # TypeScript 配置文件
├── package.json        # 项目依赖配置
└── README.md           # 项目说明文档
```

## 应用目录结构 (app/)

```
app/
├── api/                # API 接口定义
├── assets/             # 资源文件（会被构建工具处理）
├── components/         # Vue 组件
│   ├── common/        # 通用组件
│   └── business/      # 业务组件
├── composables/        # 组合式函数
├── layouts/           # 布局组件
├── middleware/        # 路由中间件
├── pages/             # 页面组件（自动生成路由）
├── plugins/           # Nuxt 插件
├── stores/            # Pinia 状态管理
├── types/             # TypeScript 类型定义
│   ├── api/          # API 相关类型
│   ├── components/   # 组件相关类型
│   └── store/        # 状态管理相关类型
└── utils/             # 工具函数

```

## 服务端目录结构 (server/)

```
server/
├── api/               # API 路由处理器
├── middleware/        # 服务端中间件
├── plugins/          # 服务端插件
├── routes/           # 自定义服务端路由
└── utils/            # 服务端工具函数
```

## 共享目录结构 (shared/)

```
shared/
└── types.ts          # 前后端共享的类型定义
```

## 静态资源目录 (public/)

```
public/
├── icons/            # 图标文件
└── images/           # 图片资源
```

## 配置文件说明

- `nuxt.config.ts`: Nuxt 应用的主要配置文件
- `tailwind.config.ts`: Tailwind CSS 的配置文件
- `tsconfig.json`: TypeScript 编译器配置
- `.eslintrc.js`: ESLint 代码规范配置
- `.prettierrc`: Prettier 代码格式化配置
- `.npmrc`: npm/pnpm 包管理器配置

## 开发规范

### 命名规范

- 组件命名：大驼峰命名，如 `UserProfile.vue`
- 工具函数：小驼峰命名，如 `formatDate.ts`
- 类型定义：
  - 接口：大写 I 开头，如 `IUserProfile`
  - 类型：大写 T 开头，如 `TApiResponse`
  - 枚举：大写 E 开头，如 `EStatus`

### 文件组织

- 组件按功能分类，放在对应目录下
- 类型定义集中管理，按模块分类
- 工具函数按功能分类，避免单文件过大
- 页面组件放在 `pages` 目录，自动生成路由

### API 组织

- API 接口按模块分类
- 统一使用 `useFetch` 处理请求
- 响应数据类型统一定义在 `types/api` 目录

### 状态管理

- 使用 Pinia 进行状态管理
- Store 按功能模块拆分
- 复杂状态逻辑使用 composables 封装

## 构建与部署

项目使用 Nuxt 4 构建，支持：

- 服务端渲染 (SSR)
- 静态站点生成 (SSG)
- 客户端渲染 (CSR)

构建命令：
```bash
# 开发
pnpm dev

# 构建
pnpm build

# 预览
pnpm preview
``` 