# ECShopX UI 生成工具技能包

## 概述

`ecshopx-ui-generator` 是一个用于根据 Figma 设计稿自动生成 Vue 组件代码的技能包。它提供了从 Figma 设计文件中提取页面结构、组件信息和样式规范的能力。

## 目录结构

```
ecshopx-ui-generator/
├── SKILL.md                    # 技能主文档
├── README.md                   # 本文件
├── scripts/                    # 工具脚本目录
│   ├── fetch_figma_pages.py   # Figma 页面节点拉取脚本
│   ├── requirements.txt       # Python 依赖
│   └── README.md              # 脚本使用说明
└── references/                # 参考文件目录
    ├── figma-pages.json       # 生成的页面节点数据（运行脚本后生成）
    └── figma-pages.example.json # 示例 JSON 文件
```

## 快速开始

### 1. 安装 Python 依赖

```bash
cd scripts
pip install -r requirements.txt
```

### 2. 配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_FILE_KEY=your_figma_file_key_here
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

### 3. 拉取 Figma 页面节点

```bash
cd scripts
python fetch_figma_pages.py
```

### 4. 查看结果

生成的 JSON 文件：
```
references/figma-pages.json
```

## 功能特性

- ✅ **页面节点提取**: 自动拉取 Figma 文件中的所有页面节点
- ✅ **结构分析**: 提取页面框架和组件信息
- ✅ **JSON 导出**: 生成结构化的页面节点数据
- ✅ **URL 生成**: 自动生成 Figma 页面链接
- ✅ **批量处理**: 支持一次性拉取所有页面

## 使用场景

### 场景 1: 开发新页面

1. 运行脚本拉取页面节点
2. 查看 `figma-pages.json` 找到目标页面
3. 使用 Figma MCP 获取页面详细设计
4. 根据设计稿生成 Vue 组件代码

### 场景 2: 页面清单管理

定期运行脚本，维护设计文件中的页面清单，用于：
- 规划开发优先级
- 跟踪设计变更
- 生成开发文档

### 场景 3: 设计系统提取

从 Figma 文件中提取：
- 页面结构
- 组件信息
- 设计规范

## 配置说明

### Figma 文件 Key

文件 Key 从环境变量 `FIGMA_FILE_KEY` 读取，需在 `.env` 文件中配置：
```bash
FIGMA_FILE_KEY=your_file_key_here
```

**如何获取 File Key**：
- 从 Figma 文件 URL 中提取
- URL 格式：`https://www.figma.com/design/{file_key}/...`
- 复制 `{file_key}` 部分

如需使用其他文件，使用 `--file-key` 参数：
```bash
python fetch_figma_pages.py --file-key your_file_key
```

### 输出文件路径

默认输出路径：
```
references/figma-pages.json
```

自定义输出路径：
```bash
python fetch_figma_pages.py --output ./custom-path.json
```

## 与项目集成

### 在 Claude 对话中使用

当需要根据 Figma 设计稿生成代码时：

1. **加载技能**: Claude 会自动识别并加载 `ecshopx-ui-generator` 技能
2. **拉取数据**: 运行脚本获取最新的页面节点信息
3. **生成代码**: 根据设计稿和项目架构规范生成代码

### 与其他技能配合

- **ecshopx-system**: 提供架构规范和代码规范
- **ecshopx-catalog**: 商品相关页面的业务逻辑
- 其他业务模块技能: 提供对应的业务规范

## 维护说明

### 定期更新

建议每周或设计稿更新后运行脚本：
```bash
cd scripts
python fetch_figma_pages.py
```

### 版本控制

将生成的 `figma-pages.json` 纳入版本控制：
```bash
git add references/figma-pages.json
git commit -m "chore: update figma pages inventory"
```

### 变更追踪

对比不同版本的 JSON 文件，了解设计变更：
```bash
git diff references/figma-pages.json
```

## 故障排查

参考 `SKILL.md` 中的故障排查章节，或查看 `scripts/README.md` 获取详细说明。

## 相关资源

- [Figma API 文档](https://www.figma.com/developers/api)
- [项目架构规范](../ecshopx-system/SKILL.md)
- [技能使用指南](../../README.md)
