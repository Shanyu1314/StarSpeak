#!/usr/bin/env python3
"""
词典导入脚本 - 将高中、考研、托福词汇导入到Supabase数据库
"""

import os
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from supabase import Client, create_client

# 自动加载项目根目录下的 .env
load_dotenv()

# 从环境变量获取Supabase配置
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# 批处理大小
BATCH_SIZE = 200

# 词典文件配置
BASE_DIR = Path(__file__).resolve().parent.parent
DICT_FILES = {
    "高中": BASE_DIR / "scripts" / "data" / "2_高中-乱序 copy.txt",
    "考研": BASE_DIR / "scripts" / "data" / "5_考研-乱序 copy.txt",
    "托福": BASE_DIR / "scripts" / "data" / "6_托福-乱序 copy.txt",
}


def init_supabase() -> Client:
    """初始化Supabase客户端"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def parse_line(line: str) -> Optional[Dict[str, str]]:
    """
    解析txt文件中的一行
    格式：单词 TAB 词性. 释义; 更多释义

    返回: {"word": "单词", "definition": "中文释义"}
    """
    parts = line.strip().split('\t')
    if len(parts) < 2:
        return None

    word = parts[0].strip()
    definition_raw = parts[1].strip()

    if not word:
        return None

    # 提取中文释义（去除词性标记）
    # 例如："n. 努力；成就" -> "努力；成就"
    definition = definition_raw

    return {
        "word": word,
        "definition": definition,
    }


def load_dict_file(file_path: str) -> List[Dict[str, str]]:
    """读取并解析词典文件"""
    words = []

    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        return words

    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            parsed = parse_line(line)
            if parsed:
                words.append(parsed)

    return words


def get_source_id(supabase: Client, source_name: str) -> str:
    """获取（或创建）词典来源ID"""
    try:
        result = (
            supabase.table("dictionary_sources")
            .select("id")
            .eq("name", source_name)
            .single()
            .execute()
        )
        return result.data["id"]
    except Exception:
        insert_result = (
            supabase.table("dictionary_sources")
            .insert(
                {
                    "name": source_name,
                    "description": f"{source_name} 词汇导入",
                    "priority": 30,
                },
                returning="representation",
            )
            .execute()
        )
        return insert_result.data[0]["id"]


def import_words_with_tags(supabase: Client, words: List[Dict], source_tag: str):
    """
    导入单词到数据库，带有词源标签

    策略：
    1. 检查单词是否已存在
    2. 如果存在，更新source_tags（合并不重复）
    3. 如果不存在，插入新单词
    """
    print(f"\n📚 处理 [{source_tag}] 词汇...")
    print(f"   共 {len(words)} 个单词")

    source_id = get_source_id(supabase, source_tag)

    records = []
    for word_data in words:
        word = word_data["word"]
        definition = word_data["definition"]
        records.append({
            "word": word.lower(),
            "display_word": word,
            "phonetic": None,
            "translation": definition,
            "definition": definition,
            "example": None,
            "source_id": source_id,
            "is_ai_generated": False,
        })

    if not records:
        print("   ⚠️  没有有效的词条，跳过。")
        return

    total = len(records)
    print(f"   ✨ 待 upsert: {total} 个（批次 {BATCH_SIZE}）")

    for i in range(0, total, BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        current = i + len(batch)
        try:
            supabase.table("words_unified").upsert(
                batch,
                on_conflict="word,source_id",
                ignore_duplicates=False,
            ).execute()
            progress = current / total * 100
            print(f"   ✅ 已处理 {current}/{total} ({progress:.1f}%)")
        except Exception as e:
            print(f"   ❌ 批次 {i // BATCH_SIZE + 1} upsert 失败: {e}")


def main():
    """主函数"""
    print("=" * 60)
    print("📖 词典导入工具")
    print("=" * 60)

    # 初始化Supabase
    try:
        supabase = init_supabase()
        print("✅ 已连接到Supabase")
    except Exception as e:
        print(f"❌ 连接Supabase失败: {e}")
        return

    # 处理每个词典文件
    for source_tag, file_path in DICT_FILES.items():
        print(f"\n{'='*60}")
        print(f"处理文件: {file_path}")
        print(f"词源标签: {source_tag}")

        # 读取文件
        words = load_dict_file(file_path)

        if not words:
            print(f"⚠️  未能从 {file_path} 读取到任何单词，跳过...")
            continue

        # 导入到数据库
        try:
            import_words_with_tags(supabase, words, source_tag)
        except Exception as e:
            print(f"❌ 导入失败: {e}")
            continue

    print("\n" + "=" * 60)
    print("✨ 导入完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
