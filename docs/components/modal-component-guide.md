# Modal 弹窗组件开发总结

## 概述

根据 Figma 设计 ([节点 2512-17618](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2512-17618)) 封装的通用弹窗组件，支持组件式和函数式两种调用方式。

## 文件结构

```
app/
├── components/ui/modal/
│   ├── Modal.vue           # 弹窗组件
│   ├── types.ts            # 类型定义
│   ├── index.ts            # 导出文件
│   ├── example.vue         # 使用示例
│   ├── README.md           # 详细文档
│   └── QUICK_START.md      # 快速开始指南
├── composables/
│   └── useModal.ts         # 函数式调用支持
```

## 核心特性

### 1. 双模式调用

**组件式调用**：适用于需要自定义内容的场景
```vue
<Modal v-model="visible" title="标题" @confirm="handleConfirm" />
```

**函数式调用**：适用于简单的确认/警告场景
```typescript
const { confirm, alert } = useModal()
confirm('确定要删除吗？')
```

### 2. 完整的类型支持

- `IModalOptions`: 弹窗配置选项
- `IModalButton`: 按钮配置
- `IModalInstance`: 弹窗实例接口
- `IModalState`: 弹窗内部状态

### 3. 灵活的配置

- 自定义标题、内容、按钮文本
- 可选的关闭按钮
- 可选的遮罩层点击关闭
- 自定义宽度
- 支持异步回调

### 4. 优雅的动画

- 淡入淡出动画（遮罩层）
- 缩放动画（弹窗内容）
- 300ms 过渡时间

## 技术实现

### 函数式调用原理

使用 Vue 的 `h()` 和 `render()` API 动态创建组件实例：

```typescript
function createModalInstance(options: IModalOptions): IModalInstance {
  const container = createModalContainer()
  const vnode = h(Modal, { /* props */ })
  render(vnode, container)
  
  return {
    show: () => { /* 显示逻辑 */ },
    hide: () => { /* 隐藏逻辑 */ },
    update: (opts) => { /* 更新逻辑 */ },
    destroy: () => { /* 销毁逻辑 */ }
  }
}
```

### Teleport 实现

使用 `<Teleport to="body">` 将弹窗渲染到 body 下，避免 z-index 和定位问题：

```vue
<Teleport to="body">
  <div v-if="visible" class="fixed inset-0 z-50">
    <!-- 弹窗内容 -->
  </div>
</Teleport>
```

### 状态管理

- 使用 `v-model` 实现双向绑定
- 内部维护加载状态（confirmLoading、cancelLoading）
- 支持外部控制和内部状态同步

## 设计规范

严格遵循 Figma 设计：

- **宽度**：默认 480px
- **内边距**：32px
- **间距**：元素间 32px，按钮间 16px
- **阴影**：`0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)`
- **边框**：`1px solid rgba(0,0,0,0.1)`
- **标题**：20px / Medium / #191a1d / line-height: 20px
- **内容**：16px / Regular / #4a5565 / line-height: 24px
- **按钮**：14px / Medium / line-height: 20px
- **确认按钮**：黑底白字 (#0f0f10)
- **取消按钮**：白底黑边

## 实际应用

### 1. AccountMenu 组件

已集成到账户菜单的退出登录功能：

```typescript
function handleLogout() {
  confirm({
    title: '退出登录',
    content: '您是否确定退出？',
    onConfirm: async () => {
      await logout()
      router.push('/account/login')
    }
  })
}
```

### 2. 其他可用场景

- 删除确认
- 表单提交确认
- 操作不可逆警告
- 数据保存提示
- 离开页面确认

## API 设计思考

### 为什么提供两种调用方式？

1. **函数式调用**：快速、便捷，适合 80% 的场景
2. **组件式调用**：灵活、可定制，适合需要复杂内容的场景

### 为什么 confirm 和 alert 分开？

- `confirm`：有取消按钮，适合需要用户确认的场景
- `alert`：只有确定按钮，适合通知类场景
- 语义清晰，使用简单

### 为什么返回实例？

允许调用者控制弹窗生命周期：

```typescript
const instance = confirm({ /* options */ })

// 可以手动关闭
instance.hide()

// 可以更新内容
instance.update({ title: '新标题' })

// 可以完全销毁
instance.destroy()
```

## 最佳实践

### 1. 优先使用函数式调用

```typescript
// ✅ 推荐
const { confirm } = useModal()
confirm('确定要删除吗？')

// ❌ 不推荐（简单场景使用组件式太重）
const showModal = ref(false)
<Modal v-model="showModal" content="确定要删除吗？" />
```

### 2. 异步操作使用 async/await

```typescript
// ✅ 推荐
onConfirm: async () => {
  await deleteItem()
  await fetchList()
}

// ❌ 不推荐
onConfirm: () => {
  deleteItem().then(() => fetchList())
}
```

### 3. 提供清晰的操作提示

```typescript
// ✅ 推荐
confirm({
  title: '删除确认',
  content: '删除后无法恢复，确定要删除吗？',
  confirmButton: { text: '确定删除' }
})

// ❌ 不推荐（缺少关键信息）
confirm('确定吗？')
```

## 扩展性

### 支持的扩展点

1. **自定义内容**：使用默认插槽
2. **自定义按钮**：通过 `confirmButton` 和 `cancelButton` 配置
3. **自定义宽度**：通过 `width` 属性
4. **回调钩子**：`onConfirm`、`onCancel`、`onClose`

### 未来可能的扩展

1. **主题支持**：支持不同的视觉风格（success、warning、danger）
2. **位置控制**：支持 top、center、bottom
3. **多按钮**：支持 3 个或更多按钮
4. **拖拽支持**：允许拖动弹窗位置
5. **全屏模式**：支持全屏展示

## 与其他 UI 库对比

| 特性 | 本组件 | Element Plus | Ant Design Vue |
|------|--------|--------------|----------------|
| 函数式调用 | ✅ | ✅ | ✅ |
| 组件式调用 | ✅ | ✅ | ✅ |
| TypeScript 支持 | ✅ | ✅ | ✅ |
| 自定义样式 | ✅ 符合项目设计 | ⚠️ 需要覆盖 | ⚠️ 需要覆盖 |
| 包体积 | 小（单组件） | 大（全量引入） | 大（全量引入） |

## 总结

Modal 弹窗组件是一个设计精良、功能完整的基础组件：

✅ **完全符合 Figma 设计规范**  
✅ **支持双模式调用，使用灵活**  
✅ **完整的 TypeScript 类型支持**  
✅ **优雅的动画效果**  
✅ **详细的文档和示例**  
✅ **零 Linter 错误**  

可以作为项目中其他类似组件的开发参考。

