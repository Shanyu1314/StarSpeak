/**
 * ECDICT 词典数据库查询服务
 * 提供从 Supabase 数据库查询词典数据的功能
 */

import { supabase } from '../src/services/supabase';
import { WordEntry } from '../types';

/**
 * 数据库词典记录类型
 */
interface DictionaryRecord {
  word: string;
  phonetic: string | null;
  definition: string | null;
  translation: string | null;
  pos: string | null;
  collins: number | null;
  oxford: boolean;
  tag: string | null;
  bnc: number | null;
  frq: number | null;
  exchange: string | null;
}

/**
 * 从数据库查询单词
 * @param word 要查询的单词
 * @returns WordEntry 或 null
 */
export async function lookupWordInDatabase(word: string): Promise<WordEntry | null> {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('word, phonetic, definition, translation, pos, collins, oxford, tag, exchange')
      .eq('word', word.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('Database query error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // 转换数据库格式到 WordEntry 格式
    return convertToWordEntry(data);
  } catch (err) {
    console.error('Failed to lookup word in database:', err);
    return null;
  }
}

/**
 * 模糊搜索单词（前缀匹配）
 * @param prefix 前缀
 * @param limit 返回数量限制
 * @returns 匹配的单词列表
 */
export async function searchWordsByPrefix(prefix: string, limit: number = 10): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('word')
      .ilike('word', `${prefix.toLowerCase().trim()}%`)
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data.map(item => item.word);
  } catch (err) {
    console.error('Failed to search words:', err);
    return [];
  }
}

/**
 * 转换数据库记录到 WordEntry 格式
 */
function convertToWordEntry(data: DictionaryRecord): WordEntry {
  // 生成示例句子（简单处理）
  const example = generateExample(data.word, data.definition, data.pos);

  return {
    word: data.word,
    phonetic: data.phonetic || '',
    definition: data.definition || 'No definition available',
    translation_cn: data.translation || '暂无中文释义',
    example: example,
    addedAt: Date.now(),
    inDrill: false
  };
}

/**
 * 生成示例句子
 * 根据词性和单词生成一个简单的示例句
 */
function generateExample(word: string, definition: string | null, pos: string | null): string {
  // 如果定义中包含例句（通常在括号或引号中），尝试提取
  if (definition) {
    const exampleMatch = definition.match(/["']([^"']+)["']/);
    if (exampleMatch) {
      return exampleMatch[1];
    }
  }

  // 根据词性生成简单例句
  if (pos) {
    const posLower = pos.toLowerCase();

    if (posLower.includes('n') || posLower.includes('noun')) {
      return `This is a ${word}.`;
    } else if (posLower.includes('v') || posLower.includes('verb')) {
      return `I ${word} every day.`;
    } else if (posLower.includes('adj') || posLower.includes('adjective')) {
      return `It is very ${word}.`;
    } else if (posLower.includes('adv') || posLower.includes('adverb')) {
      return `She speaks ${word}.`;
    }
  }

  // 默认例句
  return `The word "${word}" is commonly used in English.`;
}

/**
 * 获取随机单词（用于学习功能）
 * @param count 数量
 * @param minFrequency 最小词频（BNC排序，数值越小越常用）
 * @param maxFrequency 最大词频
 * @returns 单词列表
 */
export async function getRandomWords(
  count: number = 10,
  minFrequency: number = 1,
  maxFrequency: number = 10000
): Promise<WordEntry[]> {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('word, phonetic, definition, translation, pos')
      .gte('bnc', minFrequency)
      .lte('bnc', maxFrequency)
      .not('bnc', 'is', null)
      .limit(count * 3); // 获取更多数据用于随机

    if (error || !data) {
      console.error('Failed to get random words:', error);
      return [];
    }

    // 随机打乱并取指定数量
    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, count);
    return shuffled.map(convertToWordEntry);
  } catch (err) {
    console.error('Failed to get random words:', err);
    return [];
  }
}
