import React, { useState, useEffect, useRef } from 'react';
import { User, Users, Tag, Wind, Scale, Coins, List, Clock, Shield, Radio, Flame, Zap, RotateCcw, Trash2 } from 'lucide-react';
import HoldButton from './HoldButton';
import { MetricCard, AdminMetric } from './UIComponents';

// Swipeable Hit Row Component
function SwipeableHitRow({ hit, hitNumber, onDelete }) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false); // Desktop hover state
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    // Only allow left swipe
    if (diff < 0) {
      setSwipeX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeX < -60) {
      // Swiped far enough - show delete button
      setSwipeX(-80);
    } else {
      // Reset
      setSwipeX(0);
    }
  };

  const handleDelete = () => {
    // FIX: Guard navigator for SSR/test environments
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    onDelete(hit.id);
  };

  // Desktop hover and focus handlers
  const handleMouseEnter = () => setShowDeleteBtn(true);
  const handleMouseLeave = () => setShowDeleteBtn(false);
  const handleFocus = () => setShowDeleteBtn(true);
  const handleBlur = () => setShowDeleteBtn(false);

  // Keyboard handler (Delete, Backspace, Enter, or Space key)
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDelete();
    }
  };

  return (
    <tr className="relative">
      <td colSpan="4" className="p-0">
        <div className="relative overflow-hidden">
          {/* Delete button background */}
          <div className="absolute inset-0 bg-red-600 flex items-center justify-end pr-4">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-white font-bold"
            >
              <Trash2 size={16} />
              Löschen
            </button>
          </div>

          {/* Swipeable content */}
          <div
            className="relative bg-zinc-900 flex items-center transition-transform duration-200"
            style={{ transform: `translateX(${swipeX}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Hit #${hitNumber} löschen - ${hit.strainName} um ${new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          >
            <div className="w-full flex items-center py-3 px-4 hover:bg-zinc-800/50">
              <div className="flex-none w-12 font-mono text-zinc-600 text-xs">#{hitNumber}</div>
              <div className="flex-none w-16 text-white text-xs">
                {new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex-1 text-zinc-400 text-xs px-2">{hit.strainName}</div>
              <div className="flex-none text-right flex items-center gap-2">
                {hit.duration > 0 && (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    {(hit.duration / 1000).toFixed(1)}s
                  </span>
                )}
                {/* Desktop delete button - visible on hover */}
                {showDeleteBtn && !isSwiping && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-2 py-1 rounded transition-colors text-[10px] font-bold"
                    aria-label="Hit löschen"
                  >
                    <Trash2 size={12} />
                    Löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function DashboardView({ liveData, lastHitTime, settings, isGuestMode, setIsGuestMode, guestHits, resetGuestHits, sessionHits, deleteHit, onManualTrigger, onHoldStart, onHoldEnd, currentStrainId, setCurrentStrainId, isSensorInhaling }) {
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
             <MetricCard label="Hits" val={liveData.today} icon={<Wind size={16}/>} color="text-emerald-400" />
             <MetricCard label="Menge" val={`${weedAmount.toFixed(2)}g`} icon={<Scale size={16}/>} color="text-lime-400" />
             <MetricCard label="Kosten" val={`${cost.toFixed(2)}€`} icon={<Coins size={16}/>} color="text-amber-400" />
             <MetricCard label="Gesamt" val={liveData.total} icon={<List size={16}/>} color="text-zinc-200" />
           </>
         )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <Clock size={14} className="text-zinc-500"/>
          <span className="text-xs font-bold uppercase text-zinc-500">Timeline</span>
          <span className="text-[10px] text-zinc-600 ml-auto">← Wische zum Löschen</span>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {sessionHits.length === 0 ? <div className="p-4 text-center text-zinc-600 text-xs italic">Warte auf den ersten Zug...</div> :
          <table className="w-full text-left text-xs text-zinc-400">
             <tbody className="divide-y divide-zinc-800">
               {sessionHits.map((hit, i) => (
                 <SwipeableHitRow
                   key={hit.id}
                   hit={hit}
                   hitNumber={sessionHits.length - i}
                   onDelete={deleteHit}
                 />
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