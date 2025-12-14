import React, { useState, useEffect, useRef } from 'react';
import { Zap, Flame } from 'lucide-react';

export default function HoldButton({ onTrigger, lastHit, active, flame }) {
  const [holding, setHolding] = useState(false);
  const [prog, setProg] = useState(0);
  const startRef = useRef(0);
  const reqRef = useRef(0);

  useEffect(() => {
    if (active && !holding) startAnim();
    else if (!active && !holding) { setProg(0); cancelAnimationFrame(reqRef.current); }
  }, [active]);

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
  };
  
  const end = () => { 
    setHolding(false); 
    cancelAnimationFrame(reqRef.current); 
    const d = Date.now() - startRef.current; 
    if (d > 200) onTrigger(d); 
    setProg(0); 
  };

  const isAct = holding || active;

  return (
    <div className="py-4 flex justify-center">
      <div className="w-64 h-64 relative flex items-center justify-center">
         <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none filter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <circle cx="128" cy="128" r="124" stroke="currentColor" strokeWidth="8" fill="transparent" 
              className={`text-emerald-500 transition-opacity duration-200 ${isAct ? 'opacity-100' : 'opacity-0'}`} 
              strokeDasharray="779" strokeDashoffset={779 - (779 * prog) / 100} />
         </svg>
         
         <button 
            onMouseDown={start} onMouseUp={end} onMouseLeave={end} 
            onTouchStart={(e)=>{e.preventDefault(); start();}} onTouchEnd={(e)=>{e.preventDefault(); end();}}
            className="w-48 h-48 rounded-full bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-10 relative overflow-hidden"
         >
            <div className={`absolute bottom-0 w-full bg-emerald-500/20 transition-all duration-75 ease-linear`} style={{ height: `${prog}%` }}></div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest z-10">Last Hit</span>
            <div className="text-4xl font-mono font-bold text-white z-10 tabular-nums my-1">{lastHit}</div>
            
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border z-10 transition-colors ${isAct ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800 text-emerald-500 border-zinc-700'}`}>
               <Zap size={12} className={`inline mr-1 ${isAct ? "fill-black" : "fill-emerald-500"}`}/> {isAct ? "Inhaling..." : "Hold / Sensor"}
            </div>
            
            <div className="absolute bottom-6 flex items-center gap-1 text-[10px] text-zinc-600 font-mono z-10">
               <Flame size={10} className={flame ? 'text-orange-500' : ''}/> {flame ? 'Detected' : 'Ready'}
            </div>
         </button>
      </div>
    </div>
  );
}