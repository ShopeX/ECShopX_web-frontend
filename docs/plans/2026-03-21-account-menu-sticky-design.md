# Account Menu Sticky Design

## Goal

为个人中心 PC 左侧菜单 [AccountMenu.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/components/AccountMenu.vue) 增加滚动吸顶交互，使其在页面纵向滚动时贴住全局 header 下缘自动对齐；H5 不受影响。

## Scope

- 仅影响 `lg` 及以上断点的个人中心页面左侧菜单
- 作用页面包括当前使用 [AccountMenu.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/components/AccountMenu.vue) 的 PC 账户页：
  [index.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/index.vue)
  [orders/index.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/orders/index.vue)
  [coupons.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/coupons.vue)
  [favorites.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/favorites.vue)
  [address.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/pages/account/address.vue)
- 不修改 H5 顶部筛选/菜单交互

## Chosen Approach

采用方案 1：`position: sticky` + 动态 `top` 偏移。

原因：

- `sticky` 最适合这种固定宽度、单列导航的布局
- 不引入滚动监听，不会增加滚动抖动和重排风险
- 能直接复用账户页当前左右两栏结构，不需要重做占位逻辑

## Layout Strategy

### 1. 菜单保持在现有左栏容器内吸顶

当前账户页的 PC 布局都采用统一结构：

- 外层容器：`items-start` 的双栏 flex
- 左栏：固定宽度 `w-64 shrink-0`
- 右栏：主内容区域

实现时不改页面的双栏结构，只在左栏容器或菜单根节点上启用 `sticky`。

### 2. 吸顶位置贴住全局 header 下缘

全局 header 在 [default.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/layouts/default.vue) 中以 `sticky top-0 z-50` 固定在页面顶部。

为保证左侧菜单始终贴住 header 下缘，而不是写死某个魔法值，顶部偏移使用全局 CSS 变量：

- 变量名建议：`--layout-header-height`
- 菜单 sticky top：`top: var(--layout-header-height, 0px)`

这样做的目的：

- header 高度未来变化时，菜单无需同步改硬编码值
- 能兼容 header 在不同页面或不同内容装配下的高度变化

### 3. header 高度来源

在 [default.vue](/Users/lukaijie/workspace/work/shopex/smallP/ecshopx-platform/ecshopx-web/app/layouts/default.vue) 的 header 容器上绑定 `ref`，在客户端挂载后读取其实际高度，并把值写到 `document.documentElement.style` 的 `--layout-header-height`。

实现优先级：

- 首选 `ResizeObserver` 持续同步高度
- 回退可接受 `window.resize` + 首次 mount 同步

虽然 sticky 本身是纯 CSS，但“自动贴住 header 下缘”需要实际 header 高度，因此只增加最小量的测量逻辑，不引入滚动监听。

## Component Changes

### AccountMenu.vue

- 为根容器增加仅 PC 生效的 sticky 样式
- 保持现有 `w-[256px]` 与视觉样式不变
- 不加入额外动画，避免菜单跟随时产生漂移感
- 保证 sticky 状态下层级低于 header，不覆盖 header

建议结果：

- `hidden/显示` 仍由各账户页控制
- `lg:sticky`
- `top` 来自 `var(--layout-header-height)`

### default.vue

- 给 header 容器增加 `ref`
- 在客户端同步 header 高度到全局 CSS 变量
- 页面卸载时清理监听或 observer

## Risks

### 1. 父级容器破坏 sticky

`position: sticky` 会被祖先元素的某些样式影响，尤其是：

- `overflow: hidden/auto/scroll`
- `transform`
- 某些高度裁切约束

从当前账户页结构看，主要容器是普通 flex，风险可控；但实现后仍需要实际页面滚动验证。

### 2. 吸顶后与 header 重叠

如果 header 高度读取不准，菜单可能被遮挡。使用实际测量值而不是写死 `88px`/`96px`，就是为了降低这个风险。

### 3. 只做 PC，不能影响 H5

所有 sticky 样式和 header 偏移逻辑都应限制在 `lg` 断点或 PC 页面结构内，避免移动端出现空白偏移。

## Verification

- PC 访问任一账户页，向下滚动后左侧菜单应吸附在 header 下方
- 回滚到顶部时菜单恢复正常文档流位置
- H5 页面无布局变化
- header 高度变化后，菜单顶边仍与 header 下边缘对齐
