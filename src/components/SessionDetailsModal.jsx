import React from 'react';
import { X, Clock, Tag, Zap, Calendar, TrendingUp } from 'lucide-react';
import { getHitTypeLabel, getHitTypeStyle } from '../utils/hitTypeHelpers';

export default function SessionDetailsModal({ session, onClose }) {
  if (!session) return null;

  const date = new Date(session.timestamp);
  const duration = session.duration ? (session.duration / 1000).toFixed(1) : 'N/A';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}></div>

      <div
        className="relative border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
              }}
            >
              <Zap size={20} style={{ color: 'var(--accent-success)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Session Details</h3>
              <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>#{session.id.toString().slice(-6)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Date & Time */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} style={{ color: 'var(--accent-info)' }} />
              <span className="text-xs uppercase font-bold" style={{ color: 'var(--text-disabled)' }}>Zeitpunkt</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{date.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-success)' }}>
                {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Strain */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} style={{ color: 'var(--accent-secondary)' }} />
              <span className="text-xs uppercase font-bold" style={{ color: 'var(--text-disabled)' }}>Sorte</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{session.strainName || 'Unbekannt'}</p>
            {session.strainPrice && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>{session.strainPrice}€/g</p>
            )}
          </div>

          {/* Duration */}
          {session.duration > 0 && (
            <div
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} style={{ color: 'var(--accent-warning)' }} />
                <span className="text-xs uppercase font-bold" style={{ color: 'var(--text-disabled)' }}>Dauer</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-warning)' }}>{duration}</p>
                <span className="text-sm" style={{ color: 'var(--text-disabled)' }}>Sekunden</span>
              </div>
              <div className="mt-3 rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(100, (parseFloat(duration) / 10) * 100)}%`,
                    background: 'linear-gradient(to right, var(--accent-warning), var(--accent-error))',
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Type */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} style={{ color: 'var(--accent-success)' }} />
              <span className="text-xs uppercase font-bold" style={{ color: 'var(--text-disabled)' }}>Typ</span>
            </div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
              style={getHitTypeStyle(session.type || '')}
            >
              {getHitTypeLabel(session.type || '')}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>Stunde</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{date.getHours()}</p>
            </div>
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>Wochentag</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{date.toLocaleDateString('de-DE', { weekday: 'short' })}</p>
            </div>
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>KW</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{getWeekNumber(date)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'white',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function for week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
