import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Corrupt Hits Cleanup Component (Admin only)
 * Find and remove hits with unrealistic timestamps
 */
export default function CorruptHitsCleanup({
  adminMode,
  corruptHitsStatus,
  onFindAndRemoveCorruptHits
}) {
  if (!adminMode) return null;

  return (
    <div className="bg-gradient-to-br from-rose-900/20 to-zinc-900 border border-rose-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-rose-400"/>
        <h3 className="text-sm font-bold text-rose-400 uppercase">Corrupt Hits Bereinigung (Admin)</h3>
      </div>

      {corruptHitsStatus && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm ${
          corruptHitsStatus.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
        }`}>
          <AlertCircle size={14} />
          {corruptHitsStatus.msg}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onFindAndRemoveCorruptHits}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl transition-colors font-medium"
        >
          <AlertCircle size={18} />
          Corrupt Hits Finden & Löschen
        </button>
      </div>

      <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-3">
        <p className="text-[10px] text-rose-300 leading-relaxed">
          <strong>Hinweis:</strong> Findet und löscht Hits mit unrealistischen Timestamps
          (vor 2020 oder nach 2030). Löst Probleme wie "Längste Pause 203999 Tage" oder
          falsche Offline-Hits vom ESP32 wenn NTP-Sync fehlgeschlagen ist.
        </p>
      </div>
    </div>
  );
}
