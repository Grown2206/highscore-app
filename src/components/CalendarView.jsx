import React, { useState, useEffect, useMemo, memo } from 'react';
import { Save, Wind, Scale, Coins, Clock, Tag, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import SwipeableHitRow from './SwipeableHitRow';

function CalendarView({ historyData, setHistoryData, sessionHits, settings, deleteHit }) {
    const [sel, setSel] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("");

    useEffect(() => {
        const d = historyData.find(h=>h.date===sel);
        setNote(d?.note||"");
    }, [sel, historyData]);

    const save = () => {
        if(navigator.vibrate) navigator.vibrate(10);
        setHistoryData(p => {
            const n = [...p]; const i = n.findIndex(h=>h.date===sel);
            if(i>=0) n[i].note = note; else n.push({date:sel,count:0,note});
            return n;
        });
    };

    const today = new Date();
    const days = Array.from({length:35},(_,i)=>{
        const d=new Date(today.getFullYear(), today.getMonth(), 1);
        d.setDate(d.getDate()-d.getDay()+1+i);
        return { iso: d.toISOString().split('T')[0], day: d.getDate(), curr: d.getMonth()===today.getMonth() };
    });

    // Tages-Statistiken berechnen
    const dayStats = useMemo(() => {
        const daySessions = sessionHits.filter(h => {
            const hitDate = new Date(h.timestamp).toISOString().split('T')[0];
            return hitDate === sel;
        });

        const totalHits = daySessions.length;
        const totalAmount = totalHits * (settings.bowlSize * (settings.weedRatio / 100));

        let totalCost = 0;
        const strainUsage = {};

        daySessions.forEach(hit => {
            const strain = settings.strains.find(s => s.name === hit.strainName);
            const price = strain?.price || hit.strainPrice || 0;
            const hitCost = settings.bowlSize * (settings.weedRatio / 100) * price;
            totalCost += hitCost;

            if (!strainUsage[hit.strainName]) {
                strainUsage[hit.strainName] = { count: 0, strain };
            }
            strainUsage[hit.strainName].count++;
        });

        const avgDuration = daySessions.length > 0
            ? daySessions.reduce((sum, h) => sum + (h.duration || 0), 0) / daySessions.length / 1000
            : 0;

        // Zeitspanne berechnen
        let timespan = null;
        if (daySessions.length > 0) {
            const times = daySessions.map(h => new Date(h.timestamp).getTime());
            const first = new Date(Math.min(...times));
            const last = new Date(Math.max(...times));
            timespan = { first, last, duration: (last - first) / 1000 / 60 / 60 }; // Stunden
        }

        return {
            sessions: daySessions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
            totalHits,
            totalAmount,
            totalCost,
            avgDuration,
            strainUsage: Object.entries(strainUsage).sort((a, b) => b[1].count - a[1].count),
            timespan
        };
    }, [sel, sessionHits, settings]);

    // Durchschnittswerte berechnen
    const avgStats = useMemo(() => {
        if (historyData.length === 0) return null;

        const totalDays = historyData.filter(h => h.count > 0).length;
        const totalHits = historyData.reduce((sum, h) => sum + h.count, 0); // FIX: sum + h.count
        const avgHitsPerDay = totalDays > 0 ? totalHits / totalDays : 0;

        // Durchschnittliche Kosten pro Tag
        let totalCost = 0;
        sessionHits.forEach(hit => {
            const strain = settings.strains.find(s => s.name === hit.strainName);
            const price = strain?.price || hit.strainPrice || 0;
            totalCost += settings.bowlSize * (settings.weedRatio / 100) * price;
        });
        const avgCostPerDay = totalDays > 0 ? totalCost / totalDays : 0;

        return { avgHitsPerDay, avgCostPerDay };
    }, [historyData, sessionHits, settings]);

    const getTrendIcon = (value, avg) => {
        if (value > avg * 1.2) return <TrendingUp className="text-rose-500" size={14} />;
        if (value < avg * 0.8) return <TrendingDown className="text-emerald-500" size={14} />;
        return <Minus className="text-zinc-500" size={14} />;
    };

    return (
        <div className="space-y-4 animate-in fade-in h-full flex flex-col pb-20">
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               <Calendar className="text-emerald-500" />
               Tagebuch
           </h2>

           {/* Kalender */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] text-zinc-600 font-bold uppercase">
                  {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=><div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                 {days.map(d=>{
                     const h = historyData.find(x=>x.date===d.iso);
                     const intensity = h?.count > 0 ? Math.min(h.count / 10, 1) : 0;
                     return (
                         <button
                             key={d.iso}
                             onClick={()=>setSel(d.iso)}
                             className={`aspect-square rounded-lg flex flex-col items-center justify-center relative border transition-all ${
                                 sel===d.iso
                                     ? 'bg-emerald-600 border-emerald-400 text-white'
                                     : h?.count > 0
                                         ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                         : 'border-transparent bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                             } ${!d.curr ? 'opacity-30' : ''}`}
                         >
                            <span className="text-xs font-bold">{d.day}</span>
                            {h?.count > 0 && (
                                <div
                                    className="absolute bottom-1 w-3/4 h-0.5 rounded-full bg-emerald-400"
                                    style={{ opacity: 0.3 + (intensity * 0.7) }}
                                />
                            )}
                         </button>
                     )
                 })}
              </div>
           </div>

           {/* Tages-Details */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
               <div className="flex items-center justify-between">
                   <div>
                       <h3 className="text-lg font-bold text-white">
                           {new Date(sel).toLocaleDateString('de-DE', {
                               weekday: 'long',
                               year: 'numeric',
                               month: 'long',
                               day: 'numeric'
                           })}
                       </h3>
                       {dayStats.totalHits === 0 && (
                           <p className="text-xs text-zinc-600 mt-1">Keine Sessions an diesem Tag</p>
                       )}
                   </div>
               </div>

               {/* Statistik-Karten */}
               {dayStats.totalHits > 0 && (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       <div className="bg-zinc-950 rounded-xl p-3">
                           <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase mb-1">
                               <Wind size={12} />
                               Hits
                               {avgStats && getTrendIcon(dayStats.totalHits, avgStats.avgHitsPerDay)}
                           </div>
                           <p className="text-2xl font-bold text-emerald-400">{dayStats.totalHits}</p>
                           {avgStats && (
                               <p className="text-[10px] text-zinc-600 mt-1">
                                   Ø {avgStats.avgHitsPerDay.toFixed(1)}
                               </p>
                           )}
                       </div>

                       <div className="bg-zinc-950 rounded-xl p-3">
                           <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase mb-1">
                               <Scale size={12} />
                               Menge
                           </div>
                           <p className="text-2xl font-bold text-lime-400">{dayStats.totalAmount.toFixed(2)}g</p>
                       </div>

                       <div className="bg-zinc-950 rounded-xl p-3">
                           <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase mb-1">
                               <Coins size={12} />
                               Kosten
                               {avgStats && getTrendIcon(dayStats.totalCost, avgStats.avgCostPerDay)}
                           </div>
                           <p className="text-2xl font-bold text-amber-400">{dayStats.totalCost.toFixed(2)}€</p>
                           {avgStats && (
                               <p className="text-[10px] text-zinc-600 mt-1">
                                   Ø {avgStats.avgCostPerDay.toFixed(2)}€
                               </p>
                           )}
                       </div>

                       <div className="bg-zinc-950 rounded-xl p-3">
                           <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase mb-1">
                               <Clock size={12} />
                               Ø Dauer
                           </div>
                           <p className="text-2xl font-bold text-purple-400">{dayStats.avgDuration.toFixed(1)}s</p>
                       </div>
                   </div>
               )}

               {/* Zeitspanne */}
               {dayStats.timespan && (
                   <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                       <p className="text-xs text-zinc-600 uppercase font-bold mb-2">Aktive Zeit</p>
                       <div className="flex items-center justify-between text-sm">
                           <span className="text-zinc-400">
                               {dayStats.timespan.first.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span className="text-zinc-600">→</span>
                           <span className="text-zinc-400">
                               {dayStats.timespan.last.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span className="text-emerald-400 font-bold">
                               {dayStats.timespan.duration.toFixed(1)}h
                           </span>
                       </div>
                   </div>
               )}

               {/* Sorten-Übersicht */}
               {dayStats.strainUsage.length > 0 && (
                   <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                       <div className="flex items-center gap-2 text-xs text-zinc-600 uppercase font-bold mb-3">
                           <Tag size={12} />
                           Verwendete Sorten
                       </div>
                       <div className="space-y-2">
                           {dayStats.strainUsage.map(([name, data]) => (
                               <div key={name} className="flex items-center justify-between">
                                   <span className="text-sm text-white">{name}</span>
                                   <div className="flex items-center gap-3">
                                       <span className="text-xs text-emerald-400 font-bold">
                                           {data.count}x
                                       </span>
                                       <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                           <div
                                               className="h-full bg-emerald-500 rounded-full"
                                               style={{ width: `${(data.count / dayStats.totalHits) * 100}%` }}
                                           />
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {/* Session-Timeline */}
               {dayStats.sessions.length > 0 && (
                   <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                       <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                           <Clock size={12} className="text-zinc-600"/>
                           <p className="text-xs text-zinc-600 uppercase font-bold">Timeline</p>
                           <span className="text-[10px] text-zinc-600 ml-auto">← Wische zum Löschen</span>
                       </div>
                       <div className="max-h-48 overflow-y-auto">
                           <table className="w-full text-left text-xs text-zinc-400">
                               <tbody className="divide-y divide-zinc-800">
                                   {dayStats.sessions.map((session, i) => (
                                       <SwipeableHitRow
                                           key={session.id}
                                           hit={session}
                                           hitNumber={i + 1}
                                           onDelete={deleteHit}
                                       />
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
               )}

               {/* Notizen */}
               <div className="space-y-2">
                   <div className="flex justify-between items-center">
                       <label className="text-xs text-zinc-600 uppercase font-bold">Notizen</label>
                       <button
                           onClick={save}
                           className="bg-emerald-600 hover:bg-emerald-700 p-2 rounded-lg text-white transition-colors flex items-center gap-1.5"
                       >
                           <Save size={14}/>
                           <span className="text-xs font-bold">Speichern</span>
                       </button>
                   </div>
                   <textarea
                       value={note}
                       onChange={e=>setNote(e.target.value)}
                       className="w-full bg-zinc-950 p-3 rounded-xl text-sm text-zinc-300 resize-none border border-zinc-800 focus:border-emerald-500 outline-none"
                       rows={3}
                       placeholder="Wie war der Tag? Stimmung, Wirkung, Besonderheiten..."
                   />
               </div>
           </div>
        </div>
    );
}

export default memo(CalendarView);