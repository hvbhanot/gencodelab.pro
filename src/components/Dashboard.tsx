import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  LogOut, 
  CheckCircle2,
  Circle,
  Trophy,
  Shuffle,
  Bug,
  Code2,
  Shield,
  Zap
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

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'security': return <Shield className="w-3 h-3" />;
    case 'performance': return <Zap className="w-3 h-3" />;
    case 'type': return <Code2 className="w-3 h-3" />;
    case 'logic': return <Bug className="w-3 h-3" />;
    default: return <Code2 className="w-3 h-3" />;
  }
};

const getCategoryLabel = (category: Category) => {
  const labels: Record<Category, string> = {
    'logic': 'Logic',
    'scope': 'Scope',
    'type': 'Type',
    'security': 'Security',
    'performance': 'Perf',
    'concurrency': 'Concurrent',
    'algorithm': 'Algo',
    'syntax': 'Syntax',
    'edge-case': 'Edge Case',
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

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-[#3fb950] bg-[#238636]/20 border-[#238636]/40';
      case 'medium': return 'text-[#d29922] bg-[#d29922]/20 border-[#d29922]/40';
      case 'hard': return 'text-[#da3633] bg-[#da3633]/20 border-[#da3633]/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#238636]">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-[#c9d1d9]">TraceBack</span>
                <span className="ml-3 text-xs text-[#6e7681]">Production Debugging Simulator</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#8b949e]">
                <Trophy className="w-4 h-4 text-[#58a6ff]" />
                <span className="text-sm">{stats.total.solved} / {stats.total.total}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#8b949e]">{currentUser}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#238636]/20 flex items-center justify-center">
                <span className="text-lg font-bold text-[#3fb950]">{stats.easy.solved}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-[#3fb950]">Easy</div>
                <div className="text-xs text-[#6e7681]">{stats.easy.total} problems</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#d29922]/20 flex items-center justify-center">
                <span className="text-lg font-bold text-[#d29922]">{stats.medium.solved}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-[#d29922]">Medium</div>
                <div className="text-xs text-[#6e7681]">{stats.medium.total} problems</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#da3633]/20 flex items-center justify-center">
                <span className="text-lg font-bold text-[#da3633]">{stats.hard.solved}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-[#da3633]">Hard</div>
                <div className="text-xs text-[#6e7681]">{stats.hard.total} problems</div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleReshuffle}
            className="border-[#30363d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9]"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Order
          </Button>
        </div>

        {/* Problem List */}
        <div className="border border-[#30363d] rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#161b22] border-b border-[#30363d] text-sm text-[#8b949e]">
            <div className="col-span-1">Status</div>
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2 text-right">Difficulty</div>
          </div>

          <div className="divide-y divide-[#30363d]">
            {problems.map(problem => {
              const progress = userProgress.problems[problem.id];
              const isSolved = progress?.solved;
              const bestScore = progress?.bestScore || 0;

              return (
                <div
                  key={problem.id}
                  onClick={() => onSelectProblem(problem)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0d1117] hover:bg-[#161b22] transition-colors cursor-pointer group items-center"
                >
                  <div className="col-span-1">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-[#3fb950]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#30363d]" />
                    )}
                  </div>

                  <div className="col-span-1 text-[#6e7681] font-mono text-sm">
                    {problem.id.toString().padStart(3, '0')}
                  </div>

                  <div className={`col-span-5 font-medium ${
                    isSolved ? 'text-[#3fb950]' : 'text-[#c9d1d9] group-hover:text-[#58a6ff]'
                  } transition-colors`}>
                    {problem.title}
                    {isSolved && (
                      <span className="ml-2 text-xs text-[#6e7681]">{bestScore}%</span>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Badge 
                      variant="outline" 
                      className="border-[#30363d] text-[#8b949e] bg-transparent text-xs flex items-center gap-1 w-fit"
                    >
                      {getCategoryIcon(problem.category)}
                      {getCategoryLabel(problem.category)}
                    </Badge>
                  </div>

                  <div className="col-span-1">
                    <span className={`text-xs ${
                      problem.type === 'find' ? 'text-[#58a6ff]'
                        : problem.type === 'recall' ? 'text-[#3fb950]'
                        : 'text-[#a371f7]'
                    }`}>
                      {problem.type === 'find' ? 'Find' : problem.type === 'recall' ? 'Recall' : 'Fix'}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
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
