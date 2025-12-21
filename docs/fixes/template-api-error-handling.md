# 模板 API 错误处理优化

## 问题描述

当头部模板 API 请求失败（404 Not Found）时，页面显示红色错误提示"加载模板失败: 404 Not Found"，影响用户体验。

实际上项目已经实现了降级机制（Fallback）：当 API 失败时，会自动使用本地默认模板。但由于渲染优先级问题，错误信息被优先显示。

## 解决方案

### 1. 优化渲染优先级 (`TemplateEngine.vue`)

**修改前：**
```vue
<template>
  <div v-if="pending">加载中...</div>
  <div v-else-if="error">加载模板失败: {{ error.message }}</div>
  <div v-else-if="template">渲染模板</div>
</template>
```

**修改后：**
```vue
<template>
  <div v-if="pending">加载中...</div>
  <!-- 优先渲染模板，即使有 error（因为可能使用了默认模板） -->
  <div v-else-if="template">渲染模板</div>
  <!-- 只有在没有可用模板时才显示错误 -->
  <div v-else-if="error">加载模板失败: {{ error.message }}</div>
  <div v-else>暂无模板</div>
</template>
```

**关键改变：**
- 优先检查是否有可用模板（API 模板或默认模板）
- 只有在 API 和默认模板都失败时才显示错误
- 即使 API 失败，只要默认模板加载成功，页面就能正常显示

### 2. 静默处理 API 错误 (`useTemplate.ts`)

**修改前：**
```typescript
export const useTemplate = (name: string) => {
  const { data: template, pending, error, refresh } = useAsyncData(
    `template-${name}`,
    async () => {
      const response = await templateApiClient.getTemplateConfig(name)
      return response.data || response
    },
    { lazy: false, server: true }
  )
  return { template, pending, error, refresh }
}
```

**修改后：**
```typescript
export const useTemplate = (name: string) => {
  const { data: template, pending, error, refresh } = useAsyncData(
    `template-${name}`,
    async () => {
      try {
        const response = await templateApiClient.getTemplateConfig(name)
        return response.data || response
      } catch (err: any) {
        // 静默处理，返回 null 让 fallback 机制接管
        logger.warn(`Failed to fetch template "${name}":`, err.message)
        return null
      }
    },
    { lazy: false, server: true }
  )
  return { template, pending, error, refresh }
}
```

**关键改变：**
- 捕获 API 异常，返回 `null` 而不是抛出错误
- 使用日志记录错误，但不影响页面渲染
- 让 fallback 机制自动接管

### 3. 优化日志输出

将日志级别从 `warn` 改为 `info`，并添加视觉标识：

```typescript
if (hasValidApiTemplate) {
  logger.info(`[useTemplate] ✓ Using API template: ${name}`)
  return apiTemplate.value
}

if (defaultTemplate.value) {
  logger.info(`[useTemplate] ⚠ API request failed, using default template: ${name}`)
  return defaultTemplate.value
}

logger.error(`[useTemplate] ✗ No valid template available for: ${name}`)
```

## 效果对比

### 修改前
- ❌ API 失败时显示红色错误提示
- ❌ 页面无法正常显示
- ❌ 控制台有刺眼的错误日志

### 修改后
- ✅ API 失败时自动使用默认模板
- ✅ 页面正常显示，用户无感知
- ✅ 控制台日志清晰，易于调试

## 降级机制说明

项目实现了完善的三级降级机制：

```
API 模板（优先） → 本地默认模板（降级） → 错误提示（兜底）
```

1. **API 模板**：优先使用 CMS 配置的模板
2. **默认模板**：API 失败时自动使用本地默认模板
3. **错误提示**：只有在 API 和默认模板都失败时才显示

## 相关文件

- `app/templateEngines/TemplateEngine.vue` - 模板渲染组件
- `app/composables/useTemplate.ts` - 模板加载逻辑
- `app/templateEngines/templates/b2c/header.ts` - 默认头部模板

## 测试建议

1. **正常情况**：API 正常返回，应该使用 API 模板
2. **API 失败**：关闭后端或模拟 404，应该自动使用默认模板，页面正常显示
3. **默认模板缺失**：删除默认模板文件，应该显示错误提示

## 总结

这次优化确保了即使模板 API 失败，用户仍然能够正常使用网站。降级机制让应用更加健壮，提供了更好的用户体验。

