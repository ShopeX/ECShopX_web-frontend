# 变更摘要

## 需求范围

本次提交汇总近期 web 端体验与接口对接调整，包含登录/注册接口对接、退出登录本地化、H5 分类菜单、装修兜底数据、商品列表装修接入、全局商城设置与商品详情推荐布局修复。

## 主要改动

- 登录注册：手机号/邮箱登录对接 `/wxapp/new_login`，注册对接会员与邮箱注册接口，处理 `status=0` 登录失败提示，表单禁用浏览器自动填充。
- 验证码：注册图形验证码失败后自动刷新，短信验证码按会员注册场景请求。
- 退出登录：不再请求 `/wxapp/auth/logout`，仅清理本地 token/user 状态，退出后跳转首页。
- 导航与头尾：H5 分类菜单按 Figma 简化交互，头部/页脚/首页装修数据为空时使用默认 DSL 渲染。
- 装修预览：补充默认装修 DSL、商品列表原生区块接入、预览高亮与 SSR 轮播定时器保护。
- 商品详情：猜你喜欢 PC 端改为 5 列 grid，避免商品数量不足时卡片被拉伸。
- 全局设置：登录背景、商城 logo 等使用商城全局配置并提供兜底。

## 测试验证

已运行以下回归测试，结果 58 个测试全部通过：

```bash
node --test \
  app/components/BCCategoryNav/bc-category-nav-h5-figma.test.js \
  app/components/BCProductRecommendations/product-recommendations-layout.test.js \
  app/decoration-engine/defaults/default-decoration-dsl.test.js \
  app/decoration-engine/components/decoration-section-contracts.test.js \
  app/decoration-engine/components/web-menu-by-id.test.js \
  app/pages/index-decoration-integration.test.js \
  app/pages/product-list-native-section.test.js \
  app/global-setting-logo-source.test.js \
  app/stores/user-logout-local.test.js \
  app/pages/account/logout-redirect-home.test.js \
  app/pages/account/login-captcha-api.test.js \
  app/pages/account/login-captcha-behavior.test.js \
  app/pages/account/login-captcha-structure.test.js \
  app/pages/account/form-autocomplete-disabled.test.js \
  app/pages/account/register-email-mode.test.js \
  app/pages/account/register-global-setting.test.js
```
