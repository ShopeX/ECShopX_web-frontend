#!/usr/bin/env python3
"""
Figma 页面节点拉取脚本

功能：
- 从 Figma API 拉取指定文件的所有页面节点
- 提取页面级别的节点信息（CANVAS 类型）
- 生成 JSON 文件保存页面节点数据

使用方法：
    python fetch_figma_pages.py [--file-key FILE_KEY] [--output OUTPUT] [--token TOKEN]

环境变量：
    FIGMA_ACCESS_TOKEN: Figma API Access Token
    FIGMA_FILE_KEY: Figma 文件 Key（必需）
"""

import os
import sys
import json
import argparse
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

# 默认配置
DEFAULT_OUTPUT = "references/figma-pages.json"
FIGMA_API_BASE = "https://api.figma.com/v1"


def load_env_file() -> None:
    """加载 .env 文件"""
    try:
        from dotenv import load_dotenv
        # 获取项目根目录的 .env 文件路径
        # 路径: scripts -> ecshopx-ui-generator -> 00-system -> skills -> .claude -> 项目根目录
        env_path = Path(__file__).parent.parent.parent.parent.parent.parent / ".env"
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
    except ImportError:
        # 如果没有 python-dotenv，使用原始方法
        env_path = Path(__file__).parent.parent.parent.parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, value = line.split("=", 1)
                        os.environ[key.strip()] = value.strip()


def get_figma_token(token: Optional[str] = None) -> str:
    """获取 Figma Access Token"""
    if token:
        return token
    
    # 从环境变量获取
    token = os.getenv("FIGMA_ACCESS_TOKEN")
    if token:
        return token
    
    # 提示用户配置
    print("❌ 错误: 未找到 Figma Access Token")
    print("\n请配置 Figma Access Token:")
    print("1. 创建 .env 文件（项目根目录）")
    print("2. 添加: FIGMA_ACCESS_TOKEN=your_token_here")
    print("3. 或使用 --token 参数传递")
    print("\n获取 Token: https://www.figma.com/developers/api#access-tokens")
    sys.exit(1)


def get_figma_file_key(file_key: Optional[str] = None) -> str:
    """获取 Figma 文件 Key"""
    if file_key:
        return file_key
    
    # 从环境变量获取
    file_key = os.getenv("FIGMA_FILE_KEY")
    if file_key:
        return file_key
    
    # 提示用户配置
    print("❌ 错误: 未找到 Figma File Key")
    print("\n请配置 Figma File Key:")
    print("1. 在 .env 文件（项目根目录）中添加:")
    print("   FIGMA_FILE_KEY=your_file_key_here")
    print("2. 或使用 --file-key 参数传递")
    print("\nFile Key 可以从 Figma 文件 URL 中获取")
    print("URL 格式: https://www.figma.com/design/{file_key}/...")
    sys.exit(1)


def fetch_figma_file(file_key: str, token: str) -> Dict[str, Any]:
    """从 Figma API 获取文件信息"""
    url = f"{FIGMA_API_BASE}/files/{file_key}"
    headers = {
        "X-Figma-Token": token
    }
    
    print(f"📡 正在拉取 Figma 文件: {file_key}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   状态码: {e.response.status_code}")
            print(f"   响应: {e.response.text}")
        sys.exit(1)


