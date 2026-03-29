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
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#4F8CFF]">&lt;v/&gt;</span>
            <span className="text-sm font-semibold text-[#EDEDED]">vibeclub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#555]">{stats.total.solved} / {stats.total.total}</span>
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-6">
            <div>
              <div className="text-lg font-bold text-green-400 font-mono">{stats.easy.solved}<span className="text-[#444] text-xs font-normal">/{stats.easy.total}</span></div>
              <div className="text-[10px] text-[#555]">Easy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400 font-mono">{stats.medium.solved}<span className="text-[#444] text-xs font-normal">/{stats.medium.total}</span></div>
              <div className="text-[10px] text-[#555]">Medium</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400 font-mono">{stats.hard.solved}<span className="text-[#444] text-xs font-normal">/{stats.hard.total}</span></div>
              <div className="text-[10px] text-[#555]">Hard</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReshuffle}
            className="text-[#555] hover:text-[#4F8CFF]"
          >
            <Shuffle className="w-3.5 h-3.5 mr-2" />
            Shuffle
          </Button>
        </div>

        <div className="rounded-lg border border-[#1E1E1E] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#111] border-b border-[#1E1E1E] text-[10px] text-[#444] uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2 text-right">Difficulty</div>
          </div>

          <div className="divide-y divide-[#1E1E1E]">
            {problems.map(problem => {
              const progress = userProgress.problems[problem.id];
              const isSolved = progress?.solved;

              return (
                <div
                  key={problem.id}
                  onClick={() => onSelectProblem(problem)}
                  className="grid grid-cols-12 gap-4 px-5 py-3 hover:bg-[#141414] transition-colors cursor-pointer group items-center"
                >
                  <div className="col-span-1">
                    {isSolved ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#2A2A2A]" />
                    )}
                  </div>
                  <div className="col-span-1 text-[#444] font-mono text-xs">
                    {problem.id.toString().padStart(3, '0')}
                  </div>
                  <div className={`col-span-5 text-sm ${
                    isSolved ? 'text-[#666]' : 'text-[#EDEDED]/80 group-hover:text-[#EDEDED]'
                  } transition-colors`}>
                    {problem.title}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-[#555] border border-[#1E1E1E] rounded px-1.5 py-0.5">
                      {getCategoryLabel(problem.category)}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-[10px] text-[#555]">
                      {problem.type === 'find' ? 'Find' : problem.type === 'recall' ? 'Recall' : 'Fix'}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getDifficultyBadge(problem.difficulty)}`}>
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
