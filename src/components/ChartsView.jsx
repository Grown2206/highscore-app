import React, { useMemo } from 'react';
import { Clock, CalendarDays } from 'lucide-react';

export default function ChartsView({ historyData, sessionHits }) {
  const weekStats = useMemo(() => {
     const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
     const counts = Array(7).fill(0);
     historyData.forEach(h => counts[new Date(h.date).getDay()] += h.count);
     return days.map((d,i) => ({ day:d, val:counts[i] }));
  }, [historyData]);
  const maxW = Math.max(...weekStats.map(s=>s.val), 1);

  const hourlyDist = useMemo(() => {
    const dist = Array(24).fill(0);
    sessionHits.forEach(h => dist[new Date(h.timestamp).getHours()]++);
    return dist;
  }, [sessionHits]);
  const maxH = Math.max(...hourlyDist, 1);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Statistik</h2>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-amber-500"/><h3 className="text-sm font-bold text-zinc-400 uppercase">Tageszeit Aktivität</h3></div>
         <div className="h-32 flex items-end gap-1">
            {hourlyDist.map((count, h) => (
               <div key={h} className="flex-1 bg-zinc-800 hover:bg-amber-500/50 transition-colors rounded-t-sm relative group" style={{ height: `${(count/maxH)*100}%` }}>
                  {h % 6 === 0 && <span className="absolute -bottom-5 left-0 text-[8px] text-zinc-600">{h}h</span>}
                  {count > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">{count}</div>}
               </div>
            ))}
         </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-2 mb-4"><CalendarDays size={16} className="text-purple-500"/><h3 className="text-sm font-bold text-zinc-400 uppercase">Wochentage</h3></div>
         <div className="flex justify-between items-end h-32 gap-2">
            {weekStats.map(s => (
                <div key={s.day} className="flex-1 flex flex-col justify-end items-center gap-2">
                   <div className="w-full bg-zinc-800 rounded-t-sm hover:bg-purple-500/50 transition-colors relative group" style={{ height: `${(s.val/maxW)*100}%` }}>
                       {s.val > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">{s.val}</div>}
                   </div>
                   <span className="text-[10px] text-zinc-500 uppercase">{s.day}</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}