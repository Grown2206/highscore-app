import React, { useState, useEffect, useMemo } from 'react';
import { User, Users, Tag, Wind, Scale, Coins, List, Clock, Shield, Radio, Flame, Zap, RotateCcw, Battery, CheckSquare, Square, Trash2, X } from 'lucide-react';
import HoldButton from './HoldButton';
import { MetricCard, AdminMetric } from './UIComponents';
import SwipeableHitRow from './SwipeableHitRow';
import { useHitSelection, Hit } from '../hooks/useHitSelection.ts';
import { LiveData } from '../hooks/useESP32Polling.ts';
import { Settings, Strain } from '../hooks/useHitManagement.ts';

interface DashboardViewProps {
  liveData: LiveData;
  lastHitTime: number | null;
  settings: Settings;
  isGuestMode: boolean;
  setIsGuestMode: (isGuestMode: boolean) => void;
  guestHits: Hit[];
  resetGuestHits: () => void;
  deleteHit: (hitId: string) => void;
  deleteHits: (hitIds: string[]) => void;
  onManualTrigger: (duration: number) => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  currentStrainId: number;
  setCurrentStrainId: (id: number) => void;
  isSensorInhaling: boolean;
  sessionHits: Hit[];
  sessionHitsCount: number;
}

// **FIX v8.8**: Pure utility function for getting today's date key
// Defined outside component to ensure stable reference (no props/context dependencies)
const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// **FIX v8.9.2**: sessionHits wiederhergestellt - Timeline mit Hit-Liste funktioniert wieder
// **NEW**: sessionHitsCount für Session-System
// **NEW v8.8**: Multi-select delete functionality with custom hook
export default function DashboardView({
  liveData,
  lastHitTime,
  settings,
  isGuestMode,
  setIsGuestMode,
  guestHits,
  resetGuestHits,
  deleteHit,
  deleteHits,
  onManualTrigger,
  onHoldStart,
  onHoldEnd,
  currentStrainId,
  setCurrentStrainId,
  isSensorInhaling,
  sessionHits,
  sessionHitsCount
}: DashboardViewProps) {
  const [timeSince, setTimeSince] = useState("00:00:00");

  // **FIX v8.8**: Track current date to force todayHits recalculation at midnight
  const [todayKey, setTodayKey] = useState(getTodayKey);

  // Check for date change every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayKey(prevKey => {
        const newKey = getTodayKey();
        return newKey === prevKey ? prevKey : newKey;
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // **FIX v8.8**: Use shared hook for multi-select state
  const {
    selectMode,
    selectedHits,
    toggleSelectMode,
    toggleHitSelection,
    selectAllHits,
    clearSelection
  } = useHitSelection();

  // **FIX v8.8**: Centralize today's hits computation (used by both render and select-all)
  // Now properly updates at midnight via todayKey dependency
  const todayHits = useMemo(() => {
    return (sessionHits || []).filter(hit => {
      const hitDate = new Date(hit.timestamp);
      const hitDateStr = `${hitDate.getFullYear()}-${String(hitDate.getMonth() + 1).padStart(2, '0')}-${String(hitDate.getDate()).padStart(2, '0')}`;
      return hitDateStr === todayKey;
    }).sort((a, b) => b.timestamp - a.timestamp); // Neueste zuerst
  }, [sessionHits, todayKey]);

  // **FIX v8.8**: Use batch delete for better performance
  const deleteSelectedHits = () => {
    if (selectedHits.size === 0) return;
    if (!window.confirm(`${selectedHits.size} Hit(s) wirklich löschen?`)) return;

    deleteHits(Array.from(selectedHits));
    clearSelection();
  };

  useEffect(() => {
    if (!lastHitTime) return;
    const iv = setInterval(() => {
      const d = Date.now() - lastHitTime;
      const h = Math.floor(d/36e5).toString().padStart(2,'0');
      const m = Math.floor((d%36e5)/6e4).toString().padStart(2,'0');
      const s = Math.floor((d%6e4)/1e3).toString().padStart(2,'0');
      setTimeSince(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [lastHitTime]);

  // **NEW**: Berechne Menge und Kosten basierend auf todayHits.length (nicht sessionHitsCount)
  // **FIX**: sessionHitsCount kann inkonsistent sein wenn offline hits importiert werden
  const actualTodayCount = todayHits.length;
  const weedAmount = actualTodayCount * settings.bowlSize * (settings.weedRatio / 100);
  const currentStrain = settings.strains.find(s => s.id == currentStrainId) || {price:0};
  const cost = weedAmount * currentStrain.price;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-2">
           {isGuestMode ? <Users className="text-amber-500" /> : <User className="text-emerald-500" />}
           <div className="leading-tight"><h2 className="font-bold text-white">{isGuestMode ? "Gäste" : "Session"}</h2><p className="text-[10px] text-zinc-400 font-mono">{isGuestMode ? "Kein Tracking" : "Tracking Aktiv"}</p></div>
        </div>
        {!isGuestMode && (
          <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-2 py-1.5 border border-zinc-800">
             <Tag size={14} className="text-zinc-500" />
             <select value={currentStrainId} onChange={(e) => { if(navigator.vibrate) navigator.vibrate(10); setCurrentStrainId(e.target.value); }} className="bg-transparent text-xs text-white outline-none font-medium max-w-[100px] truncate">
               {settings.strains.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
        )}
        <button onClick={() => { if(navigator.vibrate) navigator.vibrate(20); setIsGuestMode(!isGuestMode); }} className={`w-10 h-6 rounded-full relative transition-colors ${isGuestMode ? 'bg-amber-500' : 'bg-zinc-700'}`}>
          <div className={`w-3 h-3 bg-white rounded-full absolute top-1.5 transition-all ${isGuestMode ? 'left-6' : 'left-1'}`}/>
        </button>
      </div>

      <HoldButton
        onTrigger={onManualTrigger}
        onHoldStart={onHoldStart}
        onHoldEnd={onHoldEnd}
        lastHit={timeSince}
        active={isSensorInhaling}
        flame={liveData.flame}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {isGuestMode ? (
            <div className="col-span-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
               <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-amber-500 block">{guestHits}</span>
                  <span className="text-xs uppercase font-bold text-amber-200">Gäste Hits</span>
               </div>
               <button
                  onClick={resetGuestHits}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-2 px-4 rounded-xl transition-colors font-medium text-sm"
               >
                  <RotateCcw size={16} />
                  Zurücksetzen
               </button>
            </div>
         ) : (
           <>
             <MetricCard label="Session" val={actualTodayCount} icon={<Wind size={16}/>} color="text-emerald-400" />
             <MetricCard label="Menge" val={`${weedAmount.toFixed(2)}g`} icon={<Scale size={16}/>} color="text-lime-400" />
             <MetricCard label="Kosten" val={`${cost.toFixed(2)}€`} icon={<Coins size={16}/>} color="text-amber-400" />
             <MetricCard label="Gesamt" val={liveData.total} icon={<List size={16}/>} color="text-zinc-200" />
           </>
         )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <Clock size={14} className="text-zinc-500"/>
          <span className="text-xs font-bold uppercase text-zinc-500">Heutige Hits</span>

          {/* Multi-Select Mode Controls */}
          {!selectMode ? (
            <span className="text-[10px] text-zinc-600 ml-auto">← Wische zum Löschen</span>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-bold">
                {selectedHits.size} ausgewählt
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {!selectMode ? (
              <button
                onClick={toggleSelectMode}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors"
              >
                <CheckSquare size={12} />
                Auswählen
              </button>
            ) : (
              <>
                <button
                  onClick={() => selectAllHits(todayHits)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] font-bold transition-colors"
                >
                  <Square size={12} />
                  Alle
                </button>
                <button
                  onClick={deleteSelectedHits}
                  disabled={selectedHits.size === 0}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-[10px] font-bold transition-colors"
                >
                  <Trash2 size={12} />
                  Löschen
                </button>
                <button
                  onClick={toggleSelectMode}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] font-bold transition-colors"
                >
                  <X size={12} />
                  Abbrechen
                </button>
              </>
            )}
          </div>
        </div>
        {todayHits.length > 0 ? (
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <tbody className="divide-y divide-zinc-800">
                {todayHits.map((hit, i) => (
                  <SwipeableHitRow
                    key={hit.id}
                    hit={hit}
                    hitNumber={i + 1}
                    onDelete={deleteHit}
                    selectMode={selectMode}
                    isSelected={selectedHits.has(hit.id)}
                    onToggleSelect={toggleHitSelection}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-zinc-600 text-sm">Noch keine Hits heute</div>
          </div>
        )}
      </div>

      {settings.adminMode && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-8">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
             <Shield size={14} className="text-rose-500" />
             <span className="text-xs font-bold uppercase text-zinc-400">Admin Diagnose</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800">
             <AdminMetric label="Flame Sensor" value={liveData.flame ? 'DETECTED' : 'Ready'} active={liveData.flame} icon={<Flame size={12}/>} />
             <AdminMetric label="Inhaling" value={isSensorInhaling ? 'YES' : 'NO'} active={isSensorInhaling} icon={<Zap size={12}/>} />
             <AdminMetric label="Session Hits" value={liveData.total} icon={<List size={12}/>} />
             <AdminMetric
               label="Battery"
               value={
                 liveData.batteryPercent !== null
                   ? `${liveData.batteryPercent}%`
                   : 'N/A'
               }
               subtitle={
                 liveData.batteryVoltage !== null
                   ? `${liveData.batteryVoltage.toFixed(2)}V`
                   : ''
               }
               active={liveData.batteryPercent !== null && liveData.batteryPercent < 20}
               icon={<Battery size={12}/>}
             />
          </div>
        </div>
      )}
    </div>
  );
}