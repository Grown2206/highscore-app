import React, { useState, useEffect } from 'react';
import { User, Users, Tag, Wind, Scale, Coins, List, Clock, Shield, Radio, Flame, Zap } from 'lucide-react';
import HoldButton from './HoldButton';
import { MetricCard, AdminMetric } from './UIComponents';

export default function DashboardView({ liveData, lastHitTime, settings, isGuestMode, setIsGuestMode, guestHits, sessionHits, onManualTrigger, currentStrainId, setCurrentStrainId, isSensorInhaling }) {
  const [timeSince, setTimeSince] = useState("00:00:00");
  
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

  const weedAmount = liveData.today * settings.bowlSize * (settings.weedRatio / 100);
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

      <HoldButton onTrigger={onManualTrigger} lastHit={timeSince} active={isSensorInhaling} flame={liveData.flame} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {isGuestMode ? (
            <div className="col-span-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
               <span className="text-5xl font-bold text-amber-500 block">{guestHits}</span>
               <span className="text-xs uppercase font-bold text-amber-200">Gäste Hits</span>
            </div>
         ) : (
           <>
             <MetricCard label="Hits" val={liveData.today} icon={<Wind size={16}/>} color="text-emerald-400" />
             <MetricCard label="Menge" val={`${weedAmount.toFixed(2)}g`} icon={<Scale size={16}/>} color="text-lime-400" />
             <MetricCard label="Kosten" val={`${cost.toFixed(2)}€`} icon={<Coins size={16}/>} color="text-amber-400" />
             <MetricCard label="Gesamt" val={liveData.total} icon={<List size={16}/>} color="text-zinc-200" />
           </>
         )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center gap-2"><Clock size={14} className="text-zinc-500"/><span className="text-xs font-bold uppercase text-zinc-500">Timeline</span></div>
        <div className="max-h-48 overflow-y-auto">
          {sessionHits.length === 0 ? <div className="p-4 text-center text-zinc-600 text-xs italic">Warte auf den ersten Zug...</div> :
          <table className="w-full text-left text-xs text-zinc-400">
             <tbody className="divide-y divide-zinc-800">
               {sessionHits.map((hit, i) => (
                 <tr key={hit.id} className="hover:bg-zinc-800/50">
                   <td className="px-4 py-3 font-mono text-zinc-600">#{sessionHits.length - i}</td>
                   <td className="px-4 py-3 text-white">{new Date(hit.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                   <td className="px-4 py-3">{hit.strainName}</td>
                   <td className="px-4 py-3 text-right">{hit.duration > 0 && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">{(hit.duration/1000).toFixed(1)}s</span>}</td>
                 </tr>
               ))}
             </tbody>
          </table>}
        </div>
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
             <AdminMetric label="Session Hits" value={sessionHits.length} icon={<List size={12}/>} />
             <AdminMetric label="Signal" value="-42 dBm" icon={<Radio size={12}/>} />
          </div>
        </div>
      )}
    </div>
  );
}