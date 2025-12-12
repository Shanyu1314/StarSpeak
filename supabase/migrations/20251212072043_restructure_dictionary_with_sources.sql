/*
  # 重构词典数据库架构 - 支持多词典来源

  ## 说明
  重新设计数据库结构，支持多个词典来源，并存储AI查询结果

  ## 新建表

  ### 1. `dictionary_sources` - 词典来源表
  记录所有词典的元数据
  - `id` (uuid): 主键
  - `name` (text): 词典名称（如 "ECDICT", "word_translation"）
  - `description` (text): 词典描述
  - `priority` (integer): 查询优先级（数字越小优先级越高）
  - `created_at` (timestamptz): 创建时间

  ### 2. `words_unified` - 统一词汇表
  存储所有来源的单词数据，包括用户AI查询结果
  - `id` (uuid): 主键
  - `word` (text): 单词（小写，用于查询）
  - `display_word` (text): 显示单词（保留原始大小写）
  - `phonetic` (text): 音标
  - `translation` (text): 中文翻译
  - `definition` (text): 英文释义
  - `example` (text): 例句
  - `pos` (text): 词性
  - `source_id` (uuid): 来源词典ID（外键）
  - `is_ai_generated` (boolean): 是否为AI生成
  - `collins` (integer): 柯林斯星级
  - `frequency` (integer): 词频
  - `tags` (text[]): 标签数组（如 ["高考", "四级"]）
  - `extra_data` (jsonb): 额外数据（灵活扩展）
  - `created_at` (timestamptz): 创建时间
  - `updated_at` (timestamptz): 更新时间

  ### 3. 保留原有的 `dictionary` 表
  保持向后兼容

  ## 索引优化
  - word 唯一索引（组合 word + source_id）
  - word 前缀搜索索引
  - source_id 索引
  - is_ai_generated 索引

  ## 安全设置
  - 启用 RLS
  - 所有用户可查询
  - 只有认证用户可以插入AI生成的单词
*/

-- 创建词典来源表
CREATE TABLE IF NOT EXISTS dictionary_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  priority INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 创建统一词汇表
CREATE TABLE IF NOT EXISTS words_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  display_word TEXT NOT NULL,
  phonetic TEXT,
  translation TEXT,
  definition TEXT,
  example TEXT,
  pos TEXT,
  source_id UUID REFERENCES dictionary_sources(id) ON DELETE CASCADE,
  is_ai_generated BOOLEAN DEFAULT false,
  collins INTEGER,
  frequency INTEGER,
  tags TEXT[],
  extra_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(word, source_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_words_unified_word ON words_unified(word);
CREATE INDEX IF NOT EXISTS idx_words_unified_word_prefix ON words_unified(word text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_words_unified_source ON words_unified(source_id);
CREATE INDEX IF NOT EXISTS idx_words_unified_ai ON words_unified(is_ai_generated);
CREATE INDEX IF NOT EXISTS idx_words_unified_display ON words_unified(display_word);

-- 启用 RLS
ALTER TABLE dictionary_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE words_unified ENABLE ROW LEVEL SECURITY;

-- 词典来源表策略：所有人可读
CREATE POLICY "Anyone can read dictionary sources"
  ON dictionary_sources
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 统一词汇表策略：所有人可读
CREATE POLICY "Anyone can read words"
  ON words_unified
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 统一词汇表策略：认证用户可插入AI生成的单词
CREATE POLICY "Authenticated users can insert AI words"
  ON words_unified
  FOR INSERT
  TO authenticated
  WITH CHECK (is_ai_generated = true);

-- 统一词汇表策略：认证用户可更新AI生成的单词
CREATE POLICY "Authenticated users can update AI words"
  ON words_unified
  FOR UPDATE
  TO authenticated
  USING (is_ai_generated = true)
  WITH CHECK (is_ai_generated = true);

-- 插入预定义的词典来源
INSERT INTO dictionary_sources (name, description, priority)
VALUES 
  ('ECDICT', 'ECDICT 开源英汉词典 - 76万词条', 10),
  ('word_translation', '高中/考研/托福词汇翻译词典', 20),
  ('AI_Generated', 'AI生成的单词释义和例句', 100)
ON CONFLICT (name) DO NOTHING;

-- 添加注释
COMMENT ON TABLE dictionary_sources IS '词典来源元数据表';
COMMENT ON TABLE words_unified IS '统一词汇表，支持多来源';
COMMENT ON COLUMN words_unified.word IS '单词（小写，用于查询）';
COMMENT ON COLUMN words_unified.display_word IS '显示单词（原始大小写）';
COMMENT ON COLUMN words_unified.is_ai_generated IS '是否为AI生成内容';
COMMENT ON COLUMN words_unified.source_id IS '词典来源ID';
