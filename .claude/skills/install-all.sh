#!/bin/bash

# ECShopX Skills 一键安装脚本
# 用途：批量安装所有 skills 到 openskills

echo "🚀 开始安装 ECShopX Skills..."
echo ""

# 检查是否安装了 openskills
if ! command -v openskills &> /dev/null; then
    echo "❌ 错误：未安装 openskills"
    echo "请先安装 openskills: npm install -g openskills"
    exit 1
fi

# 进入 skills 目录
cd "$(dirname "$0")"

# 统计 skill 文件数量
skill_count=$(ls -1 *.skill 2>/dev/null | wc -l)

if [ "$skill_count" -eq 0 ]; then
    echo "❌ 错误：未找到任何 .skill 文件"
    exit 1
fi

echo "📦 发现 $skill_count 个 skills"
echo ""

# 安装每个 skill
success_count=0
for skill in *.skill; do
    echo "📥 正在安装: $skill"
    if openskills install "$skill"; then
        echo "✅ 安装成功: $skill"
        ((success_count++))
    else
        echo "❌ 安装失败: $skill"
    fi
    echo ""
done

echo "═══════════════════════════════════════"
echo "📊 安装完成: $success_count/$skill_count"
echo "═══════════════════════════════════════"
echo ""

# 同步到 AGENTS.md
echo "🔄 正在同步到 AGENTS.md..."
if openskills sync; then
    echo "✅ 同步成功"
else
    echo "⚠️  同步失败，请手动运行: openskills sync"
fi

echo ""
echo "🎉 所有 Skills 安装完成！"
echo ""
echo "📖 使用指南："
echo "  1. 打开 Claude 对话"
echo "  2. 提出相关开发需求，如："
echo "     - '创建商品列表页'"
echo "     - '实现购物车功能'"
echo "     - '开发支付流程'"
echo "  3. Claude 会自动加载对应的 skill 并提供指导"
echo ""
echo "📚 查看已安装的 skills："
echo "  openskills list"
echo ""
echo "🎊 开发愉快！"
