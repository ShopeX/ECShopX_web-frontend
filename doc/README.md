# ECshopx 华为商城项目文档

## 项目概述

ECshopx 华为商城是一个基于 Nuxt 3 开发的现代电商平台，提供了完整的电商功能，包括商品展示、分类浏览、购物车、用户中心等功能。

## 技术栈

- **框架**: Nuxt 3
- **语言**: TypeScript
- **样式**: Tailwind CSS, SCSS
- **状态管理**: Pinia
- **包管理器**: pnpm
- **Node.js 版本**: ^20.18.0

## 目录结构

```
ecshopx-website/
├── app/                  # Nuxt 应用配置
├── assets/              # 静态资源
│   ├── css/            # 样式文件
│   └── images/         # 图片资源
├── components/         # Vue 组件
│   ├── home/          # 首页相关组件
│   └── layout/        # 布局相关组件
├── composables/       # 组合式函数
├── layouts/           # 布局模板
├── pages/             # 页面组件
├── plugins/           # Nuxt 插件
├── public/            # 公共静态资源
│   ├── icons/        # 图标文件
│   └── images/       # 图片文件
├── server/           # 服务端代码
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

## 开发环境要求

- Node.js: ^20.18.0
- pnpm: 最新版本
- 操作系统: 支持 macOS、Linux、Windows

## 快速开始

1. 安装依赖：

```bash
pnpm install
```

2. 启动开发服务器：

```bash
pnpm dev
```

3. 构建生产版本：

```bash
pnpm build
```

4. 预览生产版本：

```bash
pnpm preview
```

## 项目配置

主要配置文件：

- `nuxt.config.ts`: Nuxt 框架配置
- `tailwind.config.js`: Tailwind CSS 配置
- `tsconfig.json`: TypeScript 配置

## 代码规范

项目使用 ESLint 和 Prettier 进行代码规范化：

- `eslint`: JavaScript/TypeScript 代码检查
- `prettier`: 代码格式化

运行代码检查：

```bash
pnpm lint
```

运行代码格式化：

```bash
pnpm format
```
