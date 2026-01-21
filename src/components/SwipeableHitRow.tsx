import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Info, WifiOff } from 'lucide-react';

// Z-index constants for layer stacking
const Z_INDEX = {
  BACKGROUND_INACTIVE: 1,
  BACKGROUND_ACTIVE: 2,
  CONTENT: 3,
};

interface Hit {
  id: string | number;
  timestamp: number;
  strainName: string;
  type?: string;
  duration?: number;
}

interface SwipeableHitRowProps {
  hit: Hit;
  hitNumber: number;
  onDelete: (hitId: string | number) => void;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (hitId: string | number) => void;
}

/**
 * Enhanced Swipeable Hit Row Component
 * Used in DashboardView and CalendarView with swipe-to-delete and multi-select support
 */
export default function SwipeableHitRow({
  hit,
  hitNumber,
  onDelete,
  selectMode = false,
  isSelected = false,
  onToggleSelect
}: SwipeableHitRowProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false); // Desktop hover state
  const startX = useRef(0);
  const currentX = useRef(0);

  // **FIX v8.8**: Reset swipe state when entering select mode
  // Prevents rows from staying partially swiped when mode changes
  useEffect(() => {
    if (selectMode) {
      setSwipeX(0);
      setShowDeleteBtn(false);
      setIsSwiping(false);
    }
  }, [selectMode]);

  const handleTouchStart = (e) => {
    if (selectMode) return; // Disable swipe in select mode
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || selectMode) return; // Disable swipe in select mode
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    // Allow both left and right swipe
    setSwipeX(Math.max(Math.min(diff, 100), -100));
  };

  const handleTouchEnd = () => {
    if (selectMode) return; // Disable swipe in select mode
    setIsSwiping(false);
    if (swipeX < -60) {
      // Swiped left - lock at delete position
      setSwipeX(-80);
    } else if (swipeX > 60) {
      // Swiped right - lock at info position
      setSwipeX(80);
    } else {
      // Reset to center
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDelete();
    }
  };

  // Normalize ID for display (only handle string/number, fallback to '–' for anything else)
  const idLabel = typeof hit.id === 'string'
    ? hit.id.slice(0, 8)
    : typeof hit.id === 'number'
      ? String(hit.id).slice(0, 8)
      : '–';

  return (
    <tr className="relative">
      <td colSpan="4" className="p-0">
        <div className="relative overflow-hidden">
          {/* Info background (right swipe) - always mounted, revealed by swipe */}
          <div
            className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, var(--accent-info), color-mix(in srgb, var(--accent-info) 90%, white))',
              zIndex: swipeX > 0 ? Z_INDEX.BACKGROUND_ACTIVE : Z_INDEX.BACKGROUND_INACTIVE,
            }}
          >
            <div className="flex items-center gap-2 font-bold text-xs" style={{ color: 'white' }}>
              <Info size={16} />
              <div className="flex flex-col">
                <span className="text-[10px]" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  ID: {idLabel}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {new Date(hit.timestamp).toLocaleString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Typ: {hit.type === 'Sensor' ? 'Offline (ESP32)' : 'Manuell'}
                </span>
              </div>
            </div>
          </div>

          {/* Delete button background (left swipe) - always mounted, revealed by swipe */}
          <div
            className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, var(--accent-error), color-mix(in srgb, var(--accent-error) 90%, white))',
              zIndex: swipeX < 0 ? Z_INDEX.BACKGROUND_ACTIVE : Z_INDEX.BACKGROUND_INACTIVE,
            }}
          >
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 font-bold pointer-events-auto"
              style={{ color: 'white' }}
            >
              <Trash2 size={16} />
              Löschen
            </button>
          </div>

          {/* Swipeable content */}
          <div
            className="relative flex items-center transition-transform duration-200"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              transform: `translateX(${swipeX}px)`,
              zIndex: Z_INDEX.CONTENT,
            }}
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
            <div
              className="w-full flex items-center py-3 px-4 transition-colors"
              style={{
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bg-tertiary) 50%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* **NEW v8.8**: Checkbox for multi-select mode */}
              {selectMode && (
                <div className="flex-none mr-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect && onToggleSelect(hit.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: 'var(--bg-tertiary)',
                      accentColor: 'var(--accent-primary)',
                    }}
                  />
                </div>
              )}
              <div className="flex-none w-12 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                #{hitNumber}
              </div>
              <div className="flex-none w-20 text-xs" style={{ color: 'var(--text-primary)' }}>
                {new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex-1 text-xs px-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                {hit.strainName}
                {/* **NEW**: Offline/Sensor Hit Indicator */}
                {hit.type === 'Sensor' && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold border"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)',
                      color: 'var(--accent-info)',
                      borderColor: 'color-mix(in srgb, var(--accent-info) 30%, transparent)',
                    }}
                  >
                    <WifiOff size={9} />
                    O
                  </span>
                )}
              </div>
              <div className="flex-none text-right flex items-center gap-2">
                {hit.duration > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                      color: 'var(--accent-primary)',
                      borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
                    }}
                  >
                    {(hit.duration / 1000).toFixed(1)}s
                  </span>
                )}
                {/* Desktop delete button - visible on hover (hidden in select mode) */}
                {!selectMode && showDeleteBtn && !isSwiping && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-[10px] font-bold"
                    style={{
                      backgroundColor: 'var(--accent-error)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-error) 90%, black)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-error)';
                    }}
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
