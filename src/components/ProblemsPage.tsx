import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Circle,
  Shuffle,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Lock,
  ArrowRight
} from 'lucide-react';
import { problems as allProblems } from '@/data/problems';
import type { Problem, Difficulty, UserProgress, Category } from '@/types';

interface ProblemsPageProps {
  userProgress: UserProgress;
  onSelectProblem: (problem: Problem) => void;
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
    case 'type': return <Target className="w-3 h-3" />;
    case 'logic': return <TrendingUp className="w-3 h-3" />;
    default: return <Target className="w-3 h-3" />;
  }
};

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

const getCategoryColor = (category: Category) => {
  const colors: Record<Category, string> = {
    'security': 'text-red-400 border-red-400/30 bg-red-400/10',
    'performance': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    'type': 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    'logic': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    'scope': 'text-pink-400 border-pink-400/30 bg-pink-400/10',
    'concurrency': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    'algorithm': 'text-green-400 border-green-400/30 bg-green-400/10',
    'syntax': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    'edge-case': 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
    'pitfall': 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    'oop': 'text-teal-400 border-teal-400/30 bg-teal-400/10',
    'advanced': 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  };
  return colors[category] || 'text-gray-400 border-gray-400/30 bg-gray-400/10';
};

export function ProblemsPage({ userProgress, onSelectProblem }: ProblemsPageProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isLoggedIn = userProgress.username !== '';

  useEffect(() => {
    setProblems(shuffleArray(allProblems));
  }, []);

  const handleProblemClick = (problem: Problem) => {
    if (isLoggedIn) {
      onSelectProblem(problem);
    } else {
      setShowLoginPrompt(true);
    }
  };

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

  const progressPercent = Math.round((stats.total.solved / stats.total.total) * 100);

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold gradient-text mb-4">Debug Like a Pro</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              100 production-ready bugs waiting to be squashed. 
              From type errors to security vulnerabilities, level up your debugging game.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Progress Card */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Progress</span>
                <span className="text-2xl font-bold gradient-text">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{stats.total.solved} of {stats.total.total} solved</p>
            </div>

            {/* Easy Stats */}
            <div className="glass-card rounded-xl p-5 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-400">{stats.easy.solved}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-400">Easy</div>
                  <div className="text-xs text-gray-500">{stats.easy.total} problems</div>
                </div>
              </div>
            </div>

            {/* Medium Stats */}
            <div className="glass-card rounded-xl p-5 border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-400">{stats.medium.solved}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-yellow-400">Medium</div>
                  <div className="text-xs text-gray-500">{stats.medium.total} problems</div>
                </div>
              </div>
            </div>

            {/* Hard Stats */}
            <div className="glass-card rounded-xl p-5 border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-400">{stats.hard.solved}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-red-400">Hard</div>
                  <div className="text-xs text-gray-500">{stats.hard.total} problems</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shuffle Button */}
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              onClick={handleReshuffle}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle Order
            </Button>
          </div>

          {/* Problem List */}
          <div className="glass-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-purple-500/20 text-sm text-gray-500 font-medium">
              <div className="col-span-1">Status</div>
              <div className="col-span-1">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2 text-right">Difficulty</div>
            </div>

            {/* Problems */}
            <div className="divide-y divide-purple-500/10">
              {problems.map((problem, index) => {
                const progress = userProgress.problems[problem.id];
                const isSolved = progress?.solved;
                const displayNumber = String(index + 1).padStart(3, '0');

                return (
                  <div
                    key={problem.id}
                    onClick={() => handleProblemClick(problem)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-all cursor-pointer group items-center"
                  >
                    {/* Status */}
                    <div className="col-span-1">
                      {isSolved ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-700" />
                      )}
                    </div>

                    {/* Number */}
                    <div className="col-span-1 text-gray-600 font-mono text-sm">
                      {displayNumber}
                    </div>

                    {/* Title */}
                    <div className={`col-span-5 font-medium ${
                      isSolved ? 'text-green-400' : 'text-gray-200 group-hover:text-cyan-400'
                    } transition-colors`}>
                      {problem.title}
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs flex items-center gap-1 w-fit ${getCategoryColor(problem.category)}`}
                      >
                        {getCategoryIcon(problem.category)}
                        {getCategoryLabel(problem.category)}
                      </Badge>
                    </div>

                    {/* Type */}
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        problem.type === 'find'
                          ? 'bg-purple-500/20 text-purple-400'
                          : problem.type === 'recall'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {problem.type === 'find' ? 'Find' : problem.type === 'recall' ? 'Recall' : 'Fix'}
                      </span>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2 text-right">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getDifficultyBadge(problem.difficulty)}`}>
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-purple-500/30">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Login Required</h3>
            <p className="text-gray-400 mb-6">
              Sign in to start solving problems and track your progress. It's free!
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white px-6"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLoginPrompt(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
