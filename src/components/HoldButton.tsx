import React, { useState, useEffect, useRef } from 'react';
import { Zap, Flame } from 'lucide-react';

interface HoldButtonProps {
  onTrigger: (duration: number) => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  lastHit: string;
  active: boolean;
  flame: boolean;
}

/**
 * Enhanced Hold Button Component
 * Main interaction button for manual triggering and sensor status display
 */
export default function HoldButton({ onTrigger, onHoldStart, onHoldEnd, lastHit, active, flame }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const [prog, setProg] = useState(0);
  const startRef = useRef(0);
  const reqRef = useRef<number>(0);

  useEffect(() => {
    if (active && !holding) startAnim();
    else if (!active && !holding) { setProg(0); cancelAnimationFrame(reqRef.current); }
  }, [active]);

  // FIX: Cleanup RAF on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cancelAnimationFrame(reqRef.current);
    };
  }, []);

  const startAnim = () => {
    startRef.current = Date.now();
    const loop = () => {
      const p = Math.min(100, ((Date.now() - startRef.current)/2000)*100);
      setProg(p);
      if (active || holding) reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
  };

  const start = () => {
    if(navigator.vibrate) navigator.vibrate(30);
    setHolding(true);
    startAnim();
    if (onHoldStart) onHoldStart();
  };

  const end = () => {
    // FIX: Guard to prevent unintended triggers when not holding
    if (!holding) return;

    setHolding(false);
    cancelAnimationFrame(reqRef.current);
    const d = Date.now() - startRef.current;
    if (d > 200) onTrigger(d);
    setProg(0);
    if (onHoldEnd) onHoldEnd();
  };

  const isAct = holding || active;

  return (
    <div className="py-4 flex justify-center">
      <div className="w-64 h-64 relative flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
         {/* Background ring */}
         <div className="absolute inset-0 rounded-full border-4 border-zinc-800 transition-all duration-300"></div>

         {/* Outer glow ring when active */}
         {isAct && (
           <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-pulse"></div>
         )}

         {/* Progress ring */}
         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle cx="128" cy="128" r="124" stroke="currentColor" strokeWidth="8" fill="transparent"
              className={`transition-all duration-200 ${isAct ? 'text-emerald-500 opacity-100 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'text-emerald-500/20 opacity-0'}`}
              strokeDasharray="779"
              strokeDashoffset={779 - (779 * prog) / 100}
              strokeLinecap="round" />
         </svg>

         {/* Main button */}
         <button
            onMouseDown={start} onMouseUp={end} onMouseLeave={end}
            onTouchStart={(e)=>{e.preventDefault(); start();}} onTouchEnd={(e)=>{e.preventDefault(); end();}}
            className={`w-48 h-48 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-950 border shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-10 relative overflow-hidden ${
              isAct
                ? 'border-emerald-500/50 shadow-emerald-500/20'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}
         >
            {/* Animated fill gradient */}
            <div
              className={`absolute bottom-0 w-full bg-gradient-to-t from-emerald-500/30 via-emerald-500/20 to-transparent transition-all duration-75 ease-linear`}
              style={{ height: `${prog}%` }}
            ></div>

            {/* Radial glow when active */}
            {isAct && (
              <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent animate-pulse"></div>
            )}

            {/* Last hit label */}
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest z-10">Last Hit</span>

            {/* Timer display */}
            <div className={`text-4xl font-mono font-bold z-10 tabular-nums my-1 transition-colors ${
              isAct ? 'text-emerald-400' : 'text-white'
            }`}>
              {lastHit}
            </div>

            {/* Status badge */}
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border z-10 transition-all duration-300 ${
              isAct
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black border-emerald-400 shadow-lg shadow-emerald-500/50'
                : 'bg-zinc-800 text-emerald-500 border-zinc-700 hover:border-emerald-500/50'
            }`}>
               <Zap size={12} className={`inline mr-1 transition-all ${isAct ? "fill-black" : "fill-emerald-500"}`}/>
               {isAct ? "Inhaling..." : "Hold / Sensor"}
            </div>

            {/* Flame indicator */}
            <div className={`absolute bottom-6 flex items-center gap-1 text-[10px] font-mono z-10 transition-all duration-300 ${
              flame
                ? 'text-orange-500 font-bold'
                : 'text-zinc-600'
            }`}>
               <Flame size={10} className={`transition-all ${flame ? 'text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''}`}/>
               {flame ? 'Detected' : 'Ready'}
            </div>
         </button>

         {/* Outer shimmer ring */}
         <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
           isAct ? 'opacity-100' : 'opacity-0'
         }`}>
           <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/10 via-transparent to-emerald-500/10 animate-spin-slow"></div>
         </div>
      </div>
    </div>
  );
}