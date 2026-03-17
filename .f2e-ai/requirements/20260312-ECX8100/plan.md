# 开发计划: ECX-8100 个人中心积分展示集成 (优化版)

## 1. 目标
删除所有关于“我的积分”详情页（points.vue）的逻辑，将其原本的分页流水功能完全平移并整合至个人中心首页（index.vue）。

## 2. 关键任务

### 任务 A: 清理入口与冗余代码
- **AccountMenu.vue**: 从 `menuItems` 数组中永久删除 `points` 配置项。
- **index.vue**: 移除“全部积分 >”跳转按钮。

### 任务 B: 首页 (index.vue) 分页重构
- **Template**:
  - 在首页积分流水下方引入 `ECPagination` 组件。
  - 数据源继续使用 `pointRecords` (alias from `list`)。
- **Logic**:
  - `useMemberPoint` 的调用中解构出 `totalCount`, `pageSize`, `pageNo`, `totalPages`。
  - 实现 `handlePageChange` 函数，页码变化时调用 `loadList(true)` 刷新当前列表。

### 任务 C: 资源回收
- 删除物理文件 `app/pages/account/points.vue`。

### 任务 D: 加载交互对齐
- 确保在首页进行分页切换时，`loadingList` 能够正常触发骨架屏展示，防止页面跳动。

## 3. 验证计划
- [ ] 访问 `/account`，确认侧边栏无积分入口。
- [ ] 在首页列表底部测试翻页功能。
- [ ] 尝试访问 `/account/points` 确认其已失效。
