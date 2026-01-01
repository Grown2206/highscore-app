import React, { useState, useEffect, useMemo, memo } from 'react';
import { Save, Wind, Scale, Coins, Clock, Tag, TrendingUp, TrendingDown, Minus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import SwipeableHitRow from './SwipeableHitRow';
import { formatLocalDate, getTotalHits, getAvgHitsPerDay } from '../utils/historyDataHelpers';

// **FIX v8.9**: sessionHits wiederhergestellt - Timeline und Hit-Liste funktionieren wieder
// Verwende historyDataHelpers für Aggregationen
function CalendarView({ historyData, setHistoryData, settings, deleteHit, sessionHits }) {
    const [sel, setSel] = useState(formatLocalDate(new Date())); // FIX: Lokales Datum
    const [note, setNote] = useState("");
    const [viewDate, setViewDate] = useState(new Date()); // NEU: Aktuell angezeigte Monat

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

    // NEU: Navigation für Monate
    const prevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setViewDate(today);
        setSel(formatLocalDate(today)); // FIX: Lokales Datum
    };

    // FIX: Korrektes Kalender-Grid (Montag-Start, keine Verschiebung)
    const days = useMemo(() => {
        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

        // Montag der ersten Woche (0=Sonntag, 1=Montag)
        const startDay = firstDay.getDay();
        const offset = startDay === 0 ? -6 : 1 - startDay; // FIX: Sonntag → -6 Tage, sonst 1-startDay

        const result = [];
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() + offset);

        // 6 Wochen = 42 Tage (um sicher alle Tage des Monats zu zeigen)
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            result.push({
                iso: formatLocalDate(d), // FIX: Lokales Datum ohne UTC-Shift
                day: d.getDate(),
                curr: d.getMonth() === viewDate.getMonth()
            });
        }

        return result;
    }, [viewDate]);

    // **FIX v8.9**: Tages-Statistiken aus sessionHits - mit allen Details
    const dayStats = useMemo(() => {
        // Filtere Sessions für den ausgewählten Tag
        const daySessions = (sessionHits || []).filter(hit => {
            const hitDate = formatLocalDate(new Date(hit.timestamp));
            return hitDate === sel;
        }).sort((a, b) => b.timestamp - a.timestamp); // Neueste zuerst

        const totalHits = daySessions.length;

        // Berechne totalAmount aus per-hit Settings (fallback auf globale settings)
        const totalAmount = daySessions.reduce((sum, hit) => {
            const bowlSize = hit.bowlSize ?? settings.bowlSize;
            const weedRatio = hit.weedRatio ?? settings.weedRatio;
            return sum + (bowlSize * (weedRatio / 100));
        }, 0);

        // Kosten berechnen mit per-hit Settings (fallback auf globale settings)
        const totalCost = daySessions.reduce((sum, hit) => {
            const bowlSize = hit.bowlSize ?? settings.bowlSize;
            const weedRatio = hit.weedRatio ?? settings.weedRatio;
            const cost = (hit.strainPrice || 0) * bowlSize * (weedRatio / 100);
            return sum + cost;
        }, 0);

        // Durchschnittliche Duration berechnen
        // **CRITICAL FIX**: Filtere ungültige Durations (nur 0-8s verwenden)
        const durationsWithValue = daySessions.filter(h => h.duration > 0 && h.duration <= 8);
        const avgDuration = durationsWithValue.length > 0
            ? durationsWithValue.reduce((sum, h) => sum + h.duration, 0) / durationsWithValue.length
            : 0;

        // Sorten-Nutzung
        const strainMap = {};
        daySessions.forEach(hit => {
            const name = hit.strainName || 'Unbekannt';
            if (!strainMap[name]) {
                strainMap[name] = { count: 0 };
            }
            strainMap[name].count++;
        });
        const strainUsage = Object.entries(strainMap).sort((a, b) => b[1].count - a[1].count);

        // Zeitspanne berechnen
        let timespan = null;
        if (daySessions.length > 0) {
            const timestamps = daySessions.map(s => s.timestamp);
            const first = new Date(Math.min(...timestamps));
            const last = new Date(Math.max(...timestamps));
            const durationHours = (last - first) / (1000 * 60 * 60);
            timespan = { first, last, duration: durationHours };
        }

        return {
            sessions: daySessions,
            totalHits,
            totalAmount,
            totalCost,
            avgDuration,
            strainUsage,
            timespan
        };
    }, [sel, sessionHits, settings]);

    // **FIX v8.8.1**: Verwende historyDataHelpers statt inline reduce/filter
    const avgStats = useMemo(() => {
        if (historyData.length === 0) return null;

        const avgHitsPerDay = getAvgHitsPerDay(historyData);

        return { avgHitsPerDay };
    }, [historyData]);

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
              {/* Monats-Navigation */}
              <div className="flex items-center justify-between mb-4">
                  <button
                      onClick={prevMonth}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                  >
                      <ChevronLeft size={18} />
                  </button>
                  <div className="text-center">
                      <h3 className="text-lg font-bold text-white">
                          {viewDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                          onClick={goToToday}
                          className="text-xs text-emerald-500 hover:text-emerald-400 mt-1"
                      >
                          Heute
                      </button>
                  </div>
                  <button
                      onClick={nextMonth}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                  >
                      <ChevronRight size={18} />
                  </button>
              </div>
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

                       {/* **FIX v8.9**: Kosten & Duration Displays wiederhergestellt */}
                       <div className="bg-zinc-950 rounded-xl p-3">
                           <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase mb-1">
                               <Coins size={12} />
                               Kosten
                           </div>
                           <p className="text-2xl font-bold text-yellow-400">{dayStats.totalCost.toFixed(2)}€</p>
                       </div>

                       {dayStats.avgDuration > 0 && (
                           <div className="bg-zinc-950 rounded-xl p-3">
                               <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase mb-1">
                                   <Clock size={12} />
                                   Ø Dauer
                               </div>
                               <p className="text-2xl font-bold text-cyan-400">{dayStats.avgDuration.toFixed(1)}s</p>
                           </div>
                       )}
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