import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // 加载中显示骨架屏
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-space-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-space-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 未登录重定向到登录页
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 已登录,显示子组件
  return <>{children}</>;
};