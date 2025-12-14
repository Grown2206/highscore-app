import React from 'react';
import { Lock } from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../utils/achievements';

export default function AchievementsView({ achievements }) {
  const sorted = [...ALL_ACHIEVEMENTS].sort((a,b) => {
      const au = achievements.some(x=>x.id===a.id);
      const bu = achievements.some(x=>x.id===b.id);
      return bu - au;
  });
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Medaillen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         {sorted.map(a => {
             const un = achievements.find(x=>x.id===a.id);
             const IconComponent = a.Icon;
             return (
                 <div key={a.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${un ? 'bg-zinc-900 border-emerald-500/30' : 'bg-zinc-950 border-zinc-800 opacity-50'}`}>
                    <div className={`p-3 rounded-full ${un ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-lg' : 'bg-zinc-800 text-zinc-600'}`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm ${un?'text-white':'text-zinc-500'}`}>{a.title}</h4>
                            {!un && <Lock size={12} className="text-zinc-600"/>}
                        </div>
                        <p className="text-xs text-zinc-500">{a.desc}</p>
                        {un && <p className="text-[10px] text-emerald-500 mt-1">{new Date(un.date).toLocaleDateString()}</p>}
                    </div>
                 </div>
             )
         })}
      </div>
    </div>
  );
}