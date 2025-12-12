import React, { useMemo } from 'react';
import { Flame, Shield, TrendingUp, Calendar } from 'lucide-react';

export default function StreaksWidget({ historyData, sessionHits }) {
  const streaks = useMemo(() => {
    if (historyData.length === 0) {
      return { activeStreak: 0, longestStreak: 0, currentBreak: 0, longestBreak: 0 };
    }

    // Sortiere nach Datum
    const sortedData = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Berechne Active Streak (aufeinanderfolgende Tage mit Sessions)
    let activeStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < sortedData.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      const dayData = sortedData.find(d => d.date === expectedDateStr);

      if (dayData && dayData.count > 0) {
        activeStreak++;
      } else if (i > 0) {
        // Wenn heute noch kein Hit, aber gestern schon, zählt Streak weiter
        break;
      }
    }

    // Berechne Longest Streak
    let longestStreak = 0;
    let currentStreakCount = 0;
    const allDates = sortedData.map(d => d.date).sort();

    for (let i = 0; i < allDates.length; i++) {
      const current = new Date(allDates[i]);
      const next = i < allDates.length - 1 ? new Date(allDates[i + 1]) : null;

      const currentData = sortedData.find(d => d.date === allDates[i]);

      if (currentData && currentData.count > 0) {
        currentStreakCount++;

        if (next) {
          const dayDiff = Math.floor((next - current) / (1000 * 60 * 60 * 24));
          if (dayDiff !== 1) {
            longestStreak = Math.max(longestStreak, currentStreakCount);
            currentStreakCount = 0;
          }
        } else {
          longestStreak = Math.max(longestStreak, currentStreakCount);
        }
      }
    }

    // Berechne Current Break (Tage ohne Session)
    let currentBreak = 0;
    if (sessionHits.length > 0) {
      const lastHit = Math.max(...sessionHits.map(h => h.timestamp));
      const daysSinceLastHit = Math.floor((Date.now() - lastHit) / (1000 * 60 * 60 * 24));
      currentBreak = daysSinceLastHit;
    }

    // Berechne Longest Break
    let longestBreak = 0;
    if (sessionHits.length > 1) {
      const sortedHits = [...sessionHits].sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 1; i < sortedHits.length; i++) {
        const breakDays = Math.floor((sortedHits[i].timestamp - sortedHits[i - 1].timestamp) / (1000 * 60 * 60 * 24));
        longestBreak = Math.max(longestBreak, breakDays);
      }
    }

    return {
      activeStreak,
      longestStreak: Math.max(longestStreak, activeStreak),
      currentBreak,
      longestBreak: Math.max(longestBreak, currentBreak)
    };
  }, [historyData, sessionHits]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-orange-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Streaks</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Active Streak */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Flame size={48} className="text-orange-500"/>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Aktuell</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-orange-500">{streaks.activeStreak}</span>
              <span className="text-xs text-zinc-600">Tage</span>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <TrendingUp size={48} className="text-amber-500"/>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Rekord</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-amber-500">{streaks.longestStreak}</span>
              <span className="text-xs text-zinc-600">Tage</span>
            </div>
          </div>
        </div>

        {/* Current Break */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Shield size={48} className="text-emerald-500"/>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Pause</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-emerald-500">{streaks.currentBreak}</span>
              <span className="text-xs text-zinc-600">Tage</span>
            </div>
          </div>
        </div>

        {/* Longest Break */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Calendar size={48} className="text-blue-500"/>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Max T-Break</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-blue-500">{streaks.longestBreak}</span>
              <span className="text-xs text-zinc-600">Tage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
