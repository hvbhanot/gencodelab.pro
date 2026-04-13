import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { LandingPage } from '@/components/LandingPage';
import { ProblemsPage } from '@/components/ProblemsPage';
import { ProfilePage } from '@/components/ProfilePage';
import { PublicProfilePage } from '@/components/PublicProfilePage';
import { TipsPage } from '@/components/TipsPage';
import { ProblemSolver } from '@/components/ProblemSolver';
import { useAuth, getUserProgress, saveUserProgress, getStreaks, getDailyChallenge, getBookmarks, toggleBookmark } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
import type { Problem, UserProgress } from '@/types';
import { problems } from '@/data/problems';
import { Loader2 } from 'lucide-react';

function App() {
  const { currentUser, isLoading: authLoading, register, login, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({ username: '', problems: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dailyProblemId, setDailyProblemId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ rank: number; username: string; totalScore: number; solvedCount: number }[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        const [progress, streaks, daily, lb, bm] = await Promise.all([
          getUserProgress(currentUser),
          getStreaks(currentUser),
          getDailyChallenge(),
          fetch(`${API_BASE}/leaderboard`).then(r => r.json()).catch(() => ({ leaderboard: [] })),
          getBookmarks(currentUser),
        ]);
        setUserProgress(progress);
        setCurrentStreak(streaks.currentStreak);
        setLongestStreak(streaks.longestStreak);
        setLeaderboard(lb.leaderboard || []);
        setBookmarks(bm);
        if (daily.seed) {
          setDailyProblemId(problems[daily.seed % problems.length].id);
        }
        setIsLoading(false);
      };
      loadData();
    } else {
      setUserProgress({ username: '', problems: {} });
      setCurrentStreak(0);
      setLongestStreak(0);
      setDailyProblemId(null);
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleRegister = useCallback(async (username: string, password: string, email: string) => {
    const result = await register(username, password, email);
    if (result.success) await login(username, password);
    return result;
  }, [register, login]);

  const handleSelectProblem = useCallback((problem: Problem) => setSelectedProblem(problem), []);
  const handleBackToProblems = useCallback(() => setSelectedProblem(null), []);

  const handleSubmitProblem = useCallback(async (problemId: number, score: number, solved: boolean, solutionViewed: boolean) => {
    if (!currentUser) return;
    const updated = await saveUserProgress(currentUser, problemId, score, solved, solutionViewed);
    if (updated) {
      setUserProgress(prev => ({ ...prev, problems: { ...prev.problems, [problemId]: updated } }));
      if (solved) {
        const streaks = await getStreaks(currentUser);
        setCurrentStreak(streaks.currentStreak);
        setLongestStreak(streaks.longestStreak);
      }
    }
  }, [currentUser]);

  const handleNextProblem = useCallback(() => {
    if (!selectedProblem) return;
    const idx = problems.findIndex(p => p.id === selectedProblem.id);
    if (problems[idx + 1]) setSelectedProblem(problems[idx + 1]);
  }, [selectedProblem]);

  const handlePreviousProblem = useCallback(() => {
    if (!selectedProblem) return;
    const idx = problems.findIndex(p => p.id === selectedProblem.id);
    if (problems[idx - 1]) setSelectedProblem(problems[idx - 1]);
  }, [selectedProblem]);

  const handleToggleBookmark = useCallback(async (problemId: number) => {
    if (!currentUser) return;
    const isNowBookmarked = await toggleBookmark(currentUser, problemId);
    setBookmarks(prev => isNowBookmarked ? [...prev, problemId] : prev.filter(id => id !== problemId));
  }, [currentUser]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--vc-bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  if (selectedProblem && currentUser) {
    const idx = problems.findIndex(p => p.id === selectedProblem.id);
    return (
      <ProblemSolver
        problem={selectedProblem}
        userProgress={userProgress.problems[selectedProblem.id]}
        onBack={handleBackToProblems}
        onNext={handleNextProblem}
        onPrevious={handlePreviousProblem}
        onSubmit={handleSubmitProblem}
        hasNext={idx < problems.length - 1}
        hasPrevious={idx > 0}
      />
    );
  }

  if (!currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage onRegister={handleRegister} onLogin={login} />} />
          <Route
            path="/problems"
            element={
              <ProblemsPage
                userProgress={{ username: '', problems: {} }}
                onSelectProblem={handleSelectProblem}
                onRegister={handleRegister}
                onLogin={login}
              />
            }
          />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/tips" element={<TipsPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const totalPoints = Object.values(userProgress.problems).reduce((sum, p) => sum + (p.bestScore || 0), 0);

  const problemsPageProps = {
    userProgress,
    onSelectProblem: handleSelectProblem,
    currentUser,
    currentStreak,
    dailyProblem: dailyProblemId ? problems.find(p => p.id === dailyProblemId) || null : null,
    leaderboard,
    bookmarks,
    onToggleBookmark: handleToggleBookmark,
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'var(--vc-bg)' }}>
        <Navigation
          currentUser={currentUser}
          totalPoints={totalPoints}
          currentStreak={currentStreak}
          onLogout={logout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Routes>
          <Route path="/" element={<ProblemsPage {...problemsPageProps} />} />
          <Route path="/problems" element={<ProblemsPage {...problemsPageProps} />} />
          <Route path="/profile" element={<ProfilePage currentUser={currentUser} userProgress={userProgress} currentStreak={currentStreak} longestStreak={longestStreak} />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/tips" element={<TipsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
