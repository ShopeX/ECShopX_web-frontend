# ECshopX Web

基于 Nuxt 4 的新一代电商解决方案。

## 环境要求

- Node.js >= 20.19.0
- pnpm >= 10.13.0

## 开发环境设置

1. 安装依赖：

```bash
pnpm install
```

2. 配置环境变量：

复制环境变量示例文件并根据需要修改：

```bash
cp .env.example .env.development
```

### 环境变量说明

#### 应用配置

- `NUXT_APP_NAME`: 应用名称
- `NUXT_APP_TITLE`: 页面标题
- `NUXT_APP_DESCRIPTION`: 应用描述

#### API 配置

- `NUXT_PUBLIC_API_BASE`: API 基础路径
- `NUXT_PUBLIC_API_TIMEOUT`: API 超时时间（毫秒）

#### SaaS 配置

- `NUXT_PUBLIC_SAAS`: 是否启用 SaaS 模式
- `NUXT_PUBLIC_COMPANY_ID`: 公司 ID（非 SaaS 模式使用）

#### Cookie 配置

- `NUXT_COOKIE_SECRET`: Cookie 加密密钥
- `NUXT_COOKIE_NAME_TOKEN`: 认证 Token Cookie 名称
- `NUXT_COOKIE_NAME_COMPANY`: 公司 ID Cookie 名称

#### 上传配置

- `NUXT_PUBLIC_UPLOAD_URL`: 上传接口地址
- `NUXT_PUBLIC_UPLOAD_MAX_SIZE`: 最大上传大小（字节）
- `NUXT_PUBLIC_UPLOAD_ACCEPT`: 允许上传的文件类型

#### 缓存配置

- `NUXT_PUBLIC_CACHE_TTL`: 缓存有效期（秒）

#### 调试配置

- `NUXT_PUBLIC_DEBUG`: 是否启用调试模式
- `NUXT_PUBLIC_API_MOCK`: 是否启用 API Mock

## 开发

启动开发服务器：

```bash
pnpm dev
```

## 构建

构建生产版本：

```bash
pnpm build
```

## 部署

预览生产版本：

```bash
pnpm preview
```

## 目录结构

```
ecshopx-web/
├── app/                # 源代码目录
│   ├── api/           # API 接口
│   ├── assets/        # 静态资源
│   ├── components/    # 组件
│   ├── composables/   # 组合式函数
│   ├── layouts/       # 布局
│   ├── pages/         # 页面
│   ├── plugins/       # 插件
│   ├── public/        # 公共文件
│   ├── server/        # 服务端
│   ├── stores/        # 状态管理
│   ├── types/         # 类型定义
│   └── utils/         # 工具函数
├── .env.example       # 环境变量示例
├── .gitignore        # Git 忽略配置
├── nuxt.config.ts    # Nuxt 配置
├── package.json      # 项目配置
├── pnpm-lock.yaml    # 依赖锁定
├── tailwind.config.ts # Tailwind 配置
└── tsconfig.json     # TypeScript 配置
```

## 注意事项

1. 不要在代码中硬编码环境变量，使用 `useRuntimeConfig()` 获取配置
2. 生产环境部署前需要设置正确的环境变量
3. 敏感信息（如 `NUXT_COOKIE_SECRET`）不要提交到代码仓库
