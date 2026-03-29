import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Flame, Target, Calendar, TrendingUp, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { problems as allProblems } from '@/data/problems';
import type { Difficulty, Category, ProblemProgress } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getCategoryLabel = (category: Category) => {
  const labels: Record<Category, string> = {
    'logic': 'Logic', 'scope': 'Scope', 'type': 'Type', 'security': 'Security',
    'performance': 'Perf', 'concurrency': 'Async', 'algorithm': 'Algo',
    'syntax': 'Syntax', 'edge-case': 'Edge Cases', 'pitfall': 'Pitfall',
    'oop': 'OOP', 'advanced': 'Advanced'
  };
  return labels[category] || category;
};

const allCategories: Category[] = [
  'logic', 'scope', 'type', 'security', 'performance', 'concurrency',
  'algorithm', 'syntax', 'edge-case', 'pitfall', 'oop', 'advanced'
];

interface ProfileData {
  username: string;
  createdAt: string;
  problems: Record<number, ProblemProgress>;
  streak: { currentStreak: number; longestStreak: number };
  invitedCount: number;
  invitedBy: string | null;
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile/${username}`);
        if (!res.ok) { setError('User not found'); setLoading(false); return; }
        setProfile(await res.json());
      } catch { setError('Failed to load profile'); }
      setLoading(false);
    };
    load();
  }, [username]);

  const stats = useMemo(() => {
    if (!profile) return null;
    const probs = Object.values(profile.problems);
    const count = (d: Difficulty) => allProblems.filter(p => p.difficulty === d).length;
    const solved = (d: Difficulty) => probs.filter(p => allProblems.find(pr => pr.id === p.problemId)?.difficulty === d && p.solved).length;
    const totalSolved = solved('easy') + solved('medium') + solved('hard');
    const totalPoints = probs.reduce((s, p) => s + (p.bestScore || 0), 0);
    const perfectScores = probs.filter(p => {
      const prob = allProblems.find(pr => pr.id === p.problemId);
      if (!prob) return false;
      const max = prob.difficulty === 'easy' ? 10 : prob.difficulty === 'medium' ? 20 : 30;
      return p.bestScore === max;
    }).length;
    return { easy: { solved: solved('easy'), total: count('easy') }, medium: { solved: solved('medium'), total: count('medium') }, hard: { solved: solved('hard'), total: count('hard') }, totalSolved, totalPoints, perfectScores, total: allProblems.length };
  }, [profile]);

  const categoryMastery = useMemo(() => {
    if (!profile) return [];
    return allCategories.map(cat => {
      const total = allProblems.filter(p => p.category === cat).length;
      const solved = Object.values(profile.problems).filter(p => {
        const prob = allProblems.find(pr => pr.id === p.problemId);
        return prob?.category === cat && p.solved;
      }).length;
      return { category: cat, solved, total, percent: total > 0 ? Math.round((solved / total) * 100) : 0 };
    }).sort((a, b) => b.percent - a.percent);
  }, [profile]);

  const heatmapData = useMemo(() => {
    if (!profile) return [];
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = Object.values(profile.problems).filter(p => p.lastAttempt?.startsWith(dateStr)).length;
      days.push({ date: dateStr, count });
    }
    return days;
  }, [profile]);

  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--vc-text-muted)' }}>Loading...</div>;
  if (error || !profile || !stats) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p style={{ color: 'var(--vc-text-muted)' }}>{error || 'User not found'}</p>
      <Link to="/" className="text-[#4ADE80] text-sm hover:underline">Back to home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <Link to="/problems" className="inline-flex items-center gap-1.5 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--vc-text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono text-[#4ADE80]">{profile.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--vc-text)' }}>{profile.username}</h1>
            <p className="text-sm" style={{ color: 'var(--vc-text-muted)' }}>
              Joined {joinDate} · {stats.totalSolved} solved · {stats.totalPoints} pts
            </p>
            {profile.invitedBy && (
              <p className="text-xs mt-1" style={{ color: 'var(--vc-text-muted)' }}>
                Invited by <Link to={`/u/${profile.invitedBy}`} className="text-[#4ADE80] hover:underline">{profile.invitedBy}</Link>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {profile.streak.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316]/[0.08] border border-[#F97316]/[0.12]">
              <Flame className="w-4 h-4 text-[#F97316]" />
              <span className="text-sm font-mono font-bold text-[#F97316]">{profile.streak.currentStreak}d</span>
            </div>
          )}
          {profile.invitedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA]/[0.08] border border-[#A78BFA]/[0.12]">
              <span className="text-sm font-mono font-bold text-[#A78BFA]">{profile.invitedCount} invited</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Solved', value: stats.totalSolved, sub: `/ ${stats.total}`, color: '#4ADE80' },
          { label: 'Points', value: stats.totalPoints, sub: 'total', color: '#FBBF24' },
          { label: 'Perfect', value: stats.perfectScores, sub: 'no hints', color: '#A78BFA' },
          { label: 'Streak', value: profile.streak.longestStreak, sub: 'best', color: '#F97316' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--vc-text-muted)' }}>{s.label}</p>
            <p className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--vc-text-faint)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Difficulty + Category */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#4ADE80]" />
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Difficulty</h2>
          </div>
          <div className="space-y-4">
            {([
              { label: 'Easy', s: stats.easy.solved, t: stats.easy.total, color: '#4ADE80' },
              { label: 'Medium', s: stats.medium.solved, t: stats.medium.total, color: '#FBBF24' },
              { label: 'Hard', s: stats.hard.solved, t: stats.hard.total, color: '#F87171' },
            ]).map(d => (
              <div key={d.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm" style={{ color: 'var(--vc-text-secondary)' }}>{d.label}</span>
                  <span className="text-sm font-mono" style={{ color: 'var(--vc-text-muted)' }}>{d.s}/{d.t}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--vc-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${d.t > 0 ? (d.s / d.t) * 100 : 0}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#A78BFA]" />
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Categories</h2>
          </div>
          <div className="space-y-2.5">
            {categoryMastery.map(cm => (
              <div key={cm.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px]" style={{ color: 'var(--vc-text-secondary)' }}>{getCategoryLabel(cm.category)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono" style={{ color: 'var(--vc-text-muted)' }}>{cm.solved}/{cm.total}</span>
                    {cm.percent === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />}
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--vc-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${cm.percent}%`, background: cm.percent === 100 ? '#4ADE80' : cm.percent > 50 ? '#FBBF24' : '#A78BFA' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#4ADE80]" />
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Activity</h2>
          <span className="text-[12px] ml-auto" style={{ color: 'var(--vc-text-muted)' }}>Last 90 days</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmapData.map(d => (
            <div key={d.date} title={`${d.date}: ${d.count}`} className="w-3 h-3 rounded-sm"
              style={{ background: d.count === 0 ? 'var(--vc-border)' : d.count === 1 ? 'rgba(74,222,128,0.3)' : d.count <= 3 ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.8)' }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: 'var(--vc-text-muted)' }}>
          <span>Less</span>
          {[0, 0.3, 0.5, 0.8].map((o, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: o === 0 ? 'var(--vc-border)' : `rgba(74,222,128,${o})` }} />)}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
