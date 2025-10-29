# 商品列表展示规范（基于 Figma 设计 + Apifox MCP API）

## ADDED Requirements

### Requirement: Apifox MCP API 集成

系统 SHALL 集成 Apifox MCP 提供的 `/goods/items` API，实现完整的数据获取和处理流程。

#### Scenario: API 请求参数映射

- **WHEN** 用户访问商品列表或变更筛选条件
- **THEN** 系统按照 Apifox API 规范构建请求参数
- **AND** 必需参数：page, pageSize, item_type="normal", main_category, is_tdk="1", type="0", company_id
- **AND** 可选参数：brand_id, sort, start_price, end_price, keywords
- **AND** 从环境变量 NUXT_PUBLIC_COMPANY_ID 获取 company_id

#### Scenario: API 响应数据处理

- **WHEN** Apifox API 返回商品列表数据
- **THEN** 系统使用 itemDetailTransformer 转换商品数据
- **AND** 从 data.list 中提取商品列表
- **AND** 从 data.brand_list.list 中提取品牌信息
- **AND** 从 data.total_count 中获取分页信息
- **AND** 从 data.tdk_data 中获取 SEO 信息
- **AND** 处理价格字段（分转元）：price, member_price, vip_price, svip_price

#### Scenario: 错误处理与重试

- **WHEN** Apifox API 请求失败或返回错误
- **THEN** 显示错误提示信息和“重新加载”按钮
- **AND** 记录错误日志供问题排查
- **AND** 用户点击重试后重新发起 API 请求

### Requirement: 现代化商品列表展示

系统 SHALL 提供现代化的商品列表页面，以 ECshopx PC 端 Figma 设计规范为准，展示响应式网格布局的商品列表，支持用户高效浏览和发现商品。

#### Scenario: Figma 设计风格的商品列表加载

- **WHEN** 用户访问商品列表页面 `/item/list`
- **THEN** 系统按 ECshopx PC 端 Figma 设计规范显示商品网格布局
- **AND** 每个商品卡片显示：商品图片、标题、现价、原价、会员价、VIP价、SVIP价、销量数据
- **AND** 支持 Tailwind CSS 响应式布局（桌面端 4-5 列，平板端 3 列，手机端 2 列）
- **AND** 商品卡片使用 sp-card 类名实现风格设计
- **AND** 支持 hover 效果和动画过渡

#### Scenario: 空状态处理

- **WHEN** 筛选条件下无匹配商品
- **THEN** 显示"暂无商品"的空状态提示

#### Scenario: 错误状态处理

- **WHEN** API 请求失败或网络错误
- **THEN** 显示错误提示信息
- **AND** 提供"重新加载"按钮供用户重试

### Requirement: 基于 Apifox API 的商品筛选功能

系统 SHALL 集成 Apifox MCP `/goods/items` API，提供多维度的商品筛选功能，包括品牌、价格区间、分类、排序等，帮助用户快速找到目标商品。

#### Scenario: Apifox API 品牌筛选

- **WHEN** 用户在筛选组件中选择品牌（使用 brand_list 数据）
- **THEN** 系统发送带 brand_id 参数的 API 请求到 `/goods/items`
- **AND** 列表仅显示该品牌的商品（按 attribute_id 过滤）
- **AND** URL 查询参数更新为 `?brand_id={attribute_id}`
- **AND** 品牌筛选器显示品牌名称和图片（attribute_name, image_url）

#### Scenario: 价格区间筛选

- **WHEN** 用户设置价格范围（最低价格和最高价格）
- **THEN** 列表仅显示价格在指定区间内的商品
- **AND** URL 查询参数包含 start_price 和 end_price

#### Scenario: 排序功能

- **WHEN** 用户选择排序方式（默认、销量、价格升序、价格降序）
- **THEN** 商品列表按照选中的排序规则重新排列
- **AND** 当前选中的排序选项在 UI 中高亮显示

#### Scenario: 筛选条件组合

- **WHEN** 用户同时应用多个筛选条件（品牌 + 价格区间 + 排序）
- **THEN** 系统应用所有筛选条件的交集
- **AND** URL 查询参数包含所有有效的筛选条件

