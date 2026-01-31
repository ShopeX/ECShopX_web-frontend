# Skills 目录结构说明

## 📁 目录结构

项目中有三个 skills 目录，**全部采用打平结构**，通过软链接共享同一份数据源：

```
.agent/skills-source/             ← 📦 原始数据源（唯一真实存储）
├── A-foundation/
│   ├── 00-system/
│   ├── 01-spec/
│   ├── 02-infra/
│   ├── 03-common/
│   ├── 04-testing/
│   └── 05-i18n/
├── B-domains/
│   ├── 10-catalog/
│   ├── 20-cart-checkout/
│   ├── 30-order-member/
│   └── 40-marketing-cms/
└── C-delivery/
    ├── 90-figma-to-code/
    ├── 91-apifox-to-impl/
    ├── 92-verification/
    ├── 93-maintenance/
    └── 94-i18n-workflow/

.agent/skills/                    ← 🔗 打平结构（软链接）
├── 00-system → ../skills-source/A-foundation/00-system
├── 01-spec → ../skills-source/A-foundation/01-spec
├── 02-infra → ../skills-source/A-foundation/02-infra
├── 03-common → ../skills-source/A-foundation/03-common
├── 04-testing → ../skills-source/A-foundation/04-testing
├── 05-i18n → ../skills-source/A-foundation/05-i18n
├── 10-catalog → ../skills-source/B-domains/10-catalog
├── 20-cart-checkout → ../skills-source/B-domains/20-cart-checkout
├── 30-order-member → ../skills-source/B-domains/30-order-member
├── 40-marketing-cms → ../skills-source/B-domains/40-marketing-cms
├── 90-figma-to-code → ../skills-source/C-delivery/90-figma-to-code
├── 91-apifox-to-impl → ../skills-source/C-delivery/91-apifox-to-impl
├── 92-verification → ../skills-source/C-delivery/92-verification
├── 93-maintenance → ../skills-source/C-delivery/93-maintenance
└── 94-i18n-workflow → ../skills-source/C-delivery/94-i18n-workflow

.claude/skills/                   ← 🔗 打平结构（软链接）
├── 00-system → ../../.agent/skills-source/A-foundation/00-system
├── 01-spec → ../../.agent/skills-source/A-foundation/01-spec
├── ... (相同结构)
└── 94-i18n-workflow → ../../.agent/skills-source/C-delivery/94-i18n-workflow

.cursor/skills/                   ← 🔗 打平结构（软链接）
├── 00-system → ../../.agent/skills-source/A-foundation/00-system
├── 01-spec → ../../.agent/skills-source/A-foundation/01-spec
├── ... (相同结构)
└── 94-i18n-workflow → ../../.agent/skills-source/C-delivery/94-i18n-workflow
```

## ✨ 特点

### 1. 统一数据源
- `.agent/skills-source/` 是**唯一的原始数据存储位置**
- `.agent/skills/`、`.claude/skills/`、`.cursor/skills/` 都是软链接集合
- 所有三个目录结构**完全一致**（都是打平的）

### 2. 三向同步
- 在**任意路径**修改文件，其他**两个路径**立即同步
- 例如：修改 `.agent/skills/10-catalog/SKILL.md`
  - ✅ `.agent/skills-source/B-domains/10-catalog/SKILL.md` 同步更新（真实文件）
  - ✅ `.claude/skills/10-catalog/SKILL.md` 同步更新（软链接）
  - ✅ `.cursor/skills/10-catalog/SKILL.md` 同步更新（软链接）

### 3. 完全扁平化
- **所有三个 skills 目录都是打平的**，无分层结构
- 可以直接访问任何技能目录，无需进入子文件夹
- 保留编号前缀（00-94），便于排序和分类

### 4. 分类清晰
- 通过编号前缀区分技能类别：
  - `00-05`: A-foundation（基础设施）
  - `10-49`: B-domains（业务领域）
  - `90-99`: C-delivery（交付工具）

## 🎯 使用场景

### 所有工具统一使用打平结构
```bash
# Agent
.agent/skills/00-system/
.agent/skills/10-catalog/

# Claude
.claude/skills/00-system/
.claude/skills/10-catalog/

# Cursor
.cursor/skills/00-system/
.cursor/skills/10-catalog/
```

### 直接访问原始数据
```bash
.agent/skills-source/A-foundation/00-system/
.agent/skills-source/B-domains/10-catalog/
```

## 🔧 维护说明

### 添加新技能
1. 在 `.agent/skills-source/` 相应分类下创建新目录
2. 运行以下命令更新软链接：

