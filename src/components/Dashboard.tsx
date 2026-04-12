import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Shuffle,
  LogOut,
} from 'lucide-react';
import { problems as allProblems } from '@/data/problems';
import type { Problem, Difficulty, UserProgress, Category } from '@/types';

interface DashboardProps {
  userProgress: UserProgress;
  currentUser: string;
  onSelectProblem: (problem: Problem) => void;
  onLogout: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const getCategoryLabel = (category: Category) => {
  const labels: Record<Category, string> = {
    'logic': 'Logic',
    'scope': 'Scope',
    'type': 'Type',
    'security': 'Security',
    'performance': 'Perf',
    'concurrency': 'Async',
    'algorithm': 'Algo',
    'syntax': 'Syntax',
    'edge-case': 'Edge',
    'pitfall': 'Pitfall',
    'oop': 'OOP',
    'advanced': 'Advanced'
  };
  return labels[category] || category;
};

export function Dashboard({ userProgress, currentUser, onSelectProblem, onLogout }: DashboardProps) {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    setProblems(shuffleArray(allProblems));
  }, []);

  const stats = useMemo(() => {
    const easyTotal = allProblems.filter(p => p.difficulty === 'easy').length;
    const mediumTotal = allProblems.filter(p => p.difficulty === 'medium').length;
    const hardTotal = allProblems.filter(p => p.difficulty === 'hard').length;

    const easySolved = Object.values(userProgress.problems).filter(
      p => allProblems.find(prob => prob.id === p.problemId)?.difficulty === 'easy' && p.solved
    ).length;
    const mediumSolved = Object.values(userProgress.problems).filter(
      p => allProblems.find(prob => prob.id === p.problemId)?.difficulty === 'medium' && p.solved
    ).length;
    const hardSolved = Object.values(userProgress.problems).filter(
      p => allProblems.find(prob => prob.id === p.problemId)?.difficulty === 'hard' && p.solved
    ).length;

    const totalSolved = easySolved + mediumSolved + hardSolved;

    return {
      easy: { solved: easySolved, total: easyTotal },
      medium: { solved: mediumSolved, total: mediumTotal },
      hard: { solved: hardSolved, total: hardTotal },
      total: { solved: totalSolved, total: allProblems.length },
    };
  }, [userProgress]);

  const handleReshuffle = () => {
    setProblems(shuffleArray(allProblems));
  };

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium';
      case 'hard': return 'badge-hard';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      <header className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-[#22C55E]">&lt;g/&gt;</span>
            <span className="text-sm font-semibold text-[white/90]">gencodelab.pro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[white/40]">{stats.total.solved} / {stats.total.total}</span>
            <span className="text-sm text-[white/60]">{currentUser}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-[white/40] hover:text-[white/90] hover:bg-white/5 h-8 w-8"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-6">
            <div>
              <div className="text-lg font-bold text-green-400 font-mono">{stats.easy.solved}<span className="text-[white/40] text-sm font-normal">/{stats.easy.total}</span></div>
              <div className="text-xs text-[white/60]">Easy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400 font-mono">{stats.medium.solved}<span className="text-[white/40] text-sm font-normal">/{stats.medium.total}</span></div>
              <div className="text-xs text-[white/60]">Medium</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400 font-mono">{stats.hard.solved}<span className="text-[white/40] text-sm font-normal">/{stats.hard.total}</span></div>
              <div className="text-xs text-[white/60]">Hard</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReshuffle}
            className="text-[white/40] hover:text-[#22C55E]"
          >
            <Shuffle className="w-3.5 h-3.5 mr-2" />
            Shuffle
          </Button>
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#0D0F14] border-b border-[rgba(255,255,255,0.06)] text-xs text-[white/40] uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2 text-right">Difficulty</div>
          </div>

          <div className="divide-y divide-[rgba(255,255,255,0.06)]">
            {problems.map(problem => {
              const progress = userProgress.problems[problem.id];
              const isSolved = progress?.solved;

              return (
                <div
                  key={problem.id}
                  onClick={() => onSelectProblem(problem)}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-[#12141A] transition-colors cursor-pointer group items-center"
                >
                  <div className="col-span-1">
                    {isSolved ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-[white/20]" />
                    )}
                  </div>
                  <div className="col-span-1 text-[white/40] font-mono text-xs">
                    {problem.id.toString().padStart(3, '0')}
                  </div>
                  <div className={`col-span-5 text-sm ${
                    isSolved ? 'text-[white/60]' : 'text-[white/90] group-hover:text-white'
                  } transition-colors`}>
                    {problem.title}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[white/60] border border-[white/[0.1]] rounded-md px-2 py-1">
                      {getCategoryLabel(problem.category)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-[white/60]">
                      {problem.type === 'find' ? 'Find' : problem.type === 'recall' ? 'Recall' : 'Fix'}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
