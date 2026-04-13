import { Link, useLocation } from 'react-router-dom';
import { LogOut, Flame, Sun, Moon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscordLogo } from './DiscordLogo';

interface NavigationProps {
  currentUser: string;
  totalPoints: number;
  currentStreak: number;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const DISCORD_URL = 'https://discord.gg/UveSX7Wz';

export function Navigation({ totalPoints, currentStreak, onLogout, theme, onToggleTheme }: NavigationProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => { onLogout(); window.location.href = '/'; };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: theme === 'dark' ? 'rgba(10,12,16,0.9)' : 'rgba(248,249,250,0.9)', borderColor: 'var(--vc-border)' }}>
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center relative">
        {/* Left */}
        <Link to="/problems" className="flex items-center gap-2.5">
          <span className="font-mono text-base font-bold text-[#4ADE80]">&lt;g/&gt;</span>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--vc-text)' }}>gencodelab.pro</span>
        </Link>

        {/* Center */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-lg p-1" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', border: '1px solid var(--vc-border)' }}>
          <Link to="/problems" className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${isActive('/problems') || isActive('/') ? (theme === 'dark' ? 'bg-white/[0.08] text-white' : 'bg-black/[0.06] text-black') : 'hover:opacity-70'}`} style={{ color: isActive('/problems') || isActive('/') ? undefined : 'var(--vc-text-muted)' }}>
            Problems
          </Link>
          <Link to="/tips" className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${isActive('/tips') ? (theme === 'dark' ? 'bg-white/[0.08] text-white' : 'bg-black/[0.06] text-black') : 'hover:opacity-70'}`} style={{ color: isActive('/tips') ? undefined : 'var(--vc-text-muted)' }}>
            Tips
          </Link>
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F97316]/[0.08] border border-[#F97316]/[0.12]">
              <Flame className="w-3.5 h-3.5 text-[#F97316]" />
              <span className="text-[13px] font-mono font-bold text-[#F97316]">{currentStreak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4ADE80]/[0.08] border border-[#4ADE80]/[0.12]">
            <span className="text-[13px] font-mono font-bold text-[#4ADE80]">{totalPoints}</span>
            <span className="text-[12px]" style={{ color: 'var(--vc-text-faint)' }}>pts</span>
          </div>

          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-md" style={{ color: 'var(--vc-text-muted)' }}>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" aria-label="Join Discord" title="Join Discord">
              <DiscordLogo className="w-4 h-4" />
            </a>
          </Button>

          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-8 w-8 rounded-md" style={{ color: 'var(--vc-text-muted)' }}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Link to="/profile" className="h-8 w-8 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity" style={{ color: isActive('/profile') ? '#4ADE80' : 'var(--vc-text-muted)' }}>
            <User className="w-4 h-4" />
          </Link>

          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 rounded-md" style={{ color: 'var(--vc-text-faint)' }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
