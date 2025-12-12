import React, { useState, useRef } from 'react';
import { Settings, Shield, Tag, Coins, Zap, Edit2, Trash2, Check, Plus, X, Download, Upload, Target, AlertCircle, Database, Trash, Wifi, WifiOff, Radio, Smartphone, RefreshCw } from 'lucide-react';
import { generateTestData, mergeTestData, removeTestData } from '../utils/testDataGenerator';

export default function SettingsView({ settings, setSettings, liveTemp, historyData, setHistoryData, sessionHits, setSessionHits, achievements, setAchievements, goals, setGoals, ip, setIp, connected, isSimulating, setIsSimulating, lastError }) {
  const [form, setForm] = useState({ name: '', price: '10', thc: '15' });
  const [editId, setEditId] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [testDataStatus, setTestDataStatus] = useState(null);
  const fileInputRef = useRef(null);

  const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  
  const save = () => {
    if(!form.name) return;
    if(navigator.vibrate) navigator.vibrate(50);
    setSettings(p => {
        const strain = { id: editId || Date.now(), name: form.name, price: parseFloat(form.price), thc: parseFloat(form.thc) };
        return { ...p, strains: editId ? p.strains.map(s => s.id === editId ? strain : s) : [...p.strains, strain] };
    });
    setForm({ name: '', price: '10', thc: '15' }); setEditId(null);
  };
  
  const edit = (s) => { if(navigator.vibrate) navigator.vibrate(20); setForm({ name: s.name, price: s.price, thc: s.thc }); setEditId(s.id); };
  const del = (id) => { if(navigator.vibrate) navigator.vibrate(20); setSettings(p => ({ ...p, strains: p.strains.filter(s => s.id !== id) })); if(editId===id) { setEditId(null); setForm({name:'',price:'10',thc:'15'}); } };

  // Export/Import Funktionen
  const exportData = () => {
    try {
      const exportObj = {
        version: '6.1',
        exportDate: new Date().toISOString(),
        settings,
        historyData,
        sessionHits,
        achievements,
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
          setAchievements(data.achievements || []);
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

  // Testdaten-Funktionen
  const addTestData = (days = 30) => {
    try {
      const testData = generateTestData(days, settings);
      const merged = mergeTestData(
        { sessionHits, historyData },
        testData
      );

      setSessionHits(merged.sessionHits);
      setHistoryData(merged.historyData);

      setTestDataStatus({ type: 'success', msg: `${days} Tage Testdaten hinzugefügt!` });
      setTimeout(() => setTestDataStatus(null), 3000);
    } catch (e) {
      setTestDataStatus({ type: 'error', msg: 'Fehler beim Generieren: ' + e.message });
      setTimeout(() => setTestDataStatus(null), 3000);
    }
  };

  const clearTestData = () => {
    if (!window.confirm('Alle Testdaten (IDs mit "test_") wirklich löschen?')) return;

    try {
      const cleaned = removeTestData(sessionHits, historyData);
      setSessionHits(cleaned.sessionHits);
      setHistoryData(cleaned.historyData);

      setTestDataStatus({ type: 'success', msg: 'Testdaten entfernt!' });
      setTimeout(() => setTestDataStatus(null), 3000);
    } catch (e) {
      setTestDataStatus({ type: 'error', msg: 'Fehler beim Löschen: ' + e.message });
      setTimeout(() => setTestDataStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Einstellungen</h2>
      
      {/* BASIS BERECHNUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
         <h3 className="text-sm font-bold text-zinc-400 uppercase">Basis Berechnung</h3>
         <div className="space-y-4">
            <div className="flex justify-between text-xs"><span>Kopfgröße</span><span className="text-emerald-400 font-bold">{settings.bowlSize}g</span></div>
            <input type="range" min="0.1" max="1.5" step="0.05" value={settings.bowlSize} onChange={e => upd('bowlSize', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-emerald-500"/>
            <div className="flex justify-between text-xs"><span>Weed Anteil</span><span className="text-lime-400 font-bold">{settings.weedRatio}%</span></div>
            <input type="range" min="0" max="100" step="5" value={settings.weedRatio} onChange={e => upd('weedRatio', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-lime-500"/>
         </div>
         <div className="w-full h-px bg-zinc-800"></div>
         <div className="flex items-center justify-between pt-2">
           <div>
             <label className="flex items-center gap-2 text-white font-medium"><Shield size={20} className={settings.adminMode ? "text-rose-500" : "text-zinc-500"} />Admin Modus</label>
             <p className="text-xs text-zinc-500 mt-1 pl-7">Zeigt Diagnose-Daten im Dashboard.</p>
           </div>
           <button onClick={() => upd('adminMode', !settings.adminMode)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.adminMode ? 'bg-rose-500' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.adminMode ? 'left-7' : 'left-1'}`}></div>
           </button>
         </div>
      </div>

      {/* KALIBRIERUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Settings size={14}/> Kalibrierung</h3>
         <div className="h-10 bg-zinc-950 rounded relative flex items-center px-2 border border-zinc-800 overflow-hidden">
             <div className="absolute inset-y-0 left-0 bg-emerald-500/20 transition-all" style={{width:`${Math.min(100, liveTemp)}%`}}/>
             <div className="absolute inset-y-0 w-0.5 bg-rose-500 z-10" style={{left:`${settings.triggerThreshold}%`}}/>
             <span className="relative z-20 text-xs font-mono font-bold text-white">{liveTemp.toFixed(1)}°C</span>
             <span className="absolute right-2 text-[10px] text-zinc-500">Trigger: {settings.triggerThreshold}°C</span>
         </div>
         <input type="range" min="20" max="100" value={settings.triggerThreshold} onChange={e => upd('triggerThreshold', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-rose-500"/>
      </div>

      {/* ESP32 VERBINDUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               {connected ? <Wifi size={16} className="text-emerald-500"/> : <WifiOff size={16} className="text-zinc-500"/>}
               <h3 className="text-sm font-bold text-zinc-400 uppercase">ESP32 Verbindung</h3>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}/>
               <span className="text-xs text-zinc-500">{connected ? 'Verbunden' : 'Getrennt'}</span>
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

         {/* IP Konfiguration (nur im Sensor Modus) */}
         {!isSimulating && (
            <>
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
                        onClick={() => {
                           if (navigator.vibrate) navigator.vibrate(20);
                           // Connection test - wird automatisch durch polling getestet
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 rounded-lg transition-colors"
                     >
                        <RefreshCw size={16} className="text-zinc-400"/>
                     </button>
                  </div>
                  <p className="text-[10px] text-zinc-600">
                     Format: 192.168.x.x (ohne http://)
                  </p>
               </div>

               {/* Status/Error Anzeige */}
               {lastError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
                     <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0"/>
                     <div className="flex-1">
                        <p className="text-xs font-bold text-rose-500">Verbindungsfehler</p>
                        <p className="text-[10px] text-rose-400 mt-1">{lastError}</p>
                     </div>
                  </div>
               )}

               {connected && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
                     <Wifi size={14} className="text-emerald-500 mt-0.5"/>
                     <div>
                        <p className="text-xs font-bold text-emerald-500">Verbunden mit ESP32</p>
                        <p className="text-[10px] text-emerald-400 mt-1 font-mono">http://{ip}/api/data</p>
                     </div>
                  </div>
               )}

               {/* Hinweis für WiFi-Setup */}
               <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                     <Radio size={12} className="text-blue-400"/>
                     <span className="text-xs font-bold text-blue-400 uppercase">Ersteinrichtung ESP32</span>
                  </div>
                  <p className="text-[10px] text-blue-300 leading-relaxed">
                     <strong>1.</strong> ESP32 einschalten<br/>
                     <strong>2.</strong> Mit WiFi "HighScore-Setup" verbinden<br/>
                     <strong>3.</strong> Browser öffnet sich automatisch (oder http://192.168.4.1)<br/>
                     <strong>4.</strong> Dein WLAN auswählen und Passwort eingeben<br/>
                     <strong>5.</strong> ESP32 zeigt die IP-Adresse im Display<br/>
                     <strong>6.</strong> IP hier eingeben und Demo Modus ausschalten
                  </p>
               </div>
            </>
         )}
      </div>

      {/* SORTEN VERWALTUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Tag size={16}/> Sorten</h3>
         <div className="space-y-2 max-h-48 overflow-y-auto">
           {settings.strains.map(s => (
             <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${editId === s.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-950 border-zinc-800'}`}>
                <div><span className="font-bold text-white block text-sm">{s.name}</span><span className="text-[10px] text-zinc-500">{s.price}€/g • {s.thc}% THC</span></div>
                <div className="flex gap-2">
                   <button onClick={() => edit(s)} className={`p-2 rounded hover:bg-zinc-800 ${editId === s.id ? 'text-amber-500' : 'text-zinc-600'}`}><Edit2 size={14}/></button>
                   {settings.strains.length > 1 && <button onClick={() => del(s.id)} className="p-2 rounded hover:bg-rose-900/30 text-zinc-600 hover:text-rose-500"><Trash2 size={14}/></button>}
                </div>
             </div>
           ))}
         </div>
         <div className="flex gap-2 items-end bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
            <div className="flex-1 space-y-1"><label className="text-[9px] text-zinc-500 uppercase">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"/></div>
            <div className="w-16 space-y-1"><label className="text-[9px] text-zinc-500 uppercase">€ / g</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"/></div>
            <div className="w-12 space-y-1"><label className="text-[9px] text-zinc-500 uppercase">THC</label><input type="number" value={form.thc} onChange={e => setForm({...form, thc: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"/></div>
            <button onClick={save} className={`p-2 rounded h-8 w-8 flex items-center justify-center text-white transition-colors ${editId ? 'bg-amber-600' : 'bg-emerald-600'}`}>{editId ? <Check size={14}/> : <Plus size={14}/>}</button>
            {editId && <button onClick={() => { setEditId(null); setForm({name:'',price:'10',thc:'15'}); }} className="bg-zinc-700 p-2 rounded h-8 w-8 flex items-center justify-center text-zinc-400"><X size={14}/></button>}
         </div>
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

      {/* TESTDATEN */}
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
                <Plus size={16} />
                7 Tage
              </button>
              <button
                onClick={() => addTestData(30)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                30 Tage
              </button>
              <button
                onClick={() => addTestData(90)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus size={16} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}