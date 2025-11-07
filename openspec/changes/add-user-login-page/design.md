# User Login Page Design

## Context

当前 ECSHOPX Web 项目已有基本的用户状态管理（`stores/user.ts`），但缺少完整的登录页面和表单组件。需要开发一个功能完善、用户体验良好的登录页面，并抽象出可复用的表单 UI 组件。

**设计参考**：用户提供的登录页面设计图展示了以下特性：
- 左侧品牌展示区域（插图 + Logo）
- 右侧登录表单区域
- 支持三种登录方式：账号密码、手机验证码、邮箱验证码
- 表单包含：账号/手机/邮箱输入、密码输入（带显示/隐藏）、图形验证码
- 底部包含找回密码和注册链接

**技术约束**：
- 必须遵循 Nuxt 4 + Vue 3 + TypeScript 项目规范
- 必须使用 Tailwind CSS，禁止自定义 CSS
- 必须使用 `<script setup>` 语法
- 所有组件必须类型安全
- 遵循轻量级 DDD 架构（Composables + HTTP Clients + Transformers）

## Goals / Non-Goals

### Goals
- ✅ 开发符合设计规范的登录页面（紫色系风格，左右布局）
- ✅ **开发基于 Schema 驱动的通用表单系统**（Form.vue + FormItem.vue）
- ✅ 支持多种表单项类型（Input、Select、Radio、Checkbox 等）
- ✅ FormItem 支持插槽方式自定义复杂组件
- ✅ 实现账号密码登录功能
- ✅ **完整实现手机验证码登录功能**（包括验证码发送和倒计时）
- ✅ 集成图形验证码验证
- ✅ 实现登录状态持久化（localStorage + token）
- ✅ 提供友好的错误提示和表单验证
- ✅ 支持 SSR 和客户端水合
- ✅ **使用 Apifox MCP 进行 API 接口对接**

### Non-Goals
- ❌ 不实现邮箱验证码登录（仅预留 UI 接口）
- ❌ 不实现第三方登录（微信、QQ 等）
- ❌ 不实现密码找回完整流程（仅提供入口链接）
- ❌ 不实现注册流程（仅提供入口链接）
- ❌ 不实现双因素认证（2FA）

## Decisions

### 1. 组件架构设计

**决策**：采用基于 Schema 驱动的表单系统，提供通用的 Form 和 FormItem 组件

**理由**：
- **更高的灵活性**：通过 Schema 配置即可生成表单，减少重复代码
- **更好的可维护性**：表单配置集中管理，修改更方便
- **更强的扩展性**：易于添加新的表单项类型
- **支持插槽**：复杂组件（如验证码）可通过插槽自定义
- **遵循现代表单库设计**：参考 Element Plus、Ant Design 等成熟方案

**核心组件**：

#### 1.1 Form.vue（表单容器）
- 接收 `schema` prop（IFormSchema[]）
- 接收 `modelValue` prop（表单数据对象）
- 提供 `validate()` 方法（表单验证）
- 提供 `resetFields()` 方法（重置表单）
- 提供 `v-model` 双向绑定
- 统一管理表单验证状态

#### 1.2 FormItem.vue（表单项）
- 接收 `type` prop（'input' | 'select' | 'radio' | 'checkbox' | 'custom'）
- 接收 `label` prop（表单项标签）
- 接收 `name` prop（字段名）
- 接收 `rules` prop（验证规则）
- 接收 `props` prop（传递给内部组件的属性）
- 支持默认插槽（自定义内容）
- 自动显示错误提示
- 内置常用表单控件（Input、Select、Radio、Checkbox）

**Schema 示例**：
```typescript
const loginSchema: IFormSchema[] = [
  {
    type: 'input',
    name: 'username',
    label: '账号',
    props: {
      placeholder: '请输入账号',
      maxlength: 50
    },
    rules: [
      { required: true, message: '请输入账号' }
    ]
  },
  {
    type: 'input',
    name: 'password',
    label: '密码',
    props: {
      type: 'password',
      placeholder: '请输入密码',
      showPassword: true
    },
    rules: [
      { required: true, message: '请输入密码' },
      { min: 6, message: '密码至少6位' }
    ]
  },
  {
    type: 'custom',
    name: 'captcha',
    label: '验证码',
    // 使用插槽自定义
  }
]
```

**业务组件**（放在 `components/business/`）：
- `CaptchaInput.vue` - 图形验证码输入（通过 FormItem 插槽使用）
- `VerificationCodeInput.vue` - 短信验证码输入（通过 FormItem 插槽使用）

### 2. 数据流设计

**决策**：采用轻量级 DDD 架构

```
登录页面 (pages/login/index.vue)
    ↓
认证 Composable (composables/useAuth.ts)
    ↓
用户 Store (stores/user.ts)
    ↓
认证 API Client (infrastructure/http/clients/AuthApiClient.ts)
    ↓
认证 Transformer (infrastructure/transformers/authTransformer.ts)
```

