# ECShopX Skills 使用指南

## 快速开始（3 步安装）

### 1. 一键安装所有 Skills

```bash
cd .claude/skills
./install-all.sh
```

或者手动安装：

```bash
cd .claude/skills

# 安装所有 skills
for skill in *.skill; do
  openskills install "$skill"
done

# 同步到 AGENTS.md
openskills sync
```

### 2. 验证安装

```bash
openskills list
```

应该看到 10 个已安装的 skills：
- ecshopx-system
- ecshopx-catalog
- ecshopx-search
- ecshopx-cart
- ecshopx-checkout
- ecshopx-payment
- ecshopx-order
- ecshopx-account
- ecshopx-promotion
- ecshopx-cms

### 3. 开始使用

在 Claude 对话中，直接提出开发需求，相关 skill 会自动加载！

---

## 💡 使用示例

### 场景 1：创建商品列表页

**你**：帮我创建商品列表页

**Claude**：
- 🔍 自动加载 `ecshopx-catalog` skill
- 📐 遵循简化架构（方案 2）
- 📝 提供完整代码：类型定义 → API Client → Transformer → Composable → 页面

### 场景 2：实现购物车功能

**你**：实现购物车功能

**Claude**：
- 🔍 自动加载 `ecshopx-cart` skill
- 📐 使用完整架构（方案 1 - 需要 Store）
- 📝 包含：Store + Composable + 组件 + 持久化

### 场景 3：不确定使用哪种架构

**你**：这个功能应该用哪种架构方案？

**Claude**：
- 🔍 自动加载 `ecshopx-system` skill
- 📐 提供架构决策流程图
- 💡 给出明确建议和理由

---

## 📚 Skills 索引

### 系统级 Skills

#### 🏗️ ecshopx-system
**何时使用**：
- 创建新功能，不知道用哪种架构
- 需要查看代码规范
- 了解项目技术栈和目录结构
- 学习 DDD 实践

**包含内容**：
- 三种架构方案详解
- 完整的代码规范
- DDD 开发指南
- 故障排查

---

### 商品模块 Skills

#### 🛍️ ecshopx-catalog
**何时使用**：
- 开发商品列表页
- 实现商品详情页
- SKU 规格选择
- 价格展示

**架构**：方案 2（简化架构）

#### 🔍 ecshopx-search
**何时使用**：
- 开发搜索框
- 实现搜索建议
- 搜索结果页
- 搜索历史功能

**架构**：混合（搜索结果用方案 2，历史用方案 1）

---

### 购物流程 Skills

#### 🛒 ecshopx-cart
**何时使用**：
- 购物车页面开发
- 添加到购物车
- 购物车状态管理
- 迷你购物车

**架构**：方案 1（需要 Store 和持久化）

#### 💳 ecshopx-checkout
**何时使用**：
- 结账页面开发
- 地址选择
- 配送方式
- 优惠券使用

**架构**：方案 1（多模块协同）

#### 💰 ecshopx-payment
**何时使用**：
- 支付页面开发
- 第三方支付集成
- 支付状态查询
- 退款功能

**架构**：方案 2（简化架构）

---

### 订单售后 Skills

#### 📦 ecshopx-order
**何时使用**：
- 订单列表开发
- 订单详情查看
- 订单操作（取消、确认收货）
- 物流跟踪

**架构**：方案 2（简化架构）

---

### 用户系统 Skills

#### 👤 ecshopx-account
**何时使用**：
- 登录注册功能
- 用户信息管理
- 地址管理
- 路由权限控制

**架构**：方案 1（需要全局状态）

---

### 营销推广 Skills

#### 🎟️ ecshopx-promotion
**何时使用**：
- 优惠券功能
- 促销活动展示
- 优惠规则计算
- 优惠券中心

**架构**：混合（列表用方案 2，用户券用方案 1）

#### 📄 ecshopx-cms
**何时使用**：
- CMS 页面开发
- 可配置组件
- 营销页面创建
- SEO 优化

**架构**：方案 2（简化架构）

---

## 🎓 学习路径

### 新手入门（第 1-2 天）

1. 阅读 `ecshopx-system` - 了解架构和规范
2. 参考 `ecshopx-catalog` - 学习简化架构实现
3. 尝试创建一个简单的商品列表页

### 进阶开发（第 3-5 天）

4. 学习 `ecshopx-cart` - 理解完整架构和 Store
5. 参考 `ecshopx-checkout` - 学习多模块协同
6. 实现购物车和结账功能

### 高级应用（第 6-7 天）

7. 研究 `ecshopx-payment` - 第三方服务集成
8. 学习 `ecshopx-cms` - 动态页面渲染
9. 优化和重构现有功能

---

## 🎊 完成

你的 ECShopX B2C 商城现在拥有了完整的 AI 辅助开发体系！

**Skills 已就绪**：10/10 ✅
**业务覆盖率**：100% ✅
**开发效率**：预计提升 3-5 倍 🚀

祝开发顺利，生意兴隆！🎉

---

**创建完成日期**: 2025-01-12
**Skills 版本**: v1.0
**包含 Skills**: 10 个完整商城业务
**总大小**: 约 63KB
**维护者**: ECShopX Team