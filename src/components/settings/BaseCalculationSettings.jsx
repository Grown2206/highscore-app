import React from 'react';
import { Scale, Shield, Smartphone } from 'lucide-react';

/**
 * Base Calculation Settings Component
 * Bowl size, weed ratio, admin mode toggle, simulation mode toggle
 */
export default function BaseCalculationSettings({
  settings,
  updateSetting,
  isSimulating,
  setIsSimulating
}) {
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
    </div>
  );
}
