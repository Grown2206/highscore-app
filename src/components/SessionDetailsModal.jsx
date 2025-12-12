import React from 'react';
import { X, Clock, Tag, Zap, Calendar, TrendingUp } from 'lucide-react';

export default function SessionDetailsModal({ session, onClose }) {
  if (!session) return null;

  const date = new Date(session.timestamp);
  const duration = session.duration ? (session.duration / 1000).toFixed(1) : 'N/A';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Zap size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Session Details</h3>
              <p className="text-xs text-zinc-500">#{session.id.toString().slice(-6)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-xs text-zinc-500 uppercase font-bold">Zeitpunkt</span>
            </div>
            <div className="space-y-1">
              <p className="text-white font-medium">{date.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Strain */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-purple-500" />
              <span className="text-xs text-zinc-500 uppercase font-bold">Sorte</span>
            </div>
            <p className="text-lg font-bold text-white">{session.strainName || 'Unbekannt'}</p>
            {session.strainPrice && (
              <p className="text-xs text-zinc-500 mt-1">{session.strainPrice}€/g</p>
            )}
          </div>

          {/* Duration */}
          {session.duration > 0 && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-amber-500" />
                <span className="text-xs text-zinc-500 uppercase font-bold">Dauer</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-mono text-amber-400">{duration}</p>
                <span className="text-sm text-zinc-500">Sekunden</span>
              </div>
              <div className="mt-3 bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                  style={{ width: `${Math.min(100, (parseFloat(duration) / 10) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Type */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs text-zinc-500 uppercase font-bold">Typ</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              session.type === 'Sensor'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {session.type || 'Manuell'}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-600 uppercase mb-1">Stunde</p>
              <p className="text-lg font-bold text-white font-mono">{date.getHours()}</p>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-600 uppercase mb-1">Wochentag</p>
              <p className="text-lg font-bold text-white">{date.toLocaleDateString('de-DE', { weekday: 'short' })}</p>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-600 uppercase mb-1">KW</p>
              <p className="text-lg font-bold text-white font-mono">{getWeekNumber(date)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors"
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
