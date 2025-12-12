"""
ECDICT 词典数据导入脚本

使用方法：
1. 确保已安装依赖：pip install supabase python-dotenv
2. 将 ecdict.csv 文件放在项目根目录
3. 运行：python scripts/import_dictionary.py

注意：
- 导入过程可能需要较长时间（76万条数据）
- 建议在稳定的网络环境下运行
- 脚本会自动处理重复数据（跳过已存在的单词）
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
    print("请运行：pip install supabase")
    sys.exit(1)

# 加载环境变量
load_dotenv()

# Supabase 配置
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("错误：未找到 Supabase 配置")
    print("请确保 .env 文件包含 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY")
    sys.exit(1)

# 创建 Supabase 客户端
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 批量插入大小
BATCH_SIZE = 500

def parse_csv_value(value: str) -> str:
    """解析 CSV 值，处理空值"""
    return value.strip() if value and value.strip() else None

def convert_to_bool(value: str) -> bool:
    """转换字符串到布尔值"""
    if not value or value.strip() == "":
        return False
    return value.strip().lower() in ["true", "1", "yes", "t"]

def convert_to_int(value: str) -> int:
    """转换字符串到整数"""
    if not value or value.strip() == "":
        return None
    try:
        return int(value.strip())
    except ValueError:
        return None

def read_csv_file(file_path: str) -> List[Dict]:
    """读取 CSV 文件并转换为字典列表"""
    print(f"正在读取文件：{file_path}")

    if not os.path.exists(file_path):
        print(f"错误：文件不存在 - {file_path}")
        sys.exit(1)

    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # 转换数据格式
            record = {
                'word': parse_csv_value(row.get('word')),
                'phonetic': parse_csv_value(row.get('phonetic')),
                'definition': parse_csv_value(row.get('definition')),
                'translation': parse_csv_value(row.get('translation')),
                'pos': parse_csv_value(row.get('pos')),
                'collins': convert_to_int(row.get('collins')),
                'oxford': convert_to_bool(row.get('oxford')),
                'tag': parse_csv_value(row.get('tag')),
                'bnc': convert_to_int(row.get('bnc')),
                'frq': convert_to_int(row.get('frq')),
                'exchange': parse_csv_value(row.get('exchange'))
            }

            # 只添加有单词的记录
            if record['word']:
                data.append(record)

    print(f"共读取 {len(data)} 条记录")
    return data

def batch_insert(data: List[Dict], batch_size: int = BATCH_SIZE):
    """批量插入数据到 Supabase"""
    total = len(data)
    inserted = 0
    failed = 0
    skipped = 0

    print(f"\n开始导入数据...")
    print(f"总记录数：{total}")
    print(f"批次大小：{batch_size}")
    print("-" * 50)

    for i in range(0, total, batch_size):
        batch = data[i:i + batch_size]
        current_batch = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size

        try:
            # 使用 upsert 避免重复插入
            result = supabase.table('dictionary').upsert(
                batch,
                on_conflict='word',
                ignore_duplicates=True
            ).execute()

            inserted += len(batch)
            progress = (i + len(batch)) / total * 100
            print(f"批次 {current_batch}/{total_batches} - "
                  f"已处理：{i + len(batch)}/{total} ({progress:.1f}%) - "
                  f"成功：{inserted}")

        except Exception as e:
            failed += len(batch)
            print(f"批次 {current_batch} 失败：{str(e)}")
            # 尝试逐条插入失败的批次
            for record in batch:
                try:
                    supabase.table('dictionary').upsert(
                        record,
                        on_conflict='word',
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

def check_table_exists():
    """检查数据表是否存在"""
    try:
        result = supabase.table('dictionary').select('count', count='exact').limit(1).execute()
        print(f"数据库连接成功！当前词典记录数：{result.count}")
        return True
    except Exception as e:
        print(f"错误：无法连接到数据库")
        print(f"详情：{str(e)}")
        return False

def main():
    """主函数"""
    print("=" * 50)
    print("ECDICT 词典数据导入工具")
    print("=" * 50)

    # 检查数据库连接
    if not check_table_exists():
        sys.exit(1)

    # 查找 CSV 文件
    # 支持多个可能的路径
    possible_paths = [
        r"F:\n8n\Project\StarSpeak\StarSpeak\ecdict.csv",  # 用户提供的路径
        "ecdict.csv",  # 项目根目录
        "../ecdict.csv",  # 上级目录
    ]

    csv_file = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_file = path
            break

    if not csv_file:
        print("\n错误：未找到 ecdict.csv 文件")
        print("请将文件放在以下位置之一：")
        for path in possible_paths:
            print(f"  - {path}")
        print("\n或者直接输入文件路径：")
        csv_file = input().strip()

        if not os.path.exists(csv_file):
            print("文件不存在，退出程序")
            sys.exit(1)

    # 确认导入
    print(f"\n找到文件：{csv_file}")
    print("\n警告：此操作将导入大量数据到数据库")
    confirm = input("确认继续？(y/n): ").strip().lower()

    if confirm != 'y':
        print("操作已取消")
        sys.exit(0)

    # 读取并导入数据
    data = read_csv_file(csv_file)

    if len(data) == 0:
        print("错误：CSV 文件为空")
        sys.exit(1)

    inserted, failed = batch_insert(data)

    # 验证导入结果
    result = supabase.table('dictionary').select('count', count='exact').limit(1).execute()
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
