import React, { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from 'react';
import {
  Leaf, LayoutDashboard, Calendar as CalendarIcon, BarChart3, Trophy, Settings, Smartphone,
  Wifi, Zap, Wind, Flame, Star, Clock, Activity, Moon, CalendarDays, Shield, Tag, Gem, TrendingUp, Lock,
  Coins, List, Thermometer, Check, Plus, X, Edit2, Trash2, User, Users, Radio, Scale, WifiOff, RefreshCw,
  Save, AlertTriangle, Brain, Bell
} from 'lucide-react';
import AnalyticsView from './components/AnalyticsView';
import StreaksWidget from './components/StreaksWidget';
import SessionDetailsModal from './components/SessionDetailsModal';
import StrainManagementView from './components/StrainManagementView';
import CalendarView from './components/CalendarView';
import ChartsView from './components/ChartsView';
import SettingsView from './components/SettingsView';
import DashboardView from './components/DashboardView';
import AchievementsView from './components/AchievementsView';
import ESP32DebugView from './components/ESP32DebugView';
import { generateTestData } from './utils/testDataGenerator';

// --- KONFIGURATION FÜR PLATTFORMEN ---

// HINWEIS FÜR LOKALEN BUILD:
// Falls du 'npm install @capacitor/core' ausgeführt hast, kannst du den folgenden Import 
// wieder einkommentieren (die zwei // entfernen), um volle TypeScript-Unterstützung zu haben.
// Für die Web-Vorschau lassen wir es auskommentiert.

// import { Capacitor, CapacitorHttp } from '@capacitor/core';

// --- FALLBACK / MOCK ---
// Dieser Block sorgt dafür, dass die App auch ohne den Import nicht abstürzt.
// Auf dem Handy wird 'window.Capacitor' automatisch verfügbar sein.
const NativeCapacitor = (typeof window !== 'undefined' && window.Capacitor) 
  ? window.Capacitor 
  : { isNativePlatform: () => false };

// Native HTTP Helper (versucht CapacitorHttp zu nutzen, falls vorhanden)
const nativeHttp = async (url) => {
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp) {
      return await window.Capacitor.Plugins.CapacitorHttp.get({ url });
  }
  throw new Error("Native HTTP plugin not found");
};


// --- 1. UTILS & DATA ---

const ACHIEVEMENT_DATA = [
  { id: 'first_blood', title: 'Erster Zug', desc: 'Starte deine erste Session.', Icon: Zap },
  { id: 'high_five', title: 'High Five', desc: 'Erreiche 5 Hits an einem Tag.', Icon: Wind },
  { id: 'stoner', title: 'Heavy User', desc: 'Erreiche 10 Hits an einem Tag.', Icon: Flame },
  { id: 'century_club', title: 'Century Club', desc: 'Insgesamt 100 Hits erreicht.', Icon: Star },
  { id: 'rapid_fire', title: 'Schnellfeuer', desc: '2 Hits innerhalb von 5 Minuten.', Icon: Clock },
  { id: 'hattrick', title: 'Hattrick', desc: '3 Hits innerhalb von 15 Minuten.', Icon: Activity },
  { id: 'early_bird', title: 'Early Bird', desc: 'Ein Hit vor 08:00 Uhr morgens.', Icon: CalendarIcon },
  { id: 'night_owl', title: 'Nachteule', desc: 'Ein Hit zwischen 02:00 und 05:00 Uhr.', Icon: Moon },
  { id: '420', title: 'It\'s 4:20!', desc: 'Ein Hit exakt um 16:20 Uhr.', Icon: Leaf },
  { id: 'sunday_driver', title: 'Sonntagsfahrer', desc: 'Ein entspannter Hit am Sonntag.', Icon: CalendarDays },
  { id: 't_break', title: 'T-Break', desc: 'Über 24 Stunden Pause gemacht.', Icon: Shield },
  { id: 'detox_king', title: 'Detox King', desc: 'Über 5 Tage Pause durchgehalten.', Icon: Shield },
  { id: 'connoisseur', title: 'Connoisseur', desc: 'Probiere 3 verschiedene Sorten.', Icon: Tag },
  { id: 'explorer', title: 'Sorten-Entdecker', desc: '5 verschiedene Sorten im Tagebuch.', Icon: Tag },
  { id: 'high_roller', title: 'High Roller', desc: 'Gönn dir eine Sorte > 15€/g.', Icon: Gem },
  { id: 'iron_lung', title: 'Iron Lung', desc: 'Ein Zug länger als 5 Sekunden.', Icon: Trophy },
  { id: 'marathon', title: 'Marathon', desc: '7 Tage in Folge eine Session.', Icon: TrendingUp }
];

