#!/bin/bash

# SSR 兼容性测试脚本
# 用于验证所有页面的 SSR 兼容性

echo "🔍 开始 SSR 兼容性测试..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试页面列表
declare -a pages=(
  "http://localhost:3000/"
  "http://localhost:3000/item/list"
  "http://localhost:3000/cart"
  "http://localhost:3000/login"
)

# 等待服务器启动
wait_for_server() {
  echo "⏳ 等待开发服务器启动..."
  for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
      echo -e "${GREEN}✅ 服务器已启动${NC}"
      return 0
    fi
    sleep 1
  done
  echo -e "${RED}❌ 服务器启动超时${NC}"
  return 1
}

# 测试单个页面
test_page() {
  local url=$1
  local page_name=$(echo $url | sed 's|http://localhost:3000||')
  [[ -z "$page_name" ]] && page_name="/"
  
  echo -e "${YELLOW}测试页面: $page_name${NC}"
  
  # 获取 HTML 响应
  local response=$(curl -s "$url")
  local status=$?
  
  if [ $status -ne 0 ]; then
    echo -e "${RED}  ❌ 请求失败${NC}"
    return 1
  fi
  
  # 检查是否包含 SSR 渲染的内容
  if echo "$response" | grep -q "<div"; then
    echo -e "${GREEN}  ✅ SSR 渲染成功${NC}"
    return 0
  else
    echo -e "${RED}  ❌ 没有检测到 SSR 内容${NC}"
    return 1
  fi
}

# 主测试流程
main() {
  # 检查服务器是否运行
  if ! wait_for_server; then
    echo -e "${RED}请先启动开发服务器: pnpm run dev${NC}"
    exit 1
  fi
  
  echo ""
  echo "=========================================="
  echo "开始测试各个页面..."
  echo "=========================================="
  echo ""
  
  local failed=0
  local passed=0
  
  for page in "${pages[@]}"; do
    if test_page "$page"; then
      ((passed++))
    else
      ((failed++))
    fi
    echo ""
  done
  
  echo "=========================================="
  echo "测试结果汇总"
  echo "=========================================="
  echo -e "${GREEN}通过: $passed${NC}"
  echo -e "${RED}失败: $failed${NC}"
  echo ""
  
  if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
  else
    echo -e "${RED}⚠️  有测试失败，请检查上面的详细信息${NC}"
    exit 1
  fi
}

# 运行主函数
main

