import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Activity Heatmap Component
 * GitHub-style activity heatmap for last 12 weeks
 */
export default function ActivityHeatmap({ heatmapData, maxHeatmapCount }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-emerald-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Aktivitäts-Heatmap</h3>
        <span className="text-[10px] text-zinc-600 ml-auto">Letzte 12 Wochen</span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-flow-col gap-1 min-w-max">
          {heatmapData.map((week, wi) => (
            <div key={wi} className="grid grid-rows-7 gap-1">
              {week.map((day, di) => {
                const intensity = day.count > 0 ? (day.count / maxHeatmapCount) : 0;
                const bgColor = day.count === 0
                  ? 'bg-zinc-800'
                  : `bg-emerald-500`;
                const opacity = day.count === 0 ? '' : `opacity-${Math.ceil(intensity * 10) * 10}`;

                return (
                  <div
                    key={di}
                    className={`w-4 h-4 rounded-sm ${bgColor} ${opacity} hover:ring-2 hover:ring-emerald-400 transition-all group relative cursor-pointer`}
                    style={{ opacity: day.count > 0 ? 0.2 + (intensity * 0.8) : undefined }}
                    title={`${day.date}: ${day.count} Hits`}
                  >
                    <div className="absolute hidden group-hover:block -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {day.count} Hit{day.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-[10px] text-zinc-600">
        <span>Weniger</span>
        <div className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-500 opacity-30 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-500 opacity-60 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-500 opacity-100 rounded-sm"></div>
        <span>Mehr</span>
      </div>
    </div>
  );
}
