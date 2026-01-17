---
name: ecshopx-ui-generator
description: "ECShopX UI生成工具技能。根据Figma设计稿自动生成Vue组件代码。适用场景: (1) 根据Figma设计稿生成页面代码 (2) 提取设计系统中的组件和样式规范 (3) 批量拉取Figma页面节点信息 (4) 将设计稿转换为Tailwind CSS类名 (5) 生成符合项目架构规范的组件代码。使用Figma API和MCP工具实现设计稿到代码的自动化转换。"
---

# ECShopX UI 生成工具

## 概述

ECShopX UI 生成工具是一个基于 Figma 设计稿的自动化代码生成系统，能够从 Figma 设计文件中提取页面结构、组件信息和样式规范，并自动生成符合项目架构规范的 Vue 组件代码。

**核心能力**：
- 📐 Figma 设计稿解析和节点提取
- 🎨 设计规范转换为 Tailwind CSS
- 🧩 组件识别和代码生成
- 📄 批量页面节点信息导出
- 🔄 设计稿到代码的自动化流程

**Figma 设计工程**：
- **File Key**: 需在 `.env` 文件中配置 `FIGMA_FILE_KEY`
- **设计文件**: ECshopex-demo-PC端
- **URL**: 从 Figma 文件页面获取

## 快速开始

### 1. 环境配置

**安装依赖**：
```bash
pip install requests python-dotenv
```

**配置环境变量**：

在项目根目录的 `.env` 文件中添加：
```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_FILE_KEY=your_file_key_here              # 单个文件时使用（必需）
FIGMA_PROJECT_ID=your_project_id              # 拉取整个项目时使用（可选）
FIGMA_TEAM_ID=your_team_id                    # 拉取所有项目时使用（可选）
```

**获取 Access Token**：
1. 访问 https://www.figma.com/developers/api#access-tokens
2. 登录 Figma 账号
3. 创建 Personal Access Token
4. 复制 Token 到 `.env` 文件

**File Key 说明**：
- File Key 可以从 Figma 文件 URL 中获取
- URL 格式：`https://www.figma.com/design/{file_key}/...`
- 从 URL 中提取 `{file_key}` 部分，配置到 `FIGMA_FILE_KEY`
- 示例：如果 URL 是 `https://www.figma.com/design/abc123/...`，则 `FIGMA_FILE_KEY=abc123`

**Project ID 说明**（拉取整个项目时使用）：
- Project ID 可以从 Figma 项目页面 URL 中获取
- 格式：从 URL `https://www.figma.com/files/{project_id}/...` 中提取
- 或通过 API `GET /v1/teams/:team_id/projects` 获取项目列表

### 2. 拉取 Figma 页面节点

**方式 1: 拉取单个文件**（适用于已知文件 Key）

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_pages.py
```

**方式 2: 拉取整个项目**（推荐，获取项目下所有设计文档）⭐

```bash
cd .claude/skills/00-system/ecshopx-ui-generator/scripts
python fetch_figma_project.py --project-id your_project_id
```

**输出**：
- 单个文件：生成 `figma-pages.json` 文件
- 整个项目：生成 `figma-project-pages.json` 文件，包含项目下所有文件的页面节点信息
- 文件位置：`.claude/skills/00-system/ecshopx-ui-generator/references/`

### 3. 查看页面节点信息

```bash
cat .claude/skills/00-system/ecshopx-ui-generator/references/figma-pages.json
```

## Figma API 集成

### API 端点

**获取文件信息**：
```
GET https://api.figma.com/v1/files/{file_key}
```

**获取节点信息**：
```
GET https://api.figma.com/v1/files/{file_key}/nodes?ids={node_ids}
```

### 文件配置

**Figma 文件 Key**：
- 从环境变量 `FIGMA_FILE_KEY` 读取（必需）
- 必须在 `.env` 文件中配置，或使用 `--file-key` 参数传递
- 如何获取：从 Figma 文件 URL 中提取，格式为 `https://www.figma.com/design/{file_key}/...`

### 脚本使用

**拉取所有页面节点**：
```bash
python scripts/fetch_figma_pages.py
```

**参数说明**：
- `--file-key`: Figma 文件 Key（优先使用环境变量 `FIGMA_FILE_KEY`）
- `--output`: 输出 JSON 文件路径（默认：references/figma-pages.json）
- `--token`: Figma Access Token（优先使用环境变量 `FIGMA_ACCESS_TOKEN`）

**示例**：
```bash
# 使用环境变量配置（推荐）
python scripts/fetch_figma_pages.py

# 指定文件 Key（覆盖环境变量）
python scripts/fetch_figma_pages.py --file-key figd_xxx

# 指定输出路径
python scripts/fetch_figma_pages.py --output ./custom-output.json

# 同时指定 Token 和 File Key
python scripts/fetch_figma_pages.py --token your_token --file-key figd_xxx
```

## 页面节点数据结构

### JSON 输出格式