**理由**：
- 遵循项目现有架构模式（参考 `useCart.ts` 和 `useProduct.ts`）
- 清晰的职责分离：Composable 处理业务逻辑，Store 管理状态，API Client 处理请求
- Transformer 负责 API 数据到应用模型的转换

### 3. 表单验证策略

**决策**：使用客户端验证 + 服务端验证结合的方式

**客户端验证**（在 Composable 中实现）：
- **账号登录**：
  - 账号：非空验证
  - 密码：非空验证，最小长度 6 位
  - 图形验证码：非空验证，4 位
- **验证码登录**：
  - 手机号：非空验证，11 位数字，符合手机号格式
  - 图形验证码：非空验证，4 位
  - 短信验证码：非空验证，6 位数字

**服务端验证**：
- 账号密码正确性
- 手机号是否已注册
- 验证码正确性（图形验证码、短信验证码）
- 账号状态（是否禁用、是否存在等）
- 短信验证码是否过期（5分钟有效期）

**理由**：
- 客户端验证提供即时反馈，提升用户体验
- 服务端验证保证数据安全性
- 符合前后端分离的最佳实践

### 4. 认证状态管理

**决策**：使用 Pinia Store + localStorage 持久化

**状态结构**：
```typescript
interface UserState {
  token: string | null
  userInfo: IUser | null
  isLoggedIn: boolean
}
```

**持久化策略**：
- Token 存储在 localStorage（key: `auth_token`）
- 页面刷新时自动恢复 token
- Token 过期时清除 localStorage 并重定向到登录页

**理由**：
- localStorage 提供客户端持久化能力
- Pinia Store 提供响应式状态管理
- 遵循项目现有的用户状态管理模式

### 5. 验证码处理

**决策**：使用图形验证码 + 短信验证码双重验证

#### 5.1 图形验证码（防机器人）

**流程**：
1. 页面加载时调用 API 获取验证码图片（base64）和 key
2. 用户输入图形验证码
3. 登录/发送短信时将验证码和 key 一起提交
4. 验证失败时刷新验证码

**理由**：
- 防止暴力破解和机器人攻击
- base64 图片无需额外的图片存储服务
- 在发送短信前先验证图形验证码，防止恶意刷短信

#### 5.2 短信验证码（手机登录）

**决策**：实现完整的短信验证码发送和验证流程

**流程**：
1. 用户输入手机号和图形验证码
2. 点击"发送验证码"按钮
3. 前端验证手机号格式和图形验证码
4. 调用 API 发送短信验证码
5. 开始 60 秒倒计时，期间禁用发送按钮
6. 用户输入收到的 6 位短信验证码
7. 点击登录，提交手机号和验证码

**倒计时管理**：
- 使用 `useSmsCode` Composable 管理倒计时状态
- 倒计时结束后允许重新发送
- 页面刷新时清除倒计时状态

**理由**：
- 提供无密码登录方式，提升用户体验
- 短信验证码比密码更安全（一次性）
- 遵循行业标准的验证码登录流程

### 6. UI 样式设计

**决策**：使用 Tailwind CSS + sp- 前缀类名

**布局**：
- 使用 Flexbox/Grid 实现响应式布局
- 左右分栏设计：左侧品牌展示，右侧登录表单
- 移动端自适应：小屏幕隐藏左侧，表单占满屏幕

**颜色方案**：
- 主色调：紫色系（与设计图一致）
- 按钮：红色系（`bg-red-600 hover:bg-red-700`）
- 输入框：灰色边框（`border-gray-300 focus:border-primary`）

**理由**：
- 严格遵循项目规范，禁止自定义 CSS
- 使用 sp- 前缀类名保持项目一致性
- Tailwind CSS 提供完善的响应式和主题能力

### 7. 路由和页面结构

**决策**：使用 `/login` 作为登录页面路由

**页面结构**：
```vue
<template>
  <div class="login-container">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">...</div>
    
    <!-- 右侧表单区域 -->
    <div class="form-section">
      <!-- 登录方式切换 -->
      <FormTabs v-model="loginType" :tabs="tabs" />
      
      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin">
        <FormInput v-model="username" label="登录账号" />
        <FormInput v-model="password" type="password" label="登录密码" />
        <CaptchaInput v-model="captcha" :image="captchaImage" />
        <FormButton type="submit" :loading="loading">登录</FormButton>
      </form>
      
      <!-- 底部链接 -->
      <div class="footer-links">...</div>
    </div>
  </div>
</template>
```

**理由**：
- 清晰的结构，易于维护
- 组件化设计，提高可读性
- 符合 Vue 3 Composition API 最佳实践

## Alternatives Considered

### Alternative 1: 使用第三方表单库（如 VeeValidate）

**未选择理由**：
- 项目规模较小，自定义验证逻辑简单
- 引入第三方库增加打包体积
- 当前简单验证即可满足需求

### Alternative 2: 将登录逻辑直接写在页面组件中

**未选择理由**：
- 不符合项目架构规范
- 逻辑复用性差
- 不利于单元测试

### Alternative 3: 使用 Cookie 存储 Token

