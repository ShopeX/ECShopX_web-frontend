# Skills 目录结构说明

## 📁 目录结构

项目采用**扁平化 skills 结构**，通过软链接在三个工具目录间共享同一份数据源：

```
.agent/skills-source/             ← 📦 原始数据源（唯一真实存储）
├── 00-dev-workflow/              # 自动化开发工作流（唯一入口）
├── 01-spec/                      # 设计与编码规范
├── 02-infra/                     # 基础设施与架构
├── 03-testing/                   # 测试与质量门禁
├── 04-i18n/                      # 国际化
├── 05-system/                    # 项目骨架与 Git 规范
├── 10-figma-to-code/             # Figma 设计转码
└── 11-apifox-to-impl/            # ApiFox 接口转实现

.agent/skills/                    ← 🔗 软链接（供 Agent 使用）
.cursor/skills/                   ← 🔗 软链接（供 Cursor 使用）
.claude/skills/                   ← 🔗 软链接（供 Claude 使用）
```

## ✨ 特点

### 1. 统一数据源

- `.agent/skills-source/` 是**唯一的原始数据存储位置**
- `.agent/skills/`、`.cursor/skills/`、`.claude/skills/` 都是软链接集合
- 所有三个目录结构**完全一致**

### 2. 三向同步

- 在**任意路径**修改文件，其他**两个路径**立即同步
- 例如：修改 `.cursor/skills/00-dev-workflow/SKILL.md`
  - ✅ `.agent/skills-source/00-dev-workflow/SKILL.md` 同步更新（真实文件）
  - ✅ `.agent/skills/00-dev-workflow/SKILL.md` 同步更新（软链接）
  - ✅ `.claude/skills/00-dev-workflow/SKILL.md` 同步更新（软链接）

### 3. 完全扁平化

- 所有 skills 目录都是打平的，无分层结构
- 通过编号前缀区分类别和优先级

### 4. 编号规则

| 编号范围 | 类别     | 说明                     |
| -------- | -------- | ------------------------ |
| `00`     | 入口     | 唯一工作流入口           |
| `01-05`  | 基础规范 | 设计/架构/测试/i18n/系统 |
| `10-19`  | 交付工具 | Figma/ApiFox 转码        |

## 🎯 使用方式

### 日常开发（唯一入口）

```bash
# 团队统一使用一句话启动
"按 00-dev-workflow 从 PRD 跑通到可合并"
```

### 查看技能列表

```bash
openskills list
```

### 读取技能内容

```bash
openskills read 00-dev-workflow
openskills read 03-testing
```

## 🔧 维护说明

### 添加新技能

1. 在 `.agent/skills-source/` 下创建新目录
2. 运行以下命令更新软链接：

```bash
cd /path/to/project
skill_name="新技能名"

# 创建三个软链接
ln -s "../skills-source/$skill_name" ".agent/skills/$skill_name"
ln -s "../../.agent/skills-source/$skill_name" ".cursor/skills/$skill_name"
ln -s "../../.agent/skills-source/$skill_name" ".claude/skills/$skill_name"

# 同步 AGENTS.md
openskills sync --yes
```

### 删除技能

```bash
# 删除原始目录
rm -rf .agent/skills-source/技能名

# 删除软链接
rm .agent/skills/技能名
rm .cursor/skills/技能名
rm .claude/skills/技能名

# 同步 AGENTS.md
openskills sync --yes
```

### 重命名技能

```bash
# 重命名原始目录
mv .agent/skills-source/旧名 .agent/skills-source/新名

# 删除旧链接
rm .agent/skills/旧名 .cursor/skills/旧名 .claude/skills/旧名

# 创建新链接
ln -s "../skills-source/新名" ".agent/skills/新名"
ln -s "../../.agent/skills-source/新名" ".cursor/skills/新名"
ln -s "../../.agent/skills-source/新名" ".claude/skills/新名"

# 同步 AGENTS.md
openskills sync --yes
```

## 📊 技能列表（8 个）

| 技能                | 名称              | 说明                       |
| ------------------- | ----------------- | -------------------------- |
| `00-dev-workflow`   | 自动化开发工作流  | **唯一入口**，编排全流程   |
| `01-spec`           | 设计与编码规范    | UI/UX + TS/Vue + 安全/A11y |
| `02-infra`          | 基础设施与架构    | API/Store/性能/Mock        |
| `03-testing`        | 测试与质量门禁    | Playwright/Vitest + 门禁   |
| `04-i18n`           | 国际化            | 多语言 + RTL 适配          |
| `05-system`         | 项目骨架与 Git    | 目录结构 + 提交规范        |
| `10-figma-to-code`  | Figma 设计转码    | 设计稿 → 组件代码          |
| `11-apifox-to-impl` | ApiFox 接口转实现 | 接口文档 → API 层          |

## ⚠️ 注意事项

1. **不要在软链接目录中直接创建技能目录**
   - 新技能必须在 `.agent/skills-source/` 中创建

2. **始终在 `.agent/skills-source/` 中管理技能内容**
   - 可以在任意软链接目录中编辑文件（会自动同步）
   - 但新建/删除目录必须在 `skills-source` 中操作

3. **保持软链接完整性**
   - 使用上述维护命令进行操作

4. **三个目录结构必须一致**
   - 如果不一致，重新创建软链接
