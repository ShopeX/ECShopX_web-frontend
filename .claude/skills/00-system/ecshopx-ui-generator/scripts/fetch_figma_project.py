#!/usr/bin/env python3
"""
Figma 项目所有文件节点拉取脚本

功能：
- 从 Figma API 拉取指定项目（Project）下的所有设计文件
- 提取每个文件的所有页面节点（CANVAS 类型）
- 生成 JSON 文件保存所有文件的页面节点数据

使用方法：
    python fetch_figma_project.py --project-id PROJECT_ID [--output OUTPUT] [--token TOKEN]

环境变量：
    FIGMA_ACCESS_TOKEN: Figma API Access Token
    FIGMA_PROJECT_ID: Figma 项目 ID（可选）
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
DEFAULT_OUTPUT = "references/figma-project-pages.json"
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


def get_project_id(project_id: Optional[str] = None) -> str:
    """获取 Figma 项目 ID"""
    if project_id:
        return project_id
    
    # 从环境变量获取
    project_id = os.getenv("FIGMA_PROJECT_ID")
    if project_id:
        return project_id
    
    # 提示用户配置
    print("❌ 错误: 未找到 Figma Project ID")
    print("\n请配置 Figma Project ID:")
    print("1. 在 .env 文件（项目根目录）中添加:")
    print("   FIGMA_PROJECT_ID=your_project_id")
    print("2. 或使用 --project-id 参数传递")
    print("\n如何获取 Project ID:")
    print("1. 访问 Figma 项目页面")
    print("2. 查看 URL，格式为: https://www.figma.com/files/PROJECT_ID/...")
    print("3. 或使用 GET /v1/teams/:team_id/projects 获取项目列表")
    sys.exit(1)


def fetch_project_files(project_id: str, token: str) -> List[Dict[str, Any]]:
    """从 Figma API 获取项目下的所有文件"""
    url = f"{FIGMA_API_BASE}/projects/{project_id}/files"
    headers = {
        "X-Figma-Token": token
    }
    
    print(f"📡 正在拉取项目文件列表: {project_id}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        files = data.get("files", [])
        print(f"✅ 找到 {len(files)} 个设计文件")
        return files
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   状态码: {e.response.status_code}")
            print(f"   响应: {e.response.text}")
        sys.exit(1)


def fetch_figma_file(file_key: str, token: str) -> Dict[str, Any]:
    """从 Figma API 获取单个文件信息"""
    url = f"{FIGMA_API_BASE}/files/{file_key}"
    headers = {
        "X-Figma-Token": token
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"   ⚠️  文件 {file_key} 获取失败: {e}")
        return None


def extract_page_nodes(document: Dict[str, Any], file_key: str) -> List[Dict[str, Any]]:
    """从文档中提取页面节点（CANVAS 类型）"""
    pages = []
    
    def traverse_node(node: Dict[str, Any]):
        """递归遍历节点树"""
        node_type = node.get("type", "")
        
        # 提取页面节点（CANVAS 类型）
        if node_type == "CANVAS":
            node_id = node.get("id", "")
            node_id_for_url = node_id.replace(":", "-")
            children = node.get("children", [])
            frames = []
            frame_count = 0
            
            # 提取 FRAME 节点信息
            for child in children:
                if child.get("type") == "FRAME":
                    frame_count += 1
                    bbox = child.get("absoluteBoundingBox", {})
                    frames.append({
                        "id": child.get("id", ""),
                        "name": child.get("name", ""),
                        "type": child.get("type", ""),
                        "width": bbox.get("width", 0),
                        "height": bbox.get("height", 0),
                    })
            
            pages.append({
                "id": node_id,
                "name": node.get("name", ""),
                "type": node_type,
                "node_id": node_id_for_url,
                "url": f"https://www.figma.com/design/{file_key}?node-id={node_id_for_url}",
                "children_count": len(children),
                "frame_count": frame_count,
                "frames": frames[:10],  # 只保存前10个框架信息
            })
        
        # 递归处理子节点
        for child in node.get("children", []):
            traverse_node(child)
    
    # 从文档根节点开始遍历
    if "document" in document:
        traverse_node(document["document"])
    
    return pages


def process_project_files(project_files: List[Dict[str, Any]], token: str) -> List[Dict[str, Any]]:
    """处理项目中的所有文件，提取页面节点"""
    all_files_data = []
    
    for i, file_info in enumerate(project_files, 1):
        file_key = file_info.get("key", "")
        file_name = file_info.get("name", "")
        
        print(f"\n[{i}/{len(project_files)}] 处理文件: {file_name}")
        
        # 获取文件详细数据
        file_data = fetch_figma_file(file_key, token)
        if not file_data:
            continue
        
        # 提取页面节点
        pages = extract_page_nodes(file_data, file_key)
        
        file_result = {
            "file_key": file_key,
            "file_name": file_name,
            "last_modified": file_info.get("last_modified", ""),
            "thumbnail_url": file_info.get("thumbnail_url", ""),
            "pages": pages,
            "total_pages": len(pages),
            "total_frames": sum(p.get("frame_count", 0) for p in pages),
        }
        
        all_files_data.append(file_result)
        print(f"   ✅ 提取了 {len(pages)} 个页面节点")
    
    return all_files_data


def generate_output_data(project_id: str, files_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """生成输出数据结构"""
    total_pages = sum(f.get("total_pages", 0) for f in files_data)
    total_frames = sum(f.get("total_frames", 0) for f in files_data)
    
    return {
        "project_id": project_id,
        "total_files": len(files_data),
        "total_pages": total_pages,
        "total_frames": total_frames,
        "files": files_data,
        "generated_at": datetime.now().isoformat(),
        "generator": "ecshopx-ui-generator",
    }


def save_json(data: Dict[str, Any], output_path: str) -> None:
    """保存 JSON 数据到文件"""
    output_file = Path(__file__).parent.parent / output_path
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已保存到: {output_file}")
    print(f"   文件大小: {output_file.stat().st_size} bytes")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="拉取 Figma 项目下所有文件的页面节点",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python fetch_figma_project.py --project-id 123456
  python fetch_figma_project.py --project-id 123456 --output custom.json
  python fetch_figma_project.py --project-id 123456 --token your_token_here
        """
    )
    
    parser.add_argument(
        "--project-id",
        help="Figma 项目 ID (优先使用环境变量 FIGMA_PROJECT_ID)"
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
    
    # 获取 Project ID
    project_id = get_project_id(args.project_id)
    
    # 获取 Token
    token = get_figma_token(args.token)
    
    # 获取项目文件列表
    project_files = fetch_project_files(project_id, token)
    
    if not project_files:
        print("⚠️  项目中没有找到任何文件")
        sys.exit(1)
    
    # 处理所有文件
    print("\n🔍 开始提取所有文件的页面节点...")
    files_data = process_project_files(project_files, token)
    
    if not files_data:
        print("⚠️  未能提取任何页面节点")
        sys.exit(1)
    
    # 生成输出数据
    output_data = generate_output_data(project_id, files_data)
    
    # 保存 JSON 文件
    save_json(output_data, args.output)
    
    # 打印摘要
    print("\n" + "="*50)
    print("📊 拉取结果摘要")
    print("="*50)
    print(f"项目 ID: {output_data['project_id']}")
    print(f"总文件数: {output_data['total_files']}")
    print(f"总页面数: {output_data['total_pages']}")
    print(f"总框架数: {output_data['total_frames']}")
    print(f"生成时间: {output_data['generated_at']}")
    print("\n文件列表:")
    for i, file_data in enumerate(files_data, 1):
        print(f"  {i}. {file_data['file_name']} ({file_data['total_pages']} 页, {file_data['total_frames']} 框架)")
    print("="*50)


if __name__ == "__main__":
    main()
