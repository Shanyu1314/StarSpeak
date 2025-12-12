/**
 * 统一词典查询服务
 * 支持多词典来源和AI生成内容
 */

import { supabase } from '../src/services/supabase';
import { WordEntry } from '../types';
import { aiLookupWord } from './gemini';

export type LookupMode = 'offline' | 'ai';

interface UnifiedWordRecord {
  id: string;
  word: string;
  display_word: string;
  phonetic: string | null;
  translation: string | null;
  definition: string | null;
  example: string | null;
  pos: string | null;
  is_ai_generated: boolean;
  source_id: string;
  created_at: string;
}

/**
 * 统一查询单词（从所有词典来源）
 * @param word 要查询的单词
 * @param mode 查询模式：'offline' 只查数据库 | 'ai' 查不到则用AI
 */
export async function lookupWord(word: string, mode: LookupMode = 'ai'): Promise<WordEntry | null> {
  const searchWord = word.toLowerCase().trim();

  try {
    // 1. 查询所有词典来源（按优先级排序）
    const { data, error } = await supabase
      .from('words_unified')
      .select(`
        *,
        dictionary_sources!inner(priority)
      `)
      .eq('word', searchWord)
      .order('dictionary_sources(priority)', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Database query error:', error);
    }

    // 2. 如果找到了，直接返回
    if (data) {
      return convertToWordEntry(data);
    }

    // 3. 如果是离线模式，直接返回 null
    if (mode === 'offline') {
      return null;
    }

    // 4. AI模式：使用AI查询并保存
    console.log('Word not found in database, using AI...');
    const aiResult = await aiLookupWord(word);

    // 5. 保存AI结果到数据库
    await saveAIGeneratedWord(aiResult);

    return aiResult;

  } catch (err) {
    console.error('Failed to lookup word:', err);
    throw err;
  }
}

/**
 * 保存AI生成的单词到数据库
 */
async function saveAIGeneratedWord(wordEntry: WordEntry): Promise<void> {
  try {
    // 获取AI来源ID
    const { data: source } = await supabase
      .from('dictionary_sources')
      .select('id')
      .eq('name', 'AI_Generated')
      .single();

    if (!source) {
      console.error('AI_Generated source not found');
      return;
    }

    const record = {
      word: wordEntry.word.toLowerCase(),
      display_word: wordEntry.word,
      phonetic: wordEntry.phonetic || null,
      translation: wordEntry.translation_cn || null,
      definition: wordEntry.definition || null,
      example: wordEntry.example || null,
      source_id: source.id,
      is_ai_generated: true
    };

    await supabase
      .from('words_unified')
      .upsert(record, {
        onConflict: 'word,source_id',
        ignoreDuplicates: false
      })
      .execute();

    console.log('AI result saved to database');
  } catch (err) {
    console.error('Failed to save AI result:', err);
  }
}

/**
 * 转换数据库记录到 WordEntry 格式
 */
function convertToWordEntry(data: UnifiedWordRecord): WordEntry {
  return {
    word: data.display_word,
    phonetic: data.phonetic || '',
    definition: data.definition || '',
    translation_cn: data.translation || '暂无中文释义',
    example: data.example || generateDefaultExample(data.display_word),
    addedAt: Date.now(),
    inDrill: false
  };
}

/**
 * 生成默认例句
 */
function generateDefaultExample(word: string): string {
  return `Example sentence with "${word}".`;
}

/**
 * 搜索单词（前缀匹配）
 * @param prefix 前缀
 * @param limit 返回数量
 */
export async function searchWords(prefix: string, limit: number = 10): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('words_unified')
      .select('display_word')
      .ilike('word', `${prefix.toLowerCase().trim()}%`)
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data.map(item => item.display_word);
  } catch (err) {
    console.error('Failed to search words:', err);
    return [];
  }
}

/**
 * 获取词典统计信息
 */
export async function getDictionaryStats() {
  try {
    const { data: sources } = await supabase
      .from('dictionary_sources')
      .select('*')
      .order('priority', { ascending: true });

    const stats = await Promise.all(
      (sources || []).map(async (source) => {
        const { count } = await supabase
          .from('words_unified')
          .select('*', { count: 'exact', head: true })
          .eq('source_id', source.id);

        return {
          name: source.name,
          description: source.description,
          count: count || 0
        };
      })
    );

    return stats;
  } catch (err) {
    console.error('Failed to get stats:', err);
    return [];
  }
}
