import React, { useState, memo, useEffect } from 'react';
import { Wifi, WifiOff, Smartphone, RefreshCw, AlertCircle, CheckCircle, Radio, Activity, Clock, Flame, TrendingUp, Zap, Settings as SettingsIcon, Edit3, Save, X } from 'lucide-react';
import { MIN_SESSION_DURATION_MS, MAX_SESSION_DURATION_MS, DEFAULT_MIN_SESSION_DURATION_MS, DEFAULT_MAX_SESSION_DURATION_MS, MIN_DURATION_SLIDER_MAX, MAX_DURATION_SLIDER_MIN } from '../config/sessionDuration';
import { LiveData, ConnectionLogEntry, FlameHistoryEntry } from '../hooks/useESP32Polling.ts';
import { Settings } from '../hooks/useHitManagement.ts';

interface ESP32DebugViewProps {
  ip: string;
  setIp: (ip: string) => void;
  connected: boolean;
  isSimulating: boolean;
  setIsSimulating: (isSimulating: boolean) => void;
  lastError: string | null;
  connectionLog: ConnectionLogEntry[];
  flameHistory: FlameHistoryEntry[];
  liveData: LiveData;
  errorCount: number;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  forceSyncPendingHits: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

function ESP32DebugView({
  ip,
  setIp,
  connected,
  isSimulating,
  setIsSimulating,
  lastError,
  connectionLog,
  flameHistory,
  liveData,
  errorCount,
  settings,
  setSettings,
  forceSyncPendingHits,
  isSyncing,
  lastSyncTime
}: ESP32DebugViewProps) {
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
    if (!connected) return { label: 'Getrennt', color: 'var(--text-tertiary)', bars: 0 };
    if (errorCount > 5) return { label: 'Schlecht', color: 'var(--accent-error)', bars: 1 };
    if (errorCount > 2) return { label: 'Mittel', color: 'var(--accent-warning)', bars: 2 };
    return { label: 'Gut', color: 'var(--accent-success)', bars: 3 };
  };

  const quality = getConnectionQuality();

  // Flame Detection Timeline
  const recentFlameData = flameHistory.slice(-60); // Letzte 60 Datenpunkte (~2 Minuten bei 2s Polling)

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Radio size={24} style={{ color: 'var(--accent-primary)' }} />
        ESP32 Diagnose
      </h2>

