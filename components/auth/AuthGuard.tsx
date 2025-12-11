import React from 'react';
// import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // Placeholder for real auth logic
  // const { user, loading } = useAuth();
  // const navigate = useNavigate();

  // if (loading) return <div>Loading...</div>;
  // if (!user) navigate('/auth');

  // For now, allow everything
  return <>{children}</>;
};