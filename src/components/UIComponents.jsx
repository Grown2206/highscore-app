import React from 'react';

export const MetricCard = ({ label, val, icon, color }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-24">
     <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">{icon} {label}</div>
     <div className={`text-2xl font-bold font-mono truncate ${color}`}>{val}</div>
  </div>
);

export const AdminMetric = ({ label, value, subtitle, icon, active }) => (
  <div className={`p-3 flex flex-col items-start gap-1 ${active ? 'bg-emerald-500/10' : 'bg-zinc-900'} transition-colors`}>
     <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase font-bold">{icon}{label}</div>
     <div className={`text-sm font-mono font-bold ${active ? 'text-emerald-500' : 'text-zinc-300'}`}>{value}</div>
     {subtitle && <div className="text-[10px] text-zinc-600 font-mono">{subtitle}</div>}
  </div>
);