### Requirement: Apifox API 分页加载功能

系统 SHALL 使用 Apifox API 的 page 和 pageSize 参数支持分页加载商品数据，并使用 total_count 计算分页信息，优化页面性能和用户体验。

#### Scenario: Apifox API 初始页面加载

- **WHEN** 用户首次访问商品列表页面
- **THEN** 发送 API 请求到 `/goods/items` 带参数 `{page: "1", pageSize: "20", item_type: "normal", main_category: "276", is_tdk: "1", type: "0", company_id: process.env.NUXT_PUBLIC_COMPANY_ID}`
- **AND** 使用 useLazyAsyncData 进行 SSR 数据预取
- **AND** 显示加载状态指示器（pending 状态）
- **AND** 根据 total_count 计算是否有更多数据，显示“加载更多”按钮
- **AND** 使用 itemDetailTransformer 转换 API 响应数据

#### Scenario: 加载更多商品

- **WHEN** 用户点击"加载更多"按钮且还有未加载的商品
- **THEN** 异步加载下一页商品数据
- **AND** 新商品追加到当前列表末尾
- **AND** 按钮显示加载状态
- **AND** 如果没有更多数据，隐藏"加载更多"按钮

#### Scenario: 筛选条件变化时重置分页

- **WHEN** 用户更改任何筛选条件
- **THEN** 页码重置为第一页
- **AND** 重新加载符合新筛选条件的商品列表

### Requirement: URL 状态同步与 SEO 优化

系统 SHALL 将 Apifox API 的筛选条件同步到 URL 查询参数，并使用 API 返回的 tdk_data 进行 SEO 优化，支持书签、分享和浏览器导航功能。

#### Scenario: 筛选条件更新 URL

- **WHEN** 用户更改任何筛选条件
- **THEN** URL 查询参数实时更新
- **AND** 页面不刷新，保持单页应用体验

#### Scenario: 从 URL 恢复筛选状态

- **WHEN** 用户直接访问包含查询参数的商品列表 URL
- **THEN** 系统根据 URL 参数初始化筛选条件
- **AND** 显示对应的筛选结果

#### Scenario: 浏览器历史导航

- **WHEN** 用户使用浏览器前进/后退按钮
- **THEN** 筛选条件和商品列表状态正确恢复
- **AND** 不触发页面完全刷新

### Requirement: 基于 Nuxt 4 的服务端渲染支持

系统 SHALL 使用 Nuxt 4 和 Apifox API 的组合支持服务端渲染（SSR），提升首屏加载性能和 SEO 表现，并利用 API tdk_data 进行动态 meta 标签生成。

#### Scenario: 首屏 SSR 渲染

- **WHEN** 用户首次访问商品列表页面
- **THEN** 服务端预渲染初始商品数据
- **AND** 客户端接管后保持交互功能正常

#### Scenario: 带查询参数的 SSR

- **WHEN** 用户访问包含筛选参数的商品列表 URL
- **THEN** 服务端根据查询参数预渲染对应的筛选结果
- **AND** 筛选组件状态与 URL 参数一致

### Requirement: Tailwind CSS 响应式设计适配

系统 SHALL 使用 Tailwind CSS 和 sp-前缀类名提供现代化响应式设计，遵循 ECshopx PC 端 Figma 设计规范，适配不同设备屏幕尺寸。

#### Scenario: 移动端适配

- **WHEN** 用户在移动设备上访问商品列表
- **THEN** 商品网格布局调整为移动端优化的列数
- **AND** 筛选器组件适配触摸交互

#### Scenario: 桌面端 Figma 设计显示

- **WHEN** 用户在桌面端访问商品列表（屏幕宽度 ≥ 1024px）
- **THEN** 使用 Tailwind `grid-cols-4 lg:grid-cols-5` 实现 4-5 列商品网格布局
- **AND** 筛选器使用侧边栏布局，固定在左侧便于操作
- **AND** 商品卡片使用 sp-card 和 sp-btn 类名实现风格
- **AND** 支持 hover 效果和卡片阴影效果
