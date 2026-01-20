import React, { useMemo, useEffect, useRef } from 'react';
import { Trophy, Star, Flame, Target, Calendar, TrendingUp, Award, Lock, Sparkles } from 'lucide-react';
import { Hit } from '../hooks/useHitSelection.ts';
import { HistoryDataEntry } from '../utils/historyDataHelpers.ts';
import { Settings } from '../hooks/useHitManagement.ts';
import { triggerAchievementConfetti } from '../utils/confetti';

interface AchievementsViewProps {
  sessionHits: Hit[];
  historyData: HistoryDataEntry[];
  settings: Settings;
}

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: any;
  rarity: Rarity;
  check: (hits: Hit[], history: HistoryDataEntry[]) => boolean;
}

// Rarity configs with theme-aware colors
const rarityConfig = {
  common: {
    gradient: 'linear-gradient(135deg, var(--chart-primary), var(--chart-secondary))',
    glowColor: 'var(--chart-primary)',
    borderOpacity: '0.3',
    label: 'Gewöhnlich',
  },
  rare: {
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    glowColor: '#3b82f6',
    borderOpacity: '0.4',
    label: 'Selten',
  },
  epic: {
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    glowColor: '#a855f7',
    borderOpacity: '0.5',
    label: 'Episch',
  },
  legendary: {
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    glowColor: '#fbbf24',
    borderOpacity: '0.6',
    label: 'Legendär',
  },
};

// Achievement definitions (v8.2 - Rarity System)
const achievementDefs: AchievementDef[] = [
  {
    id: 'first_hit',
    title: 'Erste Schritte',
    description: 'Dein erster Hit',
    icon: Star,
    rarity: 'common',
    check: (hits) => hits.length >= 1,
  },
  {
    id: 'rookie',
    title: 'Rookie',
    description: '10 Hits erreicht',
    icon: Target,
    rarity: 'common',
    check: (hits) => hits.length >= 10,
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: '50 Hits erreicht',
    icon: Award,
    rarity: 'rare',
    check: (hits) => hits.length >= 50,
  },
  {
    id: 'legend',
    title: 'Legende',
    description: '100 Hits erreicht',
    icon: Trophy,
    rarity: 'rare',
    check: (hits) => hits.length >= 100,
  },
  {
    id: 'master',
    title: 'Meister',
    description: '500 Hits erreicht',
    icon: Trophy,
    rarity: 'epic',
    check: (hits) => hits.length >= 500,
  },
  {
    id: 'week_streak',
    title: '7 Tage Streak',
    description: '7 Tage in Folge aktiv',
    icon: Flame,
    rarity: 'rare',
    check: (hits, history) => {
      if (history.length < 7) return false;
      const last7Days = history.slice(-7);
      return last7Days.every((d) => d.count > 0);
    },
  },
  {
    id: 'month_streak',
    title: '30 Tage Streak',
    description: '30 Tage in Folge aktiv',
    icon: Calendar,
    rarity: 'epic',
    check: (hits, history) => {
      if (history.length < 30) return false;
      const last30Days = history.slice(-30);
      return last30Days.every((d) => d.count > 0);
    },
  },
  {
    id: 'century',
    title: 'Jahrhundert',
    description: '100 Hits an einem Tag',
    icon: TrendingUp,
    rarity: 'legendary',
    check: (hits, history) => {
      return history.some((d) => d.count >= 100);
    },
  },
];

export default function AchievementsView({ sessionHits, historyData, settings }: AchievementsViewProps) {
  const prevUnlockedRef = useRef<Set<string>>(new Set());

  // Calculate achievement status
  const achievements = useMemo(() => {
    return achievementDefs.map((def) => ({
      ...def,
      unlocked: def.check(sessionHits || [], historyData || []),
    }));
  }, [sessionHits, historyData]);

  // Trigger confetti on new unlocks
  useEffect(() => {
    const currentUnlocked = new Set(achievements.filter((a) => a.unlocked).map((a) => a.id));

    // Find newly unlocked achievements
    const newlyUnlocked = achievements.filter(
      (a) => a.unlocked && !prevUnlockedRef.current.has(a.id)
    );

    // Trigger confetti for each new unlock
    newlyUnlocked.forEach((achievement) => {
      setTimeout(() => {
        triggerAchievementConfetti(achievement.rarity);
      }, 300);
    });

    prevUnlockedRef.current = currentUnlocked;
  }, [achievements]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  // Group by rarity
  const groupedAchievements = useMemo(() => {
    const groups: Record<Rarity, typeof achievements> = {
      common: [],
      rare: [],
      epic: [],
      legendary: [],
    };

    achievements.forEach((a) => {
      groups[a.rarity].push(a);
    });

    return groups;
  }, [achievements]);

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Trophy style={{ color: 'var(--accent-primary)' }} />
          Erfolge
        </h2>
      </div>

      {/* Progress Overview */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--bg-card), var(--bg-secondary))`,
          border: '2px solid var(--border-primary)',
          backdropFilter: 'var(--blur)',
        }}
      >
        {/* Animated background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(45deg, var(--chart-primary), var(--chart-secondary))',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {unlockedCount}/{totalCount}
              </p>
              <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Erfolge freigeschaltet
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {progressPercentage.toFixed(0)}%
              </p>
              <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Fortschritt
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                background: 'linear-gradient(90deg, var(--chart-primary), var(--chart-secondary))',
                boxShadow: progressPercentage > 0 ? 'var(--shadow-glow)' : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Achievements by Rarity */}
      {(['legendary', 'epic', 'rare', 'common'] as Rarity[]).map((rarity) => {
        const rarityAchievements = groupedAchievements[rarity];
        if (rarityAchievements.length === 0) return null;

        const config = rarityConfig[rarity];

        return (
          <div key={rarity} className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: config.glowColor }} />
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: config.glowColor }}>
                {config.label}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rarityAchievements.map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div
                    key={achievement.id}
                    className="relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-102"
                    style={{
                      backgroundColor: achievement.unlocked ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      borderColor: achievement.unlocked ? config.glowColor : 'var(--border-primary)',
                      opacity: achievement.unlocked ? 1 : 0.6,
                      backdropFilter: 'var(--blur)',
                      boxShadow: achievement.unlocked ? `0 0 20px ${config.glowColor}40` : 'none',
                    }}
                  >
                    <div className="p-6 relative z-10">
                      <div className="flex items-start gap-4">
                        <div
                          className="p-3 rounded-xl transition-all duration-300"
                          style={{
                            background: achievement.unlocked ? config.gradient : 'var(--bg-tertiary)',
                          }}
                        >
                          {achievement.unlocked ? (
                            <Icon size={24} className="text-white" />
                          ) : (
                            <Lock size={24} style={{ color: 'var(--text-tertiary)' }} />
                          )}
                        </div>

                        <div className="flex-1">
                          <h3
                            className="font-bold text-lg"
                            style={{ color: achievement.unlocked ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                          >
                            {achievement.title}
                          </h3>
                          <p
                            className="text-sm mt-1"
                            style={{ color: achievement.unlocked ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}
                          >
                            {achievement.description}
                          </p>

                          {achievement.unlocked && (
                            <div
                              className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                              }}
                            >
                              <Star size={12} style={{ color: config.glowColor }} />
                              <span className="text-xs font-bold uppercase" style={{ color: config.glowColor }}>
                                Freigeschaltet
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Animated glow for unlocked achievements */}
                    {achievement.unlocked && (
                      <div
                        className="absolute inset-0 pointer-events-none animate-pulse"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${config.glowColor}20, transparent)`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
