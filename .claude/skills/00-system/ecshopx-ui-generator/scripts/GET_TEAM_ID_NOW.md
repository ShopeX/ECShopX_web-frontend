# 快速获取 Team ID 指南

## 🎯 目标：获取 Team ID 以拉取所有项目

### 方法 1: 从文件页面跳转（最简单）⭐

1. **打开你的 Figma 文件**
   ```
   https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端
   ```

2. **点击左上角的项目名称**
   - 在文件名称上方，通常显示为项目名称
   - 点击后会跳转到项目页面

3. **从项目页面跳转到团队页面**
   - 在项目页面，再次点击项目名称或返回按钮
   - 跳转到团队页面

4. **复制 Team ID**
   - 查看浏览器地址栏
   - URL 格式：`https://www.figma.com/files/team/{TEAM_ID}/团队名称`
   - 复制 `{TEAM_ID}` 部分

### 方法 2: 直接访问团队页面

1. **打开 Figma**
2. **点击左侧边栏的团队名称**
3. **查看 URL 中的 Team ID**

---

## 📝 配置 Team ID

获取 Team ID 后，在项目根目录的 `.env` 文件中添加：

```bash
FIGMA_TEAM_ID=your_team_id_here
```

---

## 🚀 运行脚本

配置好 Team ID 后，运行：

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_all_projects.py --fetch-files
```

或者直接指定 Team ID：

```bash
python fetch_all_projects.py --team-id your_team_id --fetch-files
```

---

## 💡 提示

- Team ID 通常是一串数字，例如：`123456789`
- 如果无法找到团队页面，可以尝试从 Figma 主页左侧的团队列表进入
- Team ID 配置后，可以重复使用，不需要每次都获取
