import React from 'react';
import { DollarSign } from 'lucide-react';

/**
 * Cost Timeline Chart Component
 * Shows daily cost distribution over last 30 days
 */
export default function CostTimelineChart({ costTimeline, maxDailyCost }) {
  if (!costTimeline || costTimeline.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-zinc-900 border border-yellow-500/30 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-yellow-400 uppercase mb-4 flex items-center gap-2">
        <DollarSign size={16} />
        Kosten-Timeline (30 Tage)
      </h3>
      <div className="h-32 flex items-end gap-1">
        {costTimeline.map((day, i) => {
          const barHeight = Math.max(2, (day.cost / maxDailyCost) * 100);
          const displayDate = new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
          return (
            <div key={i} className="flex-1 min-w-[4px] flex flex-col justify-end items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm hover:from-yellow-500 hover:to-yellow-300 transition-colors relative group"
                style={{ height: `${barHeight}%` }}
              >
                {day.cost > 0 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {displayDate}<br/>
                    {day.cost.toFixed(2)}€ ({day.count} Hits)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500">
          Gesamt: <span className="text-yellow-400 font-bold">{costTimeline.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}€</span>
        </p>
      </div>
    </div>
  );
}