**未选择理由**：
- 项目当前使用 localStorage 模式
- Cookie 在跨域场景下配置复杂
- localStorage 更适合 SPA 应用

## Risks / Trade-offs

### 风险 1: Token 安全性

**风险**：localStorage 中的 token 可能被 XSS 攻击窃取

**缓解措施**：
- 严格的输入校验和输出转义
- 使用短期 token + refresh token 机制（未来扩展）
- 实施 CSP（Content Security Policy）

### 风险 2: SSR 兼容性

**风险**：localStorage 在服务端不可用，可能导致 SSR 错误

**缓解措施**：
- 在 Pinia Store 中使用 `import.meta.client` 判断
- 仅在客户端访问 localStorage
- 参考 `stores/user.ts` 现有实现

### 风险 3: 表单组件兼容性

**风险**：新封装的表单组件可能与 Nuxt UI 组件冲突

**缓解措施**：
- 使用明确的命名（FormInput vs Input）
- 基于 Nuxt UI 的基础组件扩展
- 充分测试组件兼容性

### Trade-off 1: 验证码用户体验 vs 安全性

**选择**：优先保证安全性，使用图形验证码

**Trade-off**：
- ✅ 提高安全性，防止暴力破解
- ❌ 增加用户操作步骤，可能影响转化率

### Trade-off 2: 组件粒度 vs 复用性

**选择**：拆分为更细粒度的组件（FormInput、FormButton 等）

**Trade-off**：
- ✅ 提高复用性，未来扩展性强
- ❌ 增加组件数量和文件复杂度

## Migration Plan

### 阶段 1: 开发基础 UI 组件（第 1-2 天）
1. 创建 `FormInput.vue`
2. 创建 `FormButton.vue`
3. 创建 `FormTabs.vue`
4. 创建 `CaptchaInput.vue`
5. 测试组件功能和样式

### 阶段 2: 开发认证基础设施（第 3 天）
1. 创建 `AuthApiClient.ts`
2. 创建 `authTransformer.ts`
3. 定义 `types/api/auth.ts`
4. 更新 `stores/user.ts`

### 阶段 3: 开发登录页面（第 4 天）
1. 创建 `pages/login/index.vue`
2. 创建 `composables/useAuth.ts`
3. 实现登录表单逻辑
4. 实现验证码功能

### 阶段 4: 集成和测试（第 5 天）
1. 集成登录功能到 SpHeaderBar
2. 实现路由守卫（需要登录的页面）
3. 测试各种场景（成功、失败、验证码错误等）
4. 测试 SSR 兼容性

### Rollback Plan
- 如果登录功能有问题，可以临时禁用登录页面路由
- 表单组件独立，删除不影响其他功能
- 认证相关代码与现有功能解耦，可以安全回滚

### 阶段 5: Apifox MCP 集成
1. 使用 Apifox MCP 查看认证相关 API 文档
2. 根据 API 规范调整类型定义
3. 使用 MCP 工具测试接口调用

## Additional: Apifox MCP Integration

### 决策：使用 Apifox MCP 作为 API 接口文档和测试工具

**集成方式**：
1. 通过 Apifox MCP 查看认证相关 API 接口定义
2. 使用 MCP 工具读取接口规范，生成 TypeScript 类型定义
3. 在开发过程中使用 Apifox MCP 调试 API 接口

**API 列表**（通过 Apifox MCP 获取）：
- `POST /auth/login` - 账号密码登录
- `POST /auth/login/phone` - 手机验证码登录
- `POST /auth/logout` - 登出
- `GET /auth/user/info` - 获取用户信息
- `GET /captcha/get` - 获取图形验证码
- `POST /sms/send` - 发送短信验证码

**理由**：
- Apifox MCP 提供标准的 OpenAPI 规范
- 自动生成类型定义，减少手动编写
- 保证前后端接口一致性
- 提供 Mock 数据支持，方便前端开发

## Open Questions

### ✅ 已解决的问题

1. **手机验证码登录**：完整实现（包括发送验证码和倒计时）✅
2. **API 接口对接方式**：使用 Apifox MCP ✅
3. **UI 风格**：与第一张图片风格保持一致（紫色系、左右布局）✅

### ❓ 待确认的问题

1. **密码找回流程**：是否需要在本期实现密码找回完整流程？
   - 建议：先提供入口链接，跳转到独立的密码找回页面（后续实现）

2. **注册流程**：是否需要在本期实现用户注册功能？
   - 建议：先提供"账号登录"和"验证码登录"标签即可，不显示"立即注册"链接

3. **"记住我"功能**：是否需要？
   - 建议：默认 7 天 token 有效期，不需要额外的"记住我"选项

4. **登录成功后跳转逻辑**：
   - 建议：如果有 redirect 参数，跳转到指定页面；否则跳转到首页

5. **短信验证码有效期**：
   - 建议：5 分钟有效期，倒计时 60 秒后可重新发送

6. **多设备登录策略**：是否限制同一账号多设备登录？
   - 建议：本期不限制，由后端 token 策略决定

