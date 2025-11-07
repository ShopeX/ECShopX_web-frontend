# User Authentication Specification

## ADDED Requirements

### Requirement: User Login Page

系统 SHALL 提供一个完整的用户登录页面，支持账号密码登录和手机验证码登录方式，并集成图形验证码和短信验证码防护。

#### Scenario: 账号密码登录成功

- **GIVEN** 用户访问 `/login` 页面
- **AND** 用户选择"账号密码"登录方式
- **WHEN** 用户输入有效的账号、密码和验证码
- **AND** 用户点击"登录"按钮
- **THEN** 系统 SHALL 验证用户凭据
- **AND** 系统 SHALL 返回 JWT token 和用户信息
- **AND** 系统 SHALL 将 token 存储到 localStorage
- **AND** 系统 SHALL 更新用户登录状态
- **AND** 系统 SHALL 跳转到目标页面（或首页）

#### Scenario: 账号密码错误

- **GIVEN** 用户访问 `/login` 页面
- **WHEN** 用户输入错误的账号或密码
- **AND** 用户点击"登录"按钮
- **THEN** 系统 SHALL 显示错误提示"账号或密码错误"
- **AND** 系统 SHALL 刷新验证码
- **AND** 系统 SHALL 保持在登录页面

#### Scenario: 验证码错误

- **GIVEN** 用户访问 `/login` 页面
- **WHEN** 用户输入正确的账号和密码，但验证码错误
- **AND** 用户点击"登录"按钮
- **THEN** 系统 SHALL 显示错误提示"验证码错误"
- **AND** 系统 SHALL 刷新验证码
- **AND** 系统 SHALL 保持登录表单数据

#### Scenario: 表单验证失败

- **GIVEN** 用户访问 `/login` 页面
- **WHEN** 用户提交空的账号、密码或验证码
- **THEN** 系统 SHALL 显示字段级错误提示
- **AND** 系统 SHALL 禁用登录按钮直到表单有效
- **AND** 系统 SHALL NOT 发送登录请求

#### Scenario: 手机验证码登录成功

- **GIVEN** 用户访问 `/login` 页面
- **AND** 用户选择"验证码登录"方式
- **WHEN** 用户输入有效的手机号、图形验证码
- **AND** 用户点击"发送验证码"按钮
- **AND** 用户输入收到的短信验证码
- **AND** 用户点击"登录"按钮
- **THEN** 系统 SHALL 验证手机号和验证码
- **AND** 系统 SHALL 返回 JWT token 和用户信息
- **AND** 系统 SHALL 将 token 存储到 localStorage
- **AND** 系统 SHALL 更新用户登录状态
- **AND** 系统 SHALL 跳转到目标页面（或首页）

#### Scenario: 手机号格式错误

- **GIVEN** 用户访问 `/login` 页面
- **AND** 用户选择"验证码登录"方式
- **WHEN** 用户输入错误格式的手机号（非 11 位数字）
- **AND** 用户点击"发送验证码"按钮
- **THEN** 系统 SHALL 显示错误提示"请输入正确的手机号"
- **AND** 系统 SHALL NOT 发送短信验证码

#### Scenario: 短信验证码发送成功

- **GIVEN** 用户访问 `/login` 页面
- **AND** 用户选择"验证码登录"方式
- **WHEN** 用户输入有效的手机号和图形验证码
- **AND** 用户点击"发送验证码"按钮
- **THEN** 系统 SHALL 调用短信验证码发送 API
- **AND** 系统 SHALL 显示成功提示"验证码已发送"
- **AND** 系统 SHALL 开始 60 秒倒计时
- **AND** 系统 SHALL 禁用"发送验证码"按钮
- **AND** 按钮文本 SHALL 显示剩余秒数（如"59秒后重发"）

#### Scenario: 短信验证码倒计时结束

- **GIVEN** 用户已发送短信验证码
- **AND** 倒计时正在进行中
- **WHEN** 倒计时结束（60 秒后）
- **THEN** 系统 SHALL 启用"发送验证码"按钮
- **AND** 按钮文本 SHALL 恢复为"发送验证码"
- **AND** 用户 SHALL 可以重新发送验证码

#### Scenario: 短信验证码错误

- **GIVEN** 用户已接收短信验证码
- **WHEN** 用户输入错误的验证码
- **AND** 用户点击"登录"按钮
- **THEN** 系统 SHALL 显示错误提示"验证码错误或已过期"
- **AND** 系统 SHALL 保持在登录页面
- **AND** 系统 SHALL 保持手机号输入

