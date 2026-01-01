import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Download, CheckCircle, X } from 'lucide-react';
import { attemptDataRecovery, validateData } from '../utils/autoBackup';

export default function DataRecovery({ onRestore, onDismiss }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    async function checkBackups() {
      try {
        const recoveredSources = await attemptDataRecovery();
        setSources(recoveredSources);

        // Auto-select neueste Quelle
        if (recoveredSources.length > 0) {
          setSelectedSource(0);
        }
      } catch (error) {
        console.error('Recovery Check fehlgeschlagen:', error);
      } finally {
        setLoading(false);
      }
    }

    checkBackups();
  }, []);

  const handleRestore = () => {
    if (selectedSource !== null && sources[selectedSource]) {
      const data = sources[selectedSource].data;

      if (validateData(data)) {
        onRestore(data);
      } else {
        alert('Warnung: Backup-Daten scheinen beschädigt zu sein!');
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
          <RefreshCw className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
          <p className="text-white font-bold text-lg">Suche nach Backups...</p>
          <p className="text-zinc-500 text-sm mt-2">Bitte warten</p>
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-rose-500/50 rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-500/20 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Keine Backups gefunden</h2>
          </div>

          <p className="text-zinc-400 text-sm mb-6">
            Es konnten keine Backup-Daten gefunden werden. Du startest mit einer leeren App.
          </p>

          <button
            onClick={onDismiss}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl p-8 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-3 rounded-xl">
              <Download className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Datenwiederherstellung</h2>
              <p className="text-zinc-500 text-sm">
                {sources.length} Backup{sources.length !== 1 ? 's' : ''} gefunden
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-zinc-400 text-sm mb-6">
          Wir haben automatische Backups deiner Daten gefunden. Wähle das Backup aus, das du wiederherstellen möchtest:
        </p>

        {/* Backup Sources */}
        <div className="space-y-3 mb-6">
          {sources.map((source, index) => {
            const isValid = validateData(source.data);
            // **FIX v8.9**: sessionCount wiederhergestellt
            const historyDays = source.data.historyData?.length || 0;
            const sessionCount = source.data.sessionHits?.length || 0;
            const date = new Date(source.timestamp);

            return (
              <button
                key={index}
                onClick={() => setSelectedSource(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedSource === index
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{source.source}</span>
                      {isValid ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-500" />
                      )}
                    </div>

                    <p className="text-xs text-zinc-500 mb-2">
                      {date.toLocaleDateString('de-DE')} um {date.toLocaleTimeString('de-DE')}
                    </p>

                    <div className="flex gap-4 text-xs">
                      <span className="text-purple-400">
                        {historyDays} Tag{historyDays !== 1 ? 'e' : ''}
                      </span>
                      <span className="text-emerald-400">
                        {sessionCount} Hit{sessionCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {!isValid && (
                      <p className="text-xs text-amber-500 mt-2">
                        ⚠️ Backup könnte beschädigt sein
                      </p>
                    )}
                  </div>

                  {selectedSource === index && (
                    <div className="bg-emerald-500 p-1 rounded-full">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleRestore}
            disabled={selectedSource === null}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Wiederherstellen
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <span className="font-bold text-white">Hinweis:</span> Die Wiederherstellung überschreibt alle aktuellen Daten.
            Wenn du unsicher bist, exportiere deine aktuellen Daten zuerst unter Einstellungen.
          </p>
        </div>
      </div>
    </div>
  );
}
