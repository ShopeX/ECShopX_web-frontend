# useHttp 重试功能使用指南

## 🎯 功能概述

`useHttp` 现在内置了智能重试功能，无需额外的重试封装。支持指数退避、随机抖动和自定义重试条件。

## 🛠️ API 使用方法

### 1. 基础重试（使用默认配置）

```typescript
// 启用默认重试配置
const { data, error, pending } = useHttp('/api/items', {
  query: { page: 1 },
  retry: true, // ✅ 简单开启重试
})
```

### 2. 自定义重试配置

```typescript
const { data, error, pending } = useHttp('/api/items', {
  query: { page: 1 },
  retry: {
    maxRetries: 3, // 最大重试 3 次
    baseDelay: 1000, // 基础延迟 1 秒
    maxDelay: 5000, // 最大延迟 5 秒
    backoffFactor: 2, // 指数退避因子
    // 自定义重试条件
    retryCondition: (error) => {
      return error.status >= 500 || error.code === 'NETWORK_ERROR'
    },
  },
})
```

### 3. 通过 HTTP 方法使用

```typescript
const { get, post } = useHttpMethods()

// GET 请求带重试
const listData = get('/api/items', {
  query: { page: 1 },
  retry: { maxRetries: 3 },
})

// POST 请求带重试
const createData = post(
  '/api/items',
  { name: 'New Item' },
  {
    retry: true,
  }
)
```

## 📋 在 API 层的使用

### item.ts API 示例

```typescript
export function useItemApi() {
  const { get } = useHttpMethods()

  return {
    // 普通请求（无重试）
    getList(params) {
      return get('/goods/items', {
        query: params,
        cache: 'default',
        key: `items-${JSON.stringify(params)}`,
      })
    },

    // 重试请求（用于关键业务）
    getListWithRetry(params) {
      return get('/goods/items', {
        query: params,
        cache: 'default',
        key: `items-retry-${JSON.stringify(params)}`,
        retry: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
        },
      })
    },
  }
}
```

## 🎛️ 重试配置说明

### 默认配置

```typescript
{
  maxRetries: 3,        // 最大重试次数
  baseDelay: 1000,      // 基础延迟 1 秒
  maxDelay: 5000,       // 最大延迟 5 秒
  backoffFactor: 2,     // 指数退避因子（每次翻倍）
  retryCondition: (error) => {
    // 默认重试条件：
    // - 网络错误 (NETWORK_ERROR, ECONNABORTED)
    // - HTTP 5xx 服务器错误
    // - HTTP 408 请求超时
    // - HTTP 429 请求过多
    // - 超时错误
  }
}
```

### 延迟计算公式

```
实际延迟 = min(
  baseDelay * (backoffFactor ^ (attempt - 1)) + 随机值(0-1000ms),
  maxDelay
)
```

**示例延迟序列**：

- 第1次重试：~1000ms + 随机值
- 第2次重试：~2000ms + 随机值
- 第3次重试：~4000ms + 随机值

## 🔧 实际使用场景

### 1. 商品列表页面

```vue
<script setup lang="ts">
// 关键数据使用重试
const {
  data: items,
  error,
  pending,
  refresh,
} = await useItemListData(() => getApiParams(), {
  watchQuery: true,
  useRetry: true, // 启用重试
})

// 手动重试
const handleRetry = () => {
  refresh() // 内置的刷新方法
}
</script>
```

### 2. 表单提交

```vue
<script setup lang="ts">
const { post } = useHttpMethods()

const submitForm = async (formData) => {
  const { data, error } = await post('/api/items', formData, {
    retry: {
      maxRetries: 2, // 提交操作少重试几次
      baseDelay: 500,
    },
  })

  if (error.value) {
    // 重试失败后的处理
    showError('提交失败，请重试')
  }
}
</script>
```

### 3. 关键业务数据

```typescript
// 支付相关的 API 使用更激进的重试
export function usePaymentApi() {
  const { get, post } = useHttpMethods()

  return {
    createOrder(orderData) {
      return post('/api/orders', orderData, {
        retry: {
          maxRetries: 5, // 增加重试次数
          baseDelay: 2000, // 增加基础延迟
          maxDelay: 10000, // 增加最大延迟
          retryCondition: (error) => {
            // 除了 4xx 客户端错误，其他都重试
            return !error.status || error.status < 400 || error.status >= 500
          },
        },
      })
    },
  }
}
```

## 📊 重试日志

启用重试后，控制台会显示详细的重试日志：

```
[API Request] GET /goods/items
[API Retry] 1/3 GET /goods/items
[API Retry] 1/3 after 1234ms. Error: Network Error
[API Retry] 2/3 GET /goods/items
[API Retry] 2/3 after 2456ms. Error: 500 Server Error
[API Success] GET /goods/items (3678ms)
```

## ⚠️ 注意事项

### 1. 性能考虑

- 只在关键 API 上启用重试
- 合理设置 `maxRetries` 避免过长等待
- 使用缓存减少不必要的重试

### 2. 错误处理

- 重试失败后仍需要错误处理逻辑
- 区分可重试和不可重试的错误
- 避免对幂等性操作的重试

### 3. 用户体验

- 显示重试状态给用户
- 提供手动重试选项
- 合理的超时设置

## 🚀 最佳实践

1. **分级重试策略**：
   - 查询操作：启用重试
   - 创建操作：谨慎使用重试
   - 删除操作：避免重试

2. **环境配置**：

   ```typescript
   const retryConfig = {
     development: { maxRetries: 1, baseDelay: 500 },
     production: { maxRetries: 3, baseDelay: 1000 },
   }
   ```

3. **监控和告警**：
   - 监控重试率和成功率
   - 设置重试次数过高的告警
   - 分析失败原因优化系统

通过这种统一的重试机制，我们既保持了代码的简洁性，又提供了强大的错误恢复能力。