def extract_page_nodes(document: Dict[str, Any], file_key: str) -> List[Dict[str, Any]]:
    """从文档中提取页面节点（CANVAS 类型）"""
    pages = []
    
    def traverse_node(node: Dict[str, Any], parent_name: str = ""):
        """递归遍历节点树"""
        node_type = node.get("type", "")
        node_name = node.get("name", "")
        node_id = node.get("id", "")
        
        # 提取页面节点（CANVAS 类型）
        if node_type == "CANVAS":
            # 从 node_id 提取 node-id（用于 URL）
            # Figma node_id 格式通常是 "1:2"，需要转换为 "1-2" 格式
            node_id_for_url = node_id.replace(":", "-")
            
            # 计算子节点数量
            children = node.get("children", [])
            frames = []
            frame_count = 0
            
            # 提取 FRAME 节点信息
            for child in children:
                if child.get("type") == "FRAME":
                    frame_count += 1
                    frames.append({
                        "id": child.get("id", ""),
                        "name": child.get("name", ""),
                        "type": child.get("type", ""),
                        "width": child.get("absoluteBoundingBox", {}).get("width", 0),
                        "height": child.get("absoluteBoundingBox", {}).get("height", 0),
                    })
            
            page_info = {
                "id": node_id,
                "name": node_name,
                "type": node_type,
                "node_id": node_id_for_url,
                "url": f"https://www.figma.com/design/{file_key}?node-id={node_id_for_url}",
                "children_count": len(children),
                "frame_count": frame_count,
                "frames": frames[:10],  # 只保存前10个框架信息
            }
            pages.append(page_info)
        
        # 递归处理子节点
        for child in node.get("children", []):
            traverse_node(child, node_name)
    
    # 从文档根节点开始遍历
    if "document" in document:
        traverse_node(document["document"])
    
    return pages


def generate_output_data(file_data: Dict[str, Any], pages: List[Dict[str, Any]], file_key: str) -> Dict[str, Any]:
    """生成输出数据结构"""
    return {
        "file_key": file_key,
        "file_name": file_data.get("name", ""),
        "last_modified": file_data.get("lastModified", ""),
        "version": file_data.get("version", ""),
        "pages": pages,
        "total_pages": len(pages),
        "total_frames": sum(page.get("frame_count", 0) for page in pages),
        "generated_at": datetime.now().isoformat(),
        "generator": "ecshopx-ui-generator",
    }


def save_json(data: Dict[str, Any], output_path: str) -> None:
    """保存 JSON 数据到文件"""
    output_file = Path(__file__).parent.parent / output_path
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已保存到: {output_file}")
    print(f"   文件大小: {output_file.stat().st_size} bytes")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="拉取 Figma 文件的所有页面节点",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python fetch_figma_pages.py
  python fetch_figma_pages.py --file-key figd_xxx --output custom.json
  python fetch_figma_pages.py --token your_token_here
        """
    )
    
    parser.add_argument(
        "--file-key",
        help="Figma 文件 Key (优先使用环境变量 FIGMA_FILE_KEY)"
    )
    
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"输出 JSON 文件路径 (默认: {DEFAULT_OUTPUT})"
    )
    
    parser.add_argument(
        "--token",
        help="Figma Access Token (优先使用环境变量 FIGMA_ACCESS_TOKEN)"
    )
    
    args = parser.parse_args()
    
    # 加载环境变量
    load_env_file()
    
    # 获取 File Key
    file_key = get_figma_file_key(args.file_key)
    
    # 获取 Token
    token = get_figma_token(args.token)
    
    # 拉取文件数据
    file_data = fetch_figma_file(file_key, token)
    
    # 提取页面节点
    print("🔍 正在提取页面节点...")
    pages = extract_page_nodes(file_data, file_key)
    
    if not pages:
        print("⚠️  未找到页面节点（CANVAS 类型）")
        sys.exit(1)
    
    # 生成输出数据
    output_data = generate_output_data(file_data, pages, file_key)
    
    # 保存 JSON 文件
    save_json(output_data, args.output)
    
    # 打印摘要
    print("\n" + "="*50)
    print("📊 拉取结果摘要")
    print("="*50)
    print(f"文件名称: {output_data['file_name']}")
    print(f"总页面数: {output_data['total_pages']}")
    print(f"总框架数: {output_data['total_frames']}")
    print(f"生成时间: {output_data['generated_at']}")
    print("\n页面列表:")
    for i, page in enumerate(pages, 1):
        print(f"  {i}. {page['name']} (节点: {page['node_id']}, 框架数: {page['frame_count']})")
    print("="*50)


if __name__ == "__main__":
    main()