### Requirement: Schema-Driven Form System

系统 SHALL 提供基于 Schema 驱动的通用表单系统，包括 Form 和 FormItem 组件，支持通过配置动态渲染表单。

#### Scenario: 使用 Form 组件渲染表单

- **GIVEN** 开发者需要创建表单
- **WHEN** 开发者使用 `<Form>` 组件并传入 schema
- **THEN** 组件 SHALL 根据 schema 动态渲染表单项
- **AND** 组件 SHALL 支持 v-model 双向绑定表单数据
- **AND** 组件 SHALL 提供 `validate()` 方法用于表单验证
- **AND** 组件 SHALL 提供 `resetFields()` 方法用于重置表单
- **AND** 组件 SHALL 统一管理表单验证状态
- **AND** 组件 SHALL 使用 Tailwind CSS 样式
- **AND** 组件 SHALL 具有完整的 TypeScript 类型定义

#### Scenario: 使用 FormItem 组件渲染 Input 类型

- **GIVEN** 开发者在 schema 中定义 type="input" 的表单项
- **WHEN** Form 组件渲染该表单项
- **THEN** FormItem SHALL 渲染为输入框
- **AND** FormItem SHALL 支持 text、password、email、tel 等 input type
- **AND** FormItem SHALL 支持 placeholder、maxlength 等属性
- **AND** FormItem SHALL 支持密码显示/隐藏切换（type="password" 时）
- **AND** FormItem SHALL 显示 label
- **AND** FormItem SHALL 显示验证错误提示

#### Scenario: 使用 FormItem 组件渲染 Select 类型

- **GIVEN** 开发者在 schema 中定义 type="select" 的表单项
- **WHEN** Form 组件渲染该表单项
- **THEN** FormItem SHALL 渲染为下拉选择框
- **AND** FormItem SHALL 支持 options 属性（选项列表）
- **AND** FormItem SHALL 支持 placeholder 属性
- **AND** FormItem SHALL 支持单选和多选模式

#### Scenario: 使用 FormItem 组件渲染 Radio 类型

- **GIVEN** 开发者在 schema 中定义 type="radio" 的表单项
- **WHEN** Form 组件渲染该表单项
- **THEN** FormItem SHALL 渲染为单选按钮组
- **AND** FormItem SHALL 支持 options 属性（选项列表）
- **AND** FormItem SHALL 支持横向和纵向布局

#### Scenario: 使用 FormItem 组件渲染 Checkbox 类型

- **GIVEN** 开发者在 schema 中定义 type="checkbox" 的表单项
- **WHEN** Form 组件渲染该表单项
- **THEN** FormItem SHALL 渲染为复选框
- **AND** FormItem SHALL 支持单个复选框或复选框组
- **AND** FormItem SHALL 支持 options 属性（选项列表，用于复选框组）

#### Scenario: 使用 FormItem 插槽自定义内容

- **GIVEN** 开发者在 schema 中定义 type="custom" 的表单项
- **AND** 开发者在模板中使用 FormItem 插槽
- **WHEN** Form 组件渲染该表单项
- **THEN** FormItem SHALL 渲染插槽内容
- **AND** FormItem SHALL 显示 label
- **AND** FormItem SHALL 支持验证规则
- **AND** FormItem SHALL 显示验证错误提示

#### Scenario: FormItem 字段验证

- **GIVEN** 表单项配置了验证规则（rules）
- **WHEN** 用户输入或提交表单
- **THEN** FormItem SHALL 根据 rules 验证字段值
- **AND** 验证失败时 SHALL 显示错误提示
- **AND** 验证成功时 SHALL 清除错误提示
- **AND** 支持 required、min、max、pattern 等常用验证规则

#### Scenario: 使用 CaptchaInput 组件（业务组件）

- **GIVEN** 开发者需要图形验证码输入
- **WHEN** 开发者在 FormItem 插槽中使用 `<CaptchaInput>` 组件
- **THEN** 组件 SHALL 显示输入框和验证码图片
- **AND** 组件 SHALL 支持 v-model 双向绑定验证码值
- **AND** 组件 SHALL 支持点击图片刷新验证码
- **AND** 组件 SHALL 支持传入验证码图片 URL 或 base64
- **AND** 组件 SHALL 限制输入为 4 位
- **AND** 组件 SHALL 能够作为 FormItem 插槽内容使用

#### Scenario: 使用 VerificationCodeInput 组件（业务组件）

