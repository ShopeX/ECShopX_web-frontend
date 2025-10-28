# 统一 HTTP 请求封装

## Why

当前项目中存在多个重复且不一致的 HTTP 请求封装实现：

- `utils/http.ts` - 基于 useFetch 的封装
- `utils/fetch.ts` - 基于 $fetch 的封装
- `plugins/request.ts` - 基于 axios 的插件
- `plugins/http.ts` - 基于 useFetch 的插件

这些重复实现导致：

1. **维护困难** - 需要在多个地方同步更新功能
2. **使用混乱** - 开发者不知道应该使用哪个封装
3. **不一致性** - 不同的 API 设计、错误处理和认证机制
4. **代码冗余** - 相同功能的重复实现

## What Changes

- 采用 `useHttp` composable 模式，符合 Vue 3 + Nuxt 4 最佳实践
- 创建双层架构：Plugin + Composable
- 智能环境适配：SSR 使用 useFetch，CSR 使用 $fetch
- 提供响应式状态管理（loading、error、data）
- 完全替换所有现有 HTTP 封装实现
- 统一迁移所有代码到新的 composable API

## Impact

- Affected specs: 新增 `http-client` 规范
- Affected code:
  - 新增 `composables/useHttp.ts` - 核心 composable
  - 新增 `plugins/http.ts` - 自定义 $fetch 实例
  - 完全移除 `utils/http.ts`, `utils/fetch.ts`, `plugins/request.ts`, `plugins/http.ts`
  - 全面迁移 `app/api/item.ts` 使用新 composable
  - 全面迁移 `app/stores/product.ts` 使用新 composable
  - 更新所有组件和页面使用新的 composable API
  - 更新类型定义支持响应式状态
