# 登录页图形验证码设计说明

## 目标

在登录页的“短信验证码登录”模式中补齐图形验证码能力，接入真实接口 `GET /wxapp/distributor/image/code`，并按提供的 PC / H5 Figma 恢复 UI。

## 范围

- 仅改造 `app/pages/account/login.vue`
- 仅对“短信验证码登录”模式新增图形验证码输入与验证码图片
- 保留“账号密码登录”模式，不改其交互和校验逻辑
- 修正图形验证码接口路径
- 发送短信验证码前，强制要求用户输入图形验证码

## 不在本期范围

- 不为“账号密码登录”模式新增图形验证码
- 不修改短信验证码发送接口本身
- 不重构整个登录页为全新组件体系
- 不新增弹层式验证码交互

## 当前问题

现有实现存在两个明显问题：

1. 登录页会在发送短信前偷偷拉取图形验证码，但界面中没有真实渲染“图片验证码”输入区，用户无法填写。
2. 图形验证码接口接错了，当前 `AuthApiClient` 使用的是 `/wxapp/member/image/code`，需求指定应改为 `/wxapp/distributor/image/code`。

## 设计方案

### 页面结构

短信验证码登录模式的表单顺序调整为：

1. 手机号码
2. 图片验证码
3. 短信验证码
4. 1年内免登录
5. 登录 / 注册按钮
6. 切换到账号登录链接

账号密码登录模式保持现状。

### PC 布局

按 Figma `2655:3144` 对齐：

- 右侧登录面板维持 560px 宽
- “图片验证码”一行采用左侧输入、右侧图片的横向布局
- 验证码图片区域尺寸约 `101x40`
- 验证码刷新通过点击图片完成

### H5 布局

按 Figma `2864:23719` 对齐：

- 保持现有登录页内容节奏
- “图片验证码”在 H5 中同样是左输入右图片
- 底部按钮顺序和层级不变

## 数据与状态

### useAuth

继续由 `useAuth` 持有图形验证码状态：

- `captcha`
- `captchaLoading`
- `getCaptcha(type = 'login')`
- `refreshCaptcha()`

但 `getCaptcha` 请求路径要切换到 `/wxapp/distributor/image/code`。

### login.vue

新增本地状态：

- `phoneForm.captchaCode`

行为规则：

- 切换到短信验证码登录模式时，若当前没有 captcha，则请求一次
- 点击验证码图片时刷新并清空 `phoneForm.captchaCode`
- 发送短信验证码前校验：
  - 手机号必填且格式合法
  - 图形验证码必填
  - captcha token 存在

发送短信验证码时，传入：

- `mobile = phoneForm.phone`
- `yzm = phoneForm.captchaCode`
- `token = captcha.value?.imageToken`

### 组件策略

仓库已有 `BCCaptchaInput.vue`，但当前样式是圆角边框输入，不符合登录页 Figma 的“底边线 + 右侧图片”形态。

因此本次建议：

- 不直接复用 `BCCaptchaInput.vue`
- 在 `login.vue` 中就地实现 Figma 对齐结构
- 保留 `BCCaptchaInput.vue` 不动，避免影响其他页面

## 错误处理

- 获取图形验证码失败：显示既有错误文案 `bbf44084.81340f`
- 未输入图形验证码点击发送短信：显示 `bbf44084.d0c06a` 不合适，需新增或复用更准确文案
- 短信验证码发送失败：保持现有错误提示
- 刷新验证码时应清空用户已输入的图形验证码，避免 token 与输入不匹配

## 测试策略

新增覆盖：

1. API client 测试
- `getCaptcha()` 请求 `/wxapp/distributor/image/code`

2. 登录页结构测试
- 短信登录模式包含“图片验证码”输入和验证码图片区域
- 页面仍保留“账号登录 / 验证码登录”双模式

3. 登录页行为测试
- 发送短信前要求 `phoneForm.captchaCode`
- 发送短信时使用 `captcha.value?.imageToken`
- 刷新验证码时清空输入值

## 风险

- 图形验证码响应字段目前沿用现有 `AuthTransformer` 假设，如果真实返回结构与现有模型不一致，后续需再补 transformer
- 登录页当前 PC/H5 模板写在一个页面里，改动时要避免影响账号密码登录模式的布局
