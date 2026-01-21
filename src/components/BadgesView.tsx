import React, { useMemo, memo } from 'react';
import { Trophy, Award, Star, Lock, Clock, AlertTriangle } from 'lucide-react';
import { calculateBadges, calculateUserStats } from '../utils/badges';
import { HistoryDataEntry } from '../utils/historyDataHelpers.ts';
import { Settings } from '../hooks/useHitManagement.ts';

interface BadgeHistoryEntry {
  badgeId: string;
  level: number;
  unlockedAt: number;
}

interface BadgesViewProps {
  historyData: HistoryDataEntry[];
  settings: Settings;
  badgeHistory?: BadgeHistoryEntry[];
}

/**
 * BadgesView (v8.2 - Theme Support)
 * Badge system with full theme integration
 */
function BadgesView({ historyData, settings, badgeHistory = [] }: BadgesViewProps) {
  // Berechne User-Stats und Badges mit Error-Handling
  const stats = useMemo(() => {
    try {
      return calculateUserStats(historyData, settings);
    } catch (error) {
      console.error('BadgesView: calculateUserStats failed', error, {
        historyDataCount: historyData?.length,
        hasSettings: !!settings
      });
      return null;
    }
  }, [historyData, settings]);

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

  // Error State
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] p-6">
        <AlertTriangle size={48} style={{ color: 'var(--accent-error)' }} className="mb-4" />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Badge-System Fehler
        </h2>
        <p className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
          Die Badge-Statistiken konnten nicht berechnet werden.
        </p>
        {typeof window !== 'undefined' && (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
            }}
          >
            App neu laden
          </button>
        )}
      </div>
    );
  }

  const unlockedCount = badges.filter(b => b.unlockedLevel).length;
  const maxLevelCount = badges.filter(b => b.maxLevel).length;

  const getColorStyle = (color: string, unlocked: boolean) => {
    if (unlocked) {
      return {
        background: `linear-gradient(135deg, var(--chart-primary), var(--chart-secondary))`,
        borderColor: 'color-mix(in srgb, var(--chart-primary) 30%, transparent)',
      };
    }
    return {
      background: `linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))`,
      borderColor: 'var(--border-primary)',
    };
  };

  const getLevelColor = (levelId: string) => {
    const colors = {
      bronze: 'var(--accent-warning)',
      silver: 'var(--text-secondary)',
      gold: 'var(--chart-tertiary)',
      platinum: 'var(--accent-info)',
    };
    return colors[levelId as keyof typeof colors] || 'var(--text-tertiary)';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={28} style={{ color: 'var(--chart-tertiary)' }} />
            Badges
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {unlockedCount} von {badges.length} Kategorien • {maxLevelCount} Max Level erreicht
          </p>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--chart-tertiary) 10%, transparent), color-mix(in srgb, var(--accent-warning) 10%, transparent))`,
            border: '1px solid color-mix(in srgb, var(--chart-tertiary) 30%, transparent)',
          }}
        >
          <div className="text-3xl font-bold" style={{ color: 'var(--chart-tertiary)' }}>
            {unlockedCount}
          </div>
          <div className="text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Badges
          </div>
        </div>
      </div>

      {/* Recently Unlocked */}
      {badgeHistory.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--chart-tertiary) 10%, transparent), color-mix(in srgb, var(--accent-warning) 10%, transparent))`,
            border: '1px solid color-mix(in srgb, var(--chart-tertiary) 20%, transparent)',
          }}
        >
          <h3
            className="text-sm font-bold uppercase mb-4 flex items-center gap-2"
            style={{ color: 'var(--chart-tertiary)' }}
          >
            <Clock size={16} />
            Kürzlich freigeschaltet
          </h3>
          <div className="space-y-2">
            {badgeHistory.slice(0, 5).map((entry, i) => {
              const timeAgo = Math.floor((Date.now() - entry.timestamp) / 1000 / 60);
              const timeStr = timeAgo < 1 ? 'Gerade eben' :
                             timeAgo < 60 ? `vor ${timeAgo}m` :
                             timeAgo < 1440 ? `vor ${Math.floor(timeAgo / 60)}h` :
                             `vor ${Math.floor(timeAgo / 1440)}d`;

              return (
                <div
                  key={i}
                  className="rounded-xl p-3 flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid color-mix(in srgb, var(--chart-tertiary) 10%, transparent)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {entry.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--chart-tertiary)' }}>
                        {entry.levelName}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {timeStr}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Übersicht */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <h3
          className="text-sm font-bold uppercase mb-4 flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Star size={16} />
          Deine Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-warning)' }}>
              {stats.sessions}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Sessions
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
              {stats.streaks}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Längster Streak
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--chart-tertiary)' }}>
              {stats.daily_record}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Tages-Rekord
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-success)' }}>
              {stats.spending.toFixed(0)}€
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Ausgaben
            </div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => {
          const IconComponent = badge.Icon;
          const unlocked = badge.unlockedLevel !== null;
          const colorStyle = getColorStyle(badge.color, unlocked);

          return (
            <div
              key={badge.category}
              className="border rounded-2xl p-6 transition-all hover:scale-[1.02]"
              style={colorStyle}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      backgroundColor: unlocked
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'color-mix(in srgb, var(--bg-tertiary) 50%, transparent)',
                    }}
                  >
                    <IconComponent
                      size={24}
                      style={{ color: unlocked ? 'white' : 'var(--text-tertiary)' }}
                    />
                  </div>
                  <div>
                    <h4
                      className="font-bold"
                      style={{ color: unlocked ? 'white' : 'var(--text-tertiary)' }}
                    >
                      {badge.name}
                    </h4>
                    <p
                      className="text-xs"
                      style={{ color: unlocked ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-tertiary)' }}
                    >
                      {badge.description}
                    </p>
                  </div>
                </div>
                {badge.maxLevel && (
                  <div
                    className="rounded-lg px-2 py-1"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--chart-tertiary) 20%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--chart-tertiary) 30%, transparent)',
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: 'var(--chart-tertiary)' }}>
                      MAX
                    </span>
                  </div>
                )}
              </div>

              {/* Current Level */}
              {badge.unlockedLevel && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{badge.unlockedLevel.icon}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: getLevelColor(badge.unlockedLevel.id) }}>
                      {badge.unlockedLevel.name}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {badge.currentValue} / {badge.unlockedLevel.requirement}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {badge.nextLevel && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: unlocked ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-tertiary)' }}>
                      Nächstes Level: {badge.nextLevel.name}
                    </span>
                    <span style={{ color: unlocked ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-tertiary)' }}>
                      {badge.progress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${badge.progress}%`,
                        backgroundColor: unlocked ? 'rgba(255, 255, 255, 0.3)' : 'var(--bg-tertiary)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: unlocked ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-tertiary)' }}>
                      {badge.currentValue} / {badge.nextLevel.requirement}
                    </span>
                    {badge.remaining > 0 && (
                      <span
                        className="font-medium"
                        style={{ color: unlocked ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-tertiary)' }}
                      >
                        {badge.remaining} verbleibend
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Locked State */}
              {!unlocked && (
                <div className="flex items-center gap-2 mt-3">
                  <Lock size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Noch {badge.remaining} fehlen
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-start gap-3">
          <Award size={16} style={{ color: 'var(--chart-tertiary)' }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Badge-System:</span> Sammle Badges indem du
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