- **GIVEN** 开发者需要短信验证码输入
- **WHEN** 开发者在 FormItem 插槽中使用 `<VerificationCodeInput>` 组件
- **THEN** 组件 SHALL 显示输入框和"发送验证码"按钮
- **AND** 组件 SHALL 支持 v-model 双向绑定验证码值
- **AND** 组件 SHALL 支持自定义发送验证码方法（通过 prop）
- **AND** 组件 SHALL 在点击按钮后开始 60 秒倒计时
- **AND** 倒计时期间按钮 SHALL 显示剩余秒数（如"59秒后重发"）
- **AND** 倒计时期间按钮 SHALL 为禁用状态
- **AND** 倒计时结束后按钮 SHALL 恢复可用状态
- **AND** 组件 SHALL 限制输入为 6 位数字
- **AND** 组件 SHALL 能够作为 FormItem 插槽内容使用

### Requirement: User Authentication State Management

系统 SHALL 使用 Pinia Store 管理用户认证状态，并支持 token 持久化和页面刷新恢复。

#### Scenario: 登录成功更新状态

- **GIVEN** 用户登录成功
- **WHEN** 系统收到登录响应（token 和用户信息）
- **THEN** 系统 SHALL 将 token 存储到 localStorage（key: `auth_token`）
- **AND** 系统 SHALL 更新 Pinia Store 的 `token` 状态
- **AND** 系统 SHALL 更新 Pinia Store 的 `userInfo` 状态
- **AND** 系统 SHALL 设置 `isLoggedIn` 为 `true`

#### Scenario: 页面刷新恢复登录状态

- **GIVEN** 用户已登录并刷新页面
- **WHEN** 应用初始化时
- **THEN** 系统 SHALL 从 localStorage 读取 token
- **AND** 系统 SHALL 恢复 Pinia Store 的 `token` 状态
- **AND** 系统 SHALL 调用 API 获取用户信息
- **AND** 系统 SHALL 更新 `userInfo` 和 `isLoggedIn` 状态

#### Scenario: 登出清除状态

- **GIVEN** 用户已登录
- **WHEN** 用户点击登出
- **THEN** 系统 SHALL 清除 localStorage 中的 token
- **AND** 系统 SHALL 清空 Pinia Store 的 `token` 和 `userInfo`
- **AND** 系统 SHALL 设置 `isLoggedIn` 为 `false`
- **AND** 系统 SHALL 跳转到登录页面

#### Scenario: Token 过期处理

- **GIVEN** 用户的 token 已过期
- **WHEN** 系统调用需要认证的 API
- **THEN** 系统 SHALL 接收到 401 未授权响应
- **AND** 系统 SHALL 清除登录状态
- **AND** 系统 SHALL 跳转到登录页面
- **AND** 系统 SHALL 显示提示"登录已过期，请重新登录"

### Requirement: Captcha Verification

系统 SHALL 提供图形验证码功能，防止暴力破解和机器人攻击。

#### Scenario: 获取验证码

- **GIVEN** 用户访问登录页面
- **WHEN** 页面加载完成
- **THEN** 系统 SHALL 调用 `/captcha/get` API
- **AND** 系统 SHALL 接收验证码图片（base64）和 key
- **AND** 系统 SHALL 显示验证码图片

#### Scenario: 刷新验证码

- **GIVEN** 用户在登录页面
- **WHEN** 用户点击验证码图片
- **THEN** 系统 SHALL 调用 `/captcha/get` API 获取新验证码
- **AND** 系统 SHALL 更新验证码图片
- **AND** 系统 SHALL 清空验证码输入框

#### Scenario: 验证码提交

- **GIVEN** 用户输入验证码
- **WHEN** 用户提交登录表单
- **THEN** 系统 SHALL 将验证码值和 key 一起发送到后端
- **AND** 系统 SHALL 等待后端验证结果

### Requirement: Login Page UI/UX

系统 SHALL 提供符合设计规范的登录页面 UI，支持响应式布局和良好的用户体验。

#### Scenario: 页面布局（桌面端）

- **GIVEN** 用户在桌面浏览器访问登录页面
- **WHEN** 页面加载完成
- **THEN** 系统 SHALL 显示左右分栏布局
- **AND** 左侧 SHALL 显示品牌插图和 Logo
- **AND** 右侧 SHALL 显示登录表单
- **AND** 使用紫色系作为主色调
- **AND** 使用红色系登录按钮

#### Scenario: 页面布局（移动端）