// --- 2. HOOKS ---

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- 3. UI COMPONENTS ---

const NavBtn = ({ id, icon, label, active, set }) => (
  <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); set(id); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active===id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-400 hover:bg-zinc-800'}`}>
    {icon} {label}
  </button>
);

const MobNavBtn = ({ id, icon, active, set }) => (
  <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); set(id); }} className={`p-3 rounded-xl transition-all ${active===id ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500'}`}>{icon}</button>
);

const MetricCard = ({ label, val, icon, color }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-24">
     <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">{icon} {label}</div>
     <div className={`text-2xl font-bold font-mono truncate ${color}`}>{val}</div>
  </div>
);

const AdminMetric = ({ label, value, icon, active }) => (
  <div className="p-3 bg-zinc-950 flex flex-col items-center justify-center gap-1 text-center">
    <span className="text-[10px] text-zinc-500 uppercase font-bold">{label}</span>
    <div className={`text-sm font-mono font-bold flex items-center gap-1 justify-center ${active ? 'text-emerald-400' : 'text-zinc-300'}`}>{icon} {value}</div>
  </div>
);

function HoldButton({ onTrigger, lastHit, active, temp }) {
  const [holding, setHolding] = useState(false);
  const [prog, setProg] = useState(0);
  const startRef = useRef(0);
  const reqRef = useRef(0);

  useEffect(() => {
    if (active && !holding) startAnim();
    else if (!active && !holding) { setProg(0); cancelAnimationFrame(reqRef.current); }
  }, [active]);

  const startAnim = () => {
    startRef.current = Date.now();
    const loop = () => {
      const p = Math.min(100, ((Date.now() - startRef.current)/2000)*100);
      setProg(p);
      if (active || holding) reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
  };

  const start = () => { if(navigator.vibrate) navigator.vibrate(30); setHolding(true); startAnim(); };
  const end = () => { 
    setHolding(false); cancelAnimationFrame(reqRef.current); 
    const d = Date.now() - startRef.current; 
    if (d > 200) onTrigger(d); 
    setProg(0); 
  };

  const isAct = holding || active;

  return (
    <div className="py-4 flex justify-center">
      <div className="w-64 h-64 relative flex items-center justify-center">
         <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none filter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <circle cx="128" cy="128" r="124" stroke="currentColor" strokeWidth="8" fill="transparent" 
              className={`text-emerald-500 transition-opacity duration-200 ${isAct ? 'opacity-100' : 'opacity-0'}`} 
              strokeDasharray="779" strokeDashoffset={779 - (779 * prog) / 100} />
         </svg>
         
         <button 
            onMouseDown={start} onMouseUp={end} onMouseLeave={end} 
            onTouchStart={(e)=>{e.preventDefault(); start();}} onTouchEnd={(e)=>{e.preventDefault(); end();}}
            className="w-48 h-48 rounded-full bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-10 relative overflow-hidden"
         >
            <div className={`absolute bottom-0 w-full bg-emerald-500/20 transition-all duration-75 ease-linear`} style={{ height: `${prog}%` }}></div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest z-10">Last Hit</span>
            <div className="text-4xl font-mono font-bold text-white z-10 tabular-nums my-1">{lastHit}</div>
            
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border z-10 transition-colors ${isAct ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800 text-emerald-500 border-zinc-700'}`}>
               <Zap size={12} className={`inline mr-1 ${isAct ? "fill-black" : "fill-emerald-500"}`}/> {isAct ? "Inhaling..." : "Hold / Sensor"}
            </div>
            
            <div className="absolute bottom-6 flex items-center gap-1 text-[10px] text-zinc-600 font-mono z-10">
               <Thermometer size={10}/> {temp.toFixed(1)}°C
            </div>
         </button>
      </div>
    </div>
  );
}

// --- 4. VIEWS (imported from components/) ---

// --- 5. MAIN LOGIC & LAYOUT ---

export default function App() {
  const [settings, setSettings] = useLocalStorage('hs_settings_v6', { bowlSize: 0.3, weedRatio: 80, triggerThreshold: 50, adminMode: false, strains: [{ id: 1, name: "Lemon Haze", price: 10, thc: 22 }] });
  const [historyData, setHistoryData] = useLocalStorage('hs_history_v6', []);
  const [sessionHits, setSessionHits] = useLocalStorage('hs_session_hits_v6', []);
  const [achievements, setAchievements] = useLocalStorage('hs_achievements_v6', []);
  const [goals, setGoals] = useLocalStorage('hs_goals_v6', { dailyLimit: 0, tBreakDays: 0 });
  const [lastActiveDate, setLastActiveDate] = useLocalStorage('hs_last_date', '');
  const [manualOffset, setManualOffset] = useLocalStorage('hs_offset', 0);
  const [lastHitTime, setLastHitTime] = useLocalStorage('hs_last_hit_ts', null);
  const [ip, setIp] = useLocalStorage('hs_device_ip', '192.168.178.XXX');

  // Automatisch Testdaten hinzufügen wenn keine Daten vorhanden
  useEffect(() => {
    if (sessionHits.length === 0 && historyData.length === 0) {
      console.log('🧪 Keine Daten vorhanden - Generiere 30 Tage Testdaten...');
      try {
        const testData = generateTestData(30, settings);
        console.log('✅ Testdaten generiert:', testData.sessionHits.length, 'Sessions');
        setSessionHits(testData.sessionHits);
        setHistoryData(testData.historyData);
      } catch (error) {
        console.error('❌ Fehler beim Generieren der Testdaten:', error);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [liveData, setLiveData] = useState({ temp: 0, today: 0, total: 0 });
  const [currentStrainId, setCurrentStrainId] = useState(settings.strains[0]?.id || 0);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestHits, setGuestHits] = useState(0);
  const [connected, setConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [newAchievement, setNewAchievement] = useState(null);
  const [isSensorInhaling, setIsSensorInhaling] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connectionLog, setConnectionLog] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [errorCount, setErrorCount] = useState(0);

  const sensorStartRef = useRef(0);
  const simRef = useRef({ temp: 20, lastTrigger: 0, counts: { today: 0, total: 0 } });
  const prevApiTotalRef = useRef(0);
  const tempBuffer = useRef([]);
  const cooldownUntilRef = useRef(0); // Cooldown nach Hit
  const hasTriggeredRef = useRef(false); // Flag ob bereits getriggert

  // ... (ACHIEVEMENT LOGIC & REGISTER HIT LOGIC are same as before, simplified for brevity) ...
  const unlockAchievement = useCallback((id) => {
    setAchievements(prev => {
      if (prev.some(a => a.id === id)) return prev;
      const def = ACHIEVEMENT_DATA.find(a => a.id === id);
      if (!def) return prev;
      const ach = { id: def.id, date: new Date().toISOString() };
      setNewAchievement({ ...def, date: ach.date });
      setTimeout(() => setNewAchievement(null), 4000);
      return [...prev, ach];
    });
  }, [setAchievements]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate !== todayStr) { setManualOffset(0); setLastActiveDate(todayStr); }
  }, []);

  const registerHit = (isManual, duration) => {
    const now = Date.now();
    setLastHitTime(now);

    // Cooldown setzen: 10 Sekunden nach Hit
    if (!isManual) {
      cooldownUntilRef.current = now + 10000; // 10 Sekunden Cooldown
      hasTriggeredRef.current = false; // Reset Trigger-Flag
    }

    if (isGuestMode) { setGuestHits(p => p + 1); return; }
    const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || {name:'?',price:0};
    const newHit = { id: now, timestamp: now, type: isManual ? 'Manuell' : 'Sensor', strainName: strain.name, strainPrice: strain.price, duration };
    setSessionHits(p => [newHit, ...p]);
    setManualOffset(p => p + 1);
    const todayStr = new Date().toISOString().split('T')[0];
    setHistoryData(p => {
      const n = [...p]; const idx = n.findIndex(d => d.date === todayStr);
      if (idx >= 0) { n[idx].count++; n[idx].strainId = strain.id; }
      else n.push({ date: todayStr, count: 1, strainId: strain.id, note: "" });

      // Check Daily Limit Goal
      if (goals.dailyLimit > 0 && n[idx >= 0 ? idx : n.length - 1].count >= goals.dailyLimit) {
        setNotification({
          type: 'warning',
          message: `Tägliches Limit erreicht! (${goals.dailyLimit} Hits)`,
          icon: Bell
        });
        setTimeout(() => setNotification(null), 5000);
      }

      return n;
    });
  };

  const processTemperature = (rawTemp) => {
    tempBuffer.current.push(rawTemp);
    if (tempBuffer.current.length > 5) tempBuffer.current.shift();
    const temp = tempBuffer.current.reduce((a,b)=>a+b,0) / tempBuffer.current.length;
    const now = Date.now();
    const inCooldown = now < cooldownUntilRef.current;

    // Wenn Temperatur über Schwellwert UND kein Cooldown aktiv
    if (temp >= settings.triggerThreshold && !inCooldown) {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true; // Markiere als getriggert
        setIsSensorInhaling(true);
        sensorStartRef.current = now;
      }
    }
    // Wenn Temperatur unter Schwellwert fällt
    else if (temp < (settings.triggerThreshold - 5)) {
      // Cooldown beenden wenn Temperatur deutlich unter Schwellwert
      if (inCooldown && temp < (settings.triggerThreshold - 10)) {
        cooldownUntilRef.current = 0;
      }

      // Wenn vorher getriggert wurde, registriere Hit
      if (hasTriggeredRef.current && isSensorInhaling && !inCooldown) {
        const duration = now - sensorStartRef.current;
        if (duration > 500) { // Mindestens 500ms Inhalation
          registerHit(false, duration);
        }
        hasTriggeredRef.current = false;
      }
      setIsSensorInhaling(false);
    }

    return temp;
  };

  // NETZWERK POLLING - MIT OPTIMIERUNGEN + LOGGING
  useEffect(() => {
    let isRunning = false;

    const addLog = (type, message) => {
      const timestamp = new Date().toLocaleTimeString();
      setConnectionLog(prev => [{type, message, timestamp}, ...prev].slice(0, 100)); // Max 100 Einträge
    };

    const loop = async () => {
      if (isRunning) return; // Verhindere overlapping requests
      isRunning = true;

      if (isSimulating) {
        let { temp, counts } = simRef.current;
        const target = isSensorInhaling ? 220 : 20;
        temp += (target - temp) * 0.1 + (Math.random() - 0.5) * 2;
        const smoothed = processTemperature(temp);
        simRef.current.temp = temp;
        setLiveData({ temp: smoothed, today: counts.today + manualOffset, total: counts.total + manualOffset });
        setConnected(true);
        setLastError(null);
        setErrorCount(0);

        // Temperatur-History (alle 2s)
        setTempHistory(prev => [...prev, {time: Date.now(), temp: smoothed}].slice(-120)); // 4 Minuten bei 2s
      } else {
        try {
          const cleanIp = ip.trim().replace(/^http:\/\//, '').replace(/\/$/, '');
          if (!cleanIp) throw new Error("Keine IP");

          const startTime = Date.now();
          let json;
          const url = `http://${cleanIp}/api/data`;

          if (NativeCapacitor.isNativePlatform()) {
             const response = await nativeHttp(url);
             if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
             json = response.data;
          } else {
             // Browser Fallback (für Entwicklung)
             const c = new AbortController(); setTimeout(()=>c.abort(), 3000);
             const res = await fetch(url, { signal: c.signal });
             if(!res.ok) throw new Error(`HTTP ${res.status}`);
             json = await res.json();
          }

          const responseTime = Date.now() - startTime;

          if (json.total > prevApiTotalRef.current && prevApiTotalRef.current !== 0 && !isSensorInhaling) registerHit(false, 0);
          prevApiTotalRef.current = json.total;

          const smoothed = processTemperature(json.temp);
          setLiveData({ ...json, temp: smoothed, today: json.today + manualOffset, total: json.total + manualOffset });

          // Temperatur-History
          setTempHistory(prev => [...prev, {time: Date.now(), temp: smoothed}].slice(-120));

          // Success
          if (!connected) {
            addLog('success', `Verbunden mit ${cleanIp} (${responseTime}ms)`);
          }
          setConnected(true);
          setLastError(null);
          setErrorCount(0);
        } catch (e) {
          setErrorCount(prev => prev + 1);
          setConnected(false);
          let msg = e.message;
          if (msg.includes('Failed to fetch') || msg.includes('aborted')) msg = 'Netzwerkfehler (Check WLAN)';
          setLastError(msg);
          addLog('error', msg);
        }
      }

      isRunning = false;
    };

    // Schnelleres Polling für bessere Responsiveness: 400ms (Demo) / 800ms (Sensor)
    const getInterval = () => {
      const baseInterval = isSimulating ? 400 : 800;
      return baseInterval * Math.min(1 + errorCount * 0.3, 4); // Max 4x langsamer bei Fehlern
    };

    let iv = setInterval(loop, getInterval());

    // Dynamisches Intervall anpassen
    const recheckInterval = setInterval(() => {
      clearInterval(iv);
      iv = setInterval(loop, getInterval());
    }, 3000);

    return () => {
      clearInterval(iv);
      clearInterval(recheckInterval);
    };
  }, [isSimulating, ip, manualOffset, isSensorInhaling, settings.triggerThreshold, errorCount, connected]);

  const ctx = useMemo(() => ({
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    achievements, setAchievements, goals, setGoals, lastHitTime,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits,
    connected, setConnected, isSimulating, setIsSimulating, newAchievement, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    connectionLog, tempHistory, errorCount,
    onManualTrigger: (d) => registerHit(true, d)
  }), [
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    achievements, setAchievements, goals, setGoals, lastHitTime,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits,
    connected, setConnected, isSimulating, setIsSimulating, newAchievement, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    connectionLog, tempHistory, errorCount, registerHit
  ]);

  return <AppLayout ctx={ctx} />;
}

function AppLayout({ ctx }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const Content = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardView
          liveData={ctx.liveData}
          lastHitTime={ctx.lastHitTime}
          settings={ctx.settings}
          isGuestMode={ctx.isGuestMode}
          setIsGuestMode={ctx.setIsGuestMode}
          guestHits={ctx.guestHits}
          sessionHits={ctx.sessionHits}
          onManualTrigger={ctx.onManualTrigger}
          currentStrainId={ctx.currentStrainId}
          setCurrentStrainId={ctx.setCurrentStrainId}
          isSensorInhaling={ctx.isSensorInhaling}
        />;
      case 'calendar':
        return <CalendarView
          historyData={ctx.historyData}
          setHistoryData={ctx.setHistoryData}
          sessionHits={ctx.sessionHits}
          settings={ctx.settings}
        />;
      case 'strains':
        return <StrainManagementView
          settings={ctx.settings}
          setSettings={ctx.setSettings}
          sessionHits={ctx.sessionHits}
        />;
      case 'charts':
        return <ChartsView
          historyData={ctx.historyData}
          sessionHits={ctx.sessionHits}
          settings={ctx.settings}
        />;
      case 'analytics':
        return <AnalyticsView
          historyData={ctx.historyData}
          sessionHits={ctx.sessionHits}
          settings={ctx.settings}
        />;
      case 'achievements':
        return <AchievementsView
          achievements={ctx.achievements}
        />;
      case 'esp32':
        return <ESP32DebugView
          ip={ctx.ip}
          setIp={ctx.setIp}
          connected={ctx.connected}
          isSimulating={ctx.isSimulating}
          setIsSimulating={ctx.setIsSimulating}
          lastError={ctx.lastError}
          connectionLog={ctx.connectionLog}
          tempHistory={ctx.tempHistory}
          liveData={ctx.liveData}
          errorCount={ctx.errorCount}
          settings={ctx.settings}
          setSettings={ctx.setSettings}
        />;
      case 'settings':
        return <SettingsView
          settings={ctx.settings}
          setSettings={ctx.setSettings}
          historyData={ctx.historyData}
          setHistoryData={ctx.setHistoryData}
          sessionHits={ctx.sessionHits}
          setSessionHits={ctx.setSessionHits}
          achievements={ctx.achievements}
          setAchievements={ctx.setAchievements}
          goals={ctx.goals}
          setGoals={ctx.setGoals}
        />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Achievement Notification */}
      {ctx.newAchievement && (
        <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] flex items-center gap-4 border border-yellow-400/50">
              <div className="bg-white/20 p-2 rounded-full"><ctx.newAchievement.Icon size={20} /></div>
              <div><p className="text-[10px] uppercase font-bold text-yellow-100 tracking-wider">Erfolg Freigeschaltet</p><p className="font-bold text-lg leading-tight">{ctx.newAchievement.title}</p></div>
           </div>
        </div>
      )}

      {/* Goal/Warning Notification */}
      {ctx.notification && (
        <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           <div className={`px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] flex items-center gap-4 border ${
             ctx.notification.type === 'warning'
               ? 'bg-gradient-to-r from-orange-500 to-rose-600 border-orange-400/50'
               : 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400/50'
           } text-white`}>
              <div className="bg-white/20 p-2 rounded-full"><ctx.notification.icon size={20} /></div>
              <div><p className="text-[10px] uppercase font-bold opacity-90 tracking-wider">Hinweis</p><p className="font-bold text-lg leading-tight">{ctx.notification.message}</p></div>
           </div>
        </div>
      )}

      {/* Session Details Modal */}
      {ctx.selectedSession && (
        <SessionDetailsModal session={ctx.selectedSession} onClose={() => ctx.setSelectedSession(null)} />
      )}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3"><div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20"><Leaf className="w-6 h-6 text-emerald-400" /></div><div><h1 className="font-bold text-lg text-white">High Score</h1><p className="text-xs text-zinc-500">Pro v6.1</p></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavBtn id="dashboard" icon={<LayoutDashboard/>} label="Dashboard" active={activeTab} set={setActiveTab}/>
          <NavBtn id="calendar" icon={<CalendarIcon/>} label="Tagebuch" active={activeTab} set={setActiveTab}/>
          <NavBtn id="strains" icon={<Tag/>} label="Sorten" active={activeTab} set={setActiveTab}/>
          <NavBtn id="charts" icon={<BarChart3/>} label="Statistik" active={activeTab} set={setActiveTab}/>
          <NavBtn id="analytics" icon={<Brain/>} label="Analytics" active={activeTab} set={setActiveTab}/>
          <NavBtn id="achievements" icon={<Trophy/>} label="Erfolge" active={activeTab} set={setActiveTab}/>
          <NavBtn id="esp32" icon={<Radio/>} label="ESP32 Debug" active={activeTab} set={setActiveTab}/>
          <NavBtn id="settings" icon={<Settings/>} label="Einstellungen" active={activeTab} set={setActiveTab}/>
        </nav>
        <div className="p-4 border-t border-zinc-800">
           <div className="flex items-center gap-2 text-xs">
             <button onClick={() => ctx.setIsSimulating(!ctx.isSimulating)} className="flex items-center gap-2 text-zinc-500 hover:text-white"><Smartphone size={14}/> {ctx.isSimulating ? "Demo" : "Sensor"}</button>
             <div className="ml-auto flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${ctx.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div></div>
           </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8 relative pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)]"><div className="max-w-5xl mx-auto h-full"><Content /></div></main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 overflow-x-auto">
        <MobNavBtn id="dashboard" icon={<LayoutDashboard/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="calendar" icon={<CalendarIcon/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="strains" icon={<Tag/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="charts" icon={<BarChart3/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="esp32" icon={<Radio/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="settings" icon={<Settings/>} active={activeTab} set={setActiveTab}/>
      </div>
    </div>
  );
}