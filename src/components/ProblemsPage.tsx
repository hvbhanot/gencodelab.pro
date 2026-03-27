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
  ArrowRight,
  Eye,
  Terminal,
  RefreshCw,
  Search,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { problems as allProblems } from '@/data/problems';
import type { Problem, Difficulty, UserProgress, Category, ProblemType } from '@/types';

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

const typeConfig: Record<ProblemType, { label: string; color: string; icon: typeof Eye }> = {
  find: { label: 'Find', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: Eye },
  fix: { label: 'Fix', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25', icon: Terminal },
  recall: { label: 'Recall', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: RefreshCw },
};

const allCategories: Category[] = [
  'logic', 'scope', 'type', 'security', 'performance', 'concurrency',
  'algorithm', 'syntax', 'edge-case', 'pitfall', 'oop', 'advanced'
];

export function ProblemsPage({ userProgress, onSelectProblem }: ProblemsPageProps) {
  const [shuffledProblems, setShuffledProblems] = useState<Problem[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProblemType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const isLoggedIn = userProgress.username !== '';

  useEffect(() => {
    setShuffledProblems(shuffleArray(allProblems));
  }, []);

  const filteredProblems = useMemo(() => {
    return shuffledProblems.filter(p => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter === 'solved' && !userProgress.problems[p.id]?.solved) return false;
      if (statusFilter === 'unsolved' && userProgress.problems[p.id]?.solved) return false;
      return true;
    });
  }, [shuffledProblems, searchQuery, difficultyFilter, typeFilter, categoryFilter, statusFilter, userProgress]);

  const activeFilterCount = [
    difficultyFilter !== 'all',
    typeFilter !== 'all',
    categoryFilter !== 'all',
    statusFilter !== 'all',
    searchQuery !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

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
    setShuffledProblems(shuffleArray(allProblems));
  };

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium';
      case 'hard': return 'badge-hard';
    }
  };

  const progressPercent = stats.total.total > 0 ? Math.round((stats.total.solved / stats.total.total) * 100) : 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="relative pt-8 pb-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {/* Progress */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Progress</span>
                <span className="text-xl font-bold gradient-text">{progressPercent}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{stats.total.solved}/{stats.total.total} solved</p>
            </div>

            {/* Easy */}
            <div
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${difficultyFilter === 'easy' ? 'border-green-500/40 bg-green-500/5' : 'hover:border-green-500/20'}`}
              onClick={() => setDifficultyFilter(difficultyFilter === 'easy' ? 'all' : 'easy')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Easy</div>
                  <div className="text-lg font-bold text-green-400">{stats.easy.solved}<span className="text-gray-600 text-sm font-normal">/{stats.easy.total}</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
            </div>

            {/* Medium */}
            <div
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${difficultyFilter === 'medium' ? 'border-yellow-500/40 bg-yellow-500/5' : 'hover:border-yellow-500/20'}`}
              onClick={() => setDifficultyFilter(difficultyFilter === 'medium' ? 'all' : 'medium')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Medium</div>
                  <div className="text-lg font-bold text-yellow-400">{stats.medium.solved}<span className="text-gray-600 text-sm font-normal">/{stats.medium.total}</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                </div>
              </div>
            </div>

            {/* Hard */}
            <div
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${difficultyFilter === 'hard' ? 'border-red-500/40 bg-red-500/5' : 'hover:border-red-500/20'}`}
              onClick={() => setDifficultyFilter(difficultyFilter === 'hard' ? 'all' : 'hard')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Hard</div>
                  <div className="text-lg font-bold text-red-400">{stats.hard.solved}<span className="text-gray-600 text-sm font-normal">/{stats.hard.total}</span></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="glass-card rounded-xl p-3 mb-6" style={{ overflow: 'visible' }}>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-px h-7 bg-white/10 hidden md:block" />

              {/* Type Filter */}
              <div className="flex items-center gap-1">
                {(['find', 'fix', 'recall'] as ProblemType[]).map(type => {
                  const cfg = typeConfig[type];
                  const Icon = cfg.icon;
                  const isActive = typeFilter === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(isActive ? 'all' : type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive
                          ? cfg.color + ' border-current/20'
                          : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <div className="w-px h-7 bg-white/10 hidden md:block" />

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    categoryFilter !== 'all'
                      ? getCategoryColor(categoryFilter) + ' border-current/20'
                      : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {categoryFilter !== 'all' ? getCategoryLabel(categoryFilter) : 'Category'}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                    <div className="absolute top-full mt-1 left-0 z-50 w-48 rounded-lg border border-white/10 py-1 shadow-2xl bg-[#141420] max-h-[400px] overflow-y-auto">
                      <button
                        onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${categoryFilter === 'all' ? 'text-white' : 'text-gray-400'}`}
                      >
                        All Categories
                      </button>
                      {allCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors flex items-center gap-2 ${categoryFilter === cat ? 'text-white' : 'text-gray-400'}`}
                        >
                          {getCategoryIcon(cat)}
                          {getCategoryLabel(cat)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status Filter */}
              {isLoggedIn && (
                <>
                  <div className="w-px h-7 bg-white/10 hidden md:block" />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setStatusFilter(statusFilter === 'solved' ? 'all' : 'solved')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        statusFilter === 'solved'
                          ? 'bg-green-500/15 text-green-400 border-green-500/25'
                          : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Solved
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === 'unsolved' ? 'all' : 'unsolved')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        statusFilter === 'unsolved'
                          ? 'bg-gray-500/15 text-gray-300 border-gray-500/25'
                          : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Circle className="w-3 h-3" />
                      Unsolved
                    </button>
                  </div>
                </>
              )}

              {/* Spacer + Actions */}
              <div className="flex-1" />

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear ({activeFilterCount})
                </button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReshuffle}
                className="text-gray-500 hover:text-purple-400 h-8 px-2.5"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs text-gray-500">
              {filteredProblems.length === allProblems.length
                ? `${allProblems.length} problems`
                : `${filteredProblems.length} of ${allProblems.length} problems`
              }
            </span>
          </div>

          {/* Problem List */}
          <div className="glass-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/5 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-1">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Mode</div>
              <div className="col-span-2 text-right">Difficulty</div>
            </div>

            {/* Problems */}
            {filteredProblems.length > 0 ? (
              <div className="divide-y divide-white/[0.03]">
                {filteredProblems.map((problem, index) => {
                  const progress = userProgress.problems[problem.id];
                  const isSolved = progress?.solved;
                  const displayNumber = String(index + 1).padStart(3, '0');
                  const tc = typeConfig[problem.type];

                  return (
                    <div
                      key={problem.id}
                      onClick={() => handleProblemClick(problem)}
                      className={`grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-all cursor-pointer group items-center ${
                        isSolved ? 'bg-green-500/[0.02]' : ''
                      }`}
                    >
                      {/* Status */}
                      <div className="col-span-1">
                        {isSolved ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-green-400" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-gray-700 group-hover:text-gray-500 transition-colors" />
                        )}
                      </div>

                      {/* Number */}
                      <div className="col-span-1 text-gray-600 font-mono text-xs">
                        {displayNumber}
                      </div>

                      {/* Title */}
                      <div className={`col-span-5 font-medium text-sm ${
                        isSolved ? 'text-green-400/80' : 'text-gray-300 group-hover:text-white'
                      } transition-colors`}>
                        {problem.title}
                      </div>

                      {/* Category */}
                      <div className="col-span-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] flex items-center gap-1 w-fit px-2 py-0.5 ${getCategoryColor(problem.category)}`}
                        >
                          {getCategoryIcon(problem.category)}
                          {getCategoryLabel(problem.category)}
                        </Badge>
                      </div>

                      {/* Type */}
                      <div className="col-span-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${tc.color} inline-flex items-center gap-1`}>
                          <tc.icon className="w-2.5 h-2.5" />
                          {tc.label}
                        </span>
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2 text-right">
                        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="text-gray-600 text-sm mb-3">No problems match your filters</div>
                <button
                  onClick={clearAllFilters}
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
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
