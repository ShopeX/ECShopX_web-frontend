# Figma 脚本使用指南

## 两个脚本的区别

### 1. `fetch_figma_pages.py` - 拉取单个文件

**用途**：拉取**单个设计文件**的所有页面节点

**适用场景**：
- ✅ 已知具体的文件 Key
- ✅ 只需要某个特定文件的页面节点
- ✅ 文件数量少（1-2 个）

**需要的参数**：
- `FIGMA_FILE_KEY`: 文件 Key（从文件 URL 获取，必须在 `.env` 中配置）

**输出文件**：`figma-pages.json`

---

### 2. `fetch_figma_project.py` - 拉取整个项目 ⭐ 推荐

**用途**：拉取**整个项目**下所有设计文件的页面节点

**适用场景**：
- ✅ 想要获取项目中的所有设计文档
- ✅ 项目包含多个设计文件
- ✅ 需要批量拉取多个文件
- ✅ 不确定项目中有哪些文件

**需要的参数**：
- `FIGMA_PROJECT_ID`: 项目 ID（从项目 URL 获取）

**输出文件**：`figma-project-pages.json`

---

## 如何选择使用哪个脚本？

### 场景 1: 我只知道文件 URL

**使用**: `fetch_figma_pages.py`

```bash
# 从 URL 提取 File Key
# URL: https://www.figma.com/design/{file_key}/...
# 提取 {file_key} 部分

python fetch_figma_pages.py --file-key your_file_key
```

### 场景 2: 我想获取整个项目的所有设计文档

**使用**: `fetch_figma_project.py` ⭐

```bash
# 从项目 URL 提取 Project ID
# URL: https://www.figma.com/files/123456/...
# Project ID: 123456

python fetch_figma_project.py --project-id 123456
```

---

## 如何获取 Project ID？

### 方法 1: 从 Figma 项目页面 URL 获取

1. 访问 Figma 项目页面
2. 查看浏览器地址栏的 URL
3. URL 格式：`https://www.figma.com/files/{PROJECT_ID}/...`
4. 复制 PROJECT_ID

### 方法 2: 通过 API 获取（需要 Team ID）

```bash
# 1. 获取 Team ID（从团队页面 URL）
# 2. 调用 API 获取项目列表
GET https://api.figma.com/v1/teams/{team_id}/projects
```

---

## 快速开始

### 拉取整个项目（推荐）

```bash
# 1. 配置环境变量（.env 文件）
FIGMA_ACCESS_TOKEN=your_token
FIGMA_PROJECT_ID=your_project_id

# 2. 运行脚本
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_project.py

# 3. 查看结果
cat ../references/figma-project-pages.json
```

### 拉取单个文件

```bash
# 1. 配置环境变量（.env 文件）
FIGMA_ACCESS_TOKEN=your_token
FIGMA_FILE_KEY=your_file_key

# 2. 运行脚本
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_pages.py

# 3. 查看结果
cat ../references/figma-pages.json
```

---

## 输出文件对比

### `figma-pages.json` (单个文件)

```json
{
  "file_key": "your_file_key_from_env",
  "file_name": "ECshopex demo-PC端",
  "pages": [...],
  "total_pages": 6
}
```

### `figma-project-pages.json` (整个项目)

```json
{
  "project_id": "123456",
  "total_files": 3,
  "total_pages": 15,
  "files": [
    {
      "file_key": "your_file_key_from_env",
      "file_name": "ECshopex demo-PC端",
      "pages": [...],
      "total_pages": 6
    },
    {
      "file_key": "another_file_key",
      "file_name": "另一个设计文件",
      "pages": [...],
      "total_pages": 9
    }
  ]
}
```

---

## 常见问题

### Q: 我应该使用哪个脚本？

**A**: 
- 如果你想要获取**整个项目的所有设计文档** → 使用 `fetch_figma_project.py`
- 如果你只需要**某个特定文件** → 使用 `fetch_figma_pages.py`

### Q: 如何获取 Project ID？

**A**: 
1. 访问 Figma 项目页面
2. 查看 URL 中的项目 ID
3. 或通过 API `GET /v1/teams/:team_id/projects` 获取

### Q: 两个脚本的输出有什么区别？

**A**: 
- `fetch_figma_pages.py`: 输出单个文件的数据
- `fetch_figma_project.py`: 输出项目下所有文件的数据（包含文件列表）

### Q: 可以同时使用两个脚本吗？

**A**: 可以，它们生成不同的输出文件，互不冲突。