- **GIVEN** 用户在移动设备访问登录页面
- **WHEN** 页面加载完成
- **THEN** 系统 SHALL 隐藏左侧品牌区域
- **AND** 系统 SHALL 登录表单占满屏幕宽度
- **AND** 系统 SHALL 自适应屏幕大小

#### Scenario: 密码显示/隐藏

- **GIVEN** 用户在密码输入框中输入密码
- **WHEN** 用户点击密码输入框右侧的眼睛图标
- **THEN** 系统 SHALL 切换密码显示/隐藏状态
- **AND** 图标 SHALL 切换为相应的状态（睁眼/闭眼）

#### Scenario: 登录方式切换

- **GIVEN** 用户在登录页面
- **WHEN** 用户点击不同的登录方式标签（"账号登录" ↔ "验证码登录"）
- **THEN** 系统 SHALL 切换到对应的登录表单
- **AND** 系统 SHALL 清空表单输入
- **AND** 系统 SHALL 刷新图形验证码

#### Scenario: 找回密码链接

- **GIVEN** 用户在登录页面
- **WHEN** 用户点击"忘记密码"链接
- **THEN** 系统 SHALL 跳转到密码找回页面（`/forgot-password`）

### Requirement: Authentication API Integration

系统 SHALL 实现认证相关的 API 客户端和数据转换器，遵循轻量级 DDD 架构，并使用 Apifox MCP 进行接口对接。

#### Scenario: 使用 Apifox MCP 查看 API 文档

- **GIVEN** 开发者需要实现认证 API
- **WHEN** 开发者使用 Apifox MCP 工具
- **THEN** 系统 SHALL 读取 `/auth/login` 接口定义
- **AND** 系统 SHALL 读取 `/auth/login/phone` 接口定义
- **AND** 系统 SHALL 读取 `/sms/send` 接口定义
- **AND** 系统 SHALL 读取 `/captcha/get` 接口定义
- **AND** 系统 SHALL 根据接口文档生成 TypeScript 类型定义

#### Scenario: 调用账号密码登录 API

- **GIVEN** 用户提交账号密码登录表单
- **WHEN** `AuthApiClient.login()` 被调用
- **THEN** 系统 SHALL 发送 POST 请求到 `/auth/login`
- **AND** 请求体 SHALL 包含 `username`, `password`, `captcha`, `captchaKey`
- **AND** 系统 SHALL 返回 API 原始响应

#### Scenario: 调用手机验证码登录 API

- **GIVEN** 用户提交手机验证码登录表单
- **WHEN** `AuthApiClient.loginWithPhone()` 被调用
- **THEN** 系统 SHALL 发送 POST 请求到 `/auth/login/phone`
- **AND** 请求体 SHALL 包含 `phone`, `smsCode`
- **AND** 系统 SHALL 返回 API 原始响应

#### Scenario: 调用发送短信验证码 API

- **GIVEN** 用户点击"发送验证码"按钮
- **AND** 手机号和图形验证码验证通过
- **WHEN** `AuthApiClient.sendSmsCode()` 被调用
- **THEN** 系统 SHALL 发送 POST 请求到 `/sms/send`
- **AND** 请求体 SHALL 包含 `phone`, `captcha`, `captchaKey`
- **AND** 系统 SHALL 返回发送结果

#### Scenario: 转换登录响应数据

- **GIVEN** API 返回登录响应
- **WHEN** `AuthTransformer.toModel()` 被调用
- **THEN** 系统 SHALL 将 API 响应转换为应用模型
- **AND** 系统 SHALL 验证必要字段（token, userInfo）
- **AND** 系统 SHALL 处理异常数据（设置默认值或抛出错误）

#### Scenario: 调用获取用户信息 API

- **GIVEN** 用户已登录且有有效 token
- **WHEN** `AuthApiClient.getUserInfo()` 被调用
- **THEN** 系统 SHALL 发送 GET 请求到 `/user/info`
- **AND** 请求头 SHALL 包含 Authorization: Bearer {token}
- **AND** 系统 SHALL 返回用户信息

### Requirement: Form Validation

系统 SHALL 提供完善的表单验证，确保数据有效性并提供友好的错误提示。

#### Scenario: 账号字段验证

- **GIVEN** 用户在账号输入框输入
- **WHEN** 输入框失去焦点或用户提交表单
- **THEN** 系统 SHALL 验证账号非空
- **AND** 如果为空，SHALL 显示错误提示"请输入账号"

#### Scenario: 密码字段验证