```bash
cd /path/to/project

# 假设在 A-foundation 下添加了 06-new-skill
skill_name="06-new-skill"
category="A-foundation"

# 创建三个软链接
ln -s "../skills-source/$category/$skill_name" ".agent/skills/$skill_name"
ln -s "../../.agent/skills-source/$category/$skill_name" ".claude/skills/$skill_name"
ln -s "../../.agent/skills-source/$category/$skill_name" ".cursor/skills/$skill_name"
```

或使用批量命令：

```bash
# 更新所有软链接（安全，不会覆盖已存在的）
for category in A-foundation B-domains C-delivery; do
  for skill_dir in .agent/skills-source/$category/*; do
    if [ -d "$skill_dir" ]; then
      skill_name=$(basename "$skill_dir")
      [ ! -e ".agent/skills/$skill_name" ] && ln -s "../skills-source/$category/$skill_name" ".agent/skills/$skill_name"
      [ ! -e ".claude/skills/$skill_name" ] && ln -s "../../.agent/skills-source/$category/$skill_name" ".claude/skills/$skill_name"
      [ ! -e ".cursor/skills/$skill_name" ] && ln -s "../../.agent/skills-source/$category/$skill_name" ".cursor/skills/$skill_name"
    fi
  done
done
```

### 删除技能
1. 删除 `.agent/skills-source/` 中的原始目录
2. 删除三个目录中对应的软链接

```bash
# 例如删除 10-catalog
rm -rf .agent/skills-source/B-domains/10-catalog
rm .agent/skills/10-catalog
rm .claude/skills/10-catalog
rm .cursor/skills/10-catalog
```

### 重命名技能
1. 在 `.agent/skills-source/` 中重命名目录
2. 删除旧的软链接，创建新的软链接

```bash
# 例如将 10-catalog 重命名为 10-product-catalog
mv .agent/skills-source/B-domains/10-catalog .agent/skills-source/B-domains/10-product-catalog

# 删除旧链接
rm .agent/skills/10-catalog
rm .claude/skills/10-catalog
rm .cursor/skills/10-catalog

# 创建新链接
ln -s "../skills-source/B-domains/10-product-catalog" ".agent/skills/10-product-catalog"
ln -s "../../.agent/skills-source/B-domains/10-product-catalog" ".claude/skills/10-product-catalog"
ln -s "../../.agent/skills-source/B-domains/10-product-catalog" ".cursor/skills/10-product-catalog"
```

## ⚠️ 注意事项

1. **不要在软链接目录中直接创建技能目录**
   - `.agent/skills/`、`.claude/skills/`、`.cursor/skills/` 只包含软链接
   - 新技能必须在 `.agent/skills-source/` 中创建

2. **始终在 `.agent/skills-source/` 中管理技能内容**
   - 这是唯一的真实数据源
   - 可以在任意软链接目录中编辑文件（会自动同步）
   - 但新建/删除目录必须在 `skills-source` 中操作

3. **保持软链接完整性**
   - 不要手动删除或修改软链接
   - 使用上述维护命令进行操作

4. **三个目录结构完全一致**
   - `.agent/skills/`、`.claude/skills/`、`.cursor/skills/` 应该始终包含相同的技能列表
   - 如果不一致，使用上述批量命令重新同步

## 📊 验证同步

测试三向同步是否正常工作：

```bash
# 在任意路径创建测试文件
echo "test content" > .agent/skills/10-catalog/test.txt

# 检查其他路径
cat .agent/skills-source/B-domains/10-catalog/test.txt
cat .claude/skills/10-catalog/test.txt
cat .cursor/skills/10-catalog/test.txt

# 清理
rm .agent/skills-source/B-domains/10-catalog/test.txt
```

如果四个路径都能看到相同内容，说明同步正常。

## 🔍 技能目录列表

当前共有 **15 个技能目录**：

### A-foundation（基础设施）
- `00-system` - 系统基础架构
- `01-spec` - 规范文档
- `02-infra` - 基础设施
- `03-common` - 通用组件
- `04-testing` - 测试工具
- `05-i18n` - 国际化

### B-domains（业务领域）
- `10-catalog` - 商品目录
- `20-cart-checkout` - 购物车结算
- `30-order-member` - 订单会员
- `40-marketing-cms` - 营销CMS

### C-delivery（交付工具）
- `90-figma-to-code` - Figma 转代码
- `91-apifox-to-impl` - Apifox 转实现
- `92-verification` - 验证工具
- `93-maintenance` - 维护工具
- `94-i18n-workflow` - 国际化工作流
