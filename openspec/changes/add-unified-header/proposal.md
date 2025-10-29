# 添加统一网站Header提案

## Why

当前项目存在多个分散的Header组件（Header.vue、TopBar.vue、SpNavbar.vue），且`layouts/default.vue`使用的是简单的Nuxt UI组件，缺乏统一的电商网站Header体验。需要整合现有组件，建立统一的Header规范。

## What Changes

- 创建新的 `SpHeaderBar` 组件，封装完整的电商Header功能
- 在 `layouts/default.vue` 中引用 `SpHeaderBar` 组件
- 整合现有Header相关组件的功能到 `SpHeaderBar` 中
- 实现符合电商平台的双层Header结构：
  - **顶部信息栏**（黑色背景）：网站导航、地区选择、用户登录状态、快捷功能菜单
  - **主导航栏**（白色背景）：Logo、全站搜索框、购物车等核心功能区
- 基于参考图片实现具体的布局和功能：
  - 顶部栏左侧：首页链接、地区选择、会员信息显示
  - 顶部栏右侧：购物车、订单、个人中心、企业服务、商家服务、网站导航、手机版、无障碍等
  - 主导航区：Logo展示和搜索功能区域
- 使用Tailwind CSS和sp-前缀类名实现响应式设计
- 支持用户登录状态管理和完整的电商导航功能
- 遵循项目的组件命名规范，使用 `sp-` 前缀

## Impact

- **Affected specs**: 新建 header-layout capability
- **Affected code**:
  - `app/components/SpHeaderBar.vue` - 新建电商Header组件
  - `app/layouts/default.vue` - 引用SpHeaderBar组件
  - 相关composables和stores的用户状态管理
