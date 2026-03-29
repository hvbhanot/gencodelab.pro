import { useState, useEffect, useCallback } from 'react';
import type { UserProgress, ProblemProgress } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const CURRENT_USER_KEY = 'bughunt_current_user';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      setCurrentUser(stored);
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (username: string, password: string, email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      return { success: data.success, error: data.error };
    } catch {
      return { success: false, error: 'Cannot connect to server' };
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.username);
        localStorage.setItem(CURRENT_USER_KEY, data.username);
      }
      return { success: data.success, error: data.error };
    } catch {
      return { success: false, error: 'Cannot connect to server' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  return {
    currentUser,
    isLoading,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };
}

export async function getUserProgress(username: string): Promise<UserProgress> {
  try {
    const res = await fetch(`${API_BASE}/progress/${username}`);
    const data = await res.json();
    return data as UserProgress;
  } catch {
    return { username, problems: {} };
  }
}

export async function getStreaks(username: string): Promise<{ currentStreak: number; longestStreak: number; lastSolveDate: string }> {
  try {
    const res = await fetch(`${API_BASE}/streaks/${username}`);
    const data = await res.json();
    return data;
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastSolveDate: '' };
  }
}

export async function getDailyChallenge(): Promise<{ date: string; seed: number }> {
  try {
    const res = await fetch(`${API_BASE}/daily`);
    return await res.json();
  } catch {
    return { date: '', seed: 0 };
  }
}

export async function saveUserProgress(
  username: string,
  problemId: number,
  score: number,
  solved: boolean,
  solutionViewed: boolean,
): Promise<ProblemProgress | null> {
  try {
    const res = await fetch(`${API_BASE}/progress/${username}/${problemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, solved, solutionViewed }),
    });
    return await res.json();
  } catch {
    return null;
  }
}
