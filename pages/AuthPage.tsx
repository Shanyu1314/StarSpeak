import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { Button } from '../components/ui/button';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-space-900 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-space-accent to-blue-600">
          StarSpeak
        </h1>
        <p className="text-slate-400">Battle-hardened English Training</p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center">
        {isLogin ? <LoginForm /> : <SignupForm />}
        
        <div className="mt-6 text-center">
           <p className="text-slate-500 text-sm mb-2">
             {isLogin ? "Don't have an account?" : "Already have an account?"}
           </p>
           <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-space-accent">
             {isLogin ? "Sign up now" : "Login here"}
           </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;