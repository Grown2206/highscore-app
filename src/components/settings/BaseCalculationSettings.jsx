import React, { useState, useEffect } from 'react';
import { Scale, Shield, Smartphone, Zap, Save, X } from 'lucide-react';

const MIN_SESSION_DURATION_MS = 500;
const MAX_SESSION_DURATION_MS = 8000;
const MIN_DURATION_SLIDER_MAX = 3000;
const MAX_DURATION_SLIDER_MIN = 2000;
const DEFAULT_MIN_SESSION_DURATION_MS = 800;
const DEFAULT_MAX_SESSION_DURATION_MS = 4500;

/**
 * Base Calculation Settings Component (v8.10)
 * Bowl size, weed ratio, admin mode toggle, simulation mode toggle, false trigger settings
 */
export default function BaseCalculationSettings({
  settings,
  updateSetting,
  isSimulating,
  setIsSimulating,
  esp32Connected,
  esp32Ip,
  esp32LiveData
}) {
  const [editingTrigger, setEditingTrigger] = useState(false);
  const [minDuration, setMinDuration] = useState(DEFAULT_MIN_SESSION_DURATION_MS);
  const [maxDuration, setMaxDuration] = useState(DEFAULT_MAX_SESSION_DURATION_MS);
  const [saving, setSaving] = useState(false);

  // Sync False Trigger Settings vom ESP32
  useEffect(() => {
    // Don't overwrite in-progress user edits
    if (editingTrigger) {
      return;
    }

    const minFromDevice = esp32LiveData?.minSessionDuration;
    const maxFromDevice = esp32LiveData?.maxSessionDuration;

    if (typeof minFromDevice === 'number') {
      setMinDuration((prev) => (prev !== minFromDevice ? minFromDevice : prev));
    }

    if (typeof maxFromDevice === 'number') {
      setMaxDuration((prev) => (prev !== maxFromDevice ? maxFromDevice : prev));
    }
  }, [editingTrigger, esp32LiveData?.minSessionDuration, esp32LiveData?.maxSessionDuration]);

  // False Trigger Einstellungen an ESP32 senden
  const saveTriggerSettings = async () => {
    if (isSimulating) {
      alert('Im Demo Modus nicht verfügbar');
      return;
    }

    // IP-Validierung
    if (!esp32Ip || typeof esp32Ip !== 'string' || !/^(\d{1,3}\.){3}\d{1,3}$/.test(esp32Ip.trim())) {
      alert('Fehler: ESP32 IP-Adresse ist ungültig oder nicht gesetzt. Bitte prüfen Sie die Verbindung.');
      return;
    }

    // Validierung
    if (minDuration >= maxDuration) {
      alert('Fehler: Min. Dauer muss kleiner als Max. Dauer sein!');
      return;
    }

    if (minDuration < MIN_SESSION_DURATION_MS || minDuration > MAX_SESSION_DURATION_MS) {
      alert(`Fehler: Min. Dauer muss zwischen ${MIN_SESSION_DURATION_MS}ms und ${MAX_SESSION_DURATION_MS}ms liegen!`);
      return;
    }

    if (maxDuration < MIN_SESSION_DURATION_MS || maxDuration > MAX_SESSION_DURATION_MS) {
      alert(`Fehler: Max. Dauer muss zwischen ${MIN_SESSION_DURATION_MS}ms und ${MAX_SESSION_DURATION_MS}ms liegen!`);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://${esp32Ip.trim()}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minSessionDuration: minDuration,
          maxSessionDuration: maxDuration
        })
      });

      if (response.ok) {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setEditingTrigger(false);
        alert('✅ Einstellungen erfolgreich an ESP32 gesendet!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Speichern fehlgeschlagen');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`❌ Fehler beim Speichern: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
        <Scale size={16}/> Basis Berechnung
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between text-xs">
          <span>Kopfgröße</span>
          <span className="text-emerald-400 font-bold">{settings.bowlSize}g</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.5"
          step="0.05"
          value={settings.bowlSize}
          onChange={e => updateSetting('bowlSize', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg accent-emerald-500"
        />

        <div className="flex justify-between text-xs mt-4">
          <span>Weed Anteil</span>
          <span className="text-lime-400 font-bold">{settings.weedRatio}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={settings.weedRatio}
          onChange={e => updateSetting('weedRatio', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg accent-lime-500"
        />
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
        <button
          onClick={() => updateSetting('adminMode', !settings.adminMode)}
          className={`w-12 h-6 rounded-full transition-colors relative ${settings.adminMode ? 'bg-rose-500' : 'bg-zinc-700'}`}
        >
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

      {/* **NEU v8.10**: False Trigger Prevention Settings */}
      {esp32Connected && !isSimulating && (
        <div className="pt-4 mt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <h4 className="text-sm font-bold text-zinc-400 uppercase">False Trigger Prevention</h4>
            </div>
            {!editingTrigger ? (
              <button
                onClick={() => setEditingTrigger(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors"
              >
                <Zap size={12} />
                Anpassen
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTrigger(false);
                    setMinDuration(esp32LiveData?.minSessionDuration || DEFAULT_MIN_SESSION_DURATION_MS);
                    setMaxDuration(esp32LiveData?.maxSessionDuration || DEFAULT_MAX_SESSION_DURATION_MS);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs transition-colors"
                >
                  <X size={12} />
                  Abbrechen
                </button>
                <button
                  onClick={saveTriggerSettings}
                  disabled={
                    saving ||
                    minDuration >= maxDuration ||
                    minDuration < MIN_SESSION_DURATION_MS || minDuration > MAX_SESSION_DURATION_MS ||
                    maxDuration < MIN_SESSION_DURATION_MS || maxDuration > MAX_SESSION_DURATION_MS
                  }
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs transition-colors"
                >
                  <Save size={12} />
                  {saving ? 'Speichern...' : 'An ESP32 senden'}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-500 mb-4">
            Verhindert Fehlauslösungen durch zu kurze Flammen-Signale (z.B. Feuerzeug-Flackern)
          </p>

          {!editingTrigger ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">Min. Dauer</p>
                <p className="text-lg font-bold text-emerald-400">{(minDuration / 1000).toFixed(1)}s</p>
                <p className="text-[9px] text-zinc-600">Mindest-Session</p>
              </div>

              <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">Max. Dauer</p>
                <p className="text-lg font-bold text-amber-400">{(maxDuration / 1000).toFixed(1)}s</p>
                <p className="text-[9px] text-zinc-600">Maximum-Session</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Min Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-400">Min. Dauer (ms)</label>
                  <span className="text-sm font-bold text-emerald-400">{minDuration}ms ({(minDuration / 1000).toFixed(2)}s)</span>
                </div>
                <input
                  type="range"
                  min={MIN_SESSION_DURATION_MS}
                  max={MIN_DURATION_SLIDER_MAX}
                  step="50"
                  value={minDuration}
                  onChange={(e) => setMinDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-zinc-600">⚠️ Zu kurz → Fehlauslösungen (Flackern)</p>
              </div>

              {/* Max Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-400">Max. Dauer (ms)</label>
                  <span className="text-sm font-bold text-amber-400">{maxDuration}ms ({(maxDuration / 1000).toFixed(2)}s)</span>
                </div>
                <input
                  type="range"
                  min={MAX_DURATION_SLIDER_MIN}
                  max={MAX_SESSION_DURATION_MS}
                  step="100"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[9px] text-zinc-600">⚠️ Zu lang → Sensor hängt fest</p>
              </div>

              {/* Validation Warning */}
              {minDuration >= maxDuration && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                  <p className="text-xs text-red-400">⚠️ Min. Dauer muss kleiner als Max. Dauer sein!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
