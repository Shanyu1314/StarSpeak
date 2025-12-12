import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // 登录成功,跳转到首页
        navigate('/');
      }
    } catch (err) {
      setError('登录失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm border-space-700 bg-space-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
        <CardDescription>Enter your email to sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              className="bg-space-900 border-space-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-200">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              className="bg-space-900 border-space-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full font-bold" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};