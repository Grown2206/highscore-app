import React from 'react';
import { Tag } from 'lucide-react';

/**
 * Strain Distribution Chart Component
 * Shows top 5 most used strains with hit count and cost
 */
export default function StrainDistributionChart({ strainStats, totalStrainHits }) {
  if (!strainStats || strainStats.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-zinc-900 border border-purple-500/30 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 flex items-center gap-2">
        <Tag size={16} />
        Sorten-Verteilung (Top 5)
      </h3>
      <div className="space-y-3">
        {strainStats.map((strain, i) => {
          const percentage = totalStrainHits > 0 ? (strain.count / totalStrainHits) * 100 : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">{strain.name}</span>
                <span className="text-zinc-500">{strain.count} Hits · {strain.cost.toFixed(2)}€</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-600 text-right">{percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
