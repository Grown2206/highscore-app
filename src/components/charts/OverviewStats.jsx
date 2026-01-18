import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Overview Statistics Component
 * Displays total hits, active days, total amount, and average per day
 */
export default function OverviewStats({ totalStats }) {
  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
        <TrendingUp size={16} />
        Gesamt-Übersicht
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-emerald-400">{totalStats.totalHits}</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Gesamt Hits</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-purple-400">{totalStats.activeDays}</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Aktive Tage</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-lime-400">{totalStats.totalAmount.toFixed(1)}g</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Gesamt Menge</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-cyan-400">{totalStats.avgPerDay.toFixed(1)}</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Ø pro Tag</p>
        </div>
      </div>
    </div>
  );
}
