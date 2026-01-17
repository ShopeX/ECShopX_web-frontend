# Figma 页面节点拉取脚本

## 功能说明

本项目提供两个脚本：

1. **`fetch_figma_pages.py`**: 拉取**单个设计文件**的所有页面节点
2. **`fetch_figma_project.py`**: 拉取**整个项目**下所有设计文件的页面节点（新增）

## 脚本 1: 拉取单个文件 (`fetch_figma_pages.py`)

用于从 Figma API 拉取指定设计文件的所有页面节点信息，并生成 JSON 文件。

## 使用方法

### 1. 安装依赖

```bash
pip install requests python-dotenv
```

### 2. 配置环境变量

**方式 1: 使用 .env 文件（推荐）**

在项目根目录的 `.env` 文件中添加：

```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_FILE_KEY=your_file_key_here
```

**如何获取 File Key**：

- 从 Figma 文件 URL 中提取
- URL 格式：`https://www.figma.com/design/{file_key}/...`
- 复制 `{file_key}` 部分到 `FIGMA_FILE_KEY`

**方式 2: 使用命令行参数**

```bash
python fetch_figma_pages.py --token your_token_here --file-key figd_xxx
```

**环境变量说明**：

- `FIGMA_ACCESS_TOKEN`: Figma API Access Token（必需）
- `FIGMA_FILE_KEY`: Figma 文件 Key（必需）

### 3. 运行脚本

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_pages.py
```

### 4. 查看结果

生成的 JSON 文件位置：

```
.claude/skills/00-system/ecshopx-ui-generator/references/figma-pages.json
```

## 命令行参数

- `--file-key`: Figma 文件 Key（优先使用环境变量 `FIGMA_FILE_KEY`）
- `--output`: 输出 JSON 文件路径（默认: `references/figma-pages.json`）
- `--token`: Figma Access Token（优先使用环境变量 `FIGMA_ACCESS_TOKEN`）

## 示例

```bash
# 使用默认配置
python fetch_figma_pages.py

# 指定文件 Key
python fetch_figma_pages.py --file-key figd_xxx

# 指定输出路径
python fetch_figma_pages.py --output ./custom-output.json

# 指定 Token
python fetch_figma_pages.py --token your_token_here
```

## 输出格式

生成的 JSON 文件包含以下信息：

- `file_key`: Figma 文件 Key
- `file_name`: 文件名称
- `last_modified`: 最后修改时间
- `pages`: 页面节点数组
  - `id`: 节点 ID
  - `name`: 页面名称
  - `node_id`: 用于 URL 的节点 ID
  - `url`: Figma 页面 URL
  - `frame_count`: 框架数量
  - `frames`: 框架信息列表
- `total_pages`: 总页面数
- `total_frames`: 总框架数
- `generated_at`: 生成时间

---

## 脚本 2: 拉取整个项目 (`fetch_figma_project.py`) ⭐ 推荐

用于从 Figma API 拉取指定项目（Project）下**所有设计文件**的页面节点信息。

### 使用场景

当你想要：

- ✅ 获取整个项目的所有设计文档
- ✅ 批量拉取多个文件的页面节点
- ✅ 了解项目中有哪些设计文件

### 使用方法

#### 1. 获取项目 ID

**方式 1: 从 Figma URL 获取**

- 访问 Figma 项目页面
- 查看 URL，格式为: `https://www.figma.com/files/PROJECT_ID/...`
- 复制 PROJECT_ID

**方式 2: 通过 API 获取**

```bash
# 先获取团队 ID（从团队页面 URL）
# 然后调用: GET /v1/teams/:team_id/projects
```

#### 2. 配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_PROJECT_ID=your_project_id_here
```

#### 3. 运行脚本

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_project.py --project-id your_project_id
```

#### 4. 查看结果

生成的 JSON 文件位置：

```
.claude/skills/00-system/ecshopx-ui-generator/references/figma-project-pages.json
```

### 命令行参数

- `--project-id`: Figma 项目 ID（优先使用环境变量 `FIGMA_PROJECT_ID`）
- `--output`: 输出 JSON 文件路径（默认: `references/figma-project-pages.json`）
- `--token`: Figma Access Token（优先使用环境变量 `FIGMA_ACCESS_TOKEN`）

### 输出格式

生成的 JSON 文件包含以下信息：

```json
{
  "project_id": "123456",
  "total_files": 3,
  "total_pages": 15,
  "total_frames": 200,
  "files": [
    {
      "file_key": "your_file_key_from_env",
      "file_name": "ECshopex demo-PC端",
      "last_modified": "2026-01-13T08:03:54Z",
      "thumbnail_url": "...",
      "pages": [...],
      "total_pages": 6,
      "total_frames": 148
    }
  ],
  "generated_at": "2026-01-13T18:00:00Z"
}
```

### 示例

```bash
# 使用环境变量配置（推荐）
python fetch_figma_project.py

# 指定项目 ID
python fetch_figma_project.py --project-id 123456

# 指定输出路径
python fetch_figma_project.py --project-id 123456 --output ./custom.json
```

---

## 故障排查

### Token 无效

如果遇到 401 错误，检查：

1. Token 是否正确
2. Token 是否过期
3. 文件权限是否正确

### 文件不存在

如果遇到 404 错误，检查：

1. 文件 Key 是否正确
2. 文件是否被删除
3. 是否有访问权限

### 网络错误

如果遇到网络错误，检查：

1. 网络连接是否正常
2. 是否可以访问 `api.figma.com`
3. 防火墙设置
