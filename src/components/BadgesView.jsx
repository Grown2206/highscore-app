import React, { useMemo, memo } from 'react';
import { Trophy, Award, Star, Lock, Clock, AlertTriangle } from 'lucide-react';
import { calculateBadges, calculateUserStats } from '../utils/badges';

function BadgesView({ sessionHits, historyData, settings, badgeHistory = [] }) {
  // Berechne User-Stats und Badges mit Error-Handling
  const stats = useMemo(() => {
    try {
      return calculateUserStats(sessionHits, historyData, settings);
    } catch (error) {
      console.error('BadgesView: calculateUserStats failed', error, {
        sessionHitsCount: sessionHits?.length,
        historyDataCount: historyData?.length,
        hasSettings: !!settings
      });
      return null;
    }
  }, [sessionHits, historyData, settings]);

  const badges = useMemo(() => {
    try {
      if (!stats) return [];
      return calculateBadges(stats);
    } catch (error) {
      console.error('BadgesView: calculateBadges failed', error, {
        hasStats: !!stats
      });
      return [];
    }
  }, [stats]);

  // Error State - Zeige Fehler-UI wenn Stats nicht berechnet werden konnten
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] p-6">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Badge-System Fehler</h2>
        <p className="text-zinc-400 text-center mb-4">
          Die Badge-Statistiken konnten nicht berechnet werden.
        </p>
        {typeof window !== 'undefined' && (
          <button
            onClick={() => window.location.reload()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            App neu laden
          </button>
        )}
      </div>
    );
  }

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
      pink: unlocked ? 'from-pink-500 to-rose-500 border-pink-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      rose: unlocked ? 'from-rose-500 to-pink-600 border-rose-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      cyan: unlocked ? 'from-cyan-500 to-blue-500 border-cyan-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      violet: unlocked ? 'from-violet-500 to-purple-500 border-violet-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
      amber: unlocked ? 'from-amber-500 to-yellow-500 border-amber-500/30' : 'from-zinc-700 to-zinc-800 border-zinc-700',
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

      {/* Recently Unlocked */}
      {badgeHistory.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-yellow-400 uppercase mb-4 flex items-center gap-2">
            <Clock size={16} />
            Kürzlich freigeschaltet
          </h3>
          <div className="space-y-2">
            {badgeHistory.slice(0, 5).map((entry, i) => {
              const timeAgo = Math.floor((Date.now() - entry.timestamp) / 1000 / 60); // Minuten
              const timeStr = timeAgo < 1 ? 'Gerade eben' :
                             timeAgo < 60 ? `vor ${timeAgo}m` :
                             timeAgo < 1440 ? `vor ${Math.floor(timeAgo / 60)}h` :
                             `vor ${Math.floor(timeAgo / 1440)}d`;

              return (
                <div key={i} className="bg-zinc-900/50 border border-yellow-500/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{entry.name}</div>
                      <div className="text-xs text-yellow-400">{entry.levelName}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">{timeStr}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                      {badge.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${unlocked ? 'bg-white/30' : 'bg-zinc-700'}`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={unlocked ? 'text-white/60' : 'text-zinc-600'}>
                      {badge.currentValue} / {badge.nextLevel.requirement}
                    </span>
                    {badge.remaining > 0 && (
                      <span className={`font-medium ${unlocked ? 'text-white/80' : 'text-zinc-500'}`}>
                        {badge.remaining} verbleibend
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Locked State */}
              {!unlocked && (
                <div className="flex items-center gap-2 mt-3">
                  <Lock size={14} className="text-zinc-600" />
                  <span className="text-xs text-zinc-600">
                    Noch {badge.remaining} fehlen
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
