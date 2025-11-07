# User Login Page Implementation Tasks

## 1. 表单类型定义

- [x] 1.1 创建 `types/form.ts`
  - 定义 `IFormSchema` 接口（表单配置项）
  - 定义 `IFormItem` 接口（表单项配置）
  - 定义 `IFormRule` 接口（验证规则）
  - 定义 `FormItemType` 类型（'input' | 'select' | 'radio' | 'checkbox' | 'custom'）
  - 定义 `IFormProps` 接口（Form 组件 props）
  - 定义 `IFormItemProps` 接口（FormItem 组件 props）
  - 使用 TypeScript interface 定义所有类型

## 2. 基于 Schema 的表单系统开发

- [x] 2.1 创建 `components/ui/Form.vue` 组件
  - 接收 `schema` prop（IFormSchema[]）
  - 接收 `modelValue` prop（表单数据对象）
  - 实现 `v-model` 双向绑定
  - 实现 `validate()` 方法（表单验证）
  - 实现 `resetFields()` 方法（重置表单）
  - 管理表单验证状态（errors）
  - 使用 Tailwind CSS 样式
  - 实现完整的 TypeScript 类型定义

- [x] 2.2 创建 `components/ui/FormItem.vue` 组件
  - 接收 `type` prop（表单项类型）
  - 接收 `label` prop（表单项标签）
  - 接收 `name` prop（字段名）
  - 接收 `rules` prop（验证规则）
  - 接收 `props` prop（传递给内部组件的属性）
  - 支持默认插槽（自定义内容）
  - 实现内置表单控件渲染（Input、Select、Radio、Checkbox）
  - 实现字段验证逻辑
  - 显示错误提示
  - 使用 Tailwind CSS 样式
  - 实现完整的 TypeScript 类型定义

- [x] 2.3 创建 `components/business/CaptchaInput.vue` 组件
  - 左侧输入框（4 位图形验证码）
  - 右侧验证码图片（支持点击刷新）
  - 支持 v-model 双向绑定
  - 支持作为 FormItem 插槽内容使用
  - 实现完整的 TypeScript 类型定义

- [x] 2.4 创建 `components/business/VerificationCodeInput.vue` 组件
  - 左侧输入框（6 位短信验证码）
  - 右侧"发送验证码"按钮（带 60 秒倒计时）
  - 支持 v-model 双向绑定
  - 倒计时期间禁用按钮，显示剩余秒数
  - 支持自定义发送验证码方法
  - 支持作为 FormItem 插槽内容使用
  - 实现完整的 TypeScript 类型定义

## 3. 认证 API 类型定义

- [x] 3.1 使用 Apifox MCP 查看认证相关 API 文档
  - 读取 `/auth/login` 接口定义
  - 读取 `/auth/login/phone` 接口定义
  - 读取 `/sms/send` 接口定义
  - 读取 `/captcha/get` 接口定义
  - 读取用户信息相关接口

- [x] 3.2 创建 `types/api/auth.ts`
  - 根据 Apifox MCP 接口文档定义登录请求接口
  - 定义账号密码登录接口（`ILoginRequest`）
  - 定义手机验证码登录接口（`IPhoneLoginRequest`）
  - 定义登录响应接口（`ILoginResponse`：token、用户信息）
  - 定义图形验证码接口（`ICaptchaResponse`）
  - 定义短信验证码发送接口（`ISmsCodeRequest`）
  - 定义用户信息接口（`IUserInfo`）
  - 使用 TypeScript interface 定义所有类型

## 4. 认证基础设施层

- [x] 4.1 创建 `infrastructure/http/clients/AuthApiClient.ts`
  - 实现 `login()` 方法（账号密码登录）
  - **实现 `loginWithPhone()` 方法（手机验证码登录）**
  - 实现 `getCaptcha()` 方法（获取图形验证码）
  - **实现 `sendSmsCode()` 方法（发送短信验证码）**
  - 实现 `getUserInfo()` 方法（获取用户信息）
  - 实现 `logout()` 方法（登出）
  - 导出到 `infrastructure/http/clients/index.ts`
  - 使用 Apifox MCP 验证接口调用

- [x] 4.2 创建 `infrastructure/transformers/authTransformer.ts`
  - 实现 `toModel()` 方法（API 响应 → 应用模型）
  - 实现数据验证和清洗
  - 处理异常数据情况
  - 导出到 `infrastructure/transformers/index.ts`

## 5. 用户状态管理

- [x] 5.1 更新 `stores/user.ts`
  - 添加 `login()` action（处理账号密码登录）
  - 添加 `loginWithPhone()` action（处理手机验证码登录）
  - 添加 `logout()` action（清除登录状态）
  - 添加 `setToken()` action（设置 token）
  - 添加 `getUserInfo()` action（获取用户信息）
  - 实现 token 持久化到 localStorage
  - 实现页面刷新时恢复 token
  - 确保 SSR 兼容性（使用 `import.meta.client`）

