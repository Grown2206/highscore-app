import React, { useState, memo, useEffect } from 'react';
import { Wifi, WifiOff, Smartphone, RefreshCw, AlertCircle, CheckCircle, Radio, Activity, Clock, Flame, TrendingUp, Zap, Settings as SettingsIcon, Edit3, Save, X } from 'lucide-react';
import { MIN_SESSION_DURATION_MS, MAX_SESSION_DURATION_MS, DEFAULT_MIN_SESSION_DURATION_MS, DEFAULT_MAX_SESSION_DURATION_MS, MIN_DURATION_SLIDER_MAX, MAX_DURATION_SLIDER_MIN } from '../config/sessionDuration';

function ESP32DebugView({ ip, setIp, connected, isSimulating, setIsSimulating, lastError, connectionLog, flameHistory, liveData, errorCount, settings, setSettings }) {
  const [testing, setTesting] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(false);
  const [minDuration, setMinDuration] = useState(DEFAULT_MIN_SESSION_DURATION_MS);
  const [maxDuration, setMaxDuration] = useState(DEFAULT_MAX_SESSION_DURATION_MS);
  const [saving, setSaving] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    if (navigator.vibrate) navigator.vibrate(20);
    // Test wird automatisch durch polling durchgeführt
    setTimeout(() => setTesting(false), 2000);
  };

  // False Trigger Einstellungen speichern
  const saveTriggerSettings = async () => {
    if (isSimulating) {
      alert('Im Demo Modus nicht verfügbar');
      return;
    }

    // **FIX v8.2**: Validierung vor dem Speichern
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
      const response = await fetch(`http://${ip}/api/settings`, {
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
        alert('Einstellungen erfolgreich gespeichert!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Speichern fehlgeschlagen');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Sync False Trigger Settings von ESP32
  useEffect(() => {
    if (liveData.minSessionDuration !== undefined && liveData.minSessionDuration !== null) {
      setMinDuration(liveData.minSessionDuration);
    }
    if (liveData.maxSessionDuration !== undefined && liveData.maxSessionDuration !== null) {
      setMaxDuration(liveData.maxSessionDuration);
    }
  }, [liveData.minSessionDuration, liveData.maxSessionDuration]);

  // Verbindungsqualität berechnen
  const getConnectionQuality = () => {
    if (!connected) return { label: 'Getrennt', color: 'text-zinc-500', bars: 0 };
    if (errorCount > 5) return { label: 'Schlecht', color: 'text-red-500', bars: 1 };
    if (errorCount > 2) return { label: 'Mittel', color: 'text-amber-500', bars: 2 };
    return { label: 'Gut', color: 'text-emerald-500', bars: 3 };
  };

  const quality = getConnectionQuality();

  // Flame Detection Timeline
  const recentFlameData = flameHistory.slice(-60); // Letzte 60 Datenpunkte (~2 Minuten bei 2s Polling)

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Radio size={24} className="text-emerald-500"/>
        ESP32 Diagnose
      </h2>

      {/* Verbindungsstatus */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connected ? (
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Wifi size={24} className="text-emerald-500"/>
              </div>
            ) : (
              <div className="bg-zinc-800 p-3 rounded-xl">
                <WifiOff size={24} className="text-zinc-500"/>
              </div>
            )}
            <div>
              <h3 className="text-white font-bold">{connected ? 'Verbunden' : 'Getrennt'}</h3>
              <p className="text-xs text-zinc-500">{isSimulating ? 'Demo Modus' : `ESP32 @ ${ip}`}</p>
            </div>
          </div>

          {/* Signal Bars */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3].map(bar => (
                <div
                  key={bar}
                  className={`w-1 rounded-sm ${bar <= quality.bars ? quality.color + ' bg-current' : 'bg-zinc-700'}`}
                  style={{ height: `${bar * 6}px` }}
                />
              ))}
            </div>
            <span className={`text-xs font-bold ${quality.color}`}>{quality.label}</span>
          </div>
        </div>

        {/* Modus Toggle */}
        <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className={isSimulating ? "text-blue-500" : "text-emerald-500"}/>
            <div>
              <span className="text-white font-medium text-sm block">{isSimulating ? "Demo Modus" : "Sensor Modus"}</span>
              <span className="text-[10px] text-zinc-500">{isSimulating ? "Simulierte Daten" : "Live ESP32 Daten"}</span>
            </div>
          </div>
          <button onClick={() => setIsSimulating(!isSimulating)} className={`w-12 h-6 rounded-full transition-colors relative ${isSimulating ? 'bg-blue-500' : 'bg-emerald-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isSimulating ? 'left-1' : 'left-7'}`}/>
          </button>
        </div>

        {/* IP Eingabe (nur Sensor Mode) */}
        {!isSimulating && (
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase">ESP32 IP-Adresse</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.178.XXX"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={testConnection}
                disabled={testing}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} className={testing ? 'animate-spin' : ''}/>
                Test
              </button>
            </div>
          </div>
        )}

        {/* Fehler Anzeige */}
        {lastError && !isSimulating && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0"/>
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-500">Verbindungsfehler</p>
              <p className="text-[10px] text-rose-400 mt-1">{lastError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Metriken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-2">
            <Flame size={14}/> Flame Sensor
          </div>
          <div className={`text-lg font-bold ${liveData.flame ? 'text-orange-500' : 'text-zinc-500'}`}>
            {liveData.flame ? 'DETECTED' : 'Ready'}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-2">
            <Activity size={14}/> Fehler
          </div>
          <div className={`text-2xl font-bold ${errorCount > 5 ? 'text-rose-500' : errorCount > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
            {errorCount}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-2">
            <Clock size={14}/> Uptime
          </div>
          <div className="text-lg font-bold text-purple-400">
            {(() => {
              const uptimeSec = liveData.uptime || 0;
              const hours = Math.floor(uptimeSec / 3600);
              const minutes = Math.floor((uptimeSec % 3600) / 60);
              if (hours > 0) return `${hours}h ${minutes}m`;
              if (minutes > 0) return `${minutes}m`;
              return `${uptimeSec}s`;
            })()}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-2">
            <Zap size={14}/> Status
          </div>
          <div className={`text-sm font-bold ${connected ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* Flame Detection Timeline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Flame Detection Timeline</h3>
          </div>
          <span className="text-xs text-zinc-500">Letzte {Math.min(recentFlameData.length, 60)} Messungen</span>
        </div>

        {/* Timeline Visualization */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 overflow-x-auto">
          {recentFlameData.length > 0 ? (
            <div className="space-y-3">
              {/* Status Bar */}
              <div className="flex items-center gap-1 h-12">
                {recentFlameData.map((point, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-sm transition-colors ${
                      point.inhaling
                        ? 'bg-emerald-500'
                        : point.flame
                          ? 'bg-orange-500/50'
                          : 'bg-zinc-800'
                    }`}
                    title={`${point.inhaling ? 'Inhaling' : point.flame ? 'Flame Detected' : 'No Flame'} - ${new Date(point.time).toLocaleTimeString()}`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span className="text-zinc-400">Inhaling (Session)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500/50 rounded-sm"></div>
                  <span className="text-zinc-400">Flame Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
                  <span className="text-zinc-400">No Flame</span>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Aktueller Status:</span>
                  <div className="flex items-center gap-2">
                    <Flame size={14} className={liveData.flame ? 'text-orange-500' : 'text-zinc-600'}/>
                    <span className={`text-sm font-bold ${liveData.flame ? 'text-orange-400' : 'text-zinc-500'}`}>
                      {liveData.flame ? 'Flamme erkannt' : 'Keine Flamme'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-zinc-600 text-sm">
              Warte auf Daten...
            </div>
          )}
        </div>
      </div>

      {/* Sensor Information */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon size={16} className="text-amber-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">B05 Flame Sensor Info</h3>
        </div>

        {/* Sensor Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Sensor Typ</p>
            <p className="text-sm font-bold text-white">B05 IR Flame</p>
            <p className="text-[10px] text-zinc-600">760-1100nm</p>
          </div>

          <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Detection</p>
            <p className={`text-sm font-bold ${liveData.flame ? 'text-orange-500' : 'text-zinc-500'}`}>
              {liveData.flame ? 'ACTIVE' : 'Standby'}
            </p>
            <p className="text-[10px] text-zinc-600">Digital Signal</p>
          </div>

          <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Cooldown</p>
            <p className="text-sm font-bold text-blue-400">3 Sekunden</p>
            <p className="text-[10px] text-zinc-600">Nach Hit</p>
          </div>

          <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">GPIO Pin</p>
            <p className="text-sm font-bold text-emerald-400">GPIO 1</p>
            <p className="text-[10px] text-zinc-600">Digital Input</p>
          </div>
        </div>

        {/* Wiring Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-300 mb-2">Verkabelung:</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-blue-200 font-mono">
            <div><span className="text-blue-400">VCC</span> → 3.3V</div>
            <div><span className="text-blue-400">GND</span> → GND</div>
            <div><span className="text-blue-400">DO</span> → GPIO 1</div>
          </div>
        </div>

        {/* Hinweis */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <p className="text-[10px] text-amber-300 leading-relaxed">
            <strong>Hinweis:</strong> Der B05 Flame Sensor erkennt IR-Licht (760-1100nm) von Feuerzeug-Flammen.
            Digital Output: LOW = Flamme erkannt, HIGH = keine Flamme. Der ESP32 verwaltet die komplette Logik
            inklusive Session-Erkennung und 3-Sekunden Cooldown.
          </p>
        </div>
      </div>

      {/* Sensor Kalibrierung */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon size={16} className="text-purple-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Sensor Kalibrierung</h3>
        </div>

        {/* Live Flame Status mit Visualisierung */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500 font-bold uppercase">Live Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${liveData.flame ? 'bg-orange-500 animate-pulse' : 'bg-zinc-700'}`}></div>
              <span className={`text-sm font-bold ${liveData.flame ? 'text-orange-400' : 'text-zinc-500'}`}>
                {liveData.flame ? 'FLAMME ERKANNT' : 'Bereit'}
              </span>
            </div>
          </div>

          {/* Test-Hinweis */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-[10px] text-blue-300 leading-relaxed">
              <strong>Test-Modus:</strong> Halte ein Feuerzeug vor den Sensor (ca. 10-20cm Abstand).
              Die Anzeige oben sollte "FLAMME ERKANNT" zeigen. Falls nicht → Potentiometer justieren.
            </p>
          </div>
        </div>

        {/* Potentiometer Kalibrierung Anleitung */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3">
          <p className="text-xs font-bold text-purple-300 uppercase">Hardware-Kalibrierung (Potentiometer)</p>

          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <p>Potentiometer am B05 Sensor finden (blaues Rädchen)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <p>Feuerzeug anzünden, 10-15cm vor Sensor halten</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <p>Potentiometer drehen bis LED am Sensor aufleuchtet</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <p>Feuerzeug wegnehmen → LED sollte ausgehen</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <p>Mehrmals testen um Konsistenz sicherzustellen</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            <p className="text-[10px] text-amber-300">
              <strong>Wichtig:</strong> Zu empfindlich → Viele Fehlauslösungen.
              Zu unempfindlich → Flamme wird nicht erkannt.
            </p>
          </div>
        </div>

        {/* False Trigger Prevention Einstellungen - **NEU v8.1**: Editierbar */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-emerald-300 uppercase">False Trigger Prevention (v8.1)</p>
            {!editingTrigger ? (
              <button
                onClick={() => setEditingTrigger(true)}
                disabled={isSimulating}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs transition-colors"
              >
                <Edit3 size={12} />
                Bearbeiten
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTrigger(false);
                    setMinDuration(liveData.minSessionDuration || DEFAULT_MIN_SESSION_DURATION_MS);
                    setMaxDuration(liveData.maxSessionDuration || DEFAULT_MAX_SESSION_DURATION_MS);
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
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            )}
          </div>

          {!editingTrigger ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">Min. Dauer</p>
                <p className="text-lg font-bold text-emerald-400">{(minDuration / 1000).toFixed(1)}s</p>
                <p className="text-[9px] text-zinc-600">Mindest-Session</p>
              </div>

              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
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
                <p className="text-[9px] text-zinc-600">Zu kurze Sessions → Fehlauslösungen (Flackern)</p>
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
                <p className="text-[9px] text-zinc-600">Zu lange Sessions → Sensor hängt fest</p>
              </div>

              {/* Validation Warning */}
              {minDuration >= maxDuration && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                  <p className="text-[10px] text-rose-400">
                    <strong>Warnung:</strong> Min. Dauer muss kleiner als Max. Dauer sein!
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
            <p className="text-[10px] text-emerald-300 leading-relaxed">
              Sessions außerhalb {(minDuration / 1000).toFixed(1)}-{(maxDuration / 1000).toFixed(1)}s werden als Fehlauslösungen verworfen.
              Zu kurz → Flackern, Zu lang → Sensor hängt fest.
            </p>
          </div>
        </div>
      </div>

      {/* Stromverbrauch */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Stromverbrauch (geschätzt)</h3>
        </div>

        {(() => {
          // ESP32-C3: ~160mA @ 3.3V = 0.53W (aktiv mit WiFi)
          // OLED Display: ~20mA @ 3.3V = 0.066W
          // B05 Flame Sensor: ~1.5mA @ 3.3V = 0.005W
          // Gesamt aktiv: ~0.6W (~180mA @ 3.3V)
          const powerActiveW = 0.6; // Watt bei aktiver Verbindung
          const powerIdleW = 0.05; // Watt bei getrennter Verbindung (nur Sensor)
          const currentPowerW = connected ? powerActiveW : powerIdleW;
          const currentMa = connected ? 180 : 15;

          // Kosten berechnen
          const powerPerDay = currentPowerW * 24; // Wh pro Tag
          const powerPerYear = powerPerDay * 365 / 1000; // kWh pro Jahr
          const strompreis = 0.35; // €/kWh (typischer deutscher Preis)
          const costsPerYear = powerPerYear * strompreis;

          return (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <p className="text-[10px] text-zinc-600 uppercase mb-1">Aktuell</p>
                  <p className="text-lg font-bold text-yellow-400">{currentMa}mA</p>
                  <p className="text-[9px] text-zinc-600">{currentPowerW.toFixed(2)}W</p>
                </div>

                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <p className="text-[10px] text-zinc-600 uppercase mb-1">Pro Tag</p>
                  <p className="text-lg font-bold text-amber-400">{powerPerDay.toFixed(1)}</p>
                  <p className="text-[9px] text-zinc-600">Wh</p>
                </div>

                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <p className="text-[10px] text-zinc-600 uppercase mb-1">Pro Jahr</p>
                  <p className="text-lg font-bold text-emerald-400">{powerPerYear.toFixed(2)}</p>
                  <p className="text-[9px] text-zinc-600">kWh</p>
                </div>

                <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  <p className="text-[10px] text-zinc-600 uppercase mb-1">Kosten/Jahr</p>
                  <p className="text-lg font-bold text-rose-400">{costsPerYear.toFixed(2)}€</p>
                  <p className="text-[9px] text-zinc-600">@ 0.35€/kWh</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`rounded-xl p-3 border ${connected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-800/50 border-zinc-700'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                  <p className="text-xs text-zinc-400">
                    {connected ? 'Aktiver Betrieb (WiFi + Display + Sensor)' : 'Stand-by Modus (nur Sensor)'}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-[10px] text-blue-300 leading-relaxed">
                  <strong>Info:</strong> Schätzung basiert auf ESP32-C3 (160mA), OLED Display (20mA) und B05 Flame Sensor (1.5mA).
                  Tatsächlicher Verbrauch kann je nach Konfiguration variieren.
                </p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Connection Log */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Connection Log</h3>
          </div>
          <span className="text-xs text-zinc-500">{connectionLog.length} Einträge</span>
        </div>

        <div className="bg-zinc-950 rounded-xl border border-zinc-800 max-h-64 overflow-y-auto">
          {connectionLog.length === 0 ? (
            <div className="p-4 text-center text-zinc-600 text-xs">Keine Log-Einträge</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {connectionLog.map((log, i) => (
                <div key={i} className="px-4 py-2 flex items-start gap-3 hover:bg-zinc-900/50">
                  {log.type === 'success' ? (
                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0"/>
                  ) : (
                    <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0"/>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${log.type === 'success' ? 'text-emerald-400' : 'text-rose-400'} truncate`}>
                      {log.message}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ESP32DebugView);
