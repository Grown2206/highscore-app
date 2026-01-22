import React from 'react';
import { TrendingUp, TrendingDown, Calendar, ArrowRight, Minus } from 'lucide-react';

interface ComparisonStats {
  last7: number;
  prev7: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface WeekComparisonChartProps {
  comparisonStats: ComparisonStats;
}

/**
 * Enhanced Week Comparison Chart Component
 * Compares last 7 days with previous 7 days with visual comparison bars
 */
export default function WeekComparisonChart({ comparisonStats }: WeekComparisonChartProps) {
  const maxValue = Math.max(comparisonStats.last7, comparisonStats.prev7);
  const last7Percent = maxValue > 0 ? (comparisonStats.last7 / maxValue) * 100 : 0;
  const prev7Percent = maxValue > 0 ? (comparisonStats.prev7 / maxValue) * 100 : 0;

  const getTrendIcon = () => {
    if (comparisonStats.trend === 'up') return TrendingUp;
    if (comparisonStats.trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (comparisonStats.trend === 'up') return 'var(--accent-error)';
    if (comparisonStats.trend === 'down') return 'var(--accent-success)';
    return 'var(--text-tertiary)';
  };

  const getTrendBgColor = () => {
    if (comparisonStats.trend === 'up') return 'color-mix(in srgb, var(--accent-error) 10%, transparent)';
    if (comparisonStats.trend === 'down') return 'color-mix(in srgb, var(--accent-success) 10%, transparent)';
    return 'var(--bg-tertiary)';
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();
  const trendBgColor = getTrendBgColor();

  return (
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border"
      style={{
        background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-primary) 10%, transparent), var(--bg-secondary))',
        borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}
          >
            <Calendar size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-primary)' }}>Wochenvergleich</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>7-Tage Trend</p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: trendBgColor }}
        >
          <TrendIcon size={16} style={{ color: trendColor }} />
          <span className="text-lg font-bold" style={{ color: trendColor }}>
            {comparisonStats.change > 0 ? '+' : ''}{comparisonStats.change}%
          </span>
        </div>
      </div>

      {/* Comparison bars */}
      <div className="space-y-4 mb-6">
        {/* Last 7 days */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>Letzte 7 Tage</span>
            <span className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>{comparisonStats.last7}</span>
          </div>
          <div className="h-8 rounded-lg overflow-hidden relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div
              className="h-full transition-all duration-500 relative"
              style={{
                width: `${last7Percent}%`,
                background: `linear-gradient(to right, var(--chart-gradient1), var(--chart-gradient2))`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Previous 7 days */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>Vorherige 7 Tage</span>
            <span className="text-xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{comparisonStats.prev7}</span>
          </div>
          <div className="h-8 rounded-lg overflow-hidden relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div
              className="h-full transition-all duration-500 relative"
              style={{
                width: `${prev7Percent}%`,
                background: `linear-gradient(to right, var(--accent-secondary), color-mix(in srgb, var(--accent-secondary) 80%, white))`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-3 h-3 rounded"
            style={{ background: 'linear-gradient(to right, var(--chart-gradient1), var(--chart-gradient2))' }}
          ></div>
          <span style={{ color: 'var(--text-tertiary)' }}>Aktuell</span>
        </div>
        <ArrowRight size={12} style={{ color: 'var(--text-disabled)' }} />
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-3 h-3 rounded"
            style={{
              background: `linear-gradient(to right, var(--accent-secondary), color-mix(in srgb, var(--accent-secondary) 80%, white))`,
            }}
          ></div>
          <span style={{ color: 'var(--text-tertiary)' }}>Vorherig</span>
        </div>
      </div>
    </div>
  );
}
