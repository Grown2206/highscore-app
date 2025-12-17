import React, { useMemo, memo } from 'react';
import { Trophy, Award, Star, Lock } from 'lucide-react';
import { calculateBadges, calculateUserStats } from '../utils/badges';

function BadgesView({ sessionHits, historyData, settings }) {
  // Berechne User-Stats und Badges
  const stats = useMemo(
    () => calculateUserStats(sessionHits, historyData, settings),
    [sessionHits, historyData, settings]
  );

  const badges = useMemo(
    () => calculateBadges(stats),
    [stats]
  );

  // Zähle erreichte Badges
  const unlockedCount = badges.filter(b => b.unlockedLevel).length;
  const maxLevelCount = badges.filter(b => b.maxLevel).length;

  const getColorClasses = (color, unlocked) => {
    const colors = {
      orange: unlocked ? 'from-orange-500 to-red-500 border-orange-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      purple: unlocked ? 'from-purple-500 to-pink-500 border-purple-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      yellow: unlocked ? 'from-yellow-500 to-amber-500 border-yellow-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      green: unlocked ? 'from-green-500 to-emerald-500 border-green-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      emerald: unlocked ? 'from-emerald-500 to-teal-500 border-emerald-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      blue: unlocked ? 'from-blue-500 to-cyan-500 border-blue-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      indigo: unlocked ? 'from-indigo-500 to-purple-500 border-indigo-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      teal: unlocked ? 'from-teal-500 to-cyan-500 border-teal-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
    };
    return colors[color] || colors.orange;
  };

  const getLevelColor = (levelId) => {
    const colors = {
      bronze: 'text-amber-600',
      silver: 'text-zinc-400',
      gold: 'text-yellow-400',
      platinum: 'text-cyan-400',
    };
    return colors[levelId] || 'text-zinc-500';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            Badges
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {unlockedCount} von {badges.length} Kategorien • {maxLevelCount} Max Level erreicht
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{unlockedCount}</div>
          <div className="text-xs text-zinc-500 uppercase">Badges</div>
        </div>
      </div>

      {/* Stats Übersicht */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
          <Star size={16} />
          Deine Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.sessions}</div>
            <div className="text-xs text-zinc-600 mt-1">Sessions</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.streaks}</div>
            <div className="text-xs text-zinc-600 mt-1">Längster Streak</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.daily_record}</div>
            <div className="text-xs text-zinc-600 mt-1">Tages-Rekord</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.spending.toFixed(0)}€</div>
            <div className="text-xs text-zinc-600 mt-1">Ausgaben</div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => {
          const IconComponent = badge.Icon;
          const unlocked = badge.unlockedLevel !== null;

          return (
            <div
              key={badge.category}
              className={`bg-gradient-to-br ${getColorClasses(badge.color, unlocked)} border rounded-2xl p-6 transition-all hover:scale-[1.02]`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${unlocked ? 'bg-white/10' : 'bg-zinc-800/50'}`}>
                    <IconComponent size={24} className={unlocked ? 'text-white' : 'text-zinc-600'} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${unlocked ? 'text-white' : 'text-zinc-500'}`}>
                      {badge.name}
                    </h4>
                    <p className={`text-xs ${unlocked ? 'text-white/60' : 'text-zinc-600'}`}>
                      {badge.description}
                    </p>
                  </div>
                </div>
                {badge.maxLevel && (
                  <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-2 py-1">
                    <span className="text-xs font-bold text-yellow-300">MAX</span>
                  </div>
                )}
              </div>

              {/* Current Level */}
              {badge.unlockedLevel && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{badge.unlockedLevel.icon}</span>
                  <div>
                    <div className={`text-sm font-bold ${getLevelColor(badge.unlockedLevel.id)}`}>
                      {badge.unlockedLevel.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {badge.currentValue} / {badge.unlockedLevel.requirement}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {badge.nextLevel && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={unlocked ? 'text-white/80' : 'text-zinc-600'}>
                      Nächstes Level: {badge.nextLevel.name}
                    </span>
                    <span className={unlocked ? 'text-white/60' : 'text-zinc-600'}>
                      {badge.currentValue} / {badge.nextLevel.requirement}
                    </span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${unlocked ? 'bg-white/30' : 'bg-zinc-700'}`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Locked State */}
              {!unlocked && (
                <div className="flex items-center gap-2 mt-3">
                  <Lock size={14} className="text-zinc-600" />
                  <span className="text-xs text-zinc-600">
                    Noch {badge.nextLevel.requirement - badge.currentValue} fehlen
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Award size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-white">Badge-System:</span> Sammle Badges indem du
              die App nutzt! Jedes Badge hat 4 Level: Bronze, Silber, Gold und Platinum. Dein
              Fortschritt wird automatisch getrackt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BadgesView);
