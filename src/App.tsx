import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { LandingPage } from '@/components/LandingPage';
import { ProblemsPage } from '@/components/ProblemsPage';
import { TipsPage } from '@/components/TipsPage';
import { ProblemSolver } from '@/components/ProblemSolver';
import { useAuth, getUserProgress, saveUserProgress } from '@/hooks/useAuth';
import type { Problem, UserProgress } from '@/types';
import { problems } from '@/data/problems';
import { Loader2 } from 'lucide-react';

function App() {
  const { currentUser, isLoading: authLoading, register, login, logout } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({ username: '', problems: {} });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const loadProgress = async () => {
        const progress = await getUserProgress(currentUser);
        setUserProgress(progress);
        setIsLoading(false);
      };
      loadProgress();
    } else {
      setUserProgress({ username: '', problems: {} });
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

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F8CFF]" />
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
      <div className="min-h-screen bg-[#0B0B0B]">
        <Navigation
          currentUser={currentUser}
          totalPoints={totalPoints}
          onLogout={logout}
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
          <Route path="/tips" element={<TipsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
