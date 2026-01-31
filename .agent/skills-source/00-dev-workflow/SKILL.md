---
name: Dev Workflow
description: 自动化开发工作流的唯一入口。覆盖需求分析、UI设计转码、API集成、代码提交、测试验证全流程。当用户提到"需求/PRD/设计稿/figma/API/apifox/开发/联调/提交/commit/测试/e2e/回归/发版"等关键词时触发此技能。
---

# 00-dev-workflow: 自动化开发工作流

这是团队开发的**唯一入口技能**。所有从 PRD 到可合并代码的流程都从这里开始。

## 快速启动

**一句话启动**：`按 00-dev-workflow 从 PRD 跑通到可合并`

## 工作流总览

```
PRD 输入 → 需求产物 → 设计产物 → 开发实现 → i18n → 代码提交 → 测试门禁 → 可合并
   │          │          │          │        │        │          │
   ▼          ▼          ▼          ▼        ▼        ▼          ▼
 feature.md  01-spec   10-figma   02-infra  04-i18n  05-system  03-testing
                       11-apifox
```

> ⚠️ **i18n 是必须步骤**：开发完成后必须执行 `04-i18n`，不可跳过。

---

## Step 1: 需求分析（Requirements）

**输入**：PRD 文档（`docs/prd/<feature>.md`）

**加载技能**：`01-spec`

**必须产出**：

```markdown
## 用户故事

作为 <角色>，我想要 <能力>，以便 <收益>。

## 验收标准（AC）

- [ ] AC1: [可测试的描述]
- [ ] AC2: [可测试的描述]

## 非目标（Non-goals）

- [明确不做的事项]

## 测试点（直接映射到 E2E）

- Happy path: [核心正向流程]
- Edge case: [边界/异常场景]

## i18n 文案 Keys

- [新增的多语言 key 清单]
```

**检查点**：

- [ ] 用户故事清晰（1-3 条）
- [ ] AC 可测试（每条能变成断言）
- [ ] 测试点已列出

---

## Step 2: 设计转码（Design）

**输入**：Figma 链接 + node-id

**加载技能**：`10-figma-to-code`

**必须产出**：

```markdown
## 页面骨架

- Header
- Main Content
  - Section A
  - Section B
- Footer

## 组件拆分

| 组件名        | 类型     | 复用/新建 | 说明     |
| ------------- | -------- | --------- | -------- |
| BCProductCard | 业务组件 | 复用      | 商品卡片 |
| ECButton      | 基础组件 | 复用      | 按钮     |

## 状态枚举

- loading: 加载中骨架屏
- empty: 空状态占位
- error: 错误提示
- success: 正常展示

## 响应式 & RTL 注意点

- [断点适配说明]
- [RTL 镜像元素]
```

**检查点**：

- [ ] 组件拆分完成
- [ ] 状态枚举覆盖
- [ ] RTL 注意点已标注

---

## Step 3: 开发实现（Development）

**输入**：ApiFox 接口文档

**加载技能**：`02-infra` + `11-apifox-to-impl`

**架构决策**（按需选择）：

- **默认**：UI → Composable → API Client → Transformer
- **需要共享/持久化**：+ Store
- **极简页面**：UI → API Client → Transformer

**必须产出**：

```
app/
├── types/api/<module>.ts        # ApiFox types
├── infrastructure/
│   ├── clients/<module>ApiClient.ts
│   └── transformers/<module>Transformer.ts
├── composables/use<Module>.ts
├── components/<Component>/
│   ├── <Component>.vue
│   └── types.ts
└── pages/<route>.vue
```

**检查点**：

- [ ] Types 与 ApiFox 一致
- [ ] Transformer 处理数据转换
- [ ] 错误处理完整（401/403/500）

---

## Step 4: 多语言交付（i18n）

**加载技能**：`04-i18n`

**触发条件**：开发实现完成后，**必须自动执行** i18n 检查。

**执行流程**：

```bash
# 1. 扫描新增/修改的 Vue 组件中的硬编码文案
grep -r ">[^<{]*[\u4e00-\u9fa5]" app/components/<新组件>/

# 2. 检查是否使用 $t() 或 t()
grep -r '\$t\(' app/components/<新组件>/
grep -r 'useI18n' app/components/<新组件>/
```