## 6. 认证 Composable

- [x] 6.1 创建 `composables/useAuth.ts`
  - 实现 `login()` 方法（处理账号密码登录）
  - **实现 `loginWithPhone()` 方法（处理手机验证码登录）**
  - 实现 `logout()` 方法（登出逻辑）
  - 实现 `refreshCaptcha()` 方法（刷新图形验证码）
  - 实现表单验证逻辑（账号、密码、手机号、验证码）
  - 实现错误处理和提示
  - 提供响应式状态（loading、error、captchaImage 等）

- [x] 6.2 创建 `composables/useSmsCode.ts`
  - 实现倒计时管理（60 秒）
  - 提供 `sendCode()` 方法（发送短信验证码）
  - 提供 `countdown` 状态（剩余秒数）
  - 提供 `isSending` 状态（是否正在发送）
  - 提供 `canResend` 计算属性（是否可以重新发送）
  - 页面刷新时清除倒计时

## 7. 登录页面开发

- [x] 7.1 创建 `pages/login/index.vue`
  - 实现页面整体布局（左右分栏，紫色系风格）
  - 实现左侧品牌展示区域（与第一张图片风格一致）
  - 实现右侧登录表单区域
  - 实现登录方式切换（标签页："账号登录" ↔ "验证码登录"）
  - **实现账号登录表单**（使用 Form + FormSchema）：
    - 定义账号登录 Schema（账号、密码、图形验证码）
    - 使用 `<Form>` 组件渲染表单
    - 图形验证码使用 `<FormItem type="custom">` + 插槽
    - 集成 CaptchaInput 组件到插槽
    - 添加登录按钮
  - **实现验证码登录表单**（使用 Form + FormSchema）：
    - 定义验证码登录 Schema（手机号、图形验证码、短信验证码）
    - 使用 `<Form>` 组件渲染表单
    - 图形验证码和短信验证码使用插槽
    - 集成 CaptchaInput 和 VerificationCodeInput 组件
    - 添加登录按钮
  - 实现表单提交逻辑（根据登录方式）
  - 实现错误提示（Toast）
  - 实现找回密码链接
  - 实现响应式设计（移动端适配）
  - 实现登录成功后跳转逻辑

- [x] 7.2 实现 SEO 优化
  - 设置页面 title 和 meta 信息
  - 使用 `definePageMeta()` 配置页面元数据

## 8. 集成和测试

- [x] 8.1 集成登录功能到 SpHeaderBar
  - 更新 `components/SpHeaderBar.vue`
  - 显示登录/登出按钮
  - 显示用户信息（登录后）
  - 实现跳转到登录页面逻辑

- [x] 8.2 实现路由守卫（可选）
  - 创建 `middleware/auth.ts`（如果需要）
  - 保护需要登录的页面（如购物车结算页）

- [x] 8.3 功能测试 - 账号密码登录
  - 测试账号密码登录成功场景
  - 测试账号密码错误场景
  - 测试图形验证码错误场景
  - 测试图形验证码刷新功能
  - 测试表单验证（空值、格式错误）

- [x] 8.4 功能测试 - 手机验证码登录
  - **测试手机号格式验证**
  - **测试图形验证码验证后发送短信**
  - **测试短信验证码发送成功**
  - **测试 60 秒倒计时功能**
  - **测试倒计时期间禁止重复发送**
  - **测试短信验证码登录成功**
  - **测试短信验证码错误场景**

- [x] 8.5 通用功能测试
  - 测试登录成功后跳转
  - 测试登出功能
  - 测试 token 持久化和恢复
  - 测试 SSR 兼容性（页面刷新）
  - 测试响应式布局（移动端）

- [x] 8.6 样式验证
  - 验证所有样式使用 Tailwind CSS
  - 验证 sp- 前缀类名的使用
  - 验证与第一张设计图的风格一致性（紫色系、左右布局）
  - 验证深色模式兼容性（如果项目支持）

- [x] 8.7 Apifox MCP 集成验证
  - 验证 API 接口调用正确性
  - 验证类型定义与接口文档一致
  - 使用 MCP 工具测试接口响应

## 9. 文档和清理

- [x] 9.1 更新文档
  - 在 tasks.md 中标记所有任务为完成
  - 准备提交验证

- [x] 9.2 代码审查
  - 确保所有代码通过 TypeScript 类型检查
  - 确保所有代码通过 ESLint 检查
  - 确保代码符合项目规范
  - 添加必要的注释

## 10. 验证和部署准备

- [x] 10.1 运行验证
  - 执行 `openspec validate add-user-login-page --strict`
  - 修复所有验证错误

- [x] 10.2 准备演示
  - 准备功能演示流程（账号登录 + 验证码登录）
  - 准备问题反馈收集
