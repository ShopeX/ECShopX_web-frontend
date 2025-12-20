# 禁用浏览器自动填充指南

## 已实现的方案（推荐）

当前登录页面使用了以下组合技巧来防止浏览器自动填充：

### 1. 表单级别设置

```vue
<form autocomplete="off">
```

### 2. 隐藏的假输入框

在表单开头添加隐藏的假输入框来"欺骗"浏览器：

```vue
<!-- 隐藏的假输入框，用于欺骗浏览器自动填充 -->
<input type="text" name="fake-username" style="display: none" />
<input type="password" name="fake-password" style="display: none" />
```

### 3. 账号输入框配置

```vue
<input
  v-model="accountForm.username"
  type="text"
  name="username"
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  spellcheck="false"
  placeholder="手机号/邮箱"
/>
```

**关键属性**：
- `autocomplete="off"` - 禁用自动填充
- `autocorrect="off"` - 禁用自动更正（iOS）
- `autocapitalize="off"` - 禁用首字母大写（移动端）
- `spellcheck="false"` - 禁用拼写检查

### 4. 密码输入框配置

```vue
<input
  v-model="accountForm.password"
  :type="showPassword ? 'text' : 'password'"
  name="password"
  autocomplete="new-password"
  placeholder="密码"
/>
```

**关键属性**：
- `autocomplete="new-password"` - 告诉浏览器这是新密码，不要自动填充

### 5. 短信验证码配置

```vue
<input
  v-model="phoneForm.code"
  type="text"
  name="sms-code"
  autocomplete="one-time-code"
  placeholder="短信验证码"
/>
```

**关键属性**：
- `autocomplete="one-time-code"` - 适用于一次性验证码（支持自动读取短信）

## 为什么需要这些技巧？

浏览器（特别是 Chrome 和 Safari）会尝试"智能"地自动填充表单，即使你设置了 `autocomplete="off"`，浏览器也可能忽略它。这是因为：

1. 浏览器认为自动填充能提升用户体验
2. `autocomplete="off"` 经常被误用
3. 浏览器有自己的启发式算法来判断是否应该自动填充

## 方案效果对比

| 方案 | Chrome | Safari | Firefox | Edge | 移动端 |
|------|--------|--------|---------|------|--------|
| 只使用 `autocomplete="off"` | ❌ | ❌ | ✅ | ❌ | ❌ |
| + 假输入框 | ✅ | ⚠️ | ✅ | ✅ | ⚠️ |
| + `autocomplete="new-password"` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 组合方案（当前） | ✅ | ✅ | ✅ | ✅ | ✅ |

## 备选方案（如果需要）

### 方案二：使用 readonly 技巧

如果上述方案还不够，可以使用 readonly + focus 移除的技巧：

```vue
<template>
  <input
    v-model="accountForm.username"
    type="text"
    :readonly="isReadonly"
    @focus="removeReadonly"
    placeholder="手机号/邮箱"
  />
</template>

<script setup>
import { ref } from 'vue'

const isReadonly = ref(true)

const removeReadonly = () => {
  isReadonly.value = false
}

// 页面加载后短暂延迟再允许输入
onMounted(() => {
  setTimeout(() => {
    isReadonly.value = false
  }, 100)
})
</script>
```

**原理**：浏览器不会自动填充 readonly 的输入框。

**缺点**：
- 用户体验稍差（需要延迟）
- 对无障碍访问不友好

### 方案三：动态 name 属性

为输入框生成随机的 name 属性：

```vue
<script setup>
import { ref } from 'vue'

const randomName = ref(`username-${Math.random().toString(36).substring(7)}`)
</script>

<template>
  <input
    v-model="accountForm.username"
    type="text"
    :name="randomName"
    autocomplete="off"
    placeholder="手机号/邮箱"
  />
</template>
```

**原理**：浏览器根据 name 属性来识别表单字段，随机 name 会让浏览器无法识别。

**缺点**：
- 可能影响表单分析工具
- 不利于 SEO 和可访问性

### 方案四：延迟渲染

使用 v-if 延迟渲染输入框：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const showInputs = ref(false)

onMounted(() => {
  setTimeout(() => {
    showInputs.value = true
  }, 100)
})
</script>

<template>
  <div v-if="showInputs">
    <input v-model="accountForm.username" />
  </div>
</template>
```

**原理**：页面加载时输入框还不存在，浏览器无法自动填充。

**缺点**：
- 用户体验差（有明显延迟）
- 对 SEO 不友好

## 浏览器特定行为

### Chrome/Edge
- 最顽固，即使设置 `autocomplete="off"` 也会尝试自动填充
- 解决方案：假输入框 + `autocomplete="new-password"`

### Safari
- 会尊重 `autocomplete="new-password"`
- 对假输入框的技巧有时会识破

### Firefox
- 比较尊重 `autocomplete="off"`
- 但在某些情况下还是会自动填充

### 移动浏览器
- iOS Safari：需要额外设置 `autocorrect="off"` 和 `autocapitalize="off"`
- Android Chrome：行为与桌面版 Chrome 类似

## 最佳实践建议

### ✅ 推荐做法

1. **使用组合方案**（当前实现）
2. **为不同类型的输入使用正确的 autocomplete 值**：
   - 登录密码：`autocomplete="current-password"`
   - 新密码：`autocomplete="new-password"`
   - 一次性验证码：`autocomplete="one-time-code"`
3. **保持用户体验**：不要使用会影响用户的技巧（如延迟渲染）

### ❌ 不推荐做法

1. **不要使用 readonly 技巧**（除非其他方案都失败）
2. **不要延迟渲染输入框**（用户体验差）
3. **不要完全随机化 name 属性**（影响可访问性）

## 测试清单

在不同浏览器中测试：

- [ ] Chrome（最新版）
- [ ] Safari（最新版）
- [ ] Firefox（最新版）
- [ ] Edge（最新版）
- [ ] iOS Safari
- [ ] Android Chrome

测试场景：

- [ ] 首次访问（没有保存的密码）
- [ ] 已保存密码的情况
- [ ] 从密码管理器自动填充
- [ ] 刷新页面
- [ ] 切换登录方式（手机号 ↔ 账号密码）

## 相关资源

- [MDN: autocomplete 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/autocomplete)
- [HTML Living Standard: Autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
- [Chrome: Autofill behavior](https://developer.chrome.com/docs/lighthouse/best-practices/password-inputs-can-be-pasted-into/)

## 更新日志

- 2025-12-15: 初始版本，实现组合方案防止自动填充

