import React from 'react';
import { Download, Upload, Trash, RefreshCw } from 'lucide-react';
import StatusAlert from '../common/StatusAlert';

/**
 * Data Management Component
 * Export, import, restore, and reset all data
 */
export default function DataManagement({
  exportStatus,
  fileInputRef,
  onExport,
  onImportClick,
  onImportChange,
  onShowRecovery,
  onResetAllData
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Download size={16} className="text-purple-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Daten-Verwaltung</h3>
      </div>

      {exportStatus && (
        <StatusAlert type={exportStatus.type}>
          {exportStatus.msg}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={onExport}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors font-medium"
        >
          <Download size={18} />
          Daten Exportieren
        </button>

        <button
          onClick={onImportClick}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl transition-colors font-medium border border-zinc-700"
        >
          <Upload size={18} />
          Daten Importieren
        </button>

        <button
          onClick={onShowRecovery}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors font-medium"
        >
          <RefreshCw size={18} />
          Wiederherstellen
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImportChange}
        className="hidden"
      />

      <p className="text-[10px] text-zinc-600 leading-relaxed">
        Sichere deine Daten regelmäßig! Export erstellt eine JSON-Datei mit allen Sessions, Erfolgen und Einstellungen.
      </p>

      {/* RESET BUTTON */}
      <div className="pt-4 border-t border-zinc-800">
        <button
          onClick={onResetAllData}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl transition-colors font-medium"
        >
          <Trash size={18} />
          Alle Daten Zurücksetzen (außer Sorten)
        </button>
        <p className="text-[10px] text-rose-400/70 mt-2 text-center">
          ⚠️ Löscht alle Sessions, Erfolge und Tagebuch-Einträge. Sorten bleiben erhalten!
        </p>
      </div>
    </div>
  );
}
