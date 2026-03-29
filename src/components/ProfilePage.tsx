import { useMemo, useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Target,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Copy,
  Check,
  Users,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
import { problems as allProblems } from '@/data/problems';
import type { UserProgress, Difficulty, Category } from '@/types';

interface ProfilePageProps {
  currentUser: string;
  userProgress: UserProgress;
  currentStreak: number;
  longestStreak: number;
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

const allCategories: Category[] = [
  'logic', 'scope', 'type', 'security', 'performance', 'concurrency',
  'algorithm', 'syntax', 'edge-case', 'pitfall', 'oop', 'advanced'
];

export function ProfilePage({ currentUser, userProgress, currentStreak, longestStreak }: ProfilePageProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [invitedCount, setInvitedCount] = useState(0);
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const res = await fetch(`${API_BASE}/invite/stats/${currentUser}`);
        const data = await res.json();
        setInviteCode(data.activeCode);
        setInvitedCount(data.invitedCount || 0);
        setInvitedBy(data.invitedBy);
      } catch { /* ignore */ }
    };
    loadInvite();
  }, [currentUser]);

  const generateInvite = async () => {
    try {
      const res = await fetch(`${API_BASE}/invite/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser }),
      });
      const data = await res.json();
      if (data.code) setInviteCode(data.code);
    } catch { /* ignore */ }
  };

  const copyInviteLink = () => {
    if (!inviteCode) return;
    const link = `${window.location.origin}/?invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/u/${currentUser}`;
    navigator.clipboard.writeText(link);
    setProfileCopied(true);
    setTimeout(() => setProfileCopied(false), 2000);
  };

  const stats = useMemo(() => {
    const count = (d: Difficulty) => allProblems.filter(p => p.difficulty === d).length;
    const solved = (d: Difficulty) => Object.values(userProgress.problems).filter(p => allProblems.find(pr => pr.id === p.problemId)?.difficulty === d && p.solved).length;
    const totalSolved = solved('easy') + solved('medium') + solved('hard');
    const totalPoints = Object.values(userProgress.problems).reduce((s, p) => s + (p.bestScore || 0), 0);
    const totalAttempts = Object.values(userProgress.problems).reduce((s, p) => s + (p.attempts || 0), 0);
    return { easy: { solved: solved('easy'), total: count('easy') }, medium: { solved: solved('medium'), total: count('medium') }, hard: { solved: solved('hard'), total: count('hard') }, totalSolved, totalPoints, totalAttempts, total: allProblems.length };
  }, [userProgress]);

  const categoryMastery = useMemo(() => {
    return allCategories.map(cat => {
      const total = allProblems.filter(p => p.category === cat).length;
      const solved = Object.values(userProgress.problems).filter(p => {
        const prob = allProblems.find(pr => pr.id === p.problemId);
        return prob?.category === cat && p.solved;
      }).length;
      return { category: cat, solved, total, percent: total > 0 ? Math.round((solved / total) * 100) : 0 };
    }).sort((a, b) => b.percent - a.percent);
  }, [userProgress]);

  const perfectScores = useMemo(() => {
    return Object.values(userProgress.problems).filter(p => {
      const prob = allProblems.find(pr => pr.id === p.problemId);
      if (!prob) return false;
      const max = prob.difficulty === 'easy' ? 10 : prob.difficulty === 'medium' ? 20 : 30;
      return p.bestScore === max;
    }).length;
  }, [userProgress]);

  const achievements = useMemo(() => {
    const ts = stats.totalSolved;
    return [
      { id: 'first', label: 'First Solve', desc: 'Solve your first problem', unlocked: ts >= 1, icon: '🎯' },
      { id: 'ten', label: 'Getting Started', desc: 'Solve 10 problems', unlocked: ts >= 10, icon: '🔥' },
      { id: 'fifty', label: 'Halfway There', desc: 'Solve 50 problems', unlocked: ts >= 50, icon: '⚡' },
      { id: 'hundred', label: 'Centurion', desc: 'Solve 100 problems', unlocked: ts >= 100, icon: '💯' },
      { id: 'all_easy', label: 'Easy Sweep', desc: 'Complete all easy problems', unlocked: stats.easy.solved === stats.easy.total && stats.easy.total > 0, icon: '🟢' },
      { id: 'all_medium', label: 'Medium Master', desc: 'Complete all medium problems', unlocked: stats.medium.solved === stats.medium.total && stats.medium.total > 0, icon: '🟡' },
      { id: 'all_hard', label: 'Hard Crusher', desc: 'Complete all hard problems', unlocked: stats.hard.solved === stats.hard.total && stats.hard.total > 0, icon: '🔴' },
      { id: 'perfect5', label: 'Perfectionist', desc: '5 perfect scores (no hints)', unlocked: perfectScores >= 5, icon: '💎' },
      { id: 'streak3', label: 'On Fire', desc: '3+ day streak', unlocked: longestStreak >= 3, icon: '🔥' },
      { id: 'streak7', label: 'Week Warrior', desc: '7+ day streak', unlocked: longestStreak >= 7, icon: '⚔️' },
    ];
  }, [stats, perfectScores, longestStreak]);

  // Activity heatmap — last 90 days
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = Object.values(userProgress.problems).filter(p => p.lastAttempt?.startsWith(dateStr)).length;
      days.push({ date: dateStr, count });
    }
    return days;
  }, [userProgress]);

  const progressPercent = Math.round((stats.totalSolved / stats.total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center">
              <span className="text-xl font-bold font-mono text-[#4ADE80]">{currentUser.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--vc-text)' }}>{currentUser}</h1>
              <p className="text-sm" style={{ color: 'var(--vc-text-muted)' }}>{stats.totalSolved} problems solved · {stats.totalPoints} total points</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316]/[0.08] border border-[#F97316]/[0.12]">
              <Flame className="w-4 h-4 text-[#F97316]" />
              <span className="text-sm font-mono font-bold text-[#F97316]">{currentStreak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Solved', value: stats.totalSolved, sub: `/ ${stats.total}`, color: '#4ADE80' },
          { label: 'Points', value: stats.totalPoints, sub: 'total', color: '#FBBF24' },
          { label: 'Perfect', value: perfectScores, sub: 'no hints', color: '#A78BFA' },
          { label: 'Attempts', value: stats.totalAttempts, sub: 'total', color: '#F87171' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--vc-text-muted)' }}>{s.label}</p>
            <p className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--vc-text-faint)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Difficulty breakdown */}
      <div className="rounded-xl p-5 mb-8" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#4ADE80]" />
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Difficulty Progress</h2>
          <span className="ml-auto text-sm font-mono" style={{ color: 'var(--vc-text-muted)' }}>{progressPercent}%</span>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Easy', solved: stats.easy.solved, total: stats.easy.total, color: '#4ADE80' },
            { label: 'Medium', solved: stats.medium.solved, total: stats.medium.total, color: '#FBBF24' },
            { label: 'Hard', solved: stats.hard.solved, total: stats.hard.total, color: '#F87171' },
          ].map(d => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: 'var(--vc-text-secondary)' }}>{d.label}</span>
                <span className="text-sm font-mono" style={{ color: 'var(--vc-text-muted)' }}>{d.solved} / {d.total}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--vc-border)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.total > 0 ? (d.solved / d.total) * 100 : 0}%`, background: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Category Mastery */}
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#A78BFA]" />
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Category Mastery</h2>
          </div>
          <div className="space-y-3">
            {categoryMastery.map(cm => (
              <div key={cm.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px]" style={{ color: 'var(--vc-text-secondary)' }}>{getCategoryLabel(cm.category)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono" style={{ color: 'var(--vc-text-muted)' }}>{cm.solved}/{cm.total}</span>
                    {cm.percent === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />}
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--vc-border)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${cm.percent}%`,
                    background: cm.percent === 100 ? '#4ADE80' : cm.percent > 50 ? '#FBBF24' : '#A78BFA',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FBBF24]" />
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Achievements</h2>
            </div>
            <span className="text-[12px] font-mono" style={{ color: 'var(--vc-text-muted)' }}>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
          </div>
          <div className="space-y-2">
            {achievements.map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${a.unlocked ? '' : 'opacity-35'}`}
                style={{ background: a.unlocked ? 'var(--vc-surface-2)' : 'transparent' }}>
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: a.unlocked ? 'var(--vc-text)' : 'var(--vc-text-muted)' }}>{a.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--vc-text-muted)' }}>{a.desc}</p>
                </div>
                {a.unlocked && <CheckCircle2 className="w-4 h-4 text-[#4ADE80] flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#4ADE80]" />
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Activity</h2>
          <span className="text-[12px] ml-auto" style={{ color: 'var(--vc-text-muted)' }}>Last 90 days</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmapData.map(d => (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} problem${d.count !== 1 ? 's' : ''}`}
              className="w-3 h-3 rounded-sm transition-colors"
              style={{
                background: d.count === 0 ? 'var(--vc-border)' :
                  d.count === 1 ? 'rgba(74, 222, 128, 0.3)' :
                  d.count <= 3 ? 'rgba(74, 222, 128, 0.5)' :
                  'rgba(74, 222, 128, 0.8)',
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: 'var(--vc-text-muted)' }}>
          <span>Less</span>
          {[0, 0.3, 0.5, 0.8].map((opacity, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: opacity === 0 ? 'var(--vc-border)' : `rgba(74, 222, 128, ${opacity})` }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Streak + Invite */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <Flame className="w-5 h-5 text-[#F97316] mb-2" />
          <p className="text-xs" style={{ color: 'var(--vc-text-muted)' }}>Current Streak</p>
          <p className="text-3xl font-bold font-mono text-[#F97316]">{currentStreak}</p>
          <p className="text-xs" style={{ color: 'var(--vc-text-faint)' }}>days</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <Trophy className="w-5 h-5 text-[#FBBF24] mb-2" />
          <p className="text-xs" style={{ color: 'var(--vc-text-muted)' }}>Longest Streak</p>
          <p className="text-3xl font-bold font-mono text-[#FBBF24]">{longestStreak}</p>
          <p className="text-xs" style={{ color: 'var(--vc-text-faint)' }}>days</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <Users className="w-5 h-5 text-[#A78BFA] mb-2" />
          <p className="text-xs" style={{ color: 'var(--vc-text-muted)' }}>Friends Invited</p>
          <p className="text-3xl font-bold font-mono text-[#A78BFA]">{invitedCount}</p>
          <p className="text-xs" style={{ color: 'var(--vc-text-faint)' }}>people</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <Award className="w-5 h-5 text-[#4ADE80] mb-2" />
          <p className="text-xs" style={{ color: 'var(--vc-text-muted)' }}>Achievements</p>
          <p className="text-3xl font-bold font-mono text-[#4ADE80]">{achievements.filter(a => a.unlocked).length}</p>
          <p className="text-xs" style={{ color: 'var(--vc-text-faint)' }}>/ {achievements.length}</p>
        </div>
      </div>

      {/* Invite & Share */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {/* Invite a friend */}
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-[#A78BFA]" />
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Invite a Friend</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--vc-text-muted)' }}>
            Share your invite link. When they sign up, you both get the referral badge.
          </p>

          {inviteCode ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-lg font-mono text-sm truncate" style={{ background: 'var(--vc-surface-2)', color: 'var(--vc-text-secondary)', border: '1px solid var(--vc-border)' }}>
                {window.location.origin}/?invite={inviteCode}
              </div>
              <Button onClick={copyInviteLink} className={`h-10 px-4 rounded-lg text-sm font-medium ${copied ? 'bg-[#4ADE80] text-black' : 'bg-[#A78BFA] hover:bg-[#8B5CF6] text-white'}`}>
                {copied ? <><Check className="w-4 h-4 mr-1" />Copied</> : <><Copy className="w-4 h-4 mr-1" />Copy</>}
              </Button>
            </div>
          ) : (
            <Button onClick={generateInvite} className="bg-[#A78BFA] hover:bg-[#8B5CF6] text-white h-10 px-5 rounded-lg text-sm font-medium">
              Generate Invite Link
            </Button>
          )}

          {invitedBy && (
            <p className="text-xs mt-3" style={{ color: 'var(--vc-text-muted)' }}>
              You were invited by <span className="text-[#4ADE80] font-medium">{invitedBy}</span>
            </p>
          )}
        </div>

        {/* Share profile */}
        <div className="rounded-xl p-5" style={{ background: 'var(--vc-surface)', border: '1px solid var(--vc-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-5 h-5 text-[#4ADE80]" />
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--vc-text)' }}>Public Profile</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--vc-text-muted)' }}>
            Share your profile on LinkedIn, your resume, or social media. Anyone can view your stats.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-lg font-mono text-sm truncate" style={{ background: 'var(--vc-surface-2)', color: 'var(--vc-text-secondary)', border: '1px solid var(--vc-border)' }}>
              {window.location.origin}/u/{currentUser}
            </div>
            <Button onClick={copyProfileLink} className={`h-10 px-4 rounded-lg text-sm font-medium ${profileCopied ? 'bg-[#4ADE80] text-black' : 'bg-[#4ADE80] hover:bg-[#22C55E] text-black'}`}>
              {profileCopied ? <><Check className="w-4 h-4 mr-1" />Copied</> : <><Copy className="w-4 h-4 mr-1" />Copy</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