**必须产出**：

| 文件 | 说明 |
|------|------|
| `app/locales/zh-CN.json` | 中文（开发时填写） |
| `app/locales/en-US.json` | 英文（AI 翻译 + 校对） |
| `app/locales/ar.json` | 阿拉伯语（AI 翻译 + RTL 验证） |

**新增 Key 模板**（PRD 中必须列出）：

```markdown
## i18n 文案 Keys

| Key | 中文 | English | العربية | 说明 |
|-----|------|---------|---------|------|
| `feature.title` | 功能标题 | Feature Title | عنوان الميزة | 页面主标题 |
```

**检查点**：

- [ ] 组件无硬编码中文（使用 `$t()` 或 `t()`）
- [ ] 三种语言文件 Key 一致
- [ ] ar 模式下布局无错位（RTL 验证）

**自动化提醒**：

> ⚠️ **AI 必须在 Step 3 完成后主动执行**：
> 1. 扫描新增组件中的硬编码文案
> 2. 提取并生成 i18n Keys
> 3. 同步更新三个语言文件
> 4. 提示用户验证 RTL 布局

---

## Step 5: 代码提交（Commit）

**加载技能**：`05-system`

**Commit Message 格式**（Conventional Commits）：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 枚举**：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

**自动生成规则**：

- 从 PRD 标题 + diff + AC 自动总结
- scope 为模块名（如 `cart`, `product`, `auth`）

---

## Step 6: 测试门禁（Testing Gate）

**加载技能**：`03-testing`

**本地必跑 + CI 必跑**：

```bash
# 1. 代码质量
pnpm lint
pnpm format
vue-tsc --noEmit

# 2. E2E 核心链路
pnpm test:e2e

# 3. i18n 完整性检查（必跑）
node -e "
const zh = require('./app/locales/zh-CN.json');
const en = require('./app/locales/en-US.json');
const ar = require('./app/locales/ar.json');
const zhKeys = Object.keys(zh).sort();
const enKeys = Object.keys(en).sort();
const arKeys = Object.keys(ar).sort();
const missing = zhKeys.filter(k => !enKeys.includes(k) || !arKeys.includes(k));
if (missing.length) {
  console.error('❌ Missing i18n keys:', missing);
  process.exit(1);
}
console.log('✅ All i18n keys present in 3 languages');
"
```

**核心链路（必测）**：

- **加购结算**：首页 → 商品详情 → 加购 → 购物车 → 结算
- **登录订单**：登录 → 会员中心 → 订单列表 → 订单详情

**i18n/RTL 门禁**：

- [ ] 三语言文件 Key 一致
- [ ] ar 语言模式下关键页面不崩溃
- [ ] 关键布局方向正确

**通过标准**：

- [ ] lint 通过
- [ ] typecheck 通过
- [ ] E2E 核心链路 100% 通过
- [ ] i18n 三语言 Key 一致
- [ ] RTL 布局检查通过

---

## 技能依赖图

```
00-dev-workflow (入口)
    ├── 01-spec         (需求规范)
    ├── 02-infra        (架构规范)
    ├── 03-testing      (测试门禁)
    ├── 04-i18n         (多语言)
    ├── 05-system       (Git/提交)
    ├── 10-figma-to-code (设计转码)
    └── 11-apifox-to-impl (API集成)
```

---

## PR 提交模板

```markdown
## Summary

[简述本次变更]

## PRD 链接

[docs/prd/xxx.md 或外部链接]

## AC 对照

- [x] AC1: xxx
- [x] AC2: xxx

## Test Plan

- [x] 本地 lint 通过
- [x] 本地 typecheck 通过
- [x] 本地 E2E 通过（核心链路）
- [x] i18n 三语言验证
- [x] RTL 布局验证

## Screenshots

[关键页面截图]
```

---

## 常见问题

**Q: 如何跳过某个步骤？**
A: 明确告知跳过原因，但测试门禁（Step 6）不可跳过。

**Q: 后端 API 未就绪怎么办？**
A: 使用 ApiFox Mock URL 进行并行开发，参考 `11-apifox-to-impl`。

**Q: 如何处理紧急 hotfix？**
A: 最小化 Step 1-4，但 Step 5-6 必须完整执行。