      {/* Verbindungsstatus */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connected ? (
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)' }}
              >
                <Wifi size={24} style={{ color: 'var(--accent-success)' }} />
              </div>
            ) : (
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <WifiOff size={24} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            )}
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {connected ? 'Verbunden' : 'Getrennt'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {isSimulating ? 'Demo Modus' : `ESP32 @ ${ip}`}
              </p>
            </div>
          </div>

          {/* Signal Bars */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3].map(bar => (
                <div
                  key={bar}
                  className="w-1 rounded-sm"
                  style={{
                    height: `${bar * 6}px`,
                    backgroundColor: bar <= quality.bars ? quality.color : 'var(--bg-tertiary)',
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-bold" style={{ color: quality.color }}>
              {quality.label}
            </span>
          </div>
        </div>

        {/* Modus Toggle */}
        <div
          className="flex items-center justify-between p-3 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-2">
            <Smartphone
              size={16}
              style={{ color: isSimulating ? 'var(--accent-info)' : 'var(--accent-success)' }}
            />
            <div>
              <span className="font-medium text-sm block" style={{ color: 'var(--text-primary)' }}>
                {isSimulating ? "Demo Modus" : "Sensor Modus"}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {isSimulating ? "Simulierte Daten" : "Live ESP32 Daten"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              backgroundColor: isSimulating ? 'var(--accent-info)' : 'var(--accent-success)',
            }}
          >
            <div
              className={`w-4 h-4 rounded-full absolute top-1 transition-all ${isSimulating ? 'left-1' : 'left-7'}`}
              style={{ backgroundColor: 'white' }}
            />
          </button>
        </div>

        {/* IP Eingabe (nur Sensor Mode) */}
        {!isSimulating && (
          <div className="space-y-2">
            <label className="text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>ESP32 IP-Adresse</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.178.XXX"
                className="flex-1 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={testConnection}
                disabled={testing}
                className="px-4 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: testing ? 'var(--bg-tertiary)' : 'var(--accent-success)',
                  color: testing ? 'var(--text-tertiary)' : 'white',
                }}
              >
                <RefreshCw size={16} className={testing ? 'animate-spin' : ''}/>
                Test
              </button>
              <button
                onClick={forceSyncPendingHits}
                disabled={isSyncing || !connected}
                className="px-4 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: (isSyncing || !connected) ? 'var(--bg-tertiary)' : 'var(--accent-info)',
                  color: (isSyncing || !connected) ? 'var(--text-tertiary)' : 'white',
                }}
                title="Offline-Hits vom ESP32 synchronisieren"
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''}/>
                Sync
              </button>
            </div>
            {lastSyncTime && (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Letzter Sync: {new Date(lastSyncTime).toLocaleTimeString('de-DE')}
              </p>
            )}
          </div>
        )}

        {/* Fehler Anzeige */}
        {lastError && !isSimulating && (
          <div
            className="rounded-xl p-3 flex items-start gap-2 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-error) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-error) 20%, transparent)',
            }}
          >
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-error)' }} />
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: 'var(--accent-error)' }}>Verbindungsfehler</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--accent-error)', opacity: 0.8 }}>{lastError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Metriken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            <Flame size={14}/> Flame Sensor
          </div>
          <div className="text-lg font-bold" style={{ color: liveData.flame ? 'var(--accent-warning)' : 'var(--text-tertiary)' }}>
            {liveData.flame ? 'DETECTED' : 'Ready'}
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            <Activity size={14}/> Fehler
          </div>
          <div
            className="text-2xl font-bold"
            style={{
              color: errorCount > 5 ? 'var(--accent-error)' : errorCount > 0 ? 'var(--accent-warning)' : 'var(--accent-success)',
            }}
          >
            {errorCount}
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            <Clock size={14}/> Uptime
          </div>
          <div className="text-lg font-bold" style={{ color: 'var(--accent-secondary)' }}>
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

        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            <Zap size={14}/> Status
          </div>
          <div className="text-sm font-bold" style={{ color: connected ? 'var(--accent-success)' : 'var(--text-tertiary)' }}>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* Flame Detection Timeline */}
      <div
        className="rounded-2xl p-6 space-y-4 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} style={{ color: 'var(--accent-warning)' }} />
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Flame Detection Timeline</h3>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Letzte {Math.min(recentFlameData.length, 60)} Messungen</span>
        </div>

        {/* Timeline Visualization */}
        <div
          className="rounded-xl p-4 border overflow-x-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {recentFlameData.length > 0 ? (
            <div className="space-y-3">
              {/* Status Bar */}
              <div className="flex items-center gap-1 h-12">
                {recentFlameData.map((point, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full rounded-sm transition-colors"
                    style={{
                      backgroundColor: point.inhaling
                        ? 'var(--accent-success)'
                        : point.flame
                          ? 'color-mix(in srgb, var(--accent-warning) 50%, transparent)'
                          : 'var(--bg-tertiary)',
                    }}
                    title={`${point.inhaling ? 'Inhaling' : point.flame ? 'Flame Detected' : 'No Flame'} - ${new Date(point.time).toLocaleTimeString()}`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--accent-success)' }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>Inhaling (Session)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent-warning) 50%, transparent)' }}
                  ></div>
                  <span style={{ color: 'var(--text-secondary)' }}>Flame Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>No Flame</span>
                </div>
              </div>

              {/* Current Status */}
              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Aktueller Status:</span>
                  <div className="flex items-center gap-2">
                    <Flame size={14} style={{ color: liveData.flame ? 'var(--accent-warning)' : 'var(--text-disabled)' }} />
                    <span className="text-sm font-bold" style={{ color: liveData.flame ? 'var(--accent-warning)' : 'var(--text-tertiary)' }}>
                      {liveData.flame ? 'Flamme erkannt' : 'Keine Flamme'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm" style={{ color: 'var(--text-disabled)' }}>
              Warte auf Daten...
            </div>
          )}
        </div>
      </div>

      {/* Sensor Information */}
      <div
        className="rounded-2xl p-6 space-y-4 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2">
          <SettingsIcon size={16} style={{ color: 'var(--accent-warning)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>B05 Flame Sensor Info</h3>
        </div>

        {/* Sensor Status */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Sensor Typ</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>B05 IR Flame</p>
            <p className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>760-1100nm</p>
          </div>

          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Detection</p>
            <p className="text-sm font-bold" style={{ color: liveData.flame ? 'var(--accent-warning)' : 'var(--text-tertiary)' }}>
              {liveData.flame ? 'ACTIVE' : 'Standby'}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>Digital Signal</p>
          </div>

          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Cooldown</p>
            <p className="text-sm font-bold" style={{ color: 'var(--accent-info)' }}>3 Sekunden</p>
            <p className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>Nach Hit</p>
          </div>

          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>GPIO Pin</p>
            <p className="text-sm font-bold" style={{ color: 'var(--accent-success)' }}>GPIO 1</p>
            <p className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>Digital Input</p>
          </div>
        </div>

        {/* Wiring Info */}
        <div
          className="rounded-xl p-3 border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)',
          }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--accent-info)' }}>Verkabelung:</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono" style={{ color: 'color-mix(in srgb, var(--accent-info) 80%, white)' }}>
            <div><span style={{ color: 'var(--accent-info)' }}>VCC</span> → 3.3V</div>
            <div><span style={{ color: 'var(--accent-info)' }}>GND</span> → GND</div>
            <div><span style={{ color: 'var(--accent-info)' }}>DO</span> → GPIO 1</div>
          </div>
        </div>

        {/* Hinweis */}
        <div
          className="rounded-xl p-3 border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
          }}
        >
          <p className="text-[10px] leading-relaxed" style={{ color: 'color-mix(in srgb, var(--accent-warning) 90%, white)' }}>
            <strong>Hinweis:</strong> Der B05 Flame Sensor erkennt IR-Licht (760-1100nm) von Feuerzeug-Flammen.
            Digital Output: LOW = Flamme erkannt, HIGH = keine Flamme. Der ESP32 verwaltet die komplette Logik
            inklusive Session-Erkennung und 3-Sekunden Cooldown.
          </p>
        </div>
      </div>

      {/* Sensor Kalibrierung */}
      <div
        className="rounded-2xl p-6 space-y-4 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2">
          <SettingsIcon size={16} style={{ color: 'var(--accent-secondary)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Sensor Kalibrierung</h3>
        </div>

        {/* Live Flame Status mit Visualisierung */}
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Live Status</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${liveData.flame ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: liveData.flame ? 'var(--accent-warning)' : 'var(--bg-tertiary)' }}
              ></div>
              <span className="text-sm font-bold" style={{ color: liveData.flame ? 'var(--accent-warning)' : 'var(--text-tertiary)' }}>
                {liveData.flame ? 'FLAMME ERKANNT' : 'Bereit'}
              </span>
            </div>
          </div>

          {/* Test-Hinweis */}
          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)',
            }}
          >
            <p className="text-[10px] leading-relaxed" style={{ color: 'color-mix(in srgb, var(--accent-info) 90%, white)' }}>
              <strong>Test-Modus:</strong> Halte ein Feuerzeug vor den Sensor (ca. 10-20cm Abstand).
              Die Anzeige oben sollte "FLAMME ERKANNT" zeigen. Falls nicht → Potentiometer justieren.
            </p>
          </div>
        </div>

        {/* Potentiometer Kalibrierung Anleitung */}
        <div
          className="rounded-xl p-4 border space-y-3"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--accent-secondary)' }}>Hardware-Kalibrierung (Potentiometer)</p>

          <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>1.</span>
              <p>Potentiometer am B05 Sensor finden (blaues Rädchen)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>2.</span>
              <p>Feuerzeug anzünden, 10-15cm vor Sensor halten</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>3.</span>
              <p>Potentiometer drehen bis LED am Sensor aufleuchtet</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>4.</span>
              <p>Feuerzeug wegnehmen → LED sollte ausgehen</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>5.</span>
              <p>Mehrmals testen um Konsistenz sicherzustellen</p>
            </div>
          </div>

          <div
            className="rounded-lg p-2 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
            }}
          >
            <p className="text-[10px]" style={{ color: 'color-mix(in srgb, var(--accent-warning) 90%, white)' }}>
              <strong>Wichtig:</strong> Zu empfindlich → Viele Fehlauslösungen.
              Zu unempfindlich → Flamme wird nicht erkannt.
            </p>
          </div>
        </div>

        {/* False Trigger Prevention Einstellungen - **NEU v8.1**: Editierbar */}
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--accent-success)' }}>False Trigger Prevention (v8.1)</p>
            {!editingTrigger ? (
              <button
                onClick={() => setEditingTrigger(true)}
                disabled={isSimulating}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
                style={{
                  backgroundColor: isSimulating ? 'var(--bg-tertiary)' : 'var(--accent-info)',
                  color: isSimulating ? 'var(--text-tertiary)' : 'white',
                }}
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
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
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
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: (saving || minDuration >= maxDuration || minDuration < MIN_SESSION_DURATION_MS || minDuration > MAX_SESSION_DURATION_MS || maxDuration < MIN_SESSION_DURATION_MS || maxDuration > MAX_SESSION_DURATION_MS) ? 'var(--bg-tertiary)' : 'var(--accent-success)',
                    color: (saving || minDuration >= maxDuration || minDuration < MIN_SESSION_DURATION_MS || minDuration > MAX_SESSION_DURATION_MS || maxDuration < MIN_SESSION_DURATION_MS || maxDuration > MAX_SESSION_DURATION_MS) ? 'var(--text-tertiary)' : 'white',
                  }}
                >
                  <Save size={12} />
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            )}
          </div>

          {!editingTrigger ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-disabled)' }}>Min. Dauer</p>
                <p className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>{(minDuration / 1000).toFixed(1)}s</p>
                <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>Mindest-Session</p>
              </div>

              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-disabled)' }}>Max. Dauer</p>
                <p className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>{(maxDuration / 1000).toFixed(1)}s</p>
                <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>Maximum-Session</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Min Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Min. Dauer (ms)</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent-success)' }}>{minDuration}ms ({(minDuration / 1000).toFixed(2)}s)</span>
                </div>
                <input
                  type="range"
                  min={MIN_SESSION_DURATION_MS}
                  max={MIN_DURATION_SLIDER_MAX}
                  step="50"
                  value={minDuration}
                  onChange={(e) => setMinDuration(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    accentColor: 'var(--accent-success)',
                  }}
                />
                <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>Zu kurze Sessions → Fehlauslösungen (Flackern)</p>
              </div>

              {/* Max Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max. Dauer (ms)</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent-warning)' }}>{maxDuration}ms ({(maxDuration / 1000).toFixed(2)}s)</span>
                </div>
                <input
                  type="range"
                  min={MAX_DURATION_SLIDER_MIN}
                  max={MAX_SESSION_DURATION_MS}
                  step="100"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    accentColor: 'var(--accent-warning)',
                  }}
                />
                <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>Zu lange Sessions → Sensor hängt fest</p>
              </div>

              {/* Validation Warning */}
              {minDuration >= maxDuration && (
                <div
                  className="rounded-lg p-2 border"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent-error) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--accent-error) 20%, transparent)',
                  }}
                >
                  <p className="text-[10px]" style={{ color: 'var(--accent-error)' }}>
                    <strong>Warnung:</strong> Min. Dauer muss kleiner als Max. Dauer sein!
                  </p>
                </div>
              )}
            </div>
          )}

          <div
            className="mt-3 rounded-lg p-2 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
            }}
          >
            <p className="text-[10px] leading-relaxed" style={{ color: 'color-mix(in srgb, var(--accent-success) 90%, white)' }}>
              Sessions außerhalb {(minDuration / 1000).toFixed(1)}-{(maxDuration / 1000).toFixed(1)}s werden als Fehlauslösungen verworfen.
              Zu kurz → Flackern, Zu lang → Sensor hängt fest.
            </p>
          </div>
        </div>
      </div>

      {/* Stromverbrauch */}
      <div
        className="rounded-2xl p-6 space-y-4 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: 'var(--accent-warning)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Stromverbrauch (geschätzt)</h3>
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
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-disabled)' }}>Aktuell</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>{currentMa}mA</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>{currentPowerW.toFixed(2)}W</p>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-disabled)' }}>Pro Tag</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>{powerPerDay.toFixed(1)}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>Wh</p>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-disabled)' }}>Pro Jahr</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>{powerPerYear.toFixed(2)}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>kWh</p>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-disabled)' }}>Kosten/Jahr</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent-error)' }}>{costsPerYear.toFixed(2)}€</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>@ 0.35€/kWh</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div
                className="rounded-xl p-3 border"
                style={{
                  backgroundColor: connected
                    ? 'color-mix(in srgb, var(--accent-success) 10%, transparent)'
                    : 'color-mix(in srgb, var(--bg-tertiary) 50%, transparent)',
                  borderColor: connected
                    ? 'color-mix(in srgb, var(--accent-success) 20%, transparent)'
                    : 'var(--border-primary)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${connected ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: connected ? 'var(--accent-success)' : 'var(--text-disabled)' }}
                  ></div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {connected ? 'Aktiver Betrieb (WiFi + Display + Sensor)' : 'Stand-by Modus (nur Sensor)'}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div
                className="rounded-xl p-3 border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)',
                }}
              >
                <p className="text-[10px] leading-relaxed" style={{ color: 'color-mix(in srgb, var(--accent-info) 90%, white)' }}>
                  <strong>Info:</strong> Schätzung basiert auf ESP32-C3 (160mA), OLED Display (20mA) und B05 Flame Sensor (1.5mA).
                  Tatsächlicher Verbrauch kann je nach Konfiguration variieren.
                </p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Connection Log */}
      <div
        className="rounded-2xl p-6 space-y-4 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: 'var(--accent-info)' }} />
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Connection Log</h3>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{connectionLog.length} Einträge</span>
        </div>

        <div
          className="rounded-xl border max-h-64 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {connectionLog.length === 0 ? (
            <div className="p-4 text-center text-xs" style={{ color: 'var(--text-disabled)' }}>Keine Log-Einträge</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {connectionLog.map((log, i) => (
                <div
                  key={i}
                  className="px-4 py-2 flex items-start gap-3 transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {log.type === 'success' ? (
                    <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-error)' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: log.type === 'success' ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                      {log.message}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-disabled)' }}>{log.timestamp}</p>
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
