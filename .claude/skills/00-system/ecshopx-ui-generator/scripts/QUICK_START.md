# Figma 脚本快速开始指南

## 📋 脚本列表

| 脚本 | 用途 | 需要的参数 |
|------|------|-----------|
| `fetch_figma_pages.py` | 拉取单个文件的页面节点 | `FIGMA_FILE_KEY` |
| `fetch_figma_project.py` | 拉取项目的所有文件页面节点 | `FIGMA_PROJECT_ID` |
| `fetch_all_projects.py` | 获取团队的所有项目和文件 | `FIGMA_TEAM_ID` |

---

## 🚀 快速开始：获取所有项目工程

### 步骤 1: 获取 Team ID

**方法**：从 Figma 网页 URL 获取

1. 打开 Figma 网页版
2. 进入团队页面
3. 查看 URL：`https://www.figma.com/files/team/{TEAM_ID}/...`
4. 复制 TEAM_ID

**详细说明**：查看 `HOW_TO_GET_TEAM_ID.md`

### 步骤 2: 配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
FIGMA_ACCESS_TOKEN=your_token
FIGMA_TEAM_ID=your_team_id
```

### 步骤 3: 运行脚本

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts

# 获取所有项目和文件列表
python fetch_all_projects.py --fetch-files

# 或指定 Team ID
python fetch_all_projects.py --team-id your_team_id --fetch-files
```

### 步骤 4: 查看结果

生成的 JSON 文件：
```
.claude/skills/00-system/ecshopx-ui-generator/references/figma-all-projects.json
```

---

## 📊 输出文件说明

### `figma-all-projects.json`

包含：
- 团队信息
- 所有项目列表
- 每个项目的文件列表
- 统计信息

```json
{
  "team_id": "123456789",
  "total_projects": 3,
  "total_files": 15,
  "projects": [
    {
      "id": "project-1",
      "name": "项目1",
      "file_count": 5,
      "files": [...]
    }
  ]
}
```

---

## 🔄 完整工作流

### 场景：获取整个团队的所有设计文档

```bash
# 1. 获取所有项目和文件列表
python fetch_all_projects.py --team-id your_team_id --fetch-files

# 2. 查看生成的项目列表
cat ../references/figma-all-projects.json

# 3. 选择某个项目，获取详细的页面节点
python fetch_figma_project.py --project-id project_id_from_step2

# 4. 或者直接获取单个文件的页面节点
python fetch_figma_pages.py --file-key file_key_from_step2
```

---

## 💡 使用建议

1. **首次使用**：
   - 先运行 `fetch_all_projects.py` 获取项目概览
   - 了解团队中有哪些项目和文件

2. **获取具体项目**：
   - 使用 `fetch_figma_project.py` 获取项目的所有页面节点
   - 适合需要批量处理某个项目的所有文件

3. **获取单个文件**：
   - 使用 `fetch_figma_pages.py` 获取单个文件的页面节点
   - 适合只需要某个特定文件的情况

---

## 📚 相关文档

- `HOW_TO_GET_TEAM_ID.md` - 如何获取 Team ID
- `HOW_TO_GET_PROJECT_ID.md` - 如何获取 Project ID
- `README.md` - 详细使用说明
- `USAGE.md` - 脚本对比和使用场景
