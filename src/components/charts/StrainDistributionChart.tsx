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

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-400 bg-yellow-500/20';
    if (index === 1) return 'text-zinc-300 bg-zinc-500/20';
    if (index === 2) return 'text-amber-600 bg-amber-500/20';
    return 'text-purple-400 bg-purple-500/10';
  };

  const getBarGradient = (index: number) => {
    if (index === 0) return 'from-yellow-500 via-purple-500 to-pink-500';
    if (index === 1) return 'from-zinc-400 via-purple-500 to-pink-500';
    if (index === 2) return 'from-amber-600 via-purple-500 to-pink-500';
    return 'from-purple-500 to-pink-500';
  };

  const totalCost = strainStats.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="bg-gradient-to-br from-purple-900/10 to-zinc-900 border border-purple-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Tag size={16} className="text-purple-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-300 uppercase">Sorten-Verteilung</h3>
            <p className="text-xs text-zinc-500">Top 5 Favoriten</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-purple-400">{totalCost.toFixed(2)}€</div>
          <div className="text-xs text-zinc-500">Gesamt</div>
        </div>
      </div>

      <div className="space-y-4">
        {strainStats.map((strain, i) => {
          const percentage = totalStrainHits > 0 ? (strain.count / totalStrainHits) * 100 : 0;
          const RankIcon = getRankIcon(i);
          const rankColor = getRankColor(i);
          const barGradient = getBarGradient(i);

          return (
            <div
              key={i}
              className="group relative bg-zinc-900/30 border border-zinc-800 rounded-xl p-3 hover:border-purple-500/30 transition-all"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Rank badge */}
              <div className={`absolute -top-2 -left-2 p-1.5 rounded-lg ${rankColor}`}>
                <RankIcon size={12} />
              </div>

              {/* Strain info */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 font-bold text-xs">#{i + 1}</span>
                  <span className="text-zinc-300 font-medium text-sm">{strain.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-purple-400 font-bold">{strain.count}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-pink-400 font-bold">{strain.cost.toFixed(2)}€</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all duration-500 group-hover:opacity-90`}
                    style={{ width: `${percentage}%` }}
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
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-purple-500/5"></div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Trophy size={12} className="text-yellow-400"/>
          <span className="text-zinc-500">Top Strain</span>
        </div>
        <div className="text-zinc-600">·</div>
        <div className="text-zinc-500">
          <span className="text-purple-400 font-medium">{totalStrainHits}</span> Gesamt Hits
        </div>
      </div>
    </div>
  );
}
