import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Shuffle,
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

const typeConfig: Record<ProblemType, { label: string; icon: typeof Eye }> = {
  find: { label: 'Find', icon: Eye },
  fix: { label: 'Fix', icon: Terminal },
  recall: { label: 'Recall', icon: RefreshCw },
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const isLoggedIn = userProgress.username !== '';

  const openCategoryDropdown = () => {
    if (categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowCategoryDropdown(prev => !prev);
  };

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
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Progress */}
          <div className="rounded-lg border border-[#1E1E1E] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#555] text-xs">Progress</span>
              <span className="text-sm font-bold text-[#4F8CFF] font-mono">{progressPercent}%</span>
            </div>
            <div className="h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F8CFF] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-[#444] mt-2">{stats.total.solved}/{stats.total.total} solved</p>
          </div>

          {/* Easy */}
          <div
            className={`rounded-lg border p-4 cursor-pointer transition-colors ${
              difficultyFilter === 'easy' ? 'border-green-500/30 bg-green-500/5' : 'border-[#1E1E1E] hover:border-[#2A2A2A]'
            }`}
            onClick={() => setDifficultyFilter(difficultyFilter === 'easy' ? 'all' : 'easy')}
          >
            <div className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Easy</div>
            <div className="text-lg font-bold text-green-400 font-mono">
              {stats.easy.solved}<span className="text-[#444] text-xs font-normal">/{stats.easy.total}</span>
            </div>
          </div>

          {/* Medium */}
          <div
            className={`rounded-lg border p-4 cursor-pointer transition-colors ${
              difficultyFilter === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-[#1E1E1E] hover:border-[#2A2A2A]'
            }`}
            onClick={() => setDifficultyFilter(difficultyFilter === 'medium' ? 'all' : 'medium')}
          >
            <div className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Medium</div>
            <div className="text-lg font-bold text-yellow-400 font-mono">
              {stats.medium.solved}<span className="text-[#444] text-xs font-normal">/{stats.medium.total}</span>
            </div>
          </div>

          {/* Hard */}
          <div
            className={`rounded-lg border p-4 cursor-pointer transition-colors ${
              difficultyFilter === 'hard' ? 'border-red-500/30 bg-red-500/5' : 'border-[#1E1E1E] hover:border-[#2A2A2A]'
            }`}
            onClick={() => setDifficultyFilter(difficultyFilter === 'hard' ? 'all' : 'hard')}
          >
            <div className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Hard</div>
            <div className="text-lg font-bold text-red-400 font-mono">
              {stats.hard.solved}<span className="text-[#444] text-xs font-normal">/{stats.hard.total}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-lg border border-[#1E1E1E] p-3 mb-4" style={{ overflow: 'visible' }}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111] border border-[#1E1E1E] rounded-md pl-9 pr-3 py-1.5 text-sm text-[#EDEDED] placeholder-[#444] focus:outline-none focus:border-[#4F8CFF] transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#EDEDED]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-[#1E1E1E] hidden md:block" />

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
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'text-[#4F8CFF] bg-[#4F8CFF]/10'
                        : 'text-[#555] hover:text-[#EDEDED] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            <div className="w-px h-6 bg-[#1E1E1E] hidden md:block" />

            {/* Category Dropdown */}
            <button
              ref={categoryBtnRef}
              onClick={openCategoryDropdown}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                categoryFilter !== 'all'
                  ? 'text-[#4F8CFF] bg-[#4F8CFF]/10'
                  : 'text-[#555] hover:text-[#EDEDED] hover:bg-[#1E1E1E]'
              }`}
            >
              <Filter className="w-3 h-3" />
              {categoryFilter !== 'all' ? getCategoryLabel(categoryFilter) : 'Category'}
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Status Filter */}
            {isLoggedIn && (
              <>
                <div className="w-px h-6 bg-[#1E1E1E] hidden md:block" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'solved' ? 'all' : 'solved')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                      statusFilter === 'solved'
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-[#555] hover:text-[#EDEDED] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Solved
                  </button>
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'unsolved' ? 'all' : 'unsolved')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                      statusFilter === 'unsolved'
                        ? 'text-[#EDEDED] bg-[#1E1E1E]'
                        : 'text-[#555] hover:text-[#EDEDED] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <Circle className="w-3 h-3" />
                    Unsolved
                  </button>
                </div>
              </>
            )}

            <div className="flex-1" />

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#555] hover:text-[#EDEDED] hover:bg-[#1E1E1E] transition-colors"
              >
                <X className="w-3 h-3" />
                Clear ({activeFilterCount})
              </button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReshuffle}
              className="text-[#555] hover:text-[#4F8CFF] h-7 w-7 p-0"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] text-[#444]">
            {filteredProblems.length === allProblems.length
              ? `${allProblems.length} problems`
              : `${filteredProblems.length} of ${allProblems.length} problems`
            }
          </span>
        </div>

        {/* Problem List */}
        <div className="rounded-lg border border-[#1E1E1E] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#111] border-b border-[#1E1E1E] text-[10px] text-[#444] uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Mode</div>
            <div className="col-span-2 text-right">Difficulty</div>
          </div>

          {/* Problems */}
          {filteredProblems.length > 0 ? (
            <div className="divide-y divide-[#1E1E1E]">
              {filteredProblems.map((problem, index) => {
                const progress = userProgress.problems[problem.id];
                const isSolved = progress?.solved;
                const displayNumber = String(index + 1).padStart(3, '0');
                const tc = typeConfig[problem.type];

                return (
                  <div
                    key={problem.id}
                    onClick={() => handleProblemClick(problem)}
                    className={`grid grid-cols-12 gap-4 px-5 py-3 hover:bg-[#141414] transition-colors cursor-pointer group items-center`}
                  >
                    <div className="col-span-1">
                      {isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#2A2A2A] group-hover:text-[#444] transition-colors" />
                      )}
                    </div>

                    <div className="col-span-1 text-[#444] font-mono text-xs">
                      {displayNumber}
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
                      <span className="text-[10px] text-[#555] flex items-center gap-1">
                        <tc.icon className="w-2.5 h-2.5" />
                        {tc.label}
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
          ) : (
            <div className="py-16 text-center">
              <div className="text-[#444] text-sm mb-3">No problems match your filters</div>
              <button
                onClick={clearAllFilters}
                className="text-[#4F8CFF] text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="rounded-lg border border-[#1E1E1E] bg-[#141414] p-8 max-w-sm w-full text-center">
            <Lock className="w-8 h-8 text-[#4F8CFF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#EDEDED] mb-2">Sign in required</h3>
            <p className="text-[#555] text-sm mb-6">
              Sign in to solve problems and track progress.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-[#4F8CFF] hover:bg-[#3D7AED] text-white px-5 h-9 rounded-md text-sm"
              >
                Sign in
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowLoginPrompt(false)}
                className="text-[#666] hover:text-[#EDEDED] hover:bg-[#1E1E1E] h-9 rounded-md text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Dropdown Portal */}
      {showCategoryDropdown && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowCategoryDropdown(false)} />
          <div
            className="fixed w-44 rounded-md border border-[#1E1E1E] py-1 bg-[#141414] max-h-[400px] overflow-y-auto"
            style={{ zIndex: 9999, top: dropdownPos.top, left: dropdownPos.left }}
          >
            <button
              onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#1E1E1E] transition-colors ${categoryFilter === 'all' ? 'text-[#EDEDED]' : 'text-[#555]'}`}
            >
              All Categories
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#1E1E1E] transition-colors ${categoryFilter === cat ? 'text-[#EDEDED]' : 'text-[#555]'}`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
