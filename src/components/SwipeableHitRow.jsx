import React, { useState, useRef } from 'react';
import { Trash2, Info } from 'lucide-react';

// Swipeable Hit Row Component - used in DashboardView and CalendarView
export default function SwipeableHitRow({ hit, hitNumber, onDelete }) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false); // Desktop hover state
  const [showDetails, setShowDetails] = useState(false);
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
    // Allow both left and right swipe
    setSwipeX(Math.max(Math.min(diff, 100), -100));
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeX < -60) {
      // Swiped left - show delete button
      setSwipeX(-80);
      setShowDetails(false);
    } else if (swipeX > 60) {
      // Swiped right - show details
      setSwipeX(80);
      setShowDetails(true);
    } else {
      // Reset
      setSwipeX(0);
      setShowDetails(false);
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
          {/* Info background (right swipe) */}
          <div className="absolute inset-0 bg-blue-600 flex items-center justify-start pl-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Info size={16} />
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-200">ID: {hit.id.slice(0, 8)}</span>
                <span className="text-[10px] text-blue-200">
                  {new Date(hit.timestamp).toLocaleString('de-DE')}
                </span>
              </div>
            </div>
          </div>

          {/* Delete button background (left swipe) */}
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
            aria-label={`Hit #${hitNumber} - ${hit.strainName} um ${new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Links wischen zum Löschen, Rechts für Details`}
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
