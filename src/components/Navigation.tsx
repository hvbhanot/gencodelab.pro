import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentUser: string;
  totalPoints: number;
  onLogout: () => void;
}

export function Navigation({ currentUser, totalPoints, onLogout }: NavigationProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0B] border-b border-[#1E1E1E]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/problems" className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#4F8CFF]">&lt;v/&gt;</span>
          <span className="text-sm font-semibold text-[#EDEDED]">vibeclub</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/problems"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              isActive('/problems') || isActive('/')
                ? 'text-[#EDEDED] bg-[#1E1E1E]'
                : 'text-[#666] hover:text-[#EDEDED]'
            }`}
          >
            Problems
          </Link>
          <Link
            to="/tips"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              isActive('/tips')
                ? 'text-[#EDEDED] bg-[#1E1E1E]'
                : 'text-[#666] hover:text-[#EDEDED]'
            }`}
          >
            Tips
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[#666]">
            <span className="text-[#4F8CFF]">{totalPoints}</span> pts
          </span>
          <div className="w-px h-4 bg-[#1E1E1E]" />
          <span className="text-sm text-[#666]">{currentUser}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-[#666] hover:text-[#EDEDED] hover:bg-[#1E1E1E] h-8 w-8"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
