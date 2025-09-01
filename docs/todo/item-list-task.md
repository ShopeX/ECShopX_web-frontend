# 商品列表实现方案

## 需求概述

1. 功能需求：
   - 商品列表展示
   - 条件过滤查询
   - 分页加载
   - SSR 支持

2. 技术要求：
   - 使用 `app/utils` 下封装的 `useFetch` 和 `$fetch`
   - API 层统一管理
   - 保持 baseURL 和 token 一致性

## 实现步骤

### 1. 类型定义 (app/types/api/item.ts)

```typescript
// 请求参数接口
export interface IItemListParams {
  page: number
  pageSize: number
  item_type?: string
  brand_id?: string | number
  category_id?: string | number
  keywords?: string
  sort?: string
  start_price?: number
  end_price?: number
}

// 商品信息接口
export interface IItem {
  id: number | string
  title: string
  price: number
  market_price: number
  pics: string[]
  stock: number
  sales: number
}

// 响应数据接口
export interface IItemListResponse {
  list: IItem[]
  total_count: number
  brand_list?: {
    list: Array<{
      id: number | string
      name: string
    }>
  }
}
```

### 2. API 层实现 (app/api/item.ts)

```typescript
// 使用 useFetch 实现，支持 SSR
export function useItemApi() {
  return {
    // 获取商品列表
    getList(params: IItemListParams) {
      return useFetch<IItemListResponse>('/goods/items', {
        params,
        // SSR 配置
        server: true,
        // 缓存配置
        cache: 'no-cache',
        // 转换响应数据
        transform: (response) => ({
          list: response.list || [],
          total_count: response.total_count || 0,
          brand_list: response.brand_list
        })
      })
    }
  }
}
```

### 3. 页面实现 (app/pages/item/list.vue)

```typescript
// 组件结构
- 筛选区域
  - 品牌筛选
  - 价格区间
  - 排序方式
- 商品列表
  - 列表展示
  - 空状态
  - 加载状态
- 分页区域
  - 加载更多按钮
  - 加载状态

// 状态管理
- 列表数据 (items)
- 总数量 (total)
- 当前页码 (currentPage)
- 加载状态 (loading)
- 筛选条件 (filterParams)

// 数据获取
- 初始数据：SSR 获取
- 筛选：客户端请求
- 分页：客户端请求

// URL 同步
- 筛选条件同步到 URL
- 页面刷新保持筛选状态
```

### 4. 实现流程

1. **初始化阶段**：
   - 从 URL 读取筛选参数
   - SSR 获取首页数据
   - 渲染商品列表

2. **筛选操作**：
   - 更新筛选条件
   - 同步到 URL
   - 重置页码
   - 重新请求数据

3. **分页加载**：
   - 点击加载更多
   - 增加页码
   - 请求新数据
   - 追加到列表

4. **错误处理**：
   - 请求失败提示
   - 加载状态重置
   - 页码回退（分页失败时）

## 技术方案

### 1. SSR 实现
- 使用 `useAsyncData` + `useFetch` 实现 SSR
- 初始数据在服务端渲染
- 后续交互在客户端处理

### 2. 数据流转
```
URL 参数 <-> 筛选状态 <-> API 请求 <-> 列表数据
```

### 3. 性能优化
- 防抖处理筛选操作
- 缓存已加载数据
- 优化重复请求
- 图片懒加载

### 4. 用户体验
- 加载状态展示
- 空状态处理
- 错误提示
- 平滑滚动

## 代码结构

```
app/
├── types/
│   └── api/
│       └── item.ts      # 类型定义
├── api/
│   └── item.ts         # API 实现
├── pages/
│   └── item/
│       ├── list.vue    # 列表页面
│       └── components/ # 列表组件
└── components/
    └── business/
        ├── ItemCard.vue    # 商品卡片
        ├── ItemFilter.vue  # 筛选组件
        └── ItemList.vue    # 列表容器
```

## 注意事项

1. **SSR 注意点**：
   - 避免服务端/客户端状态不一致
   - 处理好 hydration 阶段
   - 合理使用缓存策略

2. **性能优化**：
   - 合理的分页大小
   - 避免不必要的重复请求
   - 图片资源优化

3. **代码规范**：
   - 类型定义完整
   - 组件职责单一
   - 代码复用合理

4. **错误处理**：
   - 请求错误处理
   - 数据验证
   - 用户提示

## 后续优化

1. **功能优化**：
   - 添加更多筛选条件
   - 支持多种排序方式
   - 记住用户筛选偏好

2. **性能优化**：
   - 虚拟滚动
   - 预加载数据
   - 组件懒加载

3. **体验优化**：
   - 骨架屏加载
   - 过渡动画
   - 响应式适配 