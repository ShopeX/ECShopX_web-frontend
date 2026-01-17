#!/usr/bin/env python3
"""
Figma 页面 Frames 详细拉取脚本

功能：
- 从 Figma API 拉取指定页面的所有 frames 详细信息
- 包括 frames 的样式、子节点、位置等完整信息
- 生成 JSON 文件保存 frames 数据

使用方法：
    python fetch_page_frames.py [--file-key FILE_KEY] [--page-id PAGE_ID] [--output OUTPUT]

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
DEFAULT_OUTPUT = "references/figma-page-frames.json"
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
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ 获取文件失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   状态码: {e.response.status_code}")
            print(f"   响应: {e.response.text[:200]}")
        sys.exit(1)


def fetch_node_details(file_key: str, node_ids: List[str], token: str) -> Dict[str, Any]:
    """获取指定节点的详细信息"""
    # Figma API 要求 node_ids 用逗号分隔
    ids_param = ",".join(node_ids)
    url = f"{FIGMA_API_BASE}/files/{file_key}/nodes?ids={ids_param}"
    headers = {
        "X-Figma-Token": token
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ 获取节点详情失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   状态码: {e.response.status_code}")
            print(f"   响应: {e.response.text[:200]}")
        sys.exit(1)


def find_page_node(document: Dict[str, Any], page_id: str) -> Optional[Dict[str, Any]]:
    """在文档中查找指定的页面节点"""
    def traverse_node(node: Dict[str, Any]):
        node_type = node.get("type", "")
        node_id = node.get("id", "")
        
        # 检查是否是目标页面（CANVAS 类型）
        if node_type == "CANVAS":
            # 支持两种格式：原始 ID (1:2) 或 URL 格式 (1-2)
            if node_id == page_id or node_id.replace(":", "-") == page_id.replace(":", "-"):
                return node
        
        # 递归处理子节点
        for child in node.get("children", []):
            result = traverse_node(child)
            if result:
                return result
        
        return None
    
    if "document" in document:
        return traverse_node(document["document"])
    return None


def extract_all_frames(page_node: Dict[str, Any], file_key: str, top_level_only: bool = False) -> List[str]:
    """提取页面中所有 frame 节点的 ID
    
    Args:
        page_node: 页面节点
        file_key: 文件 key
        top_level_only: 如果为 True，只提取页面直接子级的 frames；如果为 False，提取所有嵌套的 frames
    """
    frame_ids = []
    
    def traverse_children(node: Dict[str, Any], depth: int = 0):
        node_type = node.get("type", "")
        
        if node_type == "FRAME":
            frame_ids.append(node.get("id", ""))
            # 如果只获取顶层 frames，找到第一个 FRAME 后就不再递归
            if top_level_only:
                return
        
        # 递归处理子节点
        for child in node.get("children", []):
            traverse_children(child, depth + 1)
    
    # 从页面节点开始遍历
    for child in page_node.get("children", []):
        traverse_children(child, 0)
    
    return frame_ids


def extract_frame_info(frame_node: Dict[str, Any], file_key: str) -> Dict[str, Any]:
    """提取 frame 的详细信息"""
    node_id = frame_node.get("id", "")
    node_id_for_url = node_id.replace(":", "-")
    
    # 基本信息
    frame_info = {
        "id": node_id,
        "name": frame_node.get("name", ""),
        "type": frame_node.get("type", ""),
        "visible": frame_node.get("visible", True),
        "locked": frame_node.get("locked", False),
        "url": f"https://www.figma.com/design/{file_key}?node-id={node_id_for_url}",
    }
    
    # 位置和尺寸信息
    bbox = frame_node.get("absoluteBoundingBox")
    if bbox:
        frame_info["position"] = {
            "x": bbox.get("x", 0),
            "y": bbox.get("y", 0),
        }
        frame_info["size"] = {
            "width": bbox.get("width", 0),
            "height": bbox.get("height", 0),
        }
    
    # 样式信息
    fills = frame_node.get("fills", [])
    if fills:
        frame_info["fills"] = fills
    
    strokes = frame_node.get("strokes", [])
    if strokes:
        frame_info["strokes"] = strokes
    
    effects = frame_node.get("effects", [])
    if effects:
        frame_info["effects"] = effects
    
    # 布局相关
    layout_mode = frame_node.get("layoutMode")
    if layout_mode:
        frame_info["layout"] = {
            "mode": layout_mode,
            "paddingLeft": frame_node.get("paddingLeft", 0),
            "paddingRight": frame_node.get("paddingRight", 0),
            "paddingTop": frame_node.get("paddingTop", 0),
            "paddingBottom": frame_node.get("paddingBottom", 0),
            "itemSpacing": frame_node.get("itemSpacing", 0),
        }
    
    # 约束信息
    constraints = frame_node.get("constraints")
    if constraints:
        frame_info["constraints"] = constraints
    
    # 子节点数量
    children = frame_node.get("children", [])
    frame_info["children_count"] = len(children)
    
    # 背景色
    backgroundColor = frame_node.get("backgroundColor")
    if backgroundColor:
        frame_info["backgroundColor"] = backgroundColor
    
    # 圆角
    cornerRadius = frame_node.get("cornerRadius")
    if cornerRadius:
        frame_info["cornerRadius"] = cornerRadius
    
    # 不透明度
    opacity = frame_node.get("opacity")
    if opacity is not None:
        frame_info["opacity"] = opacity
    
    return frame_info


def main():
    parser = argparse.ArgumentParser(
        description="获取 Figma 页面中的所有 frames 详细信息"
    )
    parser.add_argument(
        "--file-key",
        type=str,
        help="Figma 文件 Key（优先使用环境变量 FIGMA_FILE_KEY）"
    )
    parser.add_argument(
        "--page-id",
        type=str,
        required=True,
        help="页面节点 ID（格式: 1341-2 或 1341:2）"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=DEFAULT_OUTPUT,
        help=f"输出文件路径（默认: {DEFAULT_OUTPUT}）"
    )
    parser.add_argument(
        "--token",
        type=str,
        help="Figma Access Token（优先使用环境变量 FIGMA_ACCESS_TOKEN）"
    )
    parser.add_argument(
        "--top-level-only",
        action="store_true",
        help="只获取页面直接子级的 frames（不包含嵌套的 frames）"
    )
    
    args = parser.parse_args()
    
    # 加载环境变量
    load_env_file()
    
    # 获取配置
    token = get_figma_token(args.token)
    file_key = get_figma_file_key(args.file_key)
    page_id = args.page_id
    
    print(f"📡 正在拉取 Figma 文件: {file_key}")
    print(f"🔍 目标页面 ID: {page_id}")
    
    # 获取文件信息
    file_data = fetch_figma_file(file_key, token)
    
    # 查找页面节点
    print("🔍 正在查找页面节点...")
    page_node = find_page_node(file_data, page_id)
    
    if not page_node:
        print(f"❌ 错误: 未找到页面节点 {page_id}")
        print("\n💡 提示:")
        print("1. 检查页面 ID 是否正确")
        print("2. 页面 ID 格式可以是: 1341-2 或 1341:2")
        print("3. 可以从 figma-pages.json 中查看可用的页面 ID")
        sys.exit(1)
    
    page_name = page_node.get("name", "Unknown")
    print(f"✅ 找到页面: {page_name}")
    
    # 提取所有 frame IDs
    if args.top_level_only:
        print("🔍 正在提取顶层 frames（仅页面直接子级）...")
    else:
        print("🔍 正在提取所有 frames（包括嵌套）...")
    frame_ids = extract_all_frames(page_node, file_key, top_level_only=args.top_level_only)
    
    if not frame_ids:
        print("⚠️  该页面中没有找到任何 frames")
        sys.exit(0)
    
    print(f"✅ 找到 {len(frame_ids)} 个 frames")
    
    # 获取 frames 详细信息
    print("📡 正在获取 frames 详细信息...")
    # Figma API 一次最多支持 100 个节点，需要分批获取
    batch_size = 100
    all_frames = []
    
    for i in range(0, len(frame_ids), batch_size):
        batch_ids = frame_ids[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(frame_ids) + batch_size - 1) // batch_size
        print(f"   处理批次 {batch_num}/{total_batches} ({len(batch_ids)} 个 frames)...", end="", flush=True)
        
        try:
            node_details = fetch_node_details(file_key, batch_ids, token)
            
            # 提取 nodes 数据
            nodes = node_details.get("nodes", {})
            batch_frames = 0
            for node_id in batch_ids:
                if node_id in nodes:
                    frame_node = nodes[node_id].get("document", {})
                    if frame_node:
                        frame_info = extract_frame_info(frame_node, file_key)
                        all_frames.append(frame_info)
                        batch_frames += 1
            
            print(f" ✅ ({batch_frames} 个成功)")
        except Exception as e:
            print(f" ❌ 错误: {e}")
            # 继续处理下一批
            continue
    
    print(f"✅ 成功获取 {len(all_frames)} 个 frames 的详细信息")
    
    # 生成输出数据
    output_data = {
        "file_key": file_key,
        "file_name": file_data.get("name", ""),
        "page_id": page_node.get("id", ""),
        "page_name": page_name,
        "page_node_id": page_id,
        "page_url": f"https://www.figma.com/design/{file_key}?node-id={page_id.replace(':', '-')}",
        "total_frames": len(all_frames),
        "frames": all_frames,
        "generated_at": datetime.now().isoformat(),
        "generator": "ecshopx-ui-generator"
    }
    
    # 保存到文件
    output_path = Path(__file__).parent.parent / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已保存到: {output_path}")
    print(f"   文件大小: {output_path.stat().st_size} bytes")
    
    print("\n" + "=" * 50)
    print("📊 拉取结果摘要")
    print("=" * 50)
    print(f"文件名称: {output_data['file_name']}")
    print(f"页面名称: {page_name}")
    print(f"页面 ID: {page_id}")
    print(f"总 Frames 数: {len(all_frames)}")
    print(f"生成时间: {output_data['generated_at']}")
    print("=" * 50)


if __name__ == "__main__":
    main()
