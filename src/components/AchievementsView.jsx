import React, { useMemo } from 'react';
import { Trophy, Star, Flame, Target, Calendar, TrendingUp, Award, Lock } from 'lucide-react';

// **PERFORMANCE FIX**: Achievement Definitionen außerhalb der Component
// Verhindert Re-Creation bei jedem Render
const achievementDefs = [
  {
    id: 'first_hit',
    title: 'Erste Schritte',
    description: 'Dein erster Hit',
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    check: (hits) => hits.length >= 1
  },
  {
    id: 'rookie',
    title: 'Rookie',
    description: '10 Hits erreicht',
    icon: Target,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    check: (hits) => hits.length >= 10
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: '50 Hits erreicht',
    icon: Award,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    check: (hits) => hits.length >= 50
  },
  {
    id: 'legend',
    title: 'Legende',
    description: '100 Hits erreicht',
    icon: Trophy,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    check: (hits) => hits.length >= 100
  },
  {
    id: 'master',
    title: 'Meister',
    description: '500 Hits erreicht',
    icon: Trophy,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    check: (hits) => hits.length >= 500
  },
  {
    id: 'week_streak',
    title: '7 Tage Streak',
    description: '7 Tage in Folge aktiv',
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: (hits, history) => {
      if (history.length < 7) return false;
      const last7Days = history.slice(-7);
      return last7Days.every(d => d.count > 0);
    }
  },
  {
    id: 'month_streak',
    title: '30 Tage Streak',
    description: '30 Tage in Folge aktiv',
    icon: Calendar,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    check: (hits, history) => {
      if (history.length < 30) return false;
      const last30Days = history.slice(-30);
      return last30Days.every(d => d.count > 0);
    }
  },
  {
    id: 'century',
    title: 'Jahrhundert',
    description: '100 Hits an einem Tag',
    icon: TrendingUp,
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/30',
    check: (hits, history) => {
      return history.some(d => d.count >= 100);
    }
  }
];

export default function AchievementsView({ sessionHits, historyData, settings }) {
  // **PERFORMANCE FIX**: achievementDefs nicht mehr in dependencies
  // Berechne Achievement-Status
  const achievements = useMemo(() => {
    return achievementDefs.map(def => ({
      ...def,
      unlocked: def.check(sessionHits || [], historyData || [])
    }));
  }, [sessionHits, historyData]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-amber-500" />
          Erfolge
        </h2>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-amber-900/20 to-zinc-900 border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-amber-400">{unlockedCount}/{totalCount}</p>
            <p className="text-xs text-zinc-600 uppercase mt-1">Erfolge freigeschaltet</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400">{progressPercentage.toFixed(0)}%</p>
            <p className="text-xs text-zinc-600 uppercase mt-1">Fortschritt</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => {
          const Icon = achievement.icon;
          const LockIcon = Lock;

          return (
            <div
              key={achievement.id}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                achievement.unlocked
                  ? `${achievement.bg} ${achievement.border}`
                  : 'bg-zinc-900/50 border-zinc-800 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      achievement.unlocked
                        ? achievement.bg
                        : 'bg-zinc-800'
                    }`}
                  >
                    {achievement.unlocked ? (
                      <Icon size={24} className={achievement.color} />
                    ) : (
                      <LockIcon size={24} className="text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      achievement.unlocked
                        ? 'text-white'
                        : 'text-zinc-600'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      achievement.unlocked
                        ? 'text-zinc-400'
                        : 'text-zinc-700'
                    }`}>
                      {achievement.description}
                    </p>

                    {achievement.unlocked && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg">
                        <Star size={12} className="text-amber-400" />
                        <span className="text-xs text-amber-400 font-bold uppercase">Freigeschaltet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Glow Effect for unlocked achievements */}
              {achievement.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
