import React, { useState, memo } from 'react';
import { Wifi, WifiOff, Smartphone, RefreshCw, AlertCircle, CheckCircle, Radio, Activity, Clock, Thermometer, TrendingUp, Zap } from 'lucide-react';

function ESP32DebugView({ ip, setIp, connected, isSimulating, setIsSimulating, lastError, connectionLog, tempHistory, liveData, errorCount }) {
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    if (navigator.vibrate) navigator.vibrate(20);
    // Test wird automatisch durch polling durchgeführt
    setTimeout(() => setTesting(false), 2000);
  };

  // Verbindungsqualität berechnen
  const getConnectionQuality = () => {
    if (!connected) return { label: 'Getrennt', color: 'text-zinc-500', bars: 0 };
    if (errorCount > 5) return { label: 'Schlecht', color: 'text-red-500', bars: 1 };
    if (errorCount > 2) return { label: 'Mittel', color: 'text-amber-500', bars: 2 };
    return { label: 'Gut', color: 'text-emerald-500', bars: 3 };
  };

  const quality = getConnectionQuality();

  // Chart Dimension
  const chartWidth = 300;
  const chartHeight = 120;
  const maxTemp = 100;

  // Temperatur-Chart Daten
  const chartPoints = tempHistory.slice(-60).map((point, i, arr) => {
    const x = (i / (arr.length - 1)) * chartWidth;
    const y = chartHeight - (point.temp / maxTemp) * chartHeight;
    return { x, y, temp: point.temp };
  });

  const pathD = chartPoints.length > 1
    ? `M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

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
            <Thermometer size={14}/> Temperatur
          </div>
          <div className="text-2xl font-bold text-emerald-400">{liveData.temp.toFixed(1)}°C</div>
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
            <Clock size={14}/> Polling
          </div>
          <div className="text-2xl font-bold text-blue-400">{isSimulating ? '400ms' : '800ms'}</div>
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

      {/* Temperatur-Verlauf */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Temperatur-Verlauf</h3>
          </div>
          <span className="text-xs text-zinc-500">Letzte {Math.min(tempHistory.length, 60)} Messungen</span>
        </div>

        {/* Chart */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 overflow-x-auto">
          {chartPoints.length > 1 ? (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(temp => {
                const y = chartHeight - (temp / maxTemp) * chartHeight;
                return (
                  <g key={temp}>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#27272a" strokeWidth="1"/>
                    <text x="5" y={y - 5} fill="#71717a" fontSize="10">{temp}°C</text>
                  </g>
                );
              })}

              {/* Area under curve */}
              <path
                d={`${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                fill="rgba(16, 185, 129, 0.1)"
              />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {chartPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill="#10b981"
                />
              ))}
            </svg>
          ) : (
            <div className="h-32 flex items-center justify-center text-zinc-600 text-sm">
              Warte auf Daten...
            </div>
          )}
        </div>
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
