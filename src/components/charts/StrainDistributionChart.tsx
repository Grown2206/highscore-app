import React from 'react';
import { Tag, Trophy, Medal, Award } from 'lucide-react';

interface StrainStat {
  name: string;
  count: number;
  cost: number;
}

interface StrainDistributionChartProps {
  strainStats: StrainStat[];
  totalStrainHits: number;
}

/**
 * Enhanced Strain Distribution Chart Component
 * Shows top 5 most used strains with hit count, cost, and ranking
 */
export default function StrainDistributionChart({ strainStats, totalStrainHits }: StrainDistributionChartProps) {
  if (!strainStats || strainStats.length === 0) return null;

  const getRankIcon = (index: number) => {
    if (index === 0) return Trophy;
    if (index === 1) return Medal;
    if (index === 2) return Award;
    return Tag;
  };

  const getRankStyles = (index: number) => {
    if (index === 0)
      return {
        color: 'var(--accent-warning)',
        bg: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
      };
    if (index === 1)
      return {
        color: 'var(--text-secondary)',
        bg: 'color-mix(in srgb, var(--text-secondary) 20%, transparent)',
      };
    if (index === 2)
      return {
        color: 'var(--accent-warning)',
        bg: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)',
      };
    return {
      color: 'var(--accent-secondary)',
      bg: 'color-mix(in srgb, var(--accent-secondary) 10%, transparent)',
    };
  };

  const getBarGradient = (index: number) => {
    if (index === 0) return 'linear-gradient(to right, var(--accent-warning), var(--accent-secondary), var(--accent-primary))';
    if (index === 1) return 'linear-gradient(to right, var(--text-secondary), var(--accent-secondary), var(--accent-primary))';
    if (index === 2) return 'linear-gradient(to right, var(--accent-warning), var(--accent-secondary), var(--accent-primary))';
    return 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))';
  };

  const totalCost = strainStats.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border"
      style={{
        background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-secondary) 10%, transparent), var(--bg-secondary))',
        borderColor: 'color-mix(in srgb, var(--accent-secondary) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 20%, transparent)' }}
          >
            <Tag size={16} style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-secondary)' }}>Sorten-Verteilung</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Top 5 Favoriten</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{totalCost.toFixed(2)}€</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gesamt</div>
        </div>
      </div>

      <div className="space-y-4">
        {strainStats.map((strain, i) => {
          const percentage = totalStrainHits > 0 ? (strain.count / totalStrainHits) * 100 : 0;
          const RankIcon = getRankIcon(i);
          const rankStyles = getRankStyles(i);
          const barGradient = getBarGradient(i);

          return (
            <div
              key={i}
              className="group relative rounded-xl p-3 transition-all border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 30%, transparent)',
                borderColor: 'var(--border-primary)',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Rank badge */}
              <div
                className="absolute -top-2 -left-2 p-1.5 rounded-lg"
                style={{
                  backgroundColor: rankStyles.bg,
                }}
              >
                <RankIcon size={12} style={{ color: rankStyles.color }} />
              </div>

              {/* Strain info */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs" style={{ color: 'var(--text-disabled)' }}>#{i + 1}</span>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{strain.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>{strain.count}</span>
                  <span style={{ color: 'var(--text-disabled)' }}>·</span>
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{strain.cost.toFixed(2)}€</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                    style={{
                      width: `${percentage}%`,
                      background: barGradient,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                  </div>
                </div>
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <span className="text-[10px] text-white font-bold drop-shadow-lg">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 5%, transparent)' }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t flex items-center justify-center gap-4 text-xs" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2">
          <Trophy size={12} style={{ color: 'var(--accent-warning)' }} />
          <span style={{ color: 'var(--text-tertiary)' }}>Top Strain</span>
        </div>
        <div style={{ color: 'var(--text-disabled)' }}>·</div>
        <div style={{ color: 'var(--text-tertiary)' }}>
          <span className="font-medium" style={{ color: 'var(--accent-secondary)' }}>{totalStrainHits}</span> Gesamt Hits
        </div>
      </div>
    </div>
  );
}
