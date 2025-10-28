# HTTP Client 规范

## ADDED Requirements

### Requirement: 自定义 $fetch 实例配置

系统 SHALL 通过 Nuxt 插件创建配置好的 `$fetch` 实例，统一处理认证、拦截器和错误处理。

#### Scenario: 插件初始化

- **WHEN** Nuxt 应用启动时
- **THEN** 应创建自定义的 `$fetch` 实例并注册为 `$api`
- **AND** 配置请求拦截器添加认证头和公司ID

#### Scenario: 全局错误处理

- **WHEN** HTTP 请求返回 401 状态码
- **THEN** 应自动跳转到登录页面
- **WHEN** HTTP 请求返回其他错误状态码
- **THEN** 应根据状态码类型提供相应的错误处理

### Requirement: useHttp Composable 接口

系统 SHALL 提供一个 `useHttp` composable，智能选择 `useFetch` 或 `$fetch`，并提供响应式的状态管理。

#### Scenario: 基础 composable 用法

- **WHEN** 使用 `const { data, pending, error } = await useHttp<T>(url, options)`
- **THEN** 应返回响应式的 `data`、`pending`、`error` 状态
- **AND** 自动处理 SSR/CSR 环境差异

#### Scenario: 方法封装用法

- **WHEN** 使用 `const { get, post } = useHttpMethods()` 获取方法封装
- **THEN** 应提供 `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()` 方法
- **AND** 每个方法返回相同的响应式状态结构

#### Scenario: 智能环境适配

- **WHEN** 在 SSR 环境中执行 HTTP 请求
- **THEN** 应自动使用 `useFetch` 以获得缓存和去重优化
- **WHEN** 在 CSR 环境中执行 HTTP 请求
- **THEN** 应自动使用 `$fetch` 以获得更轻量的实现

### Requirement: 请求选项配置

HTTP composable SHALL 支持灵活的请求配置选项，允许覆盖默认行为。

#### Scenario: 跳过认证

- **WHEN** 设置 `skipAuth: true` 选项
- **THEN** 请求不应包含认证头信息

#### Scenario: 跳过公司ID

- **WHEN** 设置 `skipCompanyId: true` 选项
- **THEN** 请求不应自动添加 `company_id` 查询参数

#### Scenario: 自定义头部

- **WHEN** 提供自定义 `headers` 选项
- **THEN** 应合并到默认头部中，允许覆盖默认值

### Requirement: 响应式状态管理

HTTP composable SHALL 提供完整的响应式状态管理，包括加载状态、错误状态和数据状态。

#### Scenario: 加载状态管理

- **WHEN** HTTP 请求开始执行
- **THEN** `pending` 状态应设置为 `true`
- **WHEN** HTTP 请求完成（成功或失败）
- **THEN** `pending` 状态应设置为 `false`

#### Scenario: 错误状态管理

- **WHEN** HTTP 请求发生错误
- **THEN** `error` 状态应包含错误信息
- **AND** `data` 状态应保持之前的值或设置为 `null`

#### Scenario: 数据刷新功能

- **WHEN** 调用 `refresh()` 方法
- **THEN** 应重新执行 HTTP 请求
- **AND** 更新所有响应式状态

### Requirement: 统一的错误处理

HTTP composable SHALL 提供统一的错误处理机制，确保所有请求的错误处理行为一致。

#### Scenario: HTTP 状态码错误

- **WHEN** 服务器返回 4xx 或 5xx 状态码
- **THEN** 应抛出包含错误信息的异常
- **AND** 根据状态码类型进行相应的处理（如 401 跳转登录）

#### Scenario: 业务逻辑错误

- **WHEN** 响应数据中 `status_code` 不为 200
- **THEN** 应记录警告日志并在 `error` 状态中提供错误信息

#### Scenario: 网络错误

- **WHEN** 发生网络超时或连接错误
- **THEN** 应抛出描述性错误信息并记录错误日志

### Requirement: TypeScript 类型安全

HTTP composable SHALL 提供完整的 TypeScript 类型定义，确保编译时类型检查。

#### Scenario: 泛型响应类型

- **WHEN** 调用 `useHttp<IUser>('/users/1')`
- **THEN** 返回的 `data` 应具有 `IUser | null` 类型
- **AND** 编译器应提供类型检查和智能提示

#### Scenario: 选项类型检查

- **WHEN** 传入请求选项参数
- **THEN** TypeScript 应验证参数类型的正确性
- **AND** 提供选项属性的智能提示

### Requirement: Nuxt 4 环境兼容性

HTTP composable SHALL 同时支持服务端渲染 (SSR) 和客户端渲染 (CSR) 环境。

#### Scenario: SSR 环境优化

- **WHEN** 在服务端执行 HTTP 请求
- **THEN** 应使用 `useFetch` 获得请求去重和缓存优化
- **AND** 正确处理服务端的运行时配置

#### Scenario: CSR 环境轻量化

- **WHEN** 在客户端执行 HTTP 请求
- **THEN** 应智能选择最轻量的实现方式
- **AND** 与 SSR 环境提供完全一致的 API

#### Scenario: 水合 (Hydration) 兼容

- **WHEN** 页面从 SSR 切换到 CSR
- **THEN** HTTP composable 状态应保持一致
- **AND** 不影响后续的客户端请求

### Requirement: 代码迁移支持

系统 SHALL 提供完整的迁移指南，支持从旧 HTTP 封装到新 composable 的统一迁移。

#### Scenario: API 层迁移

- **WHEN** 迁移 `app/api/` 目录下的 API 调用
- **THEN** 应从 `http.get()` 改为 `useHttp()` composable
- **AND** 保持相同的功能和类型安全

#### Scenario: Store 层迁移

- **WHEN** 迁移 `app/stores/` 目录下的数据获取
- **THEN** 应利用 composable 的响应式特性
- **AND** 简化状态管理逻辑

### Requirement: 环境变量配置

HTTP composable SHALL 从环境变量读取配置，支持不同部署环境的灵活配置。

#### Scenario: API 基础地址配置

- **WHEN** 设置 `NUXT_PUBLIC_API_BASE` 环境变量
- **THEN** 所有 API 请求应使用该基础地址

#### Scenario: 超时时间配置

- **WHEN** 设置 `NUXT_PUBLIC_API_TIMEOUT` 环境变量
- **THEN** 请求超时时间应使用该配置值

#### Scenario: 公司ID配置

- **WHEN** 设置 `NUXT_PUBLIC_COMPANY_ID` 环境变量
- **THEN** 请求应自动添加该公司ID参数（除非被跳过）
