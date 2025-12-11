import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect to Supabase Auth
    setTimeout(() => {
      setLoading(false);
      alert("Auth integration pending backend setup");
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm border-space-700 bg-space-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
        <CardDescription>Enter your email to sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required className="bg-space-900 border-space-700 text-white" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-200">Password</Label>
            <Input id="password" type="password" required className="bg-space-900 border-space-700 text-white" />
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