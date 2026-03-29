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
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
    setConfirmPassword('');
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const inputClass = "bg-[#111] border-[#222] text-[#E4E4E7] placeholder:text-[#71717A] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/20 rounded-md h-11 text-sm";

  if (isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="font-mono text-2xl font-bold text-[#22C55E] mb-2">&lt;v/&gt;</div>
            <h1 className="text-2xl font-semibold text-[#E4E4E7] mb-1">vibeclub</h1>
            <p className="text-[#A1A1AA] text-sm">Welcome back</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red-400 bg-red-400/5 border border-red-400/15 rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#CCC]">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#CCC]">Password</label>
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
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium h-11 rounded-md text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="text-center pt-2">
              <button type="button" onClick={switchToRegister} className="text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors">
                New here? Create an account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-mono text-2xl font-bold text-[#22C55E] mb-2">&lt;v/&gt;</div>
          <h1 className="text-2xl font-semibold text-[#E4E4E7] mb-1">Join vibeclub</h1>
          <p className="text-[#A1A1AA] text-sm">TAMUCC students only</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-red-400 bg-red-400/5 border border-red-400/15 rounded-md px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CCC]">Islander email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@islander.tamucc.edu"
              className={inputClass}
              required
            />
            <p className="text-xs text-[#71717A]">@islander.tamucc.edu or @tamucc.edu</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CCC]">Username</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CCC]">Password</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CCC]">Confirm password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={inputClass}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium h-11 rounded-md text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
            ) : (
              'Create account'
            )}
          </Button>

          <div className="text-center pt-2">
            <button type="button" onClick={switchToLogin} className="text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
