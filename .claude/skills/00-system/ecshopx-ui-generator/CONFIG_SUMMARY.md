# Figma 配置总结

## ✅ 已完成的配置

### 环境变量配置

`.env` 文件已配置以下变量：

```bash
FIGMA_ACCESS_TOKEN=your_token_here          # ✅ 已配置
FIGMA_FILE_KEY=clySPKbja8yL0BQnFke6oi      # ✅ 已配置
FIGMA_PROJECT_ID=                           # ⚠️  未配置（可选）
FIGMA_TEAM_ID=                              # ⚠️  未配置（可选）
```

### 当前配置的 File Key

- **File Key**: `clySPKbja8yL0BQnFke6oi`
- **文件名称**: ECshopex demo-PC端
- **文件 URL**: https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端

### 已拉取的页面节点

最新拉取时间：2026-01-13T22:01:42

**页面列表**：
1. PC商城 (节点: 1341-2, 87 个框架)
2. PC商城组件库 (节点: 2109-456, 0 个框架)
3. shop商城demo (节点: 1127-32, 32 个框架)
4. ecshopx (节点: 0-1, 22 个框架)
5. 控件 (节点: 0-3254, 0 个框架)
6. 雪佛龙 (节点: 0-3259, 7 个框架)

**统计**：
- 总页面数：6
- 总框架数：148

---

## 📋 可用的脚本

### 1. `fetch_figma_pages.py` ✅ 已配置

**用途**：拉取单个文件的页面节点

**当前配置**：
- File Key: `clySPKbja8yL0BQnFke6oi`（已配置到 .env）

**使用方法**：
```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_pages.py
```

**输出**：`references/figma-pages.json`

---

### 2. `fetch_figma_project.py` ⚠️  需要 Project ID

**用途**：拉取项目的所有文件页面节点

**需要的配置**：
- `FIGMA_PROJECT_ID`（需要手动获取）

**如何获取 Project ID**：
1. 在 Figma 中打开文件
2. 点击左上角的项目名称
3. 从项目页面 URL 获取 Project ID

**使用方法**：
```bash
python fetch_figma_project.py --project-id your_project_id
```

---

### 3. `fetch_all_projects.py` ⚠️  需要 Team ID

**用途**：获取团队的所有项目和文件

**需要的配置**：
- `FIGMA_TEAM_ID`（需要手动获取）

**如何获取 Team ID**：
1. 在 Figma 中打开团队页面
2. 从 URL 获取 Team ID：`https://www.figma.com/files/team/{TEAM_ID}/...`

**使用方法**：
```bash
python fetch_all_projects.py --team-id your_team_id --fetch-files
```

---

## 🔧 脚本修复

### 已修复的问题

1. ✅ **路径问题**：修复了所有脚本的 `.env` 文件路径解析
   - 从 `parent.parent.parent.parent.parent`（5级）
   - 改为 `parent.parent.parent.parent.parent.parent`（6级）

2. ✅ **环境变量加载**：使用 `python-dotenv` 正确加载环境变量

3. ✅ **File Key 配置**：已配置默认 File Key 到 `.env` 文件

---

## 📝 下一步操作

### 选项 1: 继续使用当前文件（推荐）

当前配置已足够使用 `fetch_figma_pages.py` 脚本：

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_pages.py
```

### 选项 2: 获取 Project ID 和 Team ID

如果需要获取整个项目的所有文件：

1. **获取 Project ID**：
   - 打开文件：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端
   - 点击左上角的项目名称
   - 从项目页面 URL 获取 Project ID

2. **获取 Team ID**：
   - 从项目页面点击项目名称，跳转到团队页面
   - 从团队页面 URL 获取 Team ID

3. **配置到 .env**：
   ```bash
   FIGMA_PROJECT_ID=your_project_id
   FIGMA_TEAM_ID=your_team_id
   ```

---

## 📚 相关文档

- `scripts/HOW_TO_GET_PROJECT_ID.md` - 如何获取 Project ID
- `scripts/HOW_TO_GET_TEAM_ID.md` - 如何获取 Team ID
- `scripts/QUICK_START.md` - 快速开始指南
- `scripts/USAGE.md` - 脚本使用对比

---

## ✅ 验证配置

运行以下命令验证配置：

```bash
# 验证环境变量
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('File Key:', os.getenv('FIGMA_FILE_KEY'))"

# 测试脚本
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_pages.py
```

---

**最后更新**：2026-01-13
