import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Week Comparison Chart Component
 * Compares last 7 days with previous 7 days
 */
export default function WeekComparisonChart({ comparisonStats }) {
  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-blue-500"/>
        <h3 className="text-sm font-bold text-blue-400 uppercase">Wochenvergleich</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-950 p-4 rounded-xl text-center">
          <p className="text-xs text-zinc-500 uppercase mb-2">Letzte 7 Tage</p>
          <p className="text-3xl font-bold text-blue-400">{comparisonStats.last7}</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl text-center">
          <p className="text-xs text-zinc-500 uppercase mb-2">Vorherige 7 Tage</p>
          <p className="text-3xl font-bold text-purple-400">{comparisonStats.prev7}</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl text-center">
          <p className="text-xs text-zinc-500 uppercase mb-2">Veränderung</p>
          <div className="flex items-center justify-center gap-2">
            <p className={`text-3xl font-bold ${
              comparisonStats.trend === 'up' ? 'text-rose-400' :
              comparisonStats.trend === 'down' ? 'text-emerald-400' : 'text-zinc-400'
            }`}>
              {comparisonStats.change}%
            </p>
            {comparisonStats.trend === 'up' && <TrendingUp size={20} className="text-rose-400" />}
            {comparisonStats.trend === 'down' && <TrendingDown size={20} className="text-emerald-400" />}
          </div>
        </div>
      </div>
    </div>
  );
}
