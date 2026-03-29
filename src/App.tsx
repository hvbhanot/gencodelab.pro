import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { LandingPage } from '@/components/LandingPage';
import { ProblemsPage } from '@/components/ProblemsPage';
import { LeaderboardPage } from '@/components/LeaderboardPage';
import { TipsPage } from '@/components/TipsPage';
import { ProblemSolver } from '@/components/ProblemSolver';
import { useAuth, getUserProgress, saveUserProgress, getStreaks, getDailyChallenge } from '@/hooks/useAuth';
import type { Problem, UserProgress } from '@/types';
import { problems } from '@/data/problems';
import { Loader2 } from 'lucide-react';

function App() {
  const { currentUser, isLoading: authLoading, register, login, logout } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({ username: '', problems: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyProblemId, setDailyProblemId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        const [progress, streaks, daily] = await Promise.all([
          getUserProgress(currentUser),
          getStreaks(currentUser),
          getDailyChallenge(),
        ]);
        setUserProgress(progress);
        setCurrentStreak(streaks.currentStreak);
        if (daily.seed) {
          setDailyProblemId(problems[daily.seed % problems.length].id);
        }
        setIsLoading(false);
      };
      loadData();
    } else {
      setUserProgress({ username: '', problems: {} });
      setCurrentStreak(0);
      setDailyProblemId(null);
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleRegister = useCallback(async (username: string, password: string, email: string) => {
    const result = await register(username, password, email);
    if (result.success) {
      await login(username, password);
    }
    return result;
  }, [register, login]);

  const handleSelectProblem = useCallback((problem: Problem) => {
    setSelectedProblem(problem);
  }, []);

  const handleBackToProblems = useCallback(() => {
    setSelectedProblem(null);
  }, []);

  const handleSubmitProblem = useCallback(async (problemId: number, score: number, solved: boolean, solutionViewed: boolean) => {
    if (!currentUser) return;

    const updated = await saveUserProgress(currentUser, problemId, score, solved, solutionViewed);
    if (updated) {
      setUserProgress((prev) => ({
        ...prev,
        problems: { ...prev.problems, [problemId]: updated },
      }));
      // Refresh streak after solving
      if (solved) {
        const streaks = await getStreaks(currentUser);
        setCurrentStreak(streaks.currentStreak);
      }
    }
  }, [currentUser]);

  const handleNextProblem = useCallback(() => {
    if (!selectedProblem) return;
    const currentIndex = problems.findIndex(p => p.id === selectedProblem.id);
    const nextProblem = problems[currentIndex + 1];
    if (nextProblem) {
      setSelectedProblem(nextProblem);
    }
  }, [selectedProblem]);

  const handlePreviousProblem = useCallback(() => {
    if (!selectedProblem) return;
    const currentIndex = problems.findIndex(p => p.id === selectedProblem.id);
    const prevProblem = problems[currentIndex - 1];
    if (prevProblem) {
      setSelectedProblem(prevProblem);
    }
  }, [selectedProblem]);

  const handleSelectDaily = useCallback(() => {
    if (!dailyProblemId) return;
    const problem = problems.find(p => p.id === dailyProblemId);
    if (problem) setSelectedProblem(problem);
  }, [dailyProblemId]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  // If a problem is selected, show the problem solver
  if (selectedProblem && currentUser) {
    const currentIndex = problems.findIndex(p => p.id === selectedProblem.id);
    return (
      <ProblemSolver
        problem={selectedProblem}
        userProgress={userProgress.problems[selectedProblem.id]}
        onBack={handleBackToProblems}
        onNext={handleNextProblem}
        onPrevious={handlePreviousProblem}
        onSubmit={handleSubmitProblem}
        hasNext={currentIndex < problems.length - 1}
        hasPrevious={currentIndex > 0}
      />
    );
  }

  // If not logged in, show landing page or public pages
  if (!currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onRegister={handleRegister}
                onLogin={login}
              />
            }
          />
          <Route
            path="/problems"
            element={
              <ProblemsPage
                userProgress={{ username: '', problems: {} }}
                onSelectProblem={() => {}}
              />
            }
          />
          <Route path="/tips" element={<TipsPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Otherwise show the main app with navigation
  const totalPoints = Object.values(userProgress.problems).reduce((sum, p) => sum + (p.bestScore || 0), 0);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#09090B]">
        <Navigation
          currentUser={currentUser}
          totalPoints={totalPoints}
          currentStreak={currentStreak}
          dailyProblemId={dailyProblemId}
          onLogout={logout}
          onSelectDaily={handleSelectDaily}
        />
        <Routes>
          <Route
            path="/"
            element={
              <ProblemsPage
                userProgress={userProgress}
                onSelectProblem={handleSelectProblem}
              />
            }
          />
          <Route
            path="/problems"
            element={
              <ProblemsPage
                userProgress={userProgress}
                onSelectProblem={handleSelectProblem}
              />
            }
          />
          <Route
            path="/leaderboard"
            element={
              <LeaderboardPage currentUser={currentUser} />
            }
          />
          <Route path="/tips" element={<TipsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
