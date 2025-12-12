#!/usr/bin/env python3
"""
词典导入脚本 - 将高中、考研、托福词汇导入到Supabase数据库
"""

import os
import re
from supabase import create_client, Client
from typing import List, Dict, Optional

# 从环境变量获取Supabase配置
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# 词典文件配置
DICT_FILES = {
    "高中": "scripts/data/2_高中-乱序 copy.txt",
    "考研": "scripts/data/5_考研-乱序 copy.txt",
    "托福": "scripts/data/6_托福-乱序 copy.txt",
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
        "definition": definition
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

    # 批量查询已存在的单词
    existing_words = {}
    word_list = [w["word"] for w in words]

    # 分批查询（Supabase有查询限制）
    batch_size = 100
    for i in range(0, len(word_list), batch_size):
        batch = word_list[i:i+batch_size]
        result = supabase.table("words_unified")\
            .select("word, source_tags")\
            .in_("word", batch)\
            .execute()

        for item in result.data:
            existing_words[item["word"]] = item.get("source_tags", [])

    # 分类：需要插入的和需要更新的
    to_insert = []
    to_update = []

    for word_data in words:
        word = word_data["word"]

        if word in existing_words:
            # 已存在，检查是否需要更新标签
            current_tags = existing_words[word] or []
            if source_tag not in current_tags:
                new_tags = current_tags + [source_tag]
                to_update.append({
                    "word": word,
                    "source_tags": new_tags
                })
        else:
            # 新单词，需要插入
            to_insert.append({
                "word": word.lower(),
                "display_word": word,
                "phonetic": "",
                "translation": word_data["definition"],
                "definition": word_data["definition"],
                "example": "",
                "source_tags": [source_tag],
                "is_ai_generated": False
            })

    print(f"   ✨ 需要插入: {len(to_insert)} 个")
    print(f"   🔄 需要更新标签: {len(to_update)} 个")

    # 批量插入新单词
    if to_insert:
        batch_size = 50
        for i in range(0, len(to_insert), batch_size):
            batch = to_insert[i:i+batch_size]
            try:
                supabase.table("words_unified").insert(batch).execute()
                print(f"   ✅ 已插入 {min(i+batch_size, len(to_insert))}/{len(to_insert)}")
            except Exception as e:
                print(f"   ❌ 批次 {i//batch_size + 1} 插入失败: {e}")

    # 批量更新标签
    if to_update:
        for item in to_update:
            try:
                supabase.table("words_unified")\
                    .update({"source_tags": item["source_tags"]})\
                    .eq("word", item["word"])\
                    .execute()
            except Exception as e:
                print(f"   ❌ 更新 {item['word']} 标签失败: {e}")
        print(f"   ✅ 已更新 {len(to_update)} 个单词的标签")


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
