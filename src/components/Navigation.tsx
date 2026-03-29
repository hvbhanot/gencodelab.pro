import { Link, useLocation } from 'react-router-dom';
import { LogOut, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentUser: string;
  totalPoints: number;
  currentStreak: number;
  dailyProblemId: number | null;
  onLogout: () => void;
  onSelectDaily: () => void;
}

export function Navigation({ currentUser, totalPoints, currentStreak, dailyProblemId, onLogout, onSelectDaily }: NavigationProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090B]/95 backdrop-blur-sm border-b border-[#1C1C1F]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/problems" className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-[#22C55E]">&lt;v/&gt;</span>
          <span className="text-sm font-semibold text-[#E4E4E7] tracking-tight">vibeclub</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/problems"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/problems') || isActive('/')
                ? 'text-[#E4E4E7] bg-[#1C1C1F]'
                : 'text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-white/5'
            }`}
          >
            Problems
          </Link>
          <Link
            to="/leaderboard"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/leaderboard')
                ? 'text-[#E4E4E7] bg-[#1C1C1F]'
                : 'text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-white/5'
            }`}
          >
            Leaderboard
          </Link>
          <Link
            to="/tips"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/tips')
                ? 'text-[#E4E4E7] bg-[#1C1C1F]'
                : 'text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-white/5'
            }`}
          >
            Tips
          </Link>
          {dailyProblemId && (
            <button
              onClick={onSelectDaily}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#FBBF24] hover:bg-[#FBBF24]/10 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Daily
            </button>
          )}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F97316]/8 border border-[#F97316]/15">
              <Flame className="w-3.5 h-3.5 text-[#F97316]" />
              <span className="text-xs font-mono font-semibold text-[#F97316]">{currentStreak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22C55E]/8 border border-[#22C55E]/15">
            <span className="text-xs font-mono font-semibold text-[#22C55E]">{totalPoints}</span>
            <span className="text-xs text-[#52525B]">pts</span>
          </div>
          <div className="w-px h-4 bg-[#27272A]" />
          <span className="text-sm text-[#A1A1AA]">{currentUser}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-[#71717A] hover:text-[#E4E4E7] hover:bg-white/5 h-8 w-8"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
