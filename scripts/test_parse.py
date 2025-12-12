#!/usr/bin/env python3
"""
测试词典文件解析
"""

def parse_line(line: str):
    """解析一行"""
    parts = line.strip().split('\t')
    if len(parts) < 2:
        return None

    word = parts[0].strip()
    definition = parts[1].strip()

    if not word:
        return None

    return {
        "word": word,
        "definition": definition
    }


# 测试样例
test_lines = [
    "beddings\tn. 寝具；（建筑）[建] 基床；（家畜）草垫 adj. 适于花坛种植的 vt. 把…栽入苗床（bed的ing形式） vi. 睡（bed的ing形式）",
    "although\tconj. 尽管；虽然；但是；然而",
    "effort\tn. 努力；成就",
    "preference\tn. 偏爱，倾向；优先权",
]

print("测试词典文件解析：\n")
for line in test_lines:
    result = parse_line(line)
    if result:
        print(f"单词: {result['word']}")
        print(f"释义: {result['definition']}")
        print("-" * 50)
