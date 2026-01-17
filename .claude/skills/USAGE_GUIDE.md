# ECShopX Skills 使用指南

## 如何调用技能

### 方式 1: 在 Claude 对话中自动触发

当你在对话中提到相关需求时，Claude 会自动识别并加载对应的技能：

**示例对话**：
```
你: 根据 Figma 设计稿生成商品列表页
Claude: 
  - 🔍 自动加载 ecshopx-ui-generator 技能
  - 📐 获取 Figma 设计规格
  - 📝 生成符合架构规范的代码
```

### 方式 2: 手动调用技能

在对话中明确提到技能名称：

```
你: 使用 ecshopx-ui-generator 技能帮我拉取 Figma 页面节点
Claude: 
  - 🔍 加载 ecshopx-ui-generator 技能
  - 📐 执行拉取操作
```

### 方式 3: 使用 openskills 命令

```bash
# 读取技能内容
openskills read ecshopx-ui-generator

# 列出所有已安装的技能
openskills list

# 查看技能详情
openskills read ecshopx-ui-generator
```

## 技能调用场景

### ecshopx-ui-generator 使用场景

**场景 1: 拉取 Figma 页面节点**
```
你: 帮我拉取 Figma 设计文件的所有页面节点
Claude: 
  1. 使用 ecshopx-ui-generator 技能
  2. 运行 Python 脚本拉取节点
  3. 生成 JSON 文件
```

**场景 2: 根据设计稿生成代码**
```
你: 根据 Figma 设计稿生成商品列表页组件
Claude:
  1. 加载 ecshopx-ui-generator 技能
  2. 获取设计稿规格
  3. 生成 Vue 组件代码
```

**场景 3: 提取设计系统规范**
```
你: 从 Figma 提取设计系统的颜色和字体规范
Claude:
  1. 使用 ecshopx-ui-generator 技能
  2. 分析设计文件
  3. 提取设计 token
```

## 技能安装状态

### 检查技能是否已安装

```bash
# 查看全局技能列表
openskills list

# 查看项目技能
ls ~/.agent/skills/ | grep ecshopx
```

### 已安装的技能

- ✅ `ecshopx-ui-generator` - UI 生成工具（已安装到 ~/.agent/skills/）
- ✅ `ecshopx-system` - 系统架构规范
- ✅ `ecshopx-catalog` - 商品目录
- ✅ `ecshopx-search` - 搜索功能
- ✅ `ecshopx-cart` - 购物车
- ✅ `ecshopx-checkout` - 结账流程
- ✅ `ecshopx-payment` - 支付功能
- ✅ `ecshopx-order` - 订单管理
- ✅ `ecshopx-account` - 账号管理
- ✅ `ecshopx-promotion` - 促销活动
- ✅ `ecshopx-cms` - CMS 内容管理

## 技能文件位置

### 全局技能位置
```
~/.agent/skills/ecshopx-ui-generator/
```

### 项目技能位置
```
.claude/skills/00-system/ecshopx-ui-generator/
```

### 打包文件
```
.claude/skills/ecshopx-ui-generator.skill
```

## 故障排查

### 技能未加载

1. **检查技能是否安装**：
   ```bash
   ls ~/.agent/skills/ecshopx-ui-generator/
   ```

2. **检查 AGENTS.md**：
   确保技能已添加到 `AGENTS.md` 的 `<available_skills>` 部分

3. **重新安装技能**：
   ```bash
   cd .claude/skills
   unzip -q ecshopx-ui-generator.skill -d ~/.agent/skills/
   ```

### 技能调用失败

1. **检查技能名称**：
   确保使用正确的技能名称：`ecshopx-ui-generator`

2. **检查技能描述**：
   确保你的请求匹配技能的适用场景

3. **查看技能内容**：
   ```bash
   openskills read ecshopx-ui-generator
   ```

## 最佳实践

1. **明确需求**：在对话中明确说明需要使用的技能
2. **提供上下文**：提供足够的上下文信息帮助技能正确执行
3. **检查结果**：验证技能生成的结果是否符合预期
4. **反馈改进**：如果技能使用有问题，及时反馈以便改进
