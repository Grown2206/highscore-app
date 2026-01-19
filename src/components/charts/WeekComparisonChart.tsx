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
    if (comparisonStats.trend === 'up') return 'rose';
    if (comparisonStats.trend === 'down') return 'emerald';
    return 'zinc';
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();

  return (
    <div className="bg-gradient-to-br from-blue-900/10 to-zinc-900 border border-blue-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Calendar size={16} className="text-blue-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-300 uppercase">Wochenvergleich</h3>
            <p className="text-xs text-zinc-500">7-Tage Trend</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          trendColor === 'rose' ? 'bg-rose-500/10' :
          trendColor === 'emerald' ? 'bg-emerald-500/10' :
          'bg-zinc-800'
        }`}>
          <TrendIcon size={16} className={`text-${trendColor}-400`}/>
          <span className={`text-lg font-bold text-${trendColor}-400`}>
            {comparisonStats.change > 0 ? '+' : ''}{comparisonStats.change}%
          </span>
        </div>
      </div>

      {/* Comparison bars */}
      <div className="space-y-4 mb-6">
        {/* Last 7 days */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase font-medium">Letzte 7 Tage</span>
            <span className="text-xl font-bold text-blue-400">{comparisonStats.last7}</span>
          </div>
          <div className="h-8 bg-zinc-900 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-300"
              style={{ width: `${last7Percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Previous 7 days */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase font-medium">Vorherige 7 Tage</span>
            <span className="text-xl font-bold text-purple-400">{comparisonStats.prev7}</span>
          </div>
          <div className="h-8 bg-zinc-900 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 group-hover:from-purple-500 group-hover:to-purple-300"
              style={{ width: `${prev7Percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-600 to-blue-400"></div>
          <span className="text-zinc-500">Aktuell</span>
        </div>
        <ArrowRight size={12} className="text-zinc-600"/>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-600 to-purple-400"></div>
          <span className="text-zinc-500">Vorherig</span>
        </div>
      </div>
    </div>
  );
}
