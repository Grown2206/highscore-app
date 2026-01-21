import React, { useState, useEffect, useMemo, memo } from 'react';
import { Save, Wind, Scale, Coins, Clock, Tag, TrendingUp, TrendingDown, Minus, Calendar, ChevronLeft, ChevronRight, CheckSquare, Square, Trash2, X } from 'lucide-react';
import SwipeableHitRow from './SwipeableHitRow';
import { formatLocalDate, getTotalHits, getAvgHitsPerDay, HistoryDataEntry } from '../utils/historyDataHelpers.ts';
import { useHitSelection, Hit } from '../hooks/useHitSelection.ts';
import { Settings } from '../hooks/useHitManagement.ts';

interface CalendarViewProps {
  historyData: HistoryDataEntry[];
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryDataEntry[]>>;
  settings: Settings;
  deleteHit: (hitId: string) => void;
  deleteHits: (hitIds: string[]) => void;
  sessionHits: Hit[];
}

// **FIX v8.9**: sessionHits wiederhergestellt - Timeline und Hit-Liste funktionieren wieder
// **NEW v8.8**: Multi-select delete functionality with custom hook
// Verwende historyDataHelpers für Aggregationen
function CalendarView({ historyData, setHistoryData, settings, deleteHit, deleteHits, sessionHits }: CalendarViewProps) {
    const [sel, setSel] = useState(formatLocalDate(new Date())); // FIX: Lokales Datum
    const [note, setNote] = useState("");
    const [viewDate, setViewDate] = useState(new Date()); // NEU: Aktuell angezeigte Monat

    // **FIX v8.8**: Use shared hook for multi-select state
    const {
        selectMode,
        selectedHits,
        toggleSelectMode,
        toggleHitSelection,
        selectAllHits,
        clearSelection
    } = useHitSelection();

    // **FIX v8.8**: Use batch delete for better performance
    const deleteSelectedHits = () => {
        if (selectedHits.size === 0) return;
        if (!window.confirm(`${selectedHits.size} Hit(s) wirklich löschen?`)) return;

        deleteHits(Array.from(selectedHits));
        clearSelection();
    };

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
        if (value > avg * 1.2) return <TrendingUp style={{ color: 'var(--accent-error)' }} size={14} />;
        if (value < avg * 0.8) return <TrendingDown style={{ color: 'var(--accent-success)' }} size={14} />;
        return <Minus style={{ color: 'var(--text-tertiary)' }} size={14} />;
    };

    return (
        <div className="space-y-4 animate-in fade-in h-full flex flex-col pb-20">
           <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
               <Calendar style={{ color: 'var(--accent-primary)' }} />
               Tagebuch
           </h2>

           {/* Kalender */}
           <div
               className="rounded-2xl p-4"
               style={{
                   backgroundColor: 'var(--bg-secondary)',
                   border: '1px solid var(--border-primary)',
               }}
           >
              {/* Monats-Navigation */}
              <div className="flex items-center justify-between mb-4">
                  <button
                      onClick={prevMonth}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                      }}
                  >
                      <ChevronLeft size={18} />
                  </button>
                  <div className="text-center">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {viewDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                          onClick={goToToday}
                          className="text-xs mt-1 transition-colors"
                          style={{ color: 'var(--accent-primary)' }}
                      >
                          Heute
                      </button>
                  </div>
                  <button
                      onClick={nextMonth}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                      }}
                  >
                      <ChevronRight size={18} />
                  </button>
              </div>
              <div
                  className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold uppercase"
                  style={{ color: 'var(--text-tertiary)' }}
              >
                  {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=><div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                 {days.map(d=>{
                     const h = historyData.find(x=>x.date===d.iso);
                     const intensity = h?.count > 0 ? Math.min(h.count / 10, 1) : 0;

                     const getDayStyle = () => {
                         if (sel === d.iso) {
                             return {
                                 backgroundColor: 'var(--accent-primary)',
                                 borderColor: 'color-mix(in srgb, var(--accent-primary) 70%, white)',
                                 color: 'white',
                             };
                         }
                         if (h?.count > 0) {
                             return {
                                 backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                                 borderColor: 'color-mix(in srgb, var(--accent-primary) 30%, transparent)',
                                 color: 'var(--accent-primary)',
                             };
                         }
                         return {
                             backgroundColor: 'var(--bg-primary)',
                             borderColor: 'transparent',
                             color: 'var(--text-secondary)',
                         };
                     };

                     return (
                         <button
                             key={d.iso}
                             onClick={()=>setSel(d.iso)}
                             className="aspect-square rounded-lg flex flex-col items-center justify-center relative border transition-all"
                             style={{
                                 ...getDayStyle(),
                                 opacity: !d.curr ? 0.3 : 1,
                             }}
                         >
                            <span className="text-xs font-bold">{d.day}</span>
                            {h?.count > 0 && (
                                <div
                                    className="absolute bottom-1 w-3/4 h-0.5 rounded-full"
                                    style={{
                                        backgroundColor: 'var(--accent-primary)',
                                        opacity: 0.3 + (intensity * 0.7),
                                    }}
                                />
                            )}
                         </button>
                     )
                 })}
              </div>
           </div>

           {/* Tages-Details */}
           <div
               className="rounded-2xl p-4 space-y-4"
               style={{
                   backgroundColor: 'var(--bg-secondary)',
                   border: '1px solid var(--border-primary)',
               }}
           >
               <div className="flex items-center justify-between">
                   <div>
                       <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                           {new Date(sel).toLocaleDateString('de-DE', {
                               weekday: 'long',
                               year: 'numeric',
                               month: 'long',
                               day: 'numeric'
                           })}
                       </h3>
                       {dayStats.totalHits === 0 && (
                           <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                               Keine Sessions an diesem Tag
                           </p>
                       )}
                   </div>
               </div>

               {/* Statistik-Karten */}
               {dayStats.totalHits > 0 && (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                           <div
                               className="flex items-center gap-2 text-[10px] font-bold uppercase mb-1"
                               style={{ color: 'var(--text-tertiary)' }}
                           >
                               <Wind size={12} />
                               Hits
                               {avgStats && getTrendIcon(dayStats.totalHits, avgStats.avgHitsPerDay)}
                           </div>
                           <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                               {dayStats.totalHits}
                           </p>
                           {avgStats && (
                               <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                   Ø {avgStats.avgHitsPerDay.toFixed(1)}
                               </p>
                           )}
                       </div>

                       <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                           <div
                               className="flex items-center gap-2 text-[10px] font-bold uppercase mb-1"
                               style={{ color: 'var(--text-tertiary)' }}
                           >
                               <Scale size={12} />
                               Menge
                           </div>
                           <p className="text-2xl font-bold" style={{ color: 'var(--chart-tertiary)' }}>
                               {dayStats.totalAmount.toFixed(2)}g
                           </p>
                       </div>

                       {/* **FIX v8.9**: Kosten & Duration Displays wiederhergestellt */}
                       <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                           <div
                               className="flex items-center gap-2 text-[10px] font-bold uppercase mb-1"
                               style={{ color: 'var(--text-tertiary)' }}
                           >
                               <Coins size={12} />
                               Kosten
                           </div>
                           <p className="text-2xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                               {dayStats.totalCost.toFixed(2)}€
                           </p>
                       </div>

                       {dayStats.avgDuration > 0 && (
                           <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                               <div
                                   className="flex items-center gap-2 text-[10px] font-bold uppercase mb-1"
                                   style={{ color: 'var(--text-tertiary)' }}
                               >
                                   <Clock size={12} />
                                   Ø Dauer
                               </div>
                               <p className="text-2xl font-bold" style={{ color: 'var(--accent-info)' }}>
                                   {dayStats.avgDuration.toFixed(1)}s
                               </p>
                           </div>
                       )}
                   </div>
               )}

               {/* Zeitspanne */}
               {dayStats.timespan && (
                   <div
                       className="rounded-xl p-3"
                       style={{
                           backgroundColor: 'var(--bg-primary)',
                           border: '1px solid var(--border-primary)',
                       }}
                   >
                       <p className="text-xs uppercase font-bold mb-2" style={{ color: 'var(--text-tertiary)' }}>
                           Aktive Zeit
                       </p>
                       <div className="flex items-center justify-between text-sm">
                           <span style={{ color: 'var(--text-secondary)' }}>
                               {dayStats.timespan.first.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                           <span style={{ color: 'var(--text-secondary)' }}>
                               {dayStats.timespan.last.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
                               {dayStats.timespan.duration.toFixed(1)}h
                           </span>
                       </div>
                   </div>
               )}

               {/* Sorten-Übersicht */}
               {dayStats.strainUsage.length > 0 && (
                   <div
                       className="rounded-xl p-3"
                       style={{
                           backgroundColor: 'var(--bg-primary)',
                           border: '1px solid var(--border-primary)',
                       }}
                   >
                       <div
                           className="flex items-center gap-2 text-xs uppercase font-bold mb-3"
                           style={{ color: 'var(--text-tertiary)' }}
                       >
                           <Tag size={12} />
                           Verwendete Sorten
                       </div>
                       <div className="space-y-2">
                           {dayStats.strainUsage.map(([name, data]) => (
                               <div key={name} className="flex items-center justify-between">
                                   <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{name}</span>
                                   <div className="flex items-center gap-3">
                                       <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                                           {data.count}x
                                       </span>
                                       <div
                                           className="w-16 h-1.5 rounded-full overflow-hidden"
                                           style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                       >
                                           <div
                                               className="h-full rounded-full"
                                               style={{
                                                   backgroundColor: 'var(--accent-primary)',
                                                   width: `${(data.count / dayStats.totalHits) * 100}%`,
                                               }}
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
                   <div
                       className="rounded-xl overflow-hidden"
                       style={{
                           backgroundColor: 'var(--bg-primary)',
                           border: '1px solid var(--border-primary)',
                       }}
                   >
                       <div
                           className="px-4 py-2 flex items-center gap-2"
                           style={{
                               backgroundColor: 'var(--bg-secondary)',
                               borderBottom: '1px solid var(--border-primary)',
                           }}
                       >
                           <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                           <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-tertiary)' }}>
                               Timeline
                           </p>

                           {/* Multi-Select Mode Controls */}
                           {!selectMode ? (
                               <span className="text-[10px] ml-auto" style={{ color: 'var(--text-tertiary)' }}>
                                   ← Wische zum Löschen
                               </span>
                           ) : (
                               <div className="ml-auto flex items-center gap-2">
                                   <span className="text-[10px] font-bold" style={{ color: 'var(--accent-primary)' }}>
                                       {selectedHits.size} ausgewählt
                                   </span>
                               </div>
                           )}

                           <div className="flex items-center gap-1">
                               {!selectMode ? (
                                   <button
                                       onClick={toggleSelectMode}
                                       className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                                       style={{
                                           backgroundColor: 'var(--accent-info)',
                                           color: 'white',
                                       }}
                                   >
                                       <CheckSquare size={12} />
                                       Auswählen
                                   </button>
                               ) : (
                                   <>
                                       <button
                                           onClick={() => selectAllHits(dayStats.sessions)}
                                           className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                                           style={{
                                               backgroundColor: 'var(--bg-tertiary)',
                                               color: 'var(--text-primary)',
                                           }}
                                       >
                                           <Square size={12} />
                                           Alle
                                       </button>
                                       <button
                                           onClick={deleteSelectedHits}
                                           disabled={selectedHits.size === 0}
                                           className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                                           style={{
                                               backgroundColor: selectedHits.size > 0 ? 'var(--accent-error)' : 'var(--bg-tertiary)',
                                               color: selectedHits.size > 0 ? 'white' : 'var(--text-tertiary)',
                                           }}
                                       >
                                           <Trash2 size={12} />
                                           Löschen
                                       </button>
                                       <button
                                           onClick={toggleSelectMode}
                                           className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                                           style={{
                                               backgroundColor: 'var(--bg-tertiary)',
                                               color: 'var(--text-primary)',
                                           }}
                                       >
                                           <X size={12} />
                                           Abbrechen
                                       </button>
                                   </>
                               )}
                           </div>
                       </div>
                       <div className="max-h-48 overflow-y-auto">
                           <table className="w-full text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                               <tbody style={{ borderColor: 'var(--border-primary)' }} className="divide-y">
                                   {dayStats.sessions.map((session, i) => (
                                       <SwipeableHitRow
                                           key={session.id}
                                           hit={session}
                                           hitNumber={i + 1}
                                           onDelete={deleteHit}
                                           selectMode={selectMode}
                                           isSelected={selectedHits.has(session.id)}
                                           onToggleSelect={toggleHitSelection}
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
                       <label className="text-xs uppercase font-bold" style={{ color: 'var(--text-tertiary)' }}>
                           Notizen
                       </label>
                       <button
                           onClick={save}
                           className="p-2 rounded-lg transition-colors flex items-center gap-1.5"
                           style={{
                               backgroundColor: 'var(--accent-primary)',
                               color: 'white',
                           }}
                       >
                           <Save size={14}/>
                           <span className="text-xs font-bold">Speichern</span>
                       </button>
                   </div>
                   <textarea
                       value={note}
                       onChange={e=>setNote(e.target.value)}
                       className="w-full p-3 rounded-xl text-sm resize-none border outline-none transition-colors"
                       style={{
                           backgroundColor: 'var(--bg-primary)',
                           color: 'var(--text-secondary)',
                           borderColor: 'var(--border-primary)',
                       }}
                       onFocus={(e) => {
                           e.currentTarget.style.borderColor = 'var(--accent-primary)';
                       }}
                       onBlur={(e) => {
                           e.currentTarget.style.borderColor = 'var(--border-primary)';
                       }}
                       rows={3}
                       placeholder="Wie war der Tag? Stimmung, Wirkung, Besonderheiten..."
                   />
               </div>
           </div>
        </div>
    );
}

export default memo(CalendarView);