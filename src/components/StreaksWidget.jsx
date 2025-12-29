import React, { useMemo } from 'react';
import { Flame, Shield, TrendingUp, Calendar } from 'lucide-react';

// **FIX v8.8**: Entferne sessionHits - verwende nur historyData als einzige Quelle der Wahrheit
export default function StreaksWidget({ historyData }) {
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

    // **FIX v8.8**: Berechne Current Break aus historyData (einzige Quelle der Wahrheit)
    let currentBreak = 0;
    if (sortedData.length > 0) {
      // Finde den letzten Tag mit Aktivität
      const lastActiveDay = sortedData.find(d => d.count > 0);
      if (lastActiveDay) {
        const lastDate = new Date(lastActiveDay.date);
        const today = new Date();
        currentBreak = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      }
    }

    // **FIX v8.8**: Berechne Longest Break aus historyData
    let longestBreak = 0;
    if (sortedData.length > 1) {
      const activeDays = sortedData.filter(d => d.count > 0).sort((a, b) => new Date(a.date) - new Date(b.date));
      for (let i = 1; i < activeDays.length; i++) {
        const prevDate = new Date(activeDays[i - 1].date);
        const currDate = new Date(activeDays[i].date);
        const breakDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24)) - 1;
        longestBreak = Math.max(longestBreak, breakDays);
      }
    }

    return {
      activeStreak,
      longestStreak: Math.max(longestStreak, activeStreak),
      currentBreak,
      longestBreak: Math.max(longestBreak, currentBreak)
    };
  }, [historyData]); // **FIX v8.8**: Entferne sessionHits aus Dependencies

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
