# User Login Page Proposal

## Why

用户需要通过登录页面进行身份认证才能访问电商平台的个人中心、购物车结算等功能。当前系统缺少完整的登录页面和表单组件，需要开发一个符合设计规范、支持多种登录方式的登录页面。

## What Changes

- 添加用户登录页面功能规范（`/login` 路由）
- **开发基于 Schema 驱动的表单系统**（Form.vue + FormItem.vue）
- 支持通过 FormSchema 动态渲染表单（Input、Select、Radio、Checkbox 等）
- FormItem 支持插槽方式自定义内容
- 实现账号密码登录功能
- **实现手机验证码登录功能**（完整实现，包括验证码发送）
- 实现图形验证码验证
- 实现短信验证码发送和倒计时功能
- 支持密码显示/隐藏切换
- 提供找回密码入口
- 集成用户认证状态管理（Pinia Store）
- **使用 Apifox MCP 进行 API 接口对接**
- 遵循项目 Tailwind CSS + sp- 前缀样式规范

## Impact

- **新增 Spec**: `user-auth` - 用户认证功能规范
- **新增 UI 组件**（基于 Schema 驱动的表单系统）:
  - `app/components/ui/Form.vue` - 表单容器组件（接收 FormSchema）
  - `app/components/ui/FormItem.vue` - 表单项组件（支持 Input、Select、Radio、Checkbox 等类型 + 插槽）
- **新增业务组件**:
  - `app/components/business/CaptchaInput.vue` - 图形验证码输入组件（作为 FormItem 插槽内容）
  - `app/components/business/VerificationCodeInput.vue` - 短信验证码输入组件（作为 FormItem 插槽内容）
- **新增页面**:
  - `app/pages/login/index.vue` - 登录页面
- **新增 API 类型**:
  - `app/types/api/auth.ts` - 认证相关 API 类型定义
- **新增表单类型**:
  - `app/types/form.ts` - 表单 Schema 类型定义（IFormSchema、IFormItem 等）
- **更新 Store**:
  - `app/stores/user.ts` - 扩展用户认证功能（登录、登出、token 管理）
- **新增 Composable**:
  - `app/composables/useAuth.ts` - 用户认证组合式函数
  - `app/composables/useSmsCode.ts` - 短信验证码组合式函数（倒计时管理）
- **新增 HTTP Client**:
  - `app/infrastructure/http/clients/AuthApiClient.ts` - 认证 API 客户端
- **新增 Transformer**:
  - `app/infrastructure/transformers/authTransformer.ts` - 认证数据转换器
- **依赖**:
  - **@nuxt/ui**: 4.0.0-alpha.2 - 基础 UI 组件
  - **Nuxt**: ^4.0.1 - 框架核心
  - **Pinia**: ^2.1.7 - 状态管理
  - **@pinia/nuxt**: ^0.5.1 - Pinia Nuxt 集成
  - **Radix Vue**: ^1.9.0 - 无障碍组件基础
  - **Tailwind CSS**: ^4.0.0 - 样式系统
  - **Apifox MCP** - API 接口文档和对接
- **运行环境**:
  - **Node.js**: ^20.19.0
  - **pnpm**: ^10.13.0
- **影响范围**:
  - 新增登录功能模块（账号密码 + 手机验证码）
  - 影响需要身份认证的页面（购物车结算、个人中心等）
  - 影响 SpHeaderBar 组件（显示登录状态）
