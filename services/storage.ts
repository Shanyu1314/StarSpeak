import { WordEntry, SOSScenario } from '../types';
import { supabase } from '../src/services/supabase';

console.log('📦 [Storage] 使用 Supabase 云端存储');

// 获取当前用户 ID
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('用户未登录');
  }
  return user.id;
};

/* --- Word Services --- */

export const saveWord = async (entry: WordEntry): Promise<void> => {
  console.log('💾 [Storage] 保存单词:', entry.word);
  
  try {
    const userId = await getCurrentUserId();
    
    const wordData: any = {
      user_id: userId,
      word: entry.word.toLowerCase(),
      phonetic: entry.phonetic || null,
      definition: entry.definition || null,
      translation_cn: entry.translation_cn || null,
      example: entry.example || null,
      in_drill: entry.inDrill || false,
    };

    console.log('📝 [Storage] 准备保存的数据:', wordData);

    const { error } = await (supabase
      .from('word_entries') as any)
      .upsert(wordData, { onConflict: 'user_id,word' });

    if (error) {
      console.error('❌ [Storage] 保存单词失败:', error);
      throw error;
    }
    
    console.log('✅ [Storage] 单词保存成功');
  } catch (error) {
    console.error('❌ [Storage] 保存单词错误:', error);
    throw error;
  }
};

export const getWord = async (word: string): Promise<WordEntry | undefined> => {
  console.log('🔍 [Storage] 查询单词:', word);
  
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await (supabase
      .from('word_entries') as any)
      .select('*')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('❌ [Storage] 查询单词失败:', error);
      return undefined;
    }

    if (data) {
      console.log('✅ [Storage] 找到单词:', data);
      return {
        word: data.word,
        phonetic: data.phonetic || '',
        definition: data.definition || '',
        translation_cn: data.translation_cn || '',
        example: data.example || '',
        addedAt: Date.now(),
        inDrill: data.in_drill || false,
      };
    }

    console.log('ℹ️ [Storage] 单词不存在');
    return undefined;
  } catch (error) {
    console.error('❌ [Storage] 查询单词错误:', error);
    return undefined;
  }
};

export const getAllDrillWords = async (): Promise<WordEntry[]> => {
  console.log('📚 [Storage] 获取练习单词列表');
  
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await (supabase
      .from('word_entries') as any)
      .select('*')
      .eq('user_id', userId)
      .eq('in_drill', true);

    if (error) {
      console.error('❌ [Storage] 获取练习单词失败:', error);
      return [];
    }

    console.log(`✅ [Storage] 找到 ${data?.length || 0} 个练习单词`);
    
    return (data || []).map((item: any) => ({
      word: item.word,
      phonetic: item.phonetic || '',
      definition: item.definition || '',
      translation_cn: item.translation_cn || '',
      example: item.example || '',
      addedAt: Date.now(),
      inDrill: item.in_drill || false,
    }));
  } catch (error) {
    console.error('❌ [Storage] 获取练习单词错误:', error);
    return [];
  }
};

export const getRecentWords = async (limit: number = 20): Promise<WordEntry[]> => {
  console.log(`📖 [Storage] 获取最近 ${limit} 个单词`);
  
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await (supabase
      .from('word_entries') as any)
      .select('*')
      .eq('user_id', userId)
      .limit(limit);

    if (error) {
      console.error('❌ [Storage] 获取最近单词失败:', error);
      return [];
    }

    console.log(`✅ [Storage] 找到 ${data?.length || 0} 个单词`);
    
    return (data || []).map((item: any) => ({
      word: item.word,
      phonetic: item.phonetic || '',
      definition: item.definition || '',
      translation_cn: item.translation_cn || '',
      example: item.example || '',
      addedAt: Date.now(),
      inDrill: item.in_drill || false,
    }));
  } catch (error) {
    console.error('❌ [Storage] 获取最近单词错误:', error);
    return [];
  }
};

export const toggleDrillStatus = async (word: string, status: boolean): Promise<void> => {
  console.log(`🔄 [Storage] 切换单词练习状态: ${word} -> ${status}`);
  
  try {
    const userId = await getCurrentUserId();
    
    const { error } = await (supabase
      .from('word_entries') as any)
      .update({ in_drill: status })
      .eq('user_id', userId)
      .eq('word', word.toLowerCase());

    if (error) {
      console.error('❌ [Storage] 切换状态失败:', error);
      throw error;
    }
    
    console.log('✅ [Storage] 状态切换成功');
  } catch (error) {
    console.error('❌ [Storage] 切换状态错误:', error);
  }
};

export const deleteWord = async (word: string): Promise<void> => {
  console.log(`🗑️ [Storage] 删除单词: ${word}`);
  
  try {
    const userId = await getCurrentUserId();
    
    const { error } = await (supabase
      .from('word_entries') as any)
      .delete()
      .eq('user_id', userId)
      .eq('word', word.toLowerCase());

    if (error) {
      console.error('❌ [Storage] 删除单词失败:', error);
      throw error;
    }
    
    console.log('✅ [Storage] 单词删除成功');
  } catch (error) {
    console.error('❌ [Storage] 删除单词错误:', error);
    throw error;
  }
};

/* --- SOS Scenario Services --- */

export const saveSOSScenario = async (scenario: Omit<SOSScenario, 'id'>): Promise<void> => {
  console.log('💾 [Storage] 保存 SOS 场景');
  
  try {
    const userId = await getCurrentUserId();
    
    const sosData: any = {
      user_id: userId,
      original_text: scenario.originalText,
      native_expression: scenario.nativeExpression,
    };

    const { error } = await (supabase
      .from('sos_scenarios') as any)
      .insert(sosData);

    if (error) {
      console.error('❌ [Storage] 保存 SOS 场景失败:', error);
      throw error;
    }
    
    console.log('✅ [Storage] SOS 场景保存成功');
  } catch (error) {
    console.error('❌ [Storage] 保存 SOS 场景错误:', error);
    throw error;
  }
};

export const getRecentSOS = async (limit: number = 5): Promise<SOSScenario[]> => {
  console.log(`📋 [Storage] 获取最近 ${limit} 个 SOS 场景`);
  
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await (supabase
      .from('sos_scenarios') as any)
      .select('*')
      .eq('user_id', userId)
      .limit(limit);

    if (error) {
      console.error('❌ [Storage] 获取 SOS 场景失败:', error);
      return [];
    }

    console.log(`✅ [Storage] 找到 ${data?.length || 0} 个 SOS 场景`);
    
    return (data || []).map((item: any) => ({
      id: item.id,
      originalText: item.original_text,
      nativeExpression: item.native_expression,
      createdAt: Date.now(),
    }));
  } catch (error) {
    console.error('❌ [Storage] 获取 SOS 场景错误:', error);
    return [];
  }
};
