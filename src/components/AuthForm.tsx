import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

type AuthResult = { success: boolean; error?: string };

interface AuthFormProps {
  onLogin: (username: string, password: string) => AuthResult | Promise<AuthResult>;
  onRegister: (username: string, password: string, email: string) => AuthResult | Promise<AuthResult>;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

const ALLOWED_DOMAINS = ['islander.tamucc.edu', 'tamucc.edu'];

function isAllowedEmail(email: string): boolean {
  return ALLOWED_DOMAINS.some(d => email.endsWith(`@${d}`));
}

export function AuthForm({ onLogin, onRegister, initialMode = 'login', onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await onLogin(username, password);
    if (!result.success) {
      setError(result.error || 'An error occurred');
    } else if (onSuccess) {
      onSuccess();
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!isAllowedEmail(trimmedEmail)) {
      setError('Please use your @islander.tamucc.edu or @tamucc.edu email');
      return;
    }

    setIsLoading(true);
    const result = await onRegister(username, password, trimmedEmail);
    if (!result.success) {
      setError(result.error || 'An error occurred');
    } else if (onSuccess) {
      onSuccess();
    }
    setIsLoading(false);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setError('');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setError('');
    setUsername('');
    setPassword('');
  };

  const inputClass = "bg-[#111] border-[#1E1E1E] text-[#EDEDED] placeholder:text-[#444] focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/20 rounded-md h-10";

  if (isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0B0B]">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="font-mono text-lg font-bold text-[#4F8CFF] mb-1">&lt;v/&gt;</div>
            <h1 className="text-xl font-semibold text-[#EDEDED] mb-1">vibeclub</h1>
            <p className="text-[#555] text-sm">Welcome back</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-400 bg-red-400/5 border border-red-400/10 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={inputClass}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4F8CFF] hover:bg-[#3D7AED] text-white font-medium h-10 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="text-center">
              <button type="button" onClick={switchToRegister} className="text-xs text-[#555] hover:text-[#4F8CFF] transition-colors">
                New here? Create an account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0B0B]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-mono text-lg font-bold text-[#4F8CFF] mb-1">&lt;v/&gt;</div>
          <h1 className="text-xl font-semibold text-[#EDEDED] mb-1">Join vibeclub</h1>
          <p className="text-[#555] text-sm">TAMUCC students only</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-400/5 border border-red-400/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888]">Islander email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@islander.tamucc.edu"
              className={inputClass}
              required
            />
            <p className="text-[10px] text-[#444]">@islander.tamucc.edu or @tamucc.edu</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888]">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className={inputClass}
              required
              minLength={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClass}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#4F8CFF] hover:bg-[#3D7AED] text-white font-medium h-10 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
            ) : (
              'Create account'
            )}
          </Button>

          <div className="text-center">
            <button type="button" onClick={switchToLogin} className="text-xs text-[#555] hover:text-[#4F8CFF] transition-colors">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
