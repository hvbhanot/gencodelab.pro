import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AuthForm } from './AuthForm';
import {
  CheckCircle2,
  Search,
  X,
  Lock,
  ArrowRight,
  Trophy,
  TrendingUp,
  Flame,
  ChevronDown,
  Bookmark,
  ArrowUpDown,
  Eye,
  Terminal,
  RefreshCw,
  Award,
  Target,
} from 'lucide-react';
import { problems as allProblems } from '@/data/problems';
import type { Problem, Difficulty, UserProgress, Category, ProblemType } from '@/types';

interface LeaderboardEntry { rank: number; username: string; totalScore: number; solvedCount: number; }

interface ProblemsPageProps {
  userProgress: UserProgress;
  onSelectProblem: (problem: Problem) => void;
  currentUser?: string;
  currentStreak?: number;
  dailyProblem?: Problem | null;
  leaderboard?: LeaderboardEntry[];
  bookmarks?: number[];
  onToggleBookmark?: (problemId: number) => void;
  onLogin?: (username: string, password: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  onRegister?: (username: string, password: string, email: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
}

const getCategoryLabel = (category: Category) => {
  const labels: Record<Category, string> = {
    'logic': 'Logic', 'scope': 'Scope', 'type': 'Type', 'security': 'Security',
    'performance': 'Perf', 'concurrency': 'Async', 'algorithm': 'Algo',
    'syntax': 'Syntax', 'edge-case': 'Edge Cases', 'pitfall': 'Pitfall',
    'oop': 'OOP', 'advanced': 'Advanced'
  };
  return labels[category] || category;
};

const modeConfig: Record<ProblemType, { label: string; icon: typeof Eye; color: string }> = {
  find: { label: 'Find', icon: Eye, color: 'text-[#A78BFA]' },
  fix: { label: 'Fix', icon: Terminal, color: 'text-[#4ADE80]' },
  recall: { label: 'Recall', icon: RefreshCw, color: 'text-[#FBBF24]' },
};

const allCategories: Category[] = [
  'logic', 'scope', 'type', 'security', 'performance', 'concurrency',
  'algorithm', 'syntax', 'edge-case', 'pitfall', 'oop', 'advanced'
];

type SortKey = 'default' | 'difficulty' | 'category' | 'status';

const categoryCount = (cat: Category) => allProblems.filter(p => p.category === cat).length;

export function ProblemsPage({
  userProgress,
  onSelectProblem,
  currentUser,
  currentStreak = 0,
  dailyProblem,
  leaderboard = [],
  bookmarks = [],
  onToggleBookmark,
  onLogin,
  onRegister,
}: ProblemsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved' | 'bookmarked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [pendingProblem, setPendingProblem] = useState<Problem | null>(null);
  const PROBLEMS_PER_PAGE = 15;
  const isLoggedIn = !!currentUser;

  const filteredAndSorted = useMemo(() => {
    let result = allProblems.filter(p => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter === 'solved' && !userProgress.problems[p.id]?.solved) return false;
      if (statusFilter === 'unsolved' && userProgress.problems[p.id]?.solved) return false;
      if (statusFilter === 'bookmarked' && !bookmarks.includes(p.id)) return false;
      return true;
    });
    if (sortKey === 'difficulty') { const o: Record<string, number> = { easy: 0, medium: 1, hard: 2 }; result = [...result].sort((a, b) => o[a.difficulty] - o[b.difficulty]); }
    else if (sortKey === 'category') result = [...result].sort((a, b) => a.category.localeCompare(b.category));
    else if (sortKey === 'status') result = [...result].sort((a, b) => (userProgress.problems[a.id]?.solved ? 1 : 0) - (userProgress.problems[b.id]?.solved ? 1 : 0));
    return result;
  }, [searchQuery, difficultyFilter, categoryFilter, statusFilter, userProgress, sortKey, bookmarks]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, difficultyFilter, categoryFilter, statusFilter, sortKey]);

  const totalPages = Math.ceil(filteredAndSorted.length / PROBLEMS_PER_PAGE);
  const paginatedProblems = filteredAndSorted.slice((currentPage - 1) * PROBLEMS_PER_PAGE, currentPage * PROBLEMS_PER_PAGE);
  const globalIndexOffset = (currentPage - 1) * PROBLEMS_PER_PAGE;

  const handleProblemClick = (problem: Problem) => {
    if (isLoggedIn) {
      onSelectProblem(problem);
      return;
    }

    setPendingProblem(problem);
    setShowLoginPrompt(true);
  };
  const handleBookmark = useCallback((e: React.MouseEvent, problemId: number) => { e.stopPropagation(); onToggleBookmark?.(problemId); }, [onToggleBookmark]);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthForm(false);
    setShowLoginPrompt(false);
    if (pendingProblem) {
      onSelectProblem(pendingProblem);
      setPendingProblem(null);
    }
  }, [onSelectProblem, pendingProblem]);

  if (showAuthForm && onLogin && onRegister) {
    return (
      <AuthForm
        onLogin={onLogin}
        onRegister={onRegister}
        initialMode="login"
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthForm(false);
          setPendingProblem(null);
        }}
      />
    );
  }

  const stats = useMemo(() => {
    const count = (d: Difficulty) => allProblems.filter(p => p.difficulty === d).length;
    const solved = (d: Difficulty) => Object.values(userProgress.problems).filter(p => allProblems.find(prob => prob.id === p.problemId)?.difficulty === d && p.solved).length;
    const totalSolved = solved('easy') + solved('medium') + solved('hard');
    return { easy: { solved: solved('easy'), total: count('easy') }, medium: { solved: solved('medium'), total: count('medium') }, hard: { solved: solved('hard'), total: count('hard') }, total: { solved: totalSolved, total: allProblems.length } };
  }, [userProgress]);

  // Category mastery
  const categoryMastery = useMemo(() => {
    return allCategories.map(cat => {
      const total = allProblems.filter(p => p.category === cat).length;
      const solved = Object.values(userProgress.problems).filter(p => {
        const prob = allProblems.find(pr => pr.id === p.problemId);
        return prob?.category === cat && p.solved;
      }).length;
      return { category: cat, solved, total, percent: total > 0 ? Math.round((solved / total) * 100) : 0 };
    });
  }, [userProgress]);

  // Achievements
  const achievements = useMemo(() => {
    const totalSolved = stats.total.solved;
    const allEasy = stats.easy.solved === stats.easy.total && stats.easy.total > 0;
    const allMedium = stats.medium.solved === stats.medium.total && stats.medium.total > 0;
    const allHard = stats.hard.solved === stats.hard.total && stats.hard.total > 0;
    const perfectScores = Object.values(userProgress.problems).filter(p => {
      const prob = allProblems.find(pr => pr.id === p.problemId);
      if (!prob) return false;
      const max = prob.difficulty === 'easy' ? 10 : prob.difficulty === 'medium' ? 20 : 30;
      return p.bestScore === max;
    }).length;

    return [
      { id: 'first', label: 'First Solve', desc: 'Solve your first problem', unlocked: totalSolved >= 1, icon: '🎯' },
      { id: 'ten', label: 'Getting Started', desc: 'Solve 10 problems', unlocked: totalSolved >= 10, icon: '🔥' },
      { id: 'fifty', label: 'Halfway There', desc: 'Solve 50 problems', unlocked: totalSolved >= 50, icon: '⚡' },
      { id: 'hundred', label: 'Centurion', desc: 'Solve 100 problems', unlocked: totalSolved >= 100, icon: '💯' },
      { id: 'all_easy', label: 'Easy Sweep', desc: 'Complete all easy problems', unlocked: allEasy, icon: '🟢' },
      { id: 'all_medium', label: 'Medium Master', desc: 'Complete all medium problems', unlocked: allMedium, icon: '🟡' },
      { id: 'all_hard', label: 'Hard Crusher', desc: 'Complete all hard problems', unlocked: allHard, icon: '🔴' },
      { id: 'perfect5', label: 'Perfectionist', desc: 'Get 5 perfect scores (no hints)', unlocked: perfectScores >= 5, icon: '💎' },
      { id: 'streak3', label: 'On Fire', desc: '3+ day streak', unlocked: currentStreak >= 3, icon: '🔥' },
      { id: 'streak7', label: 'Week Warrior', desc: '7+ day streak', unlocked: currentStreak >= 7, icon: '⚔️' },
    ];
  }, [stats, userProgress, currentStreak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const topLeaderboard = leaderboard.slice(0, 7);

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ===== LEFT SIDEBAR ===== */}
          {isLoggedIn && (
            <div className="w-full lg:w-[340px] lg:flex-shrink-0 space-y-5">
              {/* Leaderboard */}
              <div className="rounded-xl border border-white/[0.06] bg-[#12141A] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-[#FBBF24]" />
                  <h2 className="text-[15px] font-semibold text-white/90">Leaderboard</h2>
                </div>
                <div className="grid grid-cols-[30px_1fr_50px_60px] items-center text-[12px] text-white/30 mb-2 px-1">
                  <span>Rank</span><span>User</span><span className="text-right">Solved</span><span className="text-right font-semibold">Points</span>
                </div>
                <div className="space-y-1">
                  {topLeaderboard.map((entry) => {
                    const isMe = entry.username === currentUser;
                    return (
                      <div key={entry.username} className={`grid grid-cols-[30px_1fr_50px_60px] items-center py-2.5 px-2 rounded-lg ${entry.rank <= 3 ? 'bg-[#FBBF24]/[0.05]' : isMe ? 'bg-[#4ADE80]/[0.05]' : 'hover:bg-white/[0.02]'}`}>
                        <span className={`text-[13px] font-mono ${entry.rank <= 3 ? 'text-[#FBBF24] font-bold' : 'text-white/30'}`}>{entry.rank}</span>
                        <span className={`text-[13px] font-medium truncate ${isMe ? 'text-[#4ADE80]' : 'text-white/70'}`}>{entry.username}</span>
                        <span className="text-[13px] text-white/30 text-right font-mono">{entry.solvedCount}</span>
                        <span className={`text-[13px] text-right font-mono font-bold ${entry.rank <= 3 ? 'text-[#FBBF24]' : 'text-white/70'}`}>{entry.totalScore}</span>
                      </div>
                    );
                  })}
                  {topLeaderboard.length === 0 && <p className="text-white/20 text-sm py-4 text-center">No scores yet</p>}
                </div>
              </div>

              {/* Your Progress */}
              <div className="rounded-xl border border-white/[0.06] bg-[#12141A] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#4ADE80]" />
                  <h2 className="text-[15px] font-semibold text-white/90">Your Progress</h2>
                </div>
                <div className="mb-4">
                  <p className="text-[12px] text-white/30 mb-1">Total Solved</p>
                  <p className="text-4xl font-bold font-mono text-[#4ADE80]">{stats.total.solved}</p>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[#F97316]/[0.06] border border-[#F97316]/[0.1]">
                    <Flame className="w-4 h-4 text-[#F97316]" />
                    <span className="text-[13px] font-semibold text-[#F97316]">{currentStreak} day streak</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { label: 'Easy', s: stats.easy.solved, t: stats.easy.total, color: '#4ADE80' },
                    { label: 'Medium', s: stats.medium.solved, t: stats.medium.total, color: '#FBBF24' },
                    { label: 'Hard', s: stats.hard.solved, t: stats.hard.total, color: '#F87171' },
                  ]).map(d => (
                    <div key={d.label} className="bg-white/[0.03] rounded-lg p-3">
                      <p className="text-[11px] text-white/30 mb-1">{d.label}</p>
                      <p className="text-xl font-bold font-mono" style={{ color: d.color }}>{d.s}</p>
                      <p className="text-[11px] text-white/20 font-mono">/ {d.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Mastery */}
              <div className="rounded-xl border border-white/[0.06] bg-[#12141A] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#A78BFA]" />
                  <h2 className="text-[15px] font-semibold text-white/90">Category Mastery</h2>
                </div>
                <div className="space-y-3">
                  {categoryMastery.map(cm => (
                    <div key={cm.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-white/60">{getCategoryLabel(cm.category)}</span>
                        <span className="text-[12px] font-mono text-white/40">{cm.solved}/{cm.total}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{
                          width: `${cm.percent}%`,
                          background: cm.percent === 100 ? '#4ADE80' : cm.percent > 50 ? '#FBBF24' : '#A78BFA',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="rounded-xl border border-white/[0.06] bg-[#12141A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FBBF24]" />
                    <h2 className="text-[15px] font-semibold text-white/90">Achievements</h2>
                  </div>
                  <span className="text-[12px] font-mono text-white/30">{unlockedCount}/{achievements.length}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {achievements.map(a => (
                    <div key={a.id} title={`${a.label}: ${a.desc}`}
                      className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
                        a.unlocked ? 'bg-white/[0.06]' : 'bg-white/[0.02] opacity-30 grayscale'
                      }`}>
                      {a.icon}
                    </div>
                  ))}
                </div>
                {/* Show latest unlocked */}
                {achievements.filter(a => a.unlocked).slice(-1).map(a => (
                  <div key={a.id} className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-[12px] text-white/50"><span className="mr-1">{a.icon}</span> <b className="text-white/70">{a.label}</b> — {a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0">
            {/* Daily Challenge */}
            {dailyProblem && isLoggedIn && (
              <div onClick={() => handleProblemClick(dailyProblem)} className="mb-6 rounded-xl border border-[#FBBF24]/20 bg-[#FBBF24]/[0.04] p-5 cursor-pointer hover:bg-[#FBBF24]/[0.06] transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#FBBF24] uppercase tracking-wider mb-1">Problem of the Day</p>
                    <p className="text-[16px] font-semibold text-white/90">{dailyProblem.title}</p>
                    <p className="text-[13px] text-white/40 mt-0.5 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Give it a try today</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-md">{getCategoryLabel(dailyProblem.category)}</span>
                    <span className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${dailyProblem.difficulty === 'easy' ? 'badge-easy' : dailyProblem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{dailyProblem.difficulty.charAt(0).toUpperCase() + dailyProblem.difficulty.slice(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => setCategoryFilter('all')} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all border ${categoryFilter === 'all' ? 'bg-[#4ADE80] text-black border-[#4ADE80]' : 'text-white/50 border-white/[0.08] hover:border-white/[0.15] hover:text-white/70'}`}>
                All <span className="text-[11px] opacity-60 ml-0.5">{allProblems.length}</span>
              </button>
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all border ${categoryFilter === cat ? 'bg-[#4ADE80] text-black border-[#4ADE80]' : 'text-white/50 border-white/[0.08] hover:border-white/[0.15] hover:text-white/70'}`}>
                  {getCategoryLabel(cat)} <span className="text-[11px] opacity-60 ml-0.5">{categoryCount(cat)}</span>
                </button>
              ))}
            </div>

            {/* Search + filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="text" placeholder="Search problems..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#12141A] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white/90 placeholder-white/30 focus:outline-none focus:border-[#4ADE80]/40 focus:ring-1 focus:ring-[#4ADE80]/20 transition-all" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <button onClick={() => setStatusFilter(s => s === 'all' ? 'solved' : s === 'solved' ? 'unsolved' : s === 'unsolved' ? 'bookmarked' : 'all')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#12141A] border border-white/[0.06] text-white/50 hover:text-white/70 transition-all">
                Status{statusFilter !== 'all' && <span className="text-[#4ADE80]">: {statusFilter}</span>}<ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDifficultyFilter(d => d === 'all' ? 'easy' : d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : 'all')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#12141A] border border-white/[0.06] text-white/50 hover:text-white/70 transition-all">
                Difficulty{difficultyFilter !== 'all' && <span className={difficultyFilter === 'easy' ? 'text-[#4ADE80]' : difficultyFilter === 'medium' ? 'text-[#FBBF24]' : 'text-[#F87171]'}>: {difficultyFilter}</span>}<ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setSortKey(s => s === 'default' ? 'difficulty' : s === 'difficulty' ? 'category' : s === 'category' ? 'status' : 'default')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#12141A] border border-white/[0.06] text-white/50 hover:text-white/70 transition-all">
                <ArrowUpDown className="w-3.5 h-3.5" />Sort{sortKey !== 'default' && <span className="text-[#4ADE80]">: {sortKey}</span>}
              </button>
            </div>

            {/* Count */}
            <div className="mb-3 px-2"><span className="text-[13px] text-white/30">{filteredAndSorted.length} problems</span></div>

            {/* Table */}
            <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-[#12141A]">
              <div className="hidden md:grid grid-cols-[40px_40px_1fr_100px_140px_100px_40px] items-center px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="text-[13px] font-medium text-white/40">Status</span>
                <span className="text-[13px] font-medium text-white/40">#</span>
                <span className="text-[13px] font-medium text-white/40">Problem</span>
                <span className="text-[13px] font-medium text-white/40">Mode</span>
                <span className="text-[13px] font-medium text-white/40">Topics</span>
                <span className="text-[13px] font-medium text-white/40 text-right">Difficulty</span>
                <span></span>
              </div>

              {paginatedProblems.length > 0 ? (
                paginatedProblems.map((problem, index) => {
                  const progress = userProgress.problems[problem.id];
                  const isSolved = progress?.solved;
                  const isBookmarked = bookmarks.includes(problem.id);
                  const mc = modeConfig[problem.type];
                  const ModeIcon = mc.icon;

                  return (
                    <div key={problem.id} onClick={() => handleProblemClick(problem)}
                      className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[40px_40px_1fr_100px_140px_100px_40px] items-center px-4 md:px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors group">
                      <div>{isSolved ? <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" /> : <span className="text-white/20 text-sm">—</span>}</div>
                      <span className="hidden md:block text-[14px] font-mono text-white/25">{globalIndexOffset + index + 1}.</span>
                      <span className={`text-[14px] md:text-[15px] font-medium pr-2 md:pr-4 truncate ${isSolved ? 'text-white/50' : 'text-white/85 group-hover:text-white'} transition-colors`}>{problem.title}</span>
                      {/* Mode */}
                      <div className="hidden md:flex items-center gap-1.5">
                        <ModeIcon className={`w-3.5 h-3.5 ${mc.color}`} />
                        <span className={`text-[12px] font-medium ${mc.color}`}>{mc.label}</span>
                      </div>
                      {/* Category */}
                      <div className="hidden md:flex flex-wrap gap-1.5">
                        <span className="text-[12px] text-white/50 bg-white/[0.06] px-2.5 py-1 rounded-md">{getCategoryLabel(problem.category)}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[12px] font-semibold px-3 py-1 rounded-full border inline-block ${problem.difficulty === 'easy' ? 'badge-easy' : problem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </div>
                      {isLoggedIn && (
                        <div className="hidden md:flex justify-center">
                          <button onClick={(e) => handleBookmark(e, problem.id)} className={`p-1 rounded transition-colors ${isBookmarked ? 'text-[#FBBF24]' : 'text-white/10 hover:text-white/30'}`}>
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <p className="text-white/30 mb-3">No problems match</p>
                  <button onClick={() => { setSearchQuery(''); setDifficultyFilter('all'); setCategoryFilter('all'); setStatusFilter('all'); setSortKey('default'); }} className="text-[#4ADE80] text-sm hover:underline">Clear filters</button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.15] disabled:opacity-20 disabled:cursor-not-allowed transition-all">&lt;</button>
                {(() => {
                  const pages: (number | '...')[] = [];
                  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
                  else { pages.push(1); if (currentPage > 3) pages.push('...'); for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i); if (currentPage < totalPages - 2) pages.push('...'); pages.push(totalPages); }
                  return pages.map((page, i) => page === '...' ? <span key={`d${i}`} className="w-10 h-10 flex items-center justify-center text-white/20">...</span> :
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg border text-[14px] font-medium transition-all ${currentPage === page ? 'bg-[#4ADE80] border-[#4ADE80] text-black font-bold' : 'border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15]'}`}>{page}</button>);
                })()}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.15] disabled:opacity-20 disabled:cursor-not-allowed transition-all">&gt;</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl bg-[#12141A] border border-white/[0.08] p-10 max-w-sm w-full text-center">
            <Lock className="w-10 h-10 text-[#4ADE80] mx-auto mb-5" />
            <h3 className="text-xl font-bold text-white mb-2">Sign in to start</h3>
            <p className="text-white/50 text-[15px] mb-8">Create a free account to solve problems and track progress.</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setShowLoginPrompt(false);
                  if (onLogin && onRegister) setShowAuthForm(true);
                  else window.location.href = '/?auth=login';
                }}
                className="bg-[#4ADE80] hover:bg-[#22C55E] text-black font-semibold px-6 h-11 rounded-xl text-sm"
              >
                Sign in <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowLoginPrompt(false);
                  setPendingProblem(null);
                }}
                className="text-white/50 hover:text-white hover:bg-white/[0.06] h-11 rounded-xl text-sm"
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
