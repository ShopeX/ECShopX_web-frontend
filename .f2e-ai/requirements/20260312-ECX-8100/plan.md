# 开发计划: ECX-8100 会员中心积分功能精化

## 1. 目标
对齐 Figma 最新设计稿 `2511-10465`，完善加载体验，并按 handbook 约定引入 `ECPagination` 和 `data-testid`。

## 2. 与 Handbook 对齐
- **技术栈**：使用 Nuxt 3 + Nuxt UI。
- **组件规范**：
  - 侧边栏菜单使用 `AccountMenu.vue`。
  - 分页方案由“加载更多”改为全局 `ECPagination` 组件。
- **可测性**：所有关键交互元素必须带有 `data-testid`。
- **数据流**：业务逻辑封装在 `useMemberPoint` composable 中。

## 3. 详细任务

### 任务 A: AccountMenu 内容与属性补全
- 为 `AccountMenu.vue` 中的菜单项添加 `data-testid="account-menu-item-${key}"`。
- 确保“积分”菜单项的图标和文案对齐设计稿。

### 任务 B: 个人中心 Dashboard (index.vue) 渲染优化
- 检查 `useMemberPoint` 的调用，确保数值展示区域在 `loadingInfo` 为 true 时展示骨架屏。
- 明细列表在 `loadingList` 为 true 时展示骨架屏，解决“先出空状态再出列表”的闪烁问题。

### 任务 C: 积分详情页 (points.vue) 深度重构
- **布局对齐**：设置外层间距 `lg:gap-16`。
- **分页逻辑**：
  - 删除 `loadMore` 相关按钮和逻辑。
  - 引入 `ECPagination`。
  - 修改 `useMemberPoint` 支持 `pageNo` 的双向绑定或手动通过 `loadList` 刷新。
- **体验**：在切换页码时，列表区域应显示骨架屏。

### 任务 D: I18n 与 验收
- 补全分页组件可能用到的翻译项。
- 运行 `.f2e-ai/requirements/20260312-ECX-8100/test.spec.ts` 进行 E2E 验证。

## 4. 验证方法
- [ ] 刷新 /account 页面，无“暂无记录”闪烁。
- [ ] 访问 /account/points，PC 端侧边栏与内容区间距为 64px。
- [ ] 分页码切换正常，且切换时有加载态。
- [ ] 导出 `data-testid` 完整支持 Playwright 测试。
