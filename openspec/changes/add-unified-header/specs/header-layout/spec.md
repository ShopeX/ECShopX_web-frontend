# Header Layout Specification Changes

## ADDED Requirements

### Requirement: SpHeaderBar组件设计

系统 SHALL 创建 `SpHeaderBar` 组件，封装完整的电商网站Header功能，采用双层结构设计，符合主流电商平台的设计风格，支持用户认证、搜索、导航和购物车功能。

#### Scenario: SpHeaderBar组件创建

- **WHEN** 创建SpHeaderBar组件
- **THEN** 组件位于 `app/components/SpHeaderBar.vue`
- **AND** 使用 `<script setup lang="ts">` 语法
- **AND** 遵循项目的TypeScript严格模式规范
- **AND** 使用Tailwind CSS和sp-前缀类名

### Requirement: 布局集成

系统 SHALL 在 `layouts/default.vue` 中引用 `SpHeaderBar` 组件，替换现有的简单Header实现。

#### Scenario: Layout集成SpHeaderBar

- **WHEN** 在default.vue布局中集成Header
- **THEN** 移除现有的UHeader组件
- **AND** 引入并使用SpHeaderBar组件
- **AND** 保持页面内容区域的正确布局

#### Scenario: 双层Header结构展示

- **WHEN** 用户访问任何使用default布局的页面
- **THEN** SpHeaderBar组件显示统一的双层Header结构
- **AND** 顶部信息栏（黑色背景）显示网站导航和用户功能菜单
- **AND** 主导航栏（白色背景）显示Logo和核心功能区域

#### Scenario: SpHeaderBar顶部信息栏内容展示

- **WHEN** 用户查看SpHeaderBar的顶部信息栏
- **THEN** 左侧显示：网站首页链接、地区选择器、用户登录状态/会员信息
- **AND** 右侧显示：购物车(含数量)、我的订单、个人中心、企业采购、商家服务、网站导航、手机版入口、无障碍功能
- **AND** 所有文字使用白色字体，悬停时显示交互效果

#### Scenario: SpHeaderBar响应式适配

- **WHEN** 在不同屏幕尺寸下访问页面
- **THEN** SpHeaderBar组件自动适配屏幕尺寸
- **AND** 桌面端（≥1024px）显示完整双层结构和所有功能菜单
- **AND** 平板端（768px-1023px）简化顶部信息栏菜单项，保留核心功能
- **AND** 移动端（<768px）顶部信息栏收缩为汉堡菜单，主导航区简化布局

### Requirement: 用户登录状态管理

SpHeaderBar组件 SHALL 集成用户认证状态管理，根据登录状态显示不同的用户界面元素和功能。

#### Scenario: SpHeaderBar未登录状态显示

- **WHEN** 用户未登录访问页面
- **THEN** SpHeaderBar顶部信息栏左侧显示"请登录"链接替代用户名
- **AND** 右侧菜单中"我的订单"、"个人中心"等个人功能显示但点击时跳转登录页
- **AND** 购物车显示"0"或空状态

#### Scenario: SpHeaderBar已登录状态显示

- **WHEN** 用户已登录访问页面
- **THEN** SpHeaderBar顶部信息栏左侧显示"用户名"和会员等级标识（如"PLUS"）
- **AND** 右侧菜单中个人功能正常可用
- **AND** 购物车显示实际商品数量

#### Scenario: 会员等级和地区选择显示

- **WHEN** 已登录用户查看顶部信息栏
- **THEN** 在用户名后显示会员等级标识（如"PLUS"会员标识）
- **AND** 显示地区选择器（如"中国大陆版 - 上海"）
- **AND** 支持点击切换地区设置

### Requirement: 主导航区功能

主导航栏 SHALL 提供Logo展示和核心功能区域，集中展示品牌标识和最重要的用户操作入口。

#### Scenario: Logo和品牌展示

- **WHEN** 用户查看主导航栏
- **THEN** 在左侧显示网站Logo
- **AND** Logo可点击跳转到首页
- **AND** Logo周围有充足的留白空间保持视觉清晰度

#### Scenario: 搜索功能区域

- **WHEN** 用户在主导航栏查看搜索区域
- **THEN** 显示全站搜索框（如果需要的话）
- **AND** 搜索框支持关键词输入和搜索建议
- **AND** 提供搜索按钮或回车触发搜索功能

### Requirement: 顶部导航菜单功能

顶部信息栏的右侧菜单 SHALL 提供完整的电商平台功能导航，包括个人功能、企业服务和平台服务入口。

#### Scenario: 个人功能菜单

- **WHEN** 用户查看顶部信息栏右侧
- **THEN** 显示"购物车"链接及商品数量（如"购物车 9"）
- **AND** 显示"我的订单"、"个人中心"等个人功能入口
- **AND** 购物车数量实时更新，超过99时显示"99+"

#### Scenario: 企业和服务功能

- **WHEN** 用户查看顶部导航菜单
- **THEN** 显示"企业采购"企业级服务入口
- **AND** 显示"商家服务"商户功能入口
- **AND** 提供"网站导航"站点地图功能

#### Scenario: 平台辅助功能

- **WHEN** 用户需要其他平台功能
- **THEN** 提供"手机版"移动端入口链接
- **AND** 提供"网站无障碍"功能入口
- **AND** 所有菜单项支持键盘导航和屏幕阅读器

### Requirement: Tailwind CSS 电商平台设计

SpHeaderBar组件 SHALL 使用Tailwind CSS和sp-前缀类名，实现符合主流电商平台的现代化设计。

#### Scenario: SpHeaderBar双层结构样式实现

- **WHEN** 渲染SpHeaderBar组件
- **THEN** 顶部信息栏使用黑色背景（bg-black text-white）
- **AND** 主导航栏使用白色背景（bg-white）
- **AND** 顶部信息栏高度约32-40px，主导航栏高度约60-80px
- **AND** 使用container布局居中显示内容

#### Scenario: SpHeaderBar交互效果和视觉反馈

- **WHEN** 用户与SpHeaderBar元素交互
- **THEN** 链接悬停时显示轻微的颜色变化或下划线
- **AND** 菜单项点击提供视觉反馈
- **AND** 保持简洁的视觉风格，避免过度的动画效果

#### Scenario: SpHeaderBar响应式适配样式

- **WHEN** 在不同屏幕尺寸下显示SpHeaderBar
- **THEN** 使用Tailwind响应式前缀实现布局适配
- **AND** 移动端隐藏部分菜单项，使用汉堡菜单
- **AND** 保持Logo和核心功能在所有设备上可见
