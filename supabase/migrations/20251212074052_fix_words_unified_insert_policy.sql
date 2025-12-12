/*
  # 修复 words_unified 表的插入策略

  ## 问题
  当前策略只允许认证用户插入 AI 生成的单词，导致词典数据无法导入

  ## 解决方案
  添加新策略允许插入非 AI 生成的词典数据

  ## 变更
  1. 添加策略：允许所有用户插入非 AI 生成的词典数据
  2. 保持原有策略：只有认证用户可以插入 AI 生成的单词
*/

-- 删除旧的插入策略（如果存在）
DROP POLICY IF EXISTS "Authenticated users can insert AI words" ON words_unified;

-- 新策略1：允许插入非 AI 生成的词典数据（用于导入脚本）
CREATE POLICY "Allow inserting dictionary data"
  ON words_unified
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (is_ai_generated = false);

-- 新策略2：允许认证用户插入 AI 生成的单词
CREATE POLICY "Authenticated users can insert AI words"
  ON words_unified
  FOR INSERT
  TO authenticated
  WITH CHECK (is_ai_generated = true);

-- 注释
COMMENT ON POLICY "Allow inserting dictionary data" ON words_unified IS '允许导入非AI生成的词典数据';
COMMENT ON POLICY "Authenticated users can insert AI words" ON words_unified IS '允许认证用户插入AI生成的单词';
