#!/usr/bin/env python3
"""
Figma 获取所有项目脚本

功能：
- 获取团队（Team）下的所有项目（Projects）
- 可选：获取每个项目下的所有文件
- 生成 JSON 文件保存项目列表和文件信息

使用方法：
    python fetch_all_projects.py --team-id TEAM_ID [--fetch-files] [--output OUTPUT] [--token TOKEN]

环境变量：
    FIGMA_ACCESS_TOKEN: Figma API Access Token
    FIGMA_TEAM_ID: Figma 团队 ID（可选）
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
DEFAULT_OUTPUT = "references/figma-all-projects.json"
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
    
    token = os.getenv("FIGMA_ACCESS_TOKEN")
    if token:
        return token
    
    print("❌ 错误: 未找到 Figma Access Token")
    print("\n请配置 Figma Access Token:")
    print("1. 创建 .env 文件（项目根目录）")
    print("2. 添加: FIGMA_ACCESS_TOKEN=your_token_here")
    print("3. 或使用 --token 参数传递")
    print("\n获取 Token: https://www.figma.com/developers/api#access-tokens")
    sys.exit(1)


def get_team_id(team_id: Optional[str] = None) -> str:
    """获取 Figma 团队 ID"""
    if team_id:
        return team_id
    
    team_id = os.getenv("FIGMA_TEAM_ID")
    if team_id:
        return team_id
    
    print("❌ 错误: 未找到 Figma Team ID")
    print("\n请配置 Figma Team ID:")
    print("1. 在 .env 文件（项目根目录）中添加:")
    print("   FIGMA_TEAM_ID=your_team_id")
    print("2. 或使用 --team-id 参数传递")
    print("\n如何获取 Team ID:")
    print("1. 访问 Figma 团队页面")
    print("2. 查看 URL，格式为: https://www.figma.com/files/team/{TEAM_ID}/...")
    print("3. 或使用 GET /v1/teams 获取你的团队列表")
    sys.exit(1)


def fetch_teams(token: str) -> List[Dict[str, Any]]:
    """
    获取用户的所有团队
    
    注意：Figma API 不提供直接获取所有团队的端点。
    此函数仅用于提示用户如何获取 Team ID。
    """
    print("⚠️  Figma API 限制：无法直接获取所有团队列表")
    print("\n请手动获取 Team ID:")
    print("1. 访问 Figma 团队页面")
    print("2. 查看 URL，格式为: https://www.figma.com/files/team/{TEAM_ID}/...")
    print("3. 复制 TEAM_ID 部分")
    print("\n或者从项目页面获取:")
    print("1. 打开项目页面")
    print("2. URL 格式: https://www.figma.com/files/{PROJECT_ID}/...")
    print("3. 点击项目名称，跳转到团队页面获取 Team ID")
    
    return []


def fetch_projects(team_id: str, token: str) -> List[Dict[str, Any]]:
    """获取团队下的所有项目"""
    url = f"{FIGMA_API_BASE}/teams/{team_id}/projects"
    headers = {"X-Figma-Token": token}
    
    print(f"📡 正在获取团队 {team_id} 的项目列表...")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        projects = data.get("projects", [])
        print(f"✅ 找到 {len(projects)} 个项目")
        return projects
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   状态码: {e.response.status_code}")
            print(f"   响应: {e.response.text}")
        return []


def fetch_project_files(project_id: str, token: str) -> List[Dict[str, Any]]:
    """获取项目下的所有文件"""
    url = f"{FIGMA_API_BASE}/projects/{project_id}/files"
    headers = {"X-Figma-Token": token}
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("files", [])
    except requests.exceptions.RequestException as e:
        print(f"   ⚠️  项目 {project_id} 文件获取失败: {e}")
        return []


def process_projects(team_id: str, projects: List[Dict[str, Any]], token: str, fetch_files: bool = False) -> List[Dict[str, Any]]:
    """处理项目列表，可选获取每个项目的文件"""
    result = []
    
    for i, project in enumerate(projects, 1):
        project_id = project.get("id", "")
        project_name = project.get("name", "")
        
        print(f"\n[{i}/{len(projects)}] 处理项目: {project_name}")
        
        project_data = {
            "id": project_id,
            "name": project_name,
            "created_at": project.get("created_at", ""),
            "files": []
        }
        
        if fetch_files:
            files = fetch_project_files(project_id, token)
            project_data["files"] = files
            project_data["file_count"] = len(files)
            print(f"   ✅ 找到 {len(files)} 个文件")
        else:
            project_data["file_count"] = 0
        
        result.append(project_data)
    
    return result


def generate_output_data(team_id: str, projects_data: List[Dict[str, Any]], fetch_files: bool) -> Dict[str, Any]:
    """生成输出数据结构"""
    total_files = sum(p.get("file_count", 0) for p in projects_data)
    
    return {
        "team_id": team_id,
        "total_projects": len(projects_data),
        "total_files": total_files,
        "fetch_files": fetch_files,
        "projects": projects_data,
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
        description="获取 Figma 团队下的所有项目",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 只获取项目列表（需要提供 Team ID）
  python fetch_all_projects.py --team-id 123456
  
  # 获取项目列表和每个项目的文件
  python fetch_all_projects.py --team-id 123456 --fetch-files
  
  # 使用环境变量中的 Team ID
  python fetch_all_projects.py --fetch-files
  
注意: 由于 Figma API 限制，无法自动获取所有团队。
      需要手动从 Figma 网页 URL 中获取 Team ID。
      查看 HOW_TO_GET_TEAM_ID.md 了解如何获取 Team ID。
        """
    )
    
    parser.add_argument(
        "--team-id",
        help="Figma 团队 ID (优先使用环境变量 FIGMA_TEAM_ID，如果不提供会尝试获取所有团队)"
    )
    
    parser.add_argument(
        "--fetch-files",
        action="store_true",
        help="同时获取每个项目下的文件列表"
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
    
    # 获取 Token
    token = get_figma_token(args.token)
    
    # 获取团队 ID（必需）
    if args.team_id:
        team_id = args.team_id
    else:
        # 尝试从环境变量获取
        team_id = os.getenv("FIGMA_TEAM_ID")
        
        if not team_id:
            # 提示用户如何获取 Team ID
            fetch_teams(token)
            print("\n" + "="*50)
            print("请提供 Team ID:")
            print("1. 使用 --team-id 参数")
            print("2. 或在 .env 文件中配置 FIGMA_TEAM_ID")
            print("="*50)
            sys.exit(1)
    
    # 获取项目列表
    projects = fetch_projects(team_id, token)
    
    if not projects:
        print("⚠️  团队中没有找到任何项目")
        sys.exit(1)
    
    # 处理项目（可选获取文件）
    print(f"\n🔍 开始处理 {len(projects)} 个项目...")
    if args.fetch_files:
        print("📁 将同时获取每个项目的文件列表...")
    else:
        print("ℹ️  只获取项目列表（使用 --fetch-files 获取文件）")
    
    projects_data = process_projects(team_id, projects, token, args.fetch_files)
    
    # 生成输出数据
    output_data = generate_output_data(team_id, projects_data, args.fetch_files)
    
    # 保存 JSON 文件
    save_json(output_data, args.output)
    
    # 打印摘要
    print("\n" + "="*50)
    print("📊 拉取结果摘要")
    print("="*50)
    print(f"团队 ID: {output_data['team_id']}")
    print(f"总项目数: {output_data['total_projects']}")
    print(f"总文件数: {output_data['total_files']}")
    print(f"生成时间: {output_data['generated_at']}")
    print("\n项目列表:")
    for i, project in enumerate(projects_data, 1):
        file_info = f" ({project['file_count']} 个文件)" if args.fetch_files else ""
        print(f"  {i}. {project['name']} (ID: {project['id']}){file_info}")
    print("="*50)
    
    if args.fetch_files:
        print("\n💡 提示:")
        print("现在你可以使用以下命令获取具体项目的所有页面节点:")
        for project in projects_data:
            if project['file_count'] > 0:
                print(f"  python fetch_figma_project.py --project-id {project['id']}")


if __name__ == "__main__":
    main()
