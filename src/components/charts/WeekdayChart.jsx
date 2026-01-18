import React from 'react';
import { CalendarDays } from 'lucide-react';

/**
 * Weekday Distribution Chart Component
 * Shows hit distribution across days of the week
 */
export default function WeekdayChart({ weekStats, maxW }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={16} className="text-purple-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Wochentage</h3>
      </div>
      <div className="flex justify-between items-end h-32 gap-2">
        {weekStats.map(s => (
          <div key={s.day} className="flex-1 flex flex-col justify-end items-center gap-2">
            <div
              className="w-full bg-zinc-800 rounded-t-sm hover:bg-purple-500/50 transition-colors relative group"
              style={{ height: `${(s.val/maxW)*100}%` }}
            >
              {s.val > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">
                  {s.val}
                </div>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 uppercase">{s.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
