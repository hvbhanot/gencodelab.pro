import { useState, useEffect } from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalScore: number;
  solvedCount: number;
}

interface LeaderboardPageProps {
  currentUser: string;
}

export function LeaderboardPage({ currentUser }: LeaderboardPageProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data.leaderboard || []);
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-[#FBBF24]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[#D4D4D8]" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[#CD7F32]" />;
    return <span className="text-sm font-mono text-[#52525B]">{rank}</span>;
  };

  const userRank = entries.findIndex(e => e.username === currentUser);

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#E4E4E7] tracking-tight mb-1">Leaderboard</h1>
        <p className="text-sm text-[#71717A]">Top solvers ranked by total points</p>
      </div>

      {/* User's rank card */}
      {userRank >= 0 && (
        <div className="mb-6 p-4 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm text-[#A1A1AA]">Your rank</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold font-mono text-[#22C55E]">#{userRank + 1}</span>
              <span className="text-sm text-[#71717A]">{entries[userRank].totalScore} pts</span>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-[#52525B]">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-[#52525B]">No scores yet. Be the first!</div>
      ) : (
        <div className="rounded-xl border border-[#1C1C1F] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#0C0C0E] border-b border-[#1C1C1F] text-xs text-[#52525B] uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3 text-right">Solved</div>
            <div className="col-span-3 text-right">Points</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#1C1C1F]">
            {entries.map((entry) => {
              const isMe = entry.username === currentUser;
              return (
                <div
                  key={entry.username}
                  className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center transition-colors ${
                    isMe ? 'bg-[#22C55E]/[0.03]' : 'hover:bg-[#111113]'
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center w-8">
                    {getRankDisplay(entry.rank)}
                  </div>
                  <div className="col-span-5">
                    <span className={`text-sm font-medium ${isMe ? 'text-[#22C55E]' : 'text-[#E4E4E7]'}`}>
                      {entry.username}
                    </span>
                    {isMe && <span className="ml-2 text-xs text-[#22C55E]/60 uppercase">you</span>}
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-sm text-[#71717A] font-mono">{entry.solvedCount}</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`text-sm font-semibold font-mono ${
                      entry.rank <= 3 ? 'text-[#FBBF24]' : 'text-[#E4E4E7]'
                    }`}>
                      {entry.totalScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
