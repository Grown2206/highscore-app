import React, { useState, useRef, memo } from 'react';
import { Settings, Shield, Download, Upload, Target, AlertCircle, Database, Trash, Scale, Percent, RefreshCw, Smartphone } from 'lucide-react';
import { generateTestData, mergeTestData, removeTestData } from '../utils/testDataGenerator';
import { DEFAULT_SETTINGS, STORAGE_KEYS, LEGACY_KEYS } from '../utils/constants';

// **FIX v8.9**: sessionHits/setSessionHits props wieder hinzugefügt
function SettingsView({ settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits, goals, setGoals, showRecovery, setShowRecovery, isSimulating, setIsSimulating }) {
  const [exportStatus, setExportStatus] = useState(null);
  const [testDataStatus, setTestDataStatus] = useState(null);
  const fileInputRef = useRef(null);

  const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  // Export/Import Funktionen
  // **FIX v8.9**: Export mit sessionHits (primäre Quelle)
  const exportData = () => {
    try {
      const exportObj = {
        version: '8.9',
        exportDate: new Date().toISOString(),
        settings,
        historyData,
        sessionHits,
        goals: goals || []
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `highscore-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus({ type: 'success', msg: 'Daten erfolgreich exportiert!' });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (e) {
      setExportStatus({ type: 'error', msg: 'Export fehlgeschlagen: ' + e.message });
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.version || !data.settings) {
          throw new Error('Ungültiges Backup-Format');
        }

        if (window.confirm('Achtung: Alle aktuellen Daten werden überschrieben. Fortfahren?')) {
          setSettings(data.settings);
          setHistoryData(data.historyData || []);
          setSessionHits(data.sessionHits || []);
          if (setGoals) setGoals(data.goals || []);

          setExportStatus({ type: 'success', msg: 'Daten erfolgreich importiert!' });
          setTimeout(() => setExportStatus(null), 3000);
        }
      } catch (e) {
        setExportStatus({ type: 'error', msg: 'Import fehlgeschlagen: ' + e.message });
        setTimeout(() => setExportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // **FIX v8.9**: Testdaten mit sessionHits und Auto-Sync
  const addTestData = (days = 30) => {
    try {
      const testData = generateTestData(days, settings);
      const merged = mergeTestData(
        { sessionHits, historyData },
        testData
      );

      setSessionHits(merged.sessionHits);
      // historyData wird automatisch in App.jsx synchronisiert

      setTestDataStatus({ type: 'success', msg: `${days} Tage Testdaten hinzugefügt!` });
      setTimeout(() => setTestDataStatus(null), 3000);
    } catch (e) {
      setTestDataStatus({ type: 'error', msg: 'Fehler beim Generieren: ' + e.message });
      setTimeout(() => setTestDataStatus(null), 3000);
    }
  };

  // **FIX v8.9**: clearTestData mit sessionHits und Auto-Sync
  const clearTestData = () => {
    if (!window.confirm('Alle Testdaten (IDs mit "test_") wirklich löschen?')) return;

    try {
      const cleaned = removeTestData(sessionHits);
      setSessionHits(cleaned.sessionHits);
      // historyData wird automatisch in App.jsx synchronisiert

      setTestDataStatus({ type: 'success', msg: 'Testdaten entfernt!' });
      setTimeout(() => setTestDataStatus(null), 3000);
    } catch (e) {
      setTestDataStatus({ type: 'error', msg: 'Fehler beim Löschen: ' + e.message });
      setTimeout(() => setTestDataStatus(null), 3000);
    }
  };

  // NEUE FUNKTION: Alle Daten zurücksetzen (außer Sorten)
  const resetAllDataExceptStrains = () => {
    if (!window.confirm('⚠️ ACHTUNG: Alle Daten (Sessions, Erfolge, Tagebuch) werden gelöscht!\n\nNur die Sorten bleiben erhalten.\n\nWirklich fortfahren?')) return;

    try {
      // Sorten aus Settings extrahieren
      const strainsBackup = settings.strains || [];

      // Alle Daten zurücksetzen
      setSessionHits([]);
      setHistoryData([]);
      if (setGoals) setGoals({ dailyLimit: 0, tBreakDays: 0 });

      // Settings zurücksetzen ABER Sorten + andere Felder behalten
      // Spread operator: prevSettings bleibt basis, DEFAULT_SETTINGS überschreibt nur reset-Felder
      // adminMode, strains etc. bleiben durch initialen spread erhalten
      setSettings((prevSettings) => ({
        ...prevSettings,        // Alle bisherigen Settings (inkl. adminMode)
        ...DEFAULT_SETTINGS,    // Überschreibe nur: bowlSize, weedRatio, triggerThreshold
        strains: strainsBackup, // Sorten explizit wiederherstellen
      }));

      // localStorage Keys manuell löschen (außer Settings und Device IP)
      // Verwende zentrale Storage-Key-Konstanten
      const keysToDelete = [
        STORAGE_KEYS.HISTORY,
        STORAGE_KEYS.SESSION_HITS,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.LAST_DATE,
        STORAGE_KEYS.OFFSET,
        STORAGE_KEYS.LAST_HIT_TS,
        STORAGE_KEYS.BADGE_HISTORY,
        // Legacy cleanup: Remove old achievement key (deprecated in v7.0, removed in v8.0)
        LEGACY_KEYS.ACHIEVEMENTS_V6,
      ];
      keysToDelete.forEach(key => localStorage.removeItem(key));

      setExportStatus({ type: 'success', msg: '✅ Alle Daten gelöscht (Sorten behalten)!' });
      setTimeout(() => setExportStatus(null), 4000);
    } catch (e) {
      setExportStatus({ type: 'error', msg: 'Fehler beim Zurücksetzen: ' + e.message });
      setTimeout(() => setExportStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Einstellungen</h2>

      {/* BASIS BERECHNUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
           <Scale size={16}/> Basis Berechnung
         </h3>
         <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span>Kopfgröße</span>
              <span className="text-emerald-400 font-bold">{settings.bowlSize}g</span>
            </div>
            <input type="range" min="0.1" max="1.5" step="0.05" value={settings.bowlSize} onChange={e => upd('bowlSize', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-emerald-500"/>

            <div className="flex justify-between text-xs mt-4">
              <span>Weed Anteil</span>
              <span className="text-lime-400 font-bold">{settings.weedRatio}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={settings.weedRatio} onChange={e => upd('weedRatio', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-lime-500"/>
         </div>

         <div className="w-full h-px bg-zinc-800"></div>

         <div className="flex items-center justify-between pt-2">
           <div>
             <label className="flex items-center gap-2 text-white font-medium">
               <Shield size={20} className={settings.adminMode ? "text-rose-500" : "text-zinc-500"} />
               Admin Modus
             </label>
             <p className="text-xs text-zinc-500 mt-1 pl-7">Zeigt Diagnose-Daten und Testdaten-Verwaltung.</p>
           </div>
           <button onClick={() => upd('adminMode', !settings.adminMode)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.adminMode ? 'bg-rose-500' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.adminMode ? 'left-7' : 'left-1'}`}></div>
           </button>
         </div>

         {/* Demo-Modus Toggle (nur im Admin-Modus sichtbar) */}
         {settings.adminMode && setIsSimulating && (
           <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800">
             <div>
               <label className="flex items-center gap-2 text-white font-medium">
                 <Smartphone size={20} className={isSimulating ? "text-blue-500" : "text-emerald-500"} />
                 {isSimulating ? "Demo-Modus" : "Sensor-Modus"}
               </label>
               <p className="text-xs text-zinc-500 mt-1 pl-7">
                 {isSimulating
                   ? "Simuliert Sensor-Daten für Tests (keine Hardware benötigt)"
                   : "Verbindet mit ESP32-Hardware für echte Messungen"}
               </p>
             </div>
             <button
               onClick={() => setIsSimulating(!isSimulating)}
               className={`w-12 h-6 rounded-full transition-colors relative ${isSimulating ? 'bg-blue-500' : 'bg-emerald-500'}`}
             >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isSimulating ? 'left-7' : 'left-1'}`}></div>
             </button>
           </div>
         )}
      </div>

      {/* GOALS / ZIELE */}
      {setGoals && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Ziele</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <label className="text-xs text-zinc-500 uppercase block mb-2">Tägliches Limit</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={goals?.dailyLimit || 0}
                  onChange={(e) => setGoals(p => ({ ...p, dailyLimit: parseInt(e.target.value) || 0 }))}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono"
                />
                <span className="text-sm text-zinc-500">Hits/Tag</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">0 = kein Limit</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <label className="text-xs text-zinc-500 uppercase block mb-2">T-Break Erinnerung</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={goals?.tBreakDays || 0}
                  onChange={(e) => setGoals(p => ({ ...p, tBreakDays: parseInt(e.target.value) || 0 }))}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono"
                />
                <span className="text-sm text-zinc-500">Tage</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Erinnerung nach X Tagen ohne Pause</p>
            </div>
          </div>
        </div>
      )}

      {/* TESTDATEN (nur im Admin Mode) */}
      {settings.adminMode && (
        <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-indigo-400"/>
            <h3 className="text-sm font-bold text-indigo-400 uppercase">Testdaten (Admin)</h3>
          </div>

          {testDataStatus && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm ${testDataStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
              <AlertCircle size={14} />
              {testDataStatus.msg}
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => addTestData(7)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
              >
                7 Tage
              </button>
              <button
                onClick={() => addTestData(30)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
              >
                30 Tage
              </button>
              <button
                onClick={() => addTestData(90)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
              >
                90 Tage
              </button>
            </div>

            <button
              onClick={clearTestData}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl transition-colors font-medium"
            >
              <Trash size={18} />
              Alle Testdaten Löschen
            </button>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3">
            <p className="text-[10px] text-indigo-300 leading-relaxed">
              <strong>Hinweis:</strong> Testdaten simulieren realistische Sessions über mehrere Tage.
              Sie werden mit "test_" IDs markiert und können jederzeit wieder entfernt werden.
              Perfekt zum Testen der Analytics, Charts und Statistiken!
            </p>
          </div>
        </div>
      )}

      {/* EXPORT / IMPORT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-purple-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Daten-Verwaltung</h3>
        </div>

        {exportStatus && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm ${exportStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
            <AlertCircle size={14} />
            {exportStatus.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors font-medium"
          >
            <Download size={18} />
            Daten Exportieren
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl transition-colors font-medium border border-zinc-700"
          >
            <Upload size={18} />
            Daten Importieren
          </button>

          <button
            onClick={() => setShowRecovery?.(true)}
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
          onChange={importData}
          className="hidden"
        />

        <p className="text-[10px] text-zinc-600 leading-relaxed">
          Sichere deine Daten regelmäßig! Export erstellt eine JSON-Datei mit allen Sessions, Erfolgen und Einstellungen.
        </p>

        {/* RESET BUTTON */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={resetAllDataExceptStrains}
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
    </div>
  );
}

export default memo(SettingsView);
