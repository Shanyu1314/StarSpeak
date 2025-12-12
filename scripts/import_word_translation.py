"""
Word Translation 词典导入脚本

支持导入格式：
1. CSV 格式：word,translation
2. TSV 格式：word\ttranslation

使用方法：
python scripts/import_word_translation.py

注意：会自动查找项目根目录下的 word_translation.csv
"""

import csv
import os
import sys
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
except ImportError:
    print("错误：未安装 supabase 库")
    print("请运行：pip install supabase python-dotenv")
    sys.exit(1)

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("错误：未找到 Supabase 配置")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BATCH_SIZE = 500

def get_source_id(source_name: str) -> str:
    """获取词典来源ID"""
    try:
        result = supabase.table('dictionary_sources').select('id').eq('name', source_name).single().execute()
        return result.data['id']
    except Exception as e:
        print(f"错误：无法获取词典来源ID - {e}")
        sys.exit(1)

def detect_delimiter(file_path: str) -> str:
    """自动检测文件分隔符"""
    with open(file_path, 'r', encoding='utf-8') as f:
        first_line = f.readline()
        if '\t' in first_line:
            return '\t'
        return ','

def read_translation_file(file_path: str) -> List[Dict]:
    """读取翻译词典文件"""
    print(f"正在读取文件：{file_path}")

    if not os.path.exists(file_path):
        print(f"错误：文件不存在 - {file_path}")
        sys.exit(1)

    delimiter = detect_delimiter(file_path)
    print(f"检测到分隔符：{'Tab' if delimiter == '\t' else 'Comma'}")

    data = []
    source_id = get_source_id('word_translation')

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=delimiter)

        line_num = 0
        for row in reader:
            line_num += 1

            if not row or len(row) < 2:
                continue

            word = row[0].strip()
            translation = row[1].strip()

            if not word or not translation:
                continue

            record = {
                'word': word.lower(),
                'display_word': word,
                'translation': translation,
                'source_id': source_id,
                'is_ai_generated': False
            }

            data.append(record)

    print(f"共读取 {len(data)} 条记录")
    return data

def batch_insert(data: List[Dict], batch_size: int = BATCH_SIZE):
    """批量插入数据"""
    total = len(data)
    inserted = 0
    failed = 0

    print(f"\n开始导入数据...")
    print(f"总记录数：{total}")
    print(f"批次大小：{batch_size}")
    print("-" * 50)

    for i in range(0, total, batch_size):
        batch = data[i:i + batch_size]
        current_batch = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size

        try:
            result = supabase.table('words_unified').upsert(
                batch,
                on_conflict='word,source_id',
                ignore_duplicates=True
            ).execute()

            inserted += len(batch)
            progress = (i + len(batch)) / total * 100
            print(f"批次 {current_batch}/{total_batches} - "
                  f"已处理：{i + len(batch)}/{total} ({progress:.1f}%)")

        except Exception as e:
            print(f"批次 {current_batch} 失败：{str(e)}")
            for record in batch:
                try:
                    supabase.table('words_unified').upsert(
                        record,
                        on_conflict='word,source_id',
                        ignore_duplicates=True
                    ).execute()
                    inserted += 1
                except Exception as single_error:
                    failed += 1
                    print(f"  跳过单词 '{record['word']}'：{str(single_error)}")

    print("-" * 50)
    print(f"\n导入完成！")
    print(f"成功：{inserted} 条")
    print(f"失败：{failed} 条")
    return inserted, failed

def main():
    print("=" * 50)
    print("Word Translation 词典导入工具")
    print("=" * 50)

    possible_paths = [
        "word_translation.csv",
        "../word_translation.csv",
        "word_translation.txt",
        "../word_translation.txt",
    ]

    csv_file = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_file = path
            break

    if not csv_file:
        print("\n错误：未找到 word_translation.csv 文件")
        print("请将文件放在项目根目录，或输入文件路径：")
        csv_file = input().strip()

        if not os.path.exists(csv_file):
            print("文件不存在，退出程序")
            sys.exit(1)

    print(f"\n找到文件：{csv_file}")
    confirm = input("确认继续导入？(y/n): ").strip().lower()

    if confirm != 'y':
        print("操作已取消")
        sys.exit(0)

    data = read_translation_file(csv_file)

    if len(data) == 0:
        print("错误：文件为空")
        sys.exit(1)

    inserted, failed = batch_insert(data)

    result = supabase.table('words_unified').select('count', count='exact').limit(1).execute()
    print(f"\n数据库中当前总记录数：{result.count}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n操作已取消")
        sys.exit(0)
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
