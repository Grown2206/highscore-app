import React, { useState, useRef, memo, useCallback } from 'react';
import { generateTestData, mergeTestData, removeTestData } from '../utils/testDataGenerator';
import { DEFAULT_SETTINGS, STORAGE_KEYS, LEGACY_KEYS, TIMESTAMP_VALIDATION } from '../utils/constants';
import { HistoryDataEntry } from '../utils/historyDataHelpers.ts';
import { Hit } from '../hooks/useHitSelection.ts';
import { Settings, Goals } from '../hooks/useHitManagement.ts';
import { AlertType } from './common/StatusAlert.tsx';

// Settings Components
import BaseCalculationSettings from './settings/BaseCalculationSettings';
import GoalsSettings from './settings/GoalsSettings';
import TestDataControls from './settings/TestDataControls';
import CorruptHitsCleanup from './settings/CorruptHitsCleanup';
import DataManagement from './settings/DataManagement';
import ThemeSwitcher from './ThemeSwitcher';
import AccentColorPicker from './AccentColorPicker';

interface StatusMessage {
  type: AlertType;
  msg: string;
}

interface SettingsViewProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  historyData: HistoryDataEntry[];
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryDataEntry[]>>;
  sessionHits: Hit[];
  setSessionHits: React.Dispatch<React.SetStateAction<Hit[]>>;
  goals: Goals;
  setGoals: React.Dispatch<React.SetStateAction<Goals>>;
  showRecovery: boolean;
  setShowRecovery: (show: boolean) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  esp32Connected: boolean;
  esp32Ip: string;
  esp32LiveData: any;
}

/**
 * **REFACTORED v8.1**: Settings View - Separated into sub-components
 * Main orchestrator component that manages state and passes to specialized components
 */
