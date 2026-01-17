# 如何获取 Figma 项目 ID

## 方法 1: 从 Figma 网页 URL 获取（最简单）⭐

### 步骤：

1. **打开 Figma 网页版**
   - 访问 https://www.figma.com
   - 登录你的账号

2. **进入项目页面**
   - 点击左侧边栏的 "Projects" 或 "项目"
   - 或者直接访问项目页面

3. **查看浏览器地址栏**
   - URL 格式通常是：
     ```
     https://www.figma.com/files/{PROJECT_ID}/{项目名称}
     ```
   - 或者：
     ```
     https://www.figma.com/files/project/{PROJECT_ID}/{项目名称}
     ```

4. **提取项目 ID**
   - 项目 ID 是 URL 中 `/files/` 或 `/files/project/` 后面的那串字符
   - 示例：
     ```
     URL: https://www.figma.com/files/123456789/My-Project
     项目 ID: 123456789
     ```

### 示例截图说明：

```
浏览器地址栏：
┌─────────────────────────────────────────────────────────────┐
│ https://www.figma.com/files/123456789/ECshopex-Project     │
└─────────────────────────────────────────────────────────────┘
                              ↑
                        这就是项目 ID
```

---

## 方法 2: 从文件页面推断项目 ID

如果你知道某个文件的 URL，可以：

1. **打开文件页面**
   - URL 格式：`https://www.figma.com/design/{FILE_KEY}/...`

2. **点击文件信息或返回项目**
   - 在文件页面，点击左上角的项目名称或返回按钮
   - 这会跳转到项目页面，URL 中包含项目 ID

---

## 方法 3: 通过 API 获取项目列表（需要 Team ID）

如果你有团队 ID，可以通过 API 获取所有项目：

### 步骤：

1. **获取 Team ID**
   - 访问团队页面
   - URL 格式：`https://www.figma.com/files/team/{TEAM_ID}/...`
   - 或者从团队设置页面获取

2. **调用 API 获取项目列表**

```bash
# 使用 curl
curl -H "X-Figma-Token: YOUR_TOKEN" \
  "https://api.figma.com/v1/teams/{TEAM_ID}/projects"

# 使用 Python
import requests

team_id = "your_team_id"
token = "your_token"

url = f"https://api.figma.com/v1/teams/{team_id}/projects"
headers = {"X-Figma-Token": token}

response = requests.get(url, headers=headers)
projects = response.json()

for project in projects.get("projects", []):
    print(f"项目名称: {project['name']}")
    print(f"项目 ID: {project['id']}")
    print("---")
```

### API 响应示例：

```json
{
  "projects": [
    {
      "id": "123456789",
      "name": "ECshopex Project",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "987654321",
      "name": "Another Project",
      "created_at": "2024-02-01T00:00:00Z"
    }
  ]
}
```

---

## 方法 4: 使用浏览器开发者工具

1. **打开 Figma 项目页面**
2. **打开浏览器开发者工具**（F12 或 Cmd+Option+I）
3. **切换到 Network（网络）标签**
4. **刷新页面**
5. **查找 API 请求**
   - 查找包含 `projects` 的请求
   - 查看响应数据中的项目 ID

---

## 快速检查脚本

我创建了一个辅助脚本帮你获取项目列表：

```python
# get_projects.py
from dotenv import load_dotenv
import os
import requests
from pathlib import Path

load_dotenv(Path('.env'))

team_id = input("请输入 Team ID（从团队页面 URL 获取）: ")
token = os.getenv('FIGMA_ACCESS_TOKEN')

if not token:
    print("❌ 未找到 FIGMA_ACCESS_TOKEN，请在 .env 文件中配置")
    exit(1)

url = f"https://api.figma.com/v1/teams/{team_id}/projects"
headers = {"X-Figma-Token": token}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    
    print("\n📋 项目列表：")
    print("="*50)
    for project in data.get("projects", []):
        print(f"项目名称: {project['name']}")
        print(f"项目 ID: {project['id']}")
        print(f"创建时间: {project.get('created_at', 'N/A')}")
        print("-"*50)
except Exception as e:
    print(f"❌ 错误: {e}")
```

---

## 常见问题

### Q: 项目 ID 是什么格式？

**A**: 项目 ID 通常是一串数字，例如：`123456789`、`987654321`

### Q: 项目 ID 和文件 Key 有什么区别？

**A**: 
- **项目 ID (Project ID)**: 标识一个项目（包含多个文件）
- **文件 Key (File Key)**: 标识单个设计文件

### Q: 我可以从文件 URL 获取项目 ID 吗？

**A**: 文件 URL 不直接包含项目 ID，但你可以：
1. 点击文件页面上的项目名称链接
2. 跳转到项目页面后，URL 中就有项目 ID

### Q: 项目 ID 会变化吗？

**A**: 不会，项目 ID 是固定的，除非项目被删除。

---

## 推荐方法

**最简单的方法**：直接从 Figma 网页的项目页面 URL 中提取项目 ID。

步骤：
1. 打开 Figma
2. 进入项目页面
3. 查看浏览器地址栏
4. 复制项目 ID（`/files/` 后面的数字）