- **GIVEN** 用户在密码输入框输入
- **WHEN** 输入框失去焦点或用户提交表单
- **THEN** 系统 SHALL 验证密码非空
- **AND** 系统 SHALL 验证密码长度至少 6 位
- **AND** 如果不满足，SHALL 显示相应错误提示

#### Scenario: 图形验证码字段验证

- **GIVEN** 用户在图形验证码输入框输入
- **WHEN** 输入框失去焦点或用户提交表单
- **THEN** 系统 SHALL 验证图形验证码非空
- **AND** 系统 SHALL 验证图形验证码为 4 位
- **AND** 如果不满足，SHALL 显示相应错误提示

#### Scenario: 手机号字段验证

- **GIVEN** 用户在手机号输入框输入
- **WHEN** 输入框失去焦点或用户点击"发送验证码"
- **THEN** 系统 SHALL 验证手机号非空
- **AND** 系统 SHALL 验证手机号为 11 位数字
- **AND** 系统 SHALL 验证手机号符合中国手机号格式（1开头）
- **AND** 如果不满足，SHALL 显示相应错误提示

#### Scenario: 短信验证码字段验证

- **GIVEN** 用户在短信验证码输入框输入
- **WHEN** 输入框失去焦点或用户提交表单
- **THEN** 系统 SHALL 验证短信验证码非空
- **AND** 系统 SHALL 验证短信验证码为 6 位数字
- **AND** 如果不满足，SHALL 显示相应错误提示

### Requirement: Loading and Error States

系统 SHALL 在登录过程中提供加载状态和错误处理，确保良好的用户体验。

#### Scenario: 登录加载状态

- **GIVEN** 用户点击登录按钮
- **WHEN** 登录请求正在进行中
- **THEN** 系统 SHALL 显示加载动画（按钮内）
- **AND** 系统 SHALL 禁用登录按钮
- **AND** 系统 SHALL 禁用表单输入

#### Scenario: 登录成功反馈

- **GIVEN** 登录请求成功
- **WHEN** 系统收到成功响应
- **THEN** 系统 SHALL 显示成功提示（Toast）
- **AND** 系统 SHALL 在 0.5 秒后跳转到目标页面

#### Scenario: 登录失败反馈

- **GIVEN** 登录请求失败
- **WHEN** 系统收到错误响应
- **THEN** 系统 SHALL 显示错误提示（Toast 或表单内提示）
- **AND** 系统 SHALL 刷新验证码
- **AND** 系统 SHALL 保持表单输入（账号和密码）
- **AND** 系统 SHALL 清空验证码输入

#### Scenario: 网络错误处理

- **GIVEN** 用户提交登录表单
- **WHEN** 网络请求失败（超时或无网络）
- **THEN** 系统 SHALL 显示错误提示"网络连接失败，请稍后重试"
- **AND** 系统 SHALL 保持表单状态

### Requirement: SSR Compatibility

系统 SHALL 确保登录功能与 Nuxt SSR 兼容，避免服务端渲染错误。

#### Scenario: 服务端渲染时不访问 localStorage

- **GIVEN** 登录页面在服务端渲染
- **WHEN** Pinia Store 初始化
- **THEN** 系统 SHALL 检测 `import.meta.server`
- **AND** 系统 SHALL NOT 访问 localStorage
- **AND** 系统 SHALL 返回默认空状态

#### Scenario: 客户端水合后恢复状态

- **GIVEN** 页面在客户端水合完成
- **WHEN** Pinia Store 在客户端初始化
- **THEN** 系统 SHALL 从 localStorage 读取 token
- **AND** 系统 SHALL 恢复登录状态

### Requirement: Security Best Practices

系统 SHALL 实施安全最佳实践，保护用户账号和数据安全。

#### Scenario: 密码不明文显示

- **GIVEN** 用户输入密码
- **WHEN** 密码输入框未点击显示按钮
- **THEN** 系统 SHALL 以圆点或星号显示密码
- **AND** 系统 SHALL NOT 在控制台或日志中输出密码

#### Scenario: Token 安全存储

- **GIVEN** 用户登录成功获得 token
- **WHEN** 系统存储 token
- **THEN** 系统 SHALL 存储到 localStorage（key: `auth_token`）
- **AND** 系统 SHALL NOT 在 URL 参数中传递 token
- **AND** 系统 SHALL NOT 在控制台输出 token

#### Scenario: 敏感信息不缓存

- **GIVEN** 用户在登录页面
- **WHEN** 浏览器缓存页面
- **THEN** 系统 SHALL 设置适当的 Cache-Control 头
- **AND** 系统 SHALL NOT 缓存包含敏感信息的页面
