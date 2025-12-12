import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 [Auth] 初始化会话:', session ? {
        userId: session.user.id,
        email: session.user.email,
      } : '未登录');
      
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 [Auth] 状态变化:', event, session ? {
        userId: session.user.id,
        email: session.user.email,
      } : '未登录');
      
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // 注册
  const signUp = async (email: string, password: string, username?: string) => {
    console.log('🚀 [SignUp] 开始注册:', { email, username });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('❌ [SignUp] 注册失败:', error);
      return { data, error };
    }

    console.log('✅ [SignUp] Supabase Auth 注册成功:', {
      userId: data.user?.id,
      email: data.user?.email,
    });

    // 如果注册成功,创建 user_profile 记录
    if (data.user) {
      const profileData: Database['public']['Tables']['user_profiles']['Insert'] = {
        id: data.user.id,
        username: username || email.split('@')[0],
      };

      console.log('📝 [SignUp] 创建 user_profile 记录:', profileData);

      const { error: profileError } = await (supabase
        .from('user_profiles') as any)
        .insert(profileData);

      if (profileError) {
        console.error('❌ [SignUp] user_profile 创建失败:', profileError);
      } else {
        console.log('✅ [SignUp] user_profile 创建成功!');
      }
    }

    console.log('🎉 [SignUp] 注册流程完成!');
    return { data, error };
  };

  // 登录
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [SignIn] 开始登录:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [SignIn] 登录失败:', error);
    } else {
      console.log('✅ [SignIn] 登录成功:', {
        userId: data.user?.id,
        email: data.user?.email,
      });
    }

    return { data, error };
  };

  // 登出
  const signOut = async () => {
    console.log('👋 [SignOut] 开始登出');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [SignOut] 登出失败:', error);
    } else {
      console.log('✅ [SignOut] 登出成功!');
    }
    
    return { error };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
};
