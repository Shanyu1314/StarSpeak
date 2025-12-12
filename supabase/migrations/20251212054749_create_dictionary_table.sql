/*
  # 创建 ECDICT 词典数据表

  ## 说明
  创建用于存储 ECDICT 英汉词典数据的表结构，包含 76 万+词条。

  ## 新建表
  
  ### `dictionary`
  存储词典的核心数据
  
  **字段说明：**
  - `id` (bigserial): 自增主键
  - `word` (text): 单词名称，唯一索引
  - `phonetic` (text): 音标（英式音标）
  - `definition` (text): 英文释义
  - `translation` (text): 中文释义
  - `pos` (text): 词性标注
  - `collins` (integer): 柯林斯星级（1-5星）
  - `oxford` (boolean): 是否为牛津3000核心词汇
  - `tag` (text): 考试标签（如：zk/中考、gk/高考、cet4/四级）
  - `bnc` (integer): 英国国家语料库词频顺序
  - `frq` (integer): 当代语料库词频顺序
  - `exchange` (text): 词形变化（时态、复数等）
  - `created_at` (timestamptz): 创建时间
  
  ## 索引优化
  
  1. **word 唯一索引** - 确保单词不重复
  2. **word 前缀搜索索引** - 支持快速前缀匹配（如输入 "app" 匹配 "apple"）
  3. **bnc/frq 词频索引** - 按词频排序查询
  
  ## 安全设置
  
  - 启用 RLS（行级安全）
  - 允许所有认证用户查询词典（只读）
  - 词典数据不允许用户修改
*/

-- 创建词典表
CREATE TABLE IF NOT EXISTS dictionary (
  id BIGSERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  phonetic TEXT,
  definition TEXT,
  translation TEXT,
  pos TEXT,
  collins INTEGER,
  oxford BOOLEAN DEFAULT false,
  tag TEXT,
  bnc INTEGER,
  frq INTEGER,
  exchange TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
CREATE INDEX IF NOT EXISTS idx_dictionary_word_prefix ON dictionary(word text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_dictionary_bnc ON dictionary(bnc) WHERE bnc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dictionary_frq ON dictionary(frq) WHERE frq IS NOT NULL;

-- 启用 RLS
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;

-- 允许所有认证用户查询词典（只读）
CREATE POLICY "Anyone can read dictionary"
  ON dictionary
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 添加注释
COMMENT ON TABLE dictionary IS 'ECDICT 英汉词典数据表';
COMMENT ON COLUMN dictionary.word IS '单词（英文）';
COMMENT ON COLUMN dictionary.phonetic IS '音标';
COMMENT ON COLUMN dictionary.translation IS '中文释义';
COMMENT ON COLUMN dictionary.bnc IS 'BNC词频（数值越小越常用）';
COMMENT ON COLUMN dictionary.frq IS '当代语料库词频（数值越小越常用）';