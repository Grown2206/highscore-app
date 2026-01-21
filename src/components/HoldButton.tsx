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
 * Enhanced Hold Button Component (v8.2 - Theme Support)
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
         <div
           className="absolute inset-0 rounded-full border-4 transition-all duration-300"
           style={{ borderColor: 'var(--border-secondary)' }}
         />

         {/* Outer glow ring when active */}
         {isAct && (
           <div
             className="absolute inset-0 rounded-full border-4 animate-pulse"
             style={{ borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}
           />
         )}

         {/* Progress ring */}
         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="128"
              cy="128"
              r="124"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="transition-all duration-200"
              style={{
                color: isAct ? 'var(--accent-primary)' : 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
                opacity: isAct ? 1 : 0,
                filter: isAct ? 'var(--shadow-glow)' : 'none',
              }}
              strokeDasharray="779"
              strokeDashoffset={779 - (779 * prog) / 100}
              strokeLinecap="round"
            />
         </svg>

         {/* Main button */}
         <button
            onMouseDown={start} onMouseUp={end} onMouseLeave={end}
            onTouchStart={(e)=>{e.preventDefault(); start();}} onTouchEnd={(e)=>{e.preventDefault(); end();}}
            className="w-48 h-48 rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-10 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))`,
              border: isAct
                ? `1px solid color-mix(in srgb, var(--accent-primary) 50%, transparent)`
                : '1px solid var(--border-primary)',
              boxShadow: isAct ? 'var(--shadow-glow)' : 'var(--shadow-lg)',
            }}
         >
            {/* Animated fill gradient */}
            <div
              className="absolute bottom-0 w-full transition-all duration-75 ease-linear"
              style={{
                height: `${prog}%`,
                background: `linear-gradient(to top, color-mix(in srgb, var(--accent-primary) 30%, transparent), color-mix(in srgb, var(--accent-primary) 20%, transparent), transparent)`,
              }}
            />

            {/* Radial glow when active */}
            {isAct && (
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  background: `radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent, transparent)`,
                }}
              />
            )}

            {/* Last hit label */}
            <span
              className="text-[10px] font-bold uppercase tracking-widest z-10"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Last Hit
            </span>

            {/* Timer display */}
            <div
              className="text-4xl font-mono font-bold z-10 tabular-nums my-1 transition-colors"
              style={{ color: isAct ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              {lastHit}
            </div>

            {/* Status badge */}
            <div
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border z-10 transition-all duration-300"
              style={{
                background: isAct
                  ? `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`
                  : 'var(--bg-tertiary)',
                color: isAct ? 'var(--text-inverse)' : 'var(--accent-primary)',
                borderColor: isAct ? 'var(--accent-secondary)' : 'var(--border-primary)',
                boxShadow: isAct ? 'var(--shadow-glow)' : 'none',
              }}
            >
               <Zap
                 size={12}
                 className="inline mr-1 transition-all"
                 style={{ fill: isAct ? 'var(--text-inverse)' : 'var(--accent-primary)' }}
               />
               {isAct ? "Inhaling..." : "Hold / Sensor"}
            </div>

            {/* Flame indicator */}
            <div
              className="absolute bottom-6 flex items-center gap-1 text-[10px] font-mono z-10 transition-all duration-300"
              style={{
                color: flame ? 'var(--accent-warning)' : 'var(--text-tertiary)',
                fontWeight: flame ? 'bold' : 'normal',
              }}
            >
               <Flame
                 size={10}
                 className="transition-all"
                 style={{
                   color: flame ? 'var(--accent-warning)' : 'currentColor',
                   animation: flame ? 'pulse 1s ease-in-out infinite' : 'none',
                   filter: flame ? 'drop-shadow(0 0 8px var(--accent-warning))' : 'none',
                 }}
               />
               {flame ? 'Detected' : 'Ready'}
            </div>
         </button>

         {/* Outer shimmer ring */}
         <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
           isAct ? 'opacity-100' : 'opacity-0'
         }`}>
           <div
             className="absolute inset-0 rounded-full animate-spin-slow"
             style={{
               background: `linear-gradient(to top right, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent, color-mix(in srgb, var(--accent-primary) 10%, transparent))`,
             }}
           />
         </div>
      </div>
    </div>
  );
}