```json
{
  "file_key": "your_file_key_from_env",
  "file_name": "ECshopex-demo-PC端",
  "last_modified": "2025-01-12T10:00:00Z",
  "pages": [
    {
      "id": "1:2",
      "name": "首页",
      "type": "CANVAS",
      "node_id": "1341-2",
      "url": "https://www.figma.com/design/{file_key}?node-id=1341-2",
      "children_count": 15,
      "frames": [
        {
          "id": "2:3",
          "name": "Header",
          "type": "FRAME",
          "width": 1920,
          "height": 80
        }
      ]
    }
  ],
  "total_pages": 10,
  "total_frames": 150
}
```

### 节点类型说明

- **CANVAS**: 页面（Page）
- **FRAME**: 框架/容器（通常是页面级组件）
- **COMPONENT**: 组件实例
- **INSTANCE**: 组件实例
- **TEXT**: 文本节点
- **RECTANGLE**: 矩形/图片
- **GROUP**: 分组

## UI 生成工作流

### 完整流程

```
1. 拉取 Figma 页面节点
   ↓
2. 解析页面结构
   ↓
3. 识别组件类型
   ↓
4. 提取样式信息
   ↓
5. 转换为 Tailwind CSS
   ↓
6. 生成 Vue 组件代码
   ↓
7. 应用项目架构规范
```

### 步骤详解

#### 步骤 1: 拉取设计稿数据

```bash
# 运行脚本拉取所有页面节点
python scripts/fetch_figma_pages.py
```

#### 步骤 2: 选择目标页面

查看生成的 `figma-pages.json`，找到需要开发的页面：
```json
{
  "pages": [
    {
      "name": "商品列表页",
      "node_id": "1119-32",
      "url": "https://www.figma.com/design/...?node-id=1119-32"
    }
  ]
}
```

#### 步骤 3: 获取页面详细信息

使用 Figma MCP 或 API 获取具体页面的设计规格：
```
使用 Figma MCP 获取 node-id=1119-32 的页面设计稿
```

#### 步骤 4: 生成组件代码

根据设计稿信息，按照项目架构规范生成代码：
- 遵循 `ecshopx-system` 的架构方案
- 使用 Tailwind CSS 实现样式
- 遵循项目代码规范

## 组件映射规则

### Figma → Vue 组件映射

| Figma 类型 | Vue 组件 | Nuxt UI 组件 |
|-----------|---------|-------------|
| FRAME (Button) | `<button>` | `<UButton>` |
| FRAME (Input) | `<input>` | `<UInput>` |
| FRAME (Card) | `<div>` | `<UCard>` |
| TEXT (Heading) | `<h1-h6>` | `<h1-h6>` |
| TEXT (Body) | `<p>` | `<p>` |
| RECTANGLE (Image) | `<img>` | `<img>` |
| FRAME (Container) | `<div>` | `<div>` |

### 样式转换规则

#### 颜色转换

```javascript
// Figma 颜色 → Tailwind CSS
"#FF5733" → "text-red-500" 或自定义颜色类
"rgba(0,0,0,0.1)" → "bg-black/10"
```

#### 间距转换

```javascript
// Figma 间距 → Tailwind spacing
8px → "p-2" 或 "gap-2"
16px → "p-4" 或 "gap-4"
24px → "p-6" 或 "gap-6"
```

#### 字体转换

```javascript
// Figma 字体 → Tailwind typography
fontSize: 24, fontWeight: 700 → "text-2xl font-bold"
fontSize: 16, fontWeight: 400 → "text-base font-normal"
```

#### 布局转换

```javascript
// Figma 布局 → Tailwind layout
display: "FLEX", flexDirection: "ROW" → "flex flex-row"
display: "FLEX", flexDirection: "COLUMN" → "flex flex-col"
display: "GRID" → "grid"
```

## 代码生成示例

### 示例 1: 商品卡片组件

**Figma 设计信息**：
- 组件名：ProductCard
- 尺寸：280x400px
- 圆角：8px
- 阴影：sm
- 内边距：16px

**生成的 Vue 组件**：
```vue
<template>
  <div class="w-[280px] h-[400px] rounded-lg shadow-sm p-4">
    <!-- 商品图片 -->
    <img :src="product.image" class="w-full h-48 object-cover rounded" />
    
    <!-- 商品信息 -->
    <div class="mt-4">
      <h3 class="text-base font-semibold">{{ product.name }}</h3>
      <p class="text-lg text-red-500 font-bold mt-2">¥{{ product.price }}</p>
    </div>
  </div>
</template>
```

### 示例 2: 页面布局

**Figma 页面结构**：
- 页面：商品列表页
- 布局：Header + Filter + ProductGrid + Pagination

**生成的页面代码**：
```vue
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <Header />
    
    <!-- Filter -->
    <ProductFilter />
    
    <!-- Product Grid -->
    <div class="grid grid-cols-4 gap-4 mt-6">
      <ProductCard v-for="item in products" :key="item.id" :product="item" />
    </div>
    
    <!-- Pagination -->
    <Pagination />
  </div>
</template>
```

## 与项目架构集成

### 架构方案选择

根据功能需求选择合适的架构方案（参考 `ecshopx-system`）：

**方案 1（完整架构）**：
- 需要全局状态 → 使用 Store
- 需要持久化 → 使用 localStorage
- 示例：购物车、用户信息

**方案 2（简化架构）**：
- 不需要全局状态 → 使用 Composable
- 一次性数据获取
- 示例：商品列表、商品详情

**方案 3（最简架构）**：
- 简单静态页面
- 直接使用 `useFetch`
- 示例：关于我们、服务条款

### 代码生成规范

生成代码时遵循以下规范：

1. **命名规范**：
   - 组件：PascalCase（如 `ProductCard.vue`）
   - 文件：kebab-case（如 `product-card.vue`）
   - 变量：camelCase（如 `productList`）

2. **目录结构**：
   ```
   app/
   ├── pages/              # 页面
   ├── components/         # 组件
   │   ├── business/      # 业务组件
   │   └── ui/            # UI 组件
   ├── composables/       # 组合式函数
   └── infrastructure/    # 基础设施
   ```

3. **样式规范**：
   - 优先使用 Tailwind CSS
   - 响应式设计：`sm:`, `md:`, `lg:`, `xl:`
   - 遵循设计系统规范

## 使用场景

### 场景 1: 根据设计稿生成新页面

**步骤**：
1. 运行脚本拉取页面节点：`python scripts/fetch_figma_pages.py`
2. 查看 `figma-pages.json` 找到目标页面
3. 使用 Figma MCP 获取页面详细设计
4. 根据设计稿生成 Vue 页面代码

**示例对话**：
```
用户：根据 Figma 设计稿生成商品列表页
AI：
  1. 🔍 拉取 Figma 页面节点
  2. 📐 获取"商品列表页"的设计规格
  3. 🎨 解析组件和样式
  4. 📝 生成符合架构规范的代码
```

### 场景 2: 批量导出页面信息

**用途**：
- 了解设计文件中的所有页面
- 规划开发优先级
- 生成页面清单文档

**命令**：
```bash
python scripts/fetch_figma_pages.py --output pages-inventory.json
```

### 场景 3: 提取设计系统规范

**用途**：
- 提取颜色、字体、间距等设计 token
- 配置 Tailwind CSS 主题
- 生成设计系统文档

## 故障排查

### 常见问题

#### 1. Access Token 无效

**错误**：
```
401 Unauthorized
```

**解决**：
- 检查 `.env` 文件中的 `FIGMA_ACCESS_TOKEN`
- 确认 Token 未过期
- 重新生成 Token：https://www.figma.com/developers/api#access-tokens

#### 2. File Key 未配置或错误

**错误**：
```
❌ 错误: 未找到 Figma File Key
```
或
```
404 Not Found
```

**解决**：
- 在 `.env` 文件中添加 `FIGMA_FILE_KEY=your_file_key_here`
- 或使用 `--file-key` 参数传递
- 确认文件 Key 正确（从 Figma URL 中获取）
- 检查文件权限（需要读取权限）
- 确认文件 URL 正确

#### 3. 网络请求失败

**错误**：
```
ConnectionError or Timeout
```

**解决**：
- 检查网络连接
- 确认可以访问 `api.figma.com`
- 检查防火墙设置

#### 4. JSON 解析错误

**错误**：
```
JSONDecodeError
```

**解决**：
- 检查 API 响应格式
- 确认文件权限
- 查看完整错误信息

## 最佳实践

### 1. 定期更新页面节点

设计稿更新后，重新拉取节点信息：
```bash
# 每周或设计稿更新后运行
python scripts/fetch_figma_pages.py
```

### 2. 版本控制

将生成的 `figma-pages.json` 纳入版本控制：
```bash
git add .claude/skills/00-system/ecshopx-ui-generator/references/figma-pages.json
git commit -m "chore: update figma pages inventory"
```

### 3. 设计稿变更通知

设计稿更新时：
1. 拉取最新节点信息
2. 对比变更内容
3. 更新相关组件代码

### 4. 代码审查

生成的代码需要：
- 符合项目架构规范
- 遵循代码规范
- 通过代码审查
- 进行功能测试

## 参考资源

### Figma API 文档
- REST API: https://www.figma.com/developers/api
- 文件端点: https://www.figma.com/developers/api#file-endpoints
- 节点端点: https://www.figma.com/developers/api#node-endpoints

### 项目相关技能
- `ecshopx-system`: 系统架构规范
- `ecshopx-catalog`: 商品目录开发指南
- 其他业务模块技能

### 工具脚本
- `scripts/fetch_figma_pages.py`: 拉取 Figma 页面节点脚本
- `references/figma-pages.json`: 页面节点数据文件

## 更新日志

### v1.0.0 (2025-01-12)
- ✨ 初始版本
- ✨ Figma API 集成
- ✨ 页面节点拉取功能
- ✨ JSON 数据导出
- ✨ 代码生成工作流