function SettingsView({
  settings,
  setSettings,
  historyData,
  setHistoryData,
  sessionHits,
  setSessionHits,
  goals,
  setGoals,
  showRecovery,
  setShowRecovery,
  isSimulating,
  setIsSimulating,
  esp32Connected,
  esp32Ip,
  esp32LiveData
}: SettingsViewProps) {
  const [exportStatus, setExportStatus] = useState<StatusMessage | null>(null);
  const [testDataStatus, setTestDataStatus] = useState<StatusMessage | null>(null);
  const [corruptHitsStatus, setCorruptHitsStatus] = useState<StatusMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(p => ({ ...p, [key]: value }));
  }, [setSettings]);

  /**
   * NOTE: State setter functions from useState are guaranteed to be stable by React.
   * They are included in dependency arrays below to satisfy ESLint's exhaustive-deps rule.
   */

  // Find and remove corrupt hits with unrealistic timestamps
  const findAndRemoveCorruptHits = useCallback(() => {
    const hits = sessionHits || [];
    const now = Date.now();
    const minValidTimestamp = TIMESTAMP_VALIDATION.MIN_VALID_TIMESTAMP_MS;
    const maxValidTimestamp = now + TIMESTAMP_VALIDATION.MAX_FUTURE_OFFSET_MS;

    const corruptHits = hits.filter(hit => {
      return hit.timestamp < minValidTimestamp || hit.timestamp > maxValidTimestamp;
    });

    if (corruptHits.length === 0) {
      setCorruptHitsStatus({ type: 'success', msg: '✓ Keine corrupt Hits gefunden!' });
      setTimeout(() => setCorruptHitsStatus(null), 3000);
      return;
    }

    const details = corruptHits.map(h => {
      const date = new Date(h.timestamp);
      return `• ${date.toLocaleString('de-DE')} - ${h.strainName} (ID: ${String(h.id).slice(0, 8)})`;
    }).join('\n');

    const confirmed = window.confirm(
      `${corruptHits.length} Corrupt Hit(s) gefunden mit ungültigem Datum:\n\n${details}\n\nWirklich löschen?`
    );

    if (confirmed) {
      const validHits = hits.filter(hit =>
        hit.timestamp >= minValidTimestamp && hit.timestamp <= maxValidTimestamp
      );
      setSessionHits(validHits);
      setCorruptHitsStatus({ type: 'success', msg: `✓ ${corruptHits.length} corrupt Hit(s) gelöscht!` });
      setTimeout(() => setCorruptHitsStatus(null), 3000);
    }
  }, [sessionHits, setSessionHits, setCorruptHitsStatus]);

  // Export data
  const exportData = useCallback(() => {
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
  }, [settings, historyData, sessionHits, goals, setExportStatus]);

  // Import data
  const importData = useCallback((event) => {
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
  }, [setSettings, setHistoryData, setSessionHits, setGoals, setExportStatus]);

  // Add test data
  const addTestData = useCallback((days = 30) => {
    try {
      const testData = generateTestData(days, settings);
      const merged = mergeTestData(
        { sessionHits, historyData },
        testData
      );

      setSessionHits(merged.sessionHits);

      setTestDataStatus({ type: 'success', msg: `${days} Tage Testdaten hinzugefügt!` });
      setTimeout(() => setTestDataStatus(null), 3000);
    } catch (e) {
      setTestDataStatus({ type: 'error', msg: 'Fehler beim Generieren: ' + e.message });
      setTimeout(() => setTestDataStatus(null), 3000);
    }
  }, [settings, sessionHits, historyData, setSessionHits, setTestDataStatus]);

  // Clear test data
  const clearTestData = useCallback(() => {
    if (!window.confirm('Alle Testdaten (IDs mit "test_") wirklich löschen?')) return;

    try {
      const cleaned = removeTestData(sessionHits);
      setSessionHits(cleaned.sessionHits);

      setTestDataStatus({ type: 'success', msg: 'Testdaten entfernt!' });
      setTimeout(() => setTestDataStatus(null), 3000);
    } catch (e) {
      setTestDataStatus({ type: 'error', msg: 'Fehler beim Löschen: ' + e.message });
      setTimeout(() => setTestDataStatus(null), 3000);
    }
  }, [sessionHits, setSessionHits, setTestDataStatus]);

  // Reset all data except strains
  const resetAllDataExceptStrains = useCallback(() => {
    if (!window.confirm('⚠️ ACHTUNG: Alle Daten (Sessions, Erfolge, Tagebuch) werden gelöscht!\n\nNur die Sorten bleiben erhalten.\n\nWirklich fortfahren?')) return;

    try {
      const strainsBackup = settings.strains || [];

      setSessionHits([]);
      setHistoryData([]);
      if (setGoals) setGoals({ dailyLimit: 0, tBreakDays: 0 });

      setSettings((prevSettings) => ({
        ...prevSettings,
        ...DEFAULT_SETTINGS,
        strains: strainsBackup,
      }));

      const keysToDelete = [
        STORAGE_KEYS.HISTORY,
        STORAGE_KEYS.SESSION_HITS,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.LAST_DATE,
        STORAGE_KEYS.OFFSET,
        STORAGE_KEYS.LAST_HIT_TS,
        STORAGE_KEYS.BADGE_HISTORY,
        LEGACY_KEYS.ACHIEVEMENTS_V6,
      ];
      keysToDelete.forEach(key => localStorage.removeItem(key));

      setExportStatus({ type: 'success', msg: '✅ Alle Daten gelöscht (Sorten behalten)!' });
      setTimeout(() => setExportStatus(null), 4000);
    } catch (e) {
      setExportStatus({ type: 'error', msg: 'Fehler beim Zurücksetzen: ' + e.message });
      setTimeout(() => setExportStatus(null), 4000);
    }
  }, [settings.strains, setSessionHits, setHistoryData, setGoals, setSettings, setExportStatus]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Einstellungen</h2>

      {/* Theme & Color Customization */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Theme Auswahl
          </h3>
          <ThemeSwitcher />
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Akzentfarben
          </h3>
          <AccentColorPicker />
        </div>
      </div>

      <BaseCalculationSettings
        settings={settings}
        updateSetting={updateSetting}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        esp32Connected={esp32Connected}
        esp32Ip={esp32Ip}
        esp32LiveData={esp32LiveData}
      />

      <GoalsSettings
        goals={goals}
        setGoals={setGoals}
      />

      {settings.adminMode && (
        <>
          <TestDataControls
            testDataStatus={testDataStatus}
            onAddTestData={addTestData}
            onClearTestData={clearTestData}
          />

          <CorruptHitsCleanup
            corruptHitsStatus={corruptHitsStatus}
            onFindAndRemoveCorruptHits={findAndRemoveCorruptHits}
          />
        </>
      )}

      <DataManagement
        exportStatus={exportStatus}
        fileInputRef={fileInputRef}
        onExport={exportData}
        onImportClick={() => fileInputRef.current?.click()}
        onImportChange={importData}
        onShowRecovery={() => setShowRecovery?.(true)}
        onResetAllData={resetAllDataExceptStrains}
      />
    </div>
  );
}

export default memo(SettingsView);
