import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Hourly Distribution Chart Component
 * Shows hit distribution across 24 hours
 */
export default function HourlyDistributionChart({ hourlyDistribution, maxHourlyCount }) {
  if (!hourlyDistribution || hourlyDistribution.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-cyan-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Stündliche Verteilung</h3>
      </div>
      <div className="flex justify-between items-end h-32 gap-1 overflow-x-auto">
        {hourlyDistribution.map((h, i) => (
          <div key={i} className="flex-1 min-w-[8px] flex flex-col justify-end items-center gap-2">
            <div
              className="w-full bg-zinc-800 rounded-t-sm hover:bg-cyan-500/50 transition-colors relative group"
              style={{ height: `${(h.count / maxHourlyCount) * 100}%` }}
            >
              {h.count > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                  {h.hour}: {h.count}
                </div>
              )}
            </div>
            {i % 3 === 0 && (
              <span className="text-[8px] text-zinc-600">{h.hour.split(':')[0]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
