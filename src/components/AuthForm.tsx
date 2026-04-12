import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { resetPassword } from '@/hooks/useAuth';

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

const API_BASE_AUTH = import.meta.env.VITE_API_URL || '/api';

type Mode = 'login' | 'register' | 'reset';

export function AuthForm({ onLogin, onRegister, initialMode = 'login', onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const inviteCode = new URLSearchParams(window.location.search).get('invite') || '';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clear = () => { setError(''); setSuccess(''); setUsername(''); setPassword(''); setConfirmPassword(''); setEmail(''); };

  const inputClass = "bg-[#0D0F14] border-white/[0.08] text-white/90 placeholder:text-white/30 focus:border-[#4ADE80]/40 focus:ring-1 focus:ring-[#4ADE80]/20 rounded-lg h-11 text-sm";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await onLogin(username, password);
    if (!result.success) setError(result.error || 'An error occurred');
    else if (onSuccess) onSuccess();
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isAllowedEmail(email.trim().toLowerCase())) { setError('Please use your Islander email'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    const result = await onRegister(username, password, email.trim().toLowerCase());
    if (!result.success) { setError(result.error || 'An error occurred'); }
    else {
      // Redeem invite code if present
      if (inviteCode) {
        try {
          await fetch(`${API_BASE_AUTH}/invite/use`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: inviteCode, username }),
          });
        } catch { /* ignore */ }
      }
      if (onSuccess) onSuccess();
    }
    setIsLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!isAllowedEmail(email.trim().toLowerCase())) { setError('Please use your Islander email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    const result = await resetPassword(email.trim().toLowerCase(), password);
    if (!result.success) setError(result.error || 'An error occurred');
    else setSuccess('Password reset! You can now sign in.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0C10]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-mono text-2xl font-bold text-[#4ADE80] mb-2">&lt;g/&gt;</div>
          <h1 className="text-2xl font-semibold text-white/90 mb-1">
            {mode === 'login' ? 'gencodelab.pro' : mode === 'register' ? 'Join gencodelab.pro' : 'Reset password'}
          </h1>
          <p className="text-white/50 text-sm">
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your free account' : 'Enter your email and new password'}
          </p>
        </div>

        {mode === 'register' && inviteCode && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[#A78BFA]/[0.06] border border-[#A78BFA]/[0.12] text-center">
            <p className="text-sm text-[#A78BFA]">You've been invited! Sign up to join gencodelab.pro.</p>
          </div>
        )}
        {mode === 'register' && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-[#4ADE80]/[0.05] border border-[#4ADE80]/[0.12] text-center">
            <p className="text-sm text-white/60">
              Currently in <span className="text-[#4ADE80] font-medium">beta</span> — available exclusively to TAMUCC students.
            </p>
          </div>
        )}

        {mode === 'reset' && (
          <button onClick={() => { setMode('login'); clear(); }} className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </button>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset} className="space-y-4">
          {error && (
            <div className="text-sm text-[#F87171] bg-[#F87171]/[0.05] border border-[#F87171]/[0.12] rounded-lg px-4 py-3">{error}</div>
          )}
          {success && (
            <div className="text-sm text-[#4ADE80] bg-[#4ADE80]/[0.05] border border-[#4ADE80]/[0.12] rounded-lg px-4 py-3">{success}</div>
          )}

          {(mode === 'register' || mode === 'reset') && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Islander email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@islander.tamucc.edu" className={inputClass} required />
              {mode === 'register' && <p className="text-xs text-white/30">@islander.tamucc.edu or @tamucc.edu</p>}
            </div>
          )}

          {mode !== 'reset' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Username</label>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={mode === 'login' ? 'Enter your username' : 'Choose a username'} className={inputClass} required minLength={3} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">{mode === 'reset' ? 'New password' : 'Password'}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'} className={inputClass} required minLength={6} />
          </div>

          {(mode === 'register' || mode === 'reset') && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Confirm password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className={inputClass} required minLength={6} />
            </div>
          )}

          <Button type="submit" className="w-full bg-[#4ADE80] hover:bg-[#22C55E] text-black font-semibold h-11 rounded-lg text-sm" disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Please wait...</> :
              mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'}
          </Button>

          <div className="text-center space-y-2 pt-2">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => { setMode('reset'); clear(); }} className="block w-full text-sm text-white/40 hover:text-[#4ADE80] transition-colors">
                  Forgot password?
                </button>
                <button type="button" onClick={() => { setMode('register'); clear(); }} className="block w-full text-sm text-white/40 hover:text-[#4ADE80] transition-colors">
                  New here? Create an account
                </button>
              </>
            )}
            {mode === 'register' && (
              <button type="button" onClick={() => { setMode('login'); clear(); }} className="text-sm text-white/40 hover:text-[#4ADE80] transition-colors">
                Already have an account? Sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
