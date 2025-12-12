import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

export const SignupForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signUp(email, password, username);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // 注册成功,3秒后跳转到首页
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      setError('注册失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm border-space-700 bg-space-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Create an account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-lg">
              注册成功!请检查邮箱验证链接。3秒后自动跳转...
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-slate-200">Username</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="StarWalker" 
              required 
              className="bg-space-900 border-space-700 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
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
              minLength={6}
              className="bg-space-900 border-space-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-slate-400">密码至少 6 个字符</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full font-bold" variant="secondary" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};