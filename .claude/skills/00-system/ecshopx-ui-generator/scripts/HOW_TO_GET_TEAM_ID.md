# 如何获取 Figma Team ID

## ⚠️ 重要说明

**Figma API 限制**：无法通过 API 直接获取所有团队列表。需要手动从 Figma 网页中获取 Team ID。

## 方法 1: 从团队页面 URL 获取（最简单）⭐

### 步骤：

1. **打开 Figma 网页版**
   - 访问 https://www.figma.com
   - 登录你的账号

2. **进入团队页面**
   - 点击左侧边栏的团队名称
   - 或者访问团队页面

3. **查看浏览器地址栏**
   - URL 格式通常是：
     ```
     https://www.figma.com/files/team/{TEAM_ID}/{团队名称}
     ```
   - 或者：
     ```
     https://www.figma.com/files/team/{TEAM_ID}
     ```

4. **提取团队 ID**
   - 团队 ID 是 URL 中 `/team/` 后面的那串字符
   - 示例：
     ```
     URL: https://www.figma.com/files/team/123456789/My-Team
     团队 ID: 123456789
     ```

### 示例截图说明：

```
浏览器地址栏：
┌─────────────────────────────────────────────────────────────┐
│ https://www.figma.com/files/team/123456789/ECshopex-Team   │
└─────────────────────────────────────────────────────────────┘
                              ↑
                        这就是团队 ID
```

---

## 方法 2: 从项目页面推断

如果你知道某个项目的 URL：

1. **打开项目页面**
   - URL 格式：`https://www.figma.com/files/{PROJECT_ID}/...`

2. **点击项目名称或返回按钮**
   - 这会跳转到团队页面
   - 新 URL 中包含团队 ID

---

## 方法 3: 从文件页面跳转

如果你当前在文件页面：

1. **点击左上角的项目名称**
   - 跳转到项目页面

2. **再点击项目名称或返回按钮**
   - 跳转到团队页面
   - URL 中包含团队 ID

---

## 快速查找步骤

针对你的文件 "ECshopex demo-PC端"：

1. **在 Figma 中打开这个文件**：
   ```
   https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端
   ```

2. **点击左上角的项目名称**（在文件名称上方）

3. **跳转到项目页面后，再点击项目名称或返回按钮**

4. **跳转到团队页面后，查看 URL**：
   ```
   https://www.figma.com/files/team/{TEAM_ID}/团队名称
   ```

5. **复制 TEAM_ID**

---

## 配置到环境变量

获取 Team ID 后，在 `.env` 文件中添加：

```bash
FIGMA_TEAM_ID=your_team_id_here
```

---

## 使用脚本

配置好 Team ID 后，运行：

```bash
# 只获取项目列表
python fetch_all_projects.py

# 获取项目列表和每个项目的文件
python fetch_all_projects.py --fetch-files

# 或直接指定 Team ID
python fetch_all_projects.py --team-id 123456789 --fetch-files
```

---

## 常见问题

### Q: Team ID 是什么格式？

**A**: Team ID 通常是一串数字，例如：`123456789`、`987654321`

### Q: 为什么无法通过 API 获取所有团队？

**A**: 这是 Figma API 的限制。Figma API 不提供 `/v1/teams` 端点来获取所有团队列表。需要手动从网页 URL 中获取。

### Q: Team ID 和 Project ID 有什么区别？

**A**: 
- **Team ID**: 标识一个团队（包含多个项目）
- **Project ID**: 标识一个项目（包含多个文件）
- **File Key**: 标识单个设计文件

### Q: 我可以从文件 URL 获取 Team ID 吗？

**A**: 文件 URL 不直接包含 Team ID，但你可以：
1. 点击文件页面上的项目名称链接
2. 跳转到项目页面
3. 再点击项目名称，跳转到团队页面
4. 团队页面的 URL 中包含 Team ID

---

## 推荐方法

**最简单的方法**：直接从 Figma 网页的团队页面 URL 中提取 Team ID。

步骤：
1. 打开 Figma
2. 进入团队页面
3. 查看浏览器地址栏
4. 复制 Team ID（`/team/` 后面的数字）
