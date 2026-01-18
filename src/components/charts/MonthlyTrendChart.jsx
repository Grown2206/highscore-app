import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

/**
 * Monthly Trend Chart Component
 * Shows hit count and cost trends over last 6 months
 */
export default function MonthlyTrendChart({ monthlyTrend, maxMonthlyCount }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon size={16} className="text-indigo-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Monats-Trend</h3>
        <span className="text-[10px] text-zinc-600 ml-auto">Letzte 6 Monate</span>
      </div>

      {monthlyTrend.length > 0 ? (
        <div className="h-32 flex items-end gap-2">
          {monthlyTrend.map((m, i) => {
            const monthName = new Date(m.month + '-01').toLocaleDateString('de-DE', { month: 'short' });
            const barHeight = Math.max(4, (m.count / maxMonthlyCount) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-500 hover:to-indigo-300 transition-colors relative group"
                  style={{ height: `${barHeight}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {m.count} Hits<br/>
                    {m.cost.toFixed(2)}€
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase">{monthName}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">Noch keine Daten für Monats-Trend vorhanden</p>
          <p className="text-zinc-700 text-xs mt-1">Nutze die App für mindestens einen Monat</p>
        </div>
      )}
    </div>
  );
}
