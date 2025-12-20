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
import BadgesView from './components/BadgesView';
import ESP32DebugView from './components/ESP32DebugView';
import DataRecovery from './components/DataRecovery';
import { generateTestData } from './utils/testDataGenerator';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './utils/constants';
import { useAutoBackup } from './hooks/useAutoBackup';
import { calculateBadges, calculateUserStats, detectUnlockedBadges } from './utils/badges';

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

/**
 * Normalisiert Error-Objekte für konsistentes Logging
 * Handhabt sowohl Error-Instanzen als auch primitive throws
 *
 * @param {any} error - Der geworfene Fehler (kann Error, String, Object, etc. sein)
 * @returns {Object} Normalisierte Error-Metadaten
 */
const normalizeError = (error) => {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error.name
    };
  }
  // Non-Error throws (z.B. throw "string", throw null)
  return {
    errorValue: error,
    errorType: typeof error
  };
};

// IP Normalisierungs-Helper
const normalizeIp = (ip) => {
  if (!ip || typeof ip !== 'string') return '';

  return ip
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
};

// Native HTTP Helper (versucht CapacitorHttp zu nutzen, falls vorhanden)
const nativeHttp = async (url, method = 'GET') => {
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp) {
      if (method === 'POST') {
        return await window.Capacitor.Plugins.CapacitorHttp.post({ url });
      }
      return await window.Capacitor.Plugins.CapacitorHttp.get({ url });
  }
  throw new Error("Native HTTP plugin not found");
};


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

function HoldButton({ onTrigger, lastHit, active, flame }) {
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
               <Flame size={10} className={flame ? 'text-orange-500' : ''}/> {flame ? 'Detected' : 'Ready'}
            </div>
         </button>
      </div>
    </div>
  );
}

// --- 4. VIEWS (imported from components/) ---

// --- 5. MAIN LOGIC & LAYOUT ---

export default function App() {
  // State mit zentralen STORAGE_KEYS Konstanten
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.SETTINGS, {
    ...DEFAULT_SETTINGS,
    adminMode: false,
    strains: [{ id: 1, name: "Lemon Haze", price: 10, thc: 22 }]
  });
  const [historyData, setHistoryData] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [sessionHits, setSessionHits] = useLocalStorage(STORAGE_KEYS.SESSION_HITS, []);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, { dailyLimit: 0, tBreakDays: 0 });
  const [lastActiveDate, setLastActiveDate] = useLocalStorage(STORAGE_KEYS.LAST_DATE, '');
  const [manualOffset, setManualOffset] = useLocalStorage(STORAGE_KEYS.OFFSET, 0);
  const [lastHitTime, setLastHitTime] = useLocalStorage(STORAGE_KEYS.LAST_HIT_TS, null);
  const [ip, setIp] = useLocalStorage(STORAGE_KEYS.DEVICE_IP, '192.168.178.XXX');
  const [badgeHistory, setBadgeHistory] = useLocalStorage(STORAGE_KEYS.BADGE_HISTORY, []);

  // Badge History mit maximaler Größe
  const MAX_BADGE_HISTORY_LENGTH = 100;

  /**
   * Wrapper um setBadgeHistory der sicherstellt, dass das History-Array
   * auf die letzten MAX_BADGE_HISTORY_LENGTH Einträge begrenzt ist.
   *
   * Unterstützt sowohl funktionale als auch direkte Wert-Updates.
   */
  const setCappedBadgeHistory = useCallback(
    (update) => {
      setBadgeHistory((prev) => {
        const next =
          typeof update === 'function'
            ? update(prev ?? [])
            : update ?? [];

        // Stelle sicher, dass wir immer mit einem Array arbeiten
        if (!Array.isArray(next)) {
          if (process.env.NODE_ENV !== 'production') {
            // Bewahre die Invariante, dass Badge History immer ein Array ist
            // und zeige ein klares Signal während der Entwicklung.
            console.error(
              'setCappedBadgeHistory expected an array, but received:',
              next
            );
          }

          // Konvertiere ungültige Werte zu einem leeren, begrenzten Array, sodass
          // badgeHistory in allen Fällen ein begrenztes Array bleibt.
          return [];
        }

        // Begrenze auf die letzten MAX_BADGE_HISTORY_LENGTH Einträge
        if (next.length > MAX_BADGE_HISTORY_LENGTH) {
          return next.slice(0, MAX_BADGE_HISTORY_LENGTH);
        }

        return next;
      });
    },
    [setBadgeHistory]
  );

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

  const [liveData, setLiveData] = useState({ flame: false, today: 0, total: 0 });
  const [currentStrainId, setCurrentStrainId] = useState(settings.strains[0]?.id || 0);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestHits, setGuestHits] = useState(0);
  const [connected, setConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false); // v7.0: Sensor-Modus als Standard (kein Demo)
  const [isSensorInhaling, setIsSensorInhaling] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connectionLog, setConnectionLog] = useState([]);
  const [flameHistory, setFlameHistory] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isManuallyHolding, setIsManuallyHolding] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  // Auto-Backup System: Speichert automatisch bei Änderungen
  useAutoBackup(settings, historyData, sessionHits, goals);

  // Recovery Handler
  const handleDataRestore = useCallback((backupData) => {
    try {
      if (backupData.settings) setSettings(backupData.settings);
      if (backupData.historyData) setHistoryData(backupData.historyData);
      if (backupData.sessionHits) setSessionHits(backupData.sessionHits);
      if (backupData.goals) setGoals(backupData.goals);

      setShowRecovery(false);
      setNotification({ type: 'success', msg: '✅ Daten erfolgreich wiederhergestellt!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', msg: '❌ Wiederherstellung fehlgeschlagen!' });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [setSettings, setHistoryData, setSessionHits, setGoals, setNotification]);

  const sensorStartRef = useRef(0);
  const simRef = useRef({
    flame: false,
    lastTrigger: 0,
    counts: { today: 0, total: 0 },
    sessionActive: false,
    sessionStartTime: 0
  });
  const prevApiTotalRef = useRef(0);
  const cooldownUntilRef = useRef(0); // Cooldown nach Hit
  const hasTriggeredRef = useRef(false); // Flag ob bereits getriggert
  const hasSyncedRef = useRef(false); // Flag ob bereits synchronisiert
  const isSyncingRef = useRef(false); // Flag ob Sync läuft
  const prevBadgesRef = useRef(null); // Vorherige Badges für Unlock-Erkennung

  // NEUES BADGE-SYSTEM: Keine komplexe Check-Logik mehr!
  // Badges werden automatisch in BadgesView berechnet basierend auf Stats

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate !== todayStr) { setManualOffset(0); setLastActiveDate(todayStr); }
  }, []);

  // Reset Sync-Flag bei IP-Änderung (damit neue Verbindung erneut synchronisiert)
  useEffect(() => {
    hasSyncedRef.current = false;
  }, [ip]);

  // Badge Unlock Detection & Notifications - DEAKTIVIERT zum Debuggen
  /*useEffect(() => {
    // Begrenze try-catch auf Badge-Berechnung, damit unrelated Fehler nicht verschluckt werden
    let stats, currentBadges;
    try {
      stats = calculateUserStats(sessionHits, historyData, settings);
      currentBadges = calculateBadges(stats);
    } catch (error) {
      console.error('❌ Badge Calculation Error:', error, {
        context: 'Badge calculation failed',
        sessionHitsCount: sessionHits?.length,
        historyDataCount: historyData?.length,
        hasSettings: !!settings,
        // Null vs 0: Unterscheide "keine settings" von "settings mit 0 Keys"
        settingsKeyCount: settings ? Object.keys(settings).length : null,
        ...normalizeError(error)
      });
      // Early return - verhindert, dass fehlerhafte Badge-Daten verwendet werden
      return;
    }

    // Ab hier läuft der Code normal - Fehler werden nicht abgefangen
    if (prevBadgesRef.current) {
      const unlockedBadges = detectUnlockedBadges(prevBadgesRef.current, currentBadges);

      if (unlockedBadges.length > 0) {
        // Zeige Notification für das erste neue Badge, aber weise auf weitere hin
        const badge = unlockedBadges[0];
        const additionalCount = unlockedBadges.length - 1;
        const additionalText =
          additionalCount > 0 ? ` (+${additionalCount} weitere)` : '';

        setNotification({
          type: 'success',
          message: `🏆 ${badge.name} ${badge.newLevel.icon} ${badge.newLevel.name} freigeschaltet${additionalText}!`,
          icon: Trophy
        });
        setTimeout(() => setNotification(null), 5000);

        // Vibration feedback
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Speichere in Badge History (mit Größenbegrenzung)
        const newHistoryEntries = unlockedBadges.map(b => ({
          category: b.category,
          name: b.name,
          level: b.newLevel.id,
          levelName: b.newLevel.name,
          icon: b.newLevel.icon,
          timestamp: Date.now()
        }));

        setCappedBadgeHistory(prev => [...newHistoryEntries, ...prev]);
      }
    }

    prevBadgesRef.current = currentBadges;
  }, [sessionHits, historyData, settings, setCappedBadgeHistory]);*/

  const registerHit = (isManual, duration) => {
    const now = Date.now();
    setLastHitTime(now);

    // Cooldown setzen: 3 Sekunden nach Hit (angepasst an Flame Sensor)
    if (!isManual) {
      cooldownUntilRef.current = now + 3000; // 3 Sekunden Cooldown
      hasTriggeredRef.current = false; // Reset Trigger-Flag
    }

    if (isGuestMode) { setGuestHits(p => p + 1); return; }
    const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || {name:'?',price:0};
    const newHit = { id: now, timestamp: now, type: isManual ? 'Manuell' : 'Sensor', strainName: strain.name, strainPrice: strain.price, duration };

    // Prepare updated data BEFORE state updates
    const updatedSessionHits = [newHit, ...sessionHits];
    const todayStr = new Date().toISOString().split('T')[0];
    const idx = historyData.findIndex(d => d.date === todayStr);
    const updatedHistoryData = [...historyData];
    if (idx >= 0) {
      updatedHistoryData[idx] = { ...updatedHistoryData[idx], count: updatedHistoryData[idx].count + 1, strainId: strain.id };
    } else {
      updatedHistoryData.push({ date: todayStr, count: 1, strainId: strain.id, note: "" });
    }

    // Update States
    setSessionHits(updatedSessionHits);
    setHistoryData(updatedHistoryData);
    setManualOffset(p => p + 1);

    // Check Daily Limit Goal
    const todayCount = idx >= 0 ? updatedHistoryData[idx].count : 1;
    if (goals.dailyLimit > 0 && todayCount >= goals.dailyLimit) {
      setNotification({
        type: 'warning',
        message: `Tägliches Limit erreicht! (${goals.dailyLimit} Hits)`,
        icon: Bell
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // GÄSTE-MODUS: Reset Funktion
  const resetGuestHits = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setGuestHits(0);
    console.log('🔄 Gäste-Hits zurückgesetzt');
  };

  // AUTO-SYNC: Pending Hits vom ESP32 abrufen und importieren
  const syncPendingHits = useCallback(async () => {
    if (isSimulating || isSyncingRef.current || hasSyncedRef.current) return;

    // IP-Validierung VOR dem Setzen des Sync-Flags
    const cleanIp = normalizeIp(ip);
    if (!cleanIp) {
      console.warn('⚠️ Auto-Sync übersprungen: keine gültige IP konfiguriert');
      return;
    }

    isSyncingRef.current = true;

    try {
      const url = `http://${cleanIp}/api/sync`;

      let json;
      if (NativeCapacitor.isNativePlatform()) {
        const response = await nativeHttp(url);
        if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
        json = response.data;
      } else {
        const c = new AbortController();
        setTimeout(() => c.abort(), 5000);
        const res = await fetch(url, { signal: c.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = await res.json();
      }

      const { pendingHits = [], pendingCount = 0 } = json;

      if (pendingCount > 0 && pendingHits.length > 0) {
        console.log(`🔄 Auto-Sync: ${pendingCount} pending hits gefunden`);

        // Konvertiere ESP32 Hits in App-Format
        const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || { name: '?', price: 0 };
        const importedHits = pendingHits.map(hit => ({
          id: hit.timestamp,
          timestamp: hit.timestamp,
          type: 'Sensor',
          strainName: strain.name,
          strainPrice: strain.price,
          duration: hit.duration || 0
        }));

        // Importiere Hits in sessionHits mit Duplikatsprüfung im functional updater
        // (verhindert Race Conditions bei concurrent updates)
        let actuallyImportedCount = 0;
        setSessionHits(prev => {
          const existingIds = new Set(prev.map(h => h.id));
          const newHits = importedHits.filter(h => !existingIds.has(h.id));
          actuallyImportedCount = newHits.length; // Closure-Variable wird synchron gesetzt
          return newHits.length > 0 ? [...newHits, ...prev] : prev;
        });

        // Update History Data - NUR mit tatsächlich importierten Hits
        if (actuallyImportedCount > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          setHistoryData(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(d => d.date === todayStr);
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], count: updated[idx].count + actuallyImportedCount };
            } else {
              updated.push({ date: todayStr, count: actuallyImportedCount, strainId: strain.id, note: "" });
            }
            return updated;
          });

          // Sync erfolgreich - Bestätige an ESP32
          await completeSyncRequest();

          setNotification({
            type: 'success',
            message: `✅ ${actuallyImportedCount} Offline-Hits importiert!`,
            icon: RefreshCw
          });
          setTimeout(() => setNotification(null), 4000);

          console.log(`✅ Auto-Sync erfolgreich: ${actuallyImportedCount} hits importiert (${pendingCount - actuallyImportedCount} Duplikate übersprungen)`);
        } else {
          console.log(`✓ Auto-Sync: Alle ${pendingCount} hits bereits vorhanden (Duplikate)`);
        }
      } else {
        console.log('✓ Auto-Sync: Keine pending hits');
      }

      hasSyncedRef.current = true;
    } catch (e) {
      console.error('❌ Auto-Sync Fehler:', e.message);
    } finally {
      isSyncingRef.current = false;
    }
  }, [isSimulating, ip, currentStrainId, settings.strains, setSessionHits, setHistoryData, setNotification]);

  // AUTO-SYNC COMPLETE: ESP32 mitteilen dass Sync erfolgreich war
  const completeSyncRequest = async () => {
    try {
      const cleanIp = normalizeIp(ip);
      if (!cleanIp) {
        console.warn('⚠️ Sync-Complete übersprungen: keine gültige IP konfiguriert');
        return;
      }

      const url = `http://${cleanIp}/api/sync-complete`;

      if (NativeCapacitor.isNativePlatform()) {
        await nativeHttp(url, 'POST');
      } else {
        const c = new AbortController();
        setTimeout(() => c.abort(), 3000);
        await fetch(url, { method: 'POST', signal: c.signal });
      }

      console.log('✅ Sync-Complete an ESP32 gesendet');
    } catch (e) {
      console.error('⚠️ Sync-Complete Fehler:', e.message);
    }
  };

  // Flame Sensor Detection Logic (B05 Sensor)
  // Der ESP32 verwaltet die gesamte Logik, wir empfangen nur den Status
  const processFlameDetection = (flameDetected, isInhaling) => {
    // Setze Status direkt vom ESP32
    setIsSensorInhaling(isInhaling);

    // Flame History für Monitoring (letzten 2 Minuten)
    setFlameHistory(prev => [...prev, {
      time: Date.now(),
      flame: flameDetected,
      inhaling: isInhaling
    }].slice(-60)); // 60 Datenpunkte bei ~2s Polling = 2 Minuten

    return flameDetected;
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
        const simData = simRef.current;

        // Simulation: Session-Status folgt Button-Hold-Zustand
        const isSimInhaling = isManuallyHolding;
        const flameDetected = isSimInhaling || (Math.random() > 0.98); // Gelegentliches Flackern

        processFlameDetection(flameDetected, isSimInhaling);
        setLiveData({
          flame: flameDetected,
          today: simData.counts.today + manualOffset,
          total: simData.counts.total + manualOffset
        });
        setConnected(true);
        setLastError(null);
        setErrorCount(0);
      } else {
        try {
          const cleanIp = normalizeIp(ip);
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

          // Hit Detection: ESP32 zählt bereits selbst, wir müssen nur bei Änderung reagieren
          if (json.total > prevApiTotalRef.current && prevApiTotalRef.current !== 0) {
            const duration = json.lastDuration || 0;
            registerHit(false, duration);
          }
          prevApiTotalRef.current = json.total;

          // Flame Detection Processing
          const flameDetected = json.flame || false;
          const isInhaling = json.isInhaling || false;
          processFlameDetection(flameDetected, isInhaling);

          setLiveData({
            flame: flameDetected,
            today: json.today + manualOffset,
            total: json.total + manualOffset
          });

          // Success
          const wasDisconnected = !connected;
          if (wasDisconnected) {
            addLog('success', `Verbunden mit ${cleanIp} (${responseTime}ms)`);
          }
          setConnected(true);
          setLastError(null);
          setErrorCount(0);

          // AUTO-SYNC: Beim ersten erfolgreichen Verbinden pending hits synchronisieren
          if (wasDisconnected && !hasSyncedRef.current) {
            setTimeout(() => syncPendingHits(), 1000); // 1s Delay für stabilere Verbindung
          }
        } catch (e) {
          setErrorCount(prev => prev + 1);
          const wasConnected = connected;
          setConnected(false);
          let msg = e.message;
          if (msg.includes('Failed to fetch') || msg.includes('aborted')) msg = 'Netzwerkfehler (Check WLAN)';
          setLastError(msg);
          addLog('error', msg);

          // Reset Sync-Flag bei Verbindungsverlust, damit beim Wiederverbinden synchronisiert wird
          if (wasConnected) {
            hasSyncedRef.current = false;
          }
        }
      }

      isRunning = false;
    };

    // Schnelleres Polling für bessere Responsiveness: 400ms (Demo) / 800ms (Sensor)
    const getInterval = () => {
      const baseInterval = 400; // 400ms für Demo UND Sensor (schnellere Abfrage)
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
  }, [isSimulating, ip, manualOffset, isManuallyHolding, settings.triggerThreshold, errorCount, connected, syncPendingHits]);

  const ctx = useMemo(() => ({
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    goals, setGoals, lastHitTime, badgeHistory,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits, resetGuestHits,
    connected, setConnected, isSimulating, setIsSimulating, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    connectionLog, flameHistory, errorCount, isManuallyHolding,
    showRecovery, setShowRecovery, handleDataRestore,
    onManualTrigger: (d) => registerHit(true, d),
    onHoldStart: () => setIsManuallyHolding(true),
    onHoldEnd: () => setIsManuallyHolding(false)
  }), [
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    goals, setGoals, lastHitTime, badgeHistory,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits, resetGuestHits,
    connected, setConnected, isSimulating, setIsSimulating, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    connectionLog, flameHistory, errorCount, isManuallyHolding,
    showRecovery, setShowRecovery, handleDataRestore, registerHit
  ]);

  return <AppLayout ctx={ctx} />;
}

function AppLayout({ ctx }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">

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

      {/* Data Recovery Modal */}
      {ctx.showRecovery && (
        <DataRecovery
          onRestore={ctx.handleDataRestore}
          onDismiss={() => ctx.setShowRecovery(false)}
        />
      )}

      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3"><div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20"><Leaf className="w-6 h-6 text-emerald-400" /></div><div><h1 className="font-bold text-lg text-white">High Score</h1><p className="text-xs text-zinc-500">Pro v6.1</p></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavBtn id="dashboard" icon={<LayoutDashboard/>} label="Dashboard" active={activeTab} set={setActiveTab}/>
          <NavBtn id="calendar" icon={<CalendarIcon/>} label="Tagebuch" active={activeTab} set={setActiveTab}/>
          <NavBtn id="strains" icon={<Tag/>} label="Sorten" active={activeTab} set={setActiveTab}/>
          <NavBtn id="charts" icon={<BarChart3/>} label="Statistik" active={activeTab} set={setActiveTab}/>
          <NavBtn id="analytics" icon={<Brain/>} label="Analytics" active={activeTab} set={setActiveTab}/>
          <NavBtn id="badges" icon={<Trophy/>} label="Badges" active={activeTab} set={setActiveTab}/>
          <NavBtn id="esp32" icon={<Radio/>} label="ESP32 Debug" active={activeTab} set={setActiveTab}/>
          <NavBtn id="settings" icon={<Settings/>} label="Einstellungen" active={activeTab} set={setActiveTab}/>
        </nav>
        <div className="p-4 border-t border-zinc-800">
           <div className="flex items-center justify-between gap-2 text-xs">
             <span className="text-zinc-600 flex items-center gap-1.5">
               <Radio size={14} className={ctx.connected ? "text-emerald-500" : "text-rose-500"} />
               {ctx.connected ? "Verbunden" : "Offline"}
             </span>
             <div className={`w-2 h-2 rounded-full ${ctx.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
           </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8 relative pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <div className="max-w-5xl mx-auto h-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              liveData={ctx.liveData}
              lastHitTime={ctx.lastHitTime}
              settings={ctx.settings}
              isGuestMode={ctx.isGuestMode}
              setIsGuestMode={ctx.setIsGuestMode}
              guestHits={ctx.guestHits}
              sessionHits={ctx.sessionHits}
              onManualTrigger={ctx.onManualTrigger}
              onHoldStart={ctx.onHoldStart}
              onHoldEnd={ctx.onHoldEnd}
              currentStrainId={ctx.currentStrainId}
              setCurrentStrainId={ctx.setCurrentStrainId}
              isSensorInhaling={ctx.isSensorInhaling}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarView
              historyData={ctx.historyData}
              setHistoryData={ctx.setHistoryData}
              sessionHits={ctx.sessionHits}
              settings={ctx.settings}
            />
          )}
          {activeTab === 'strains' && (
            <StrainManagementView
              settings={ctx.settings}
              setSettings={ctx.setSettings}
              sessionHits={ctx.sessionHits}
            />
          )}
          {activeTab === 'charts' && (
            <ChartsView
              historyData={ctx.historyData}
              sessionHits={ctx.sessionHits}
              settings={ctx.settings}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsView
              historyData={ctx.historyData}
              sessionHits={ctx.sessionHits}
              settings={ctx.settings}
            />
          )}
          {activeTab === 'badges' && (
            <BadgesView
              sessionHits={ctx.sessionHits}
              historyData={ctx.historyData}
              settings={ctx.settings}
              badgeHistory={ctx.badgeHistory}
            />
          )}
          {activeTab === 'esp32' && (
            <ESP32DebugView
              ip={ctx.ip}
              setIp={ctx.setIp}
              connected={ctx.connected}
              isSimulating={ctx.isSimulating}
              setIsSimulating={ctx.setIsSimulating}
              lastError={ctx.lastError}
              connectionLog={ctx.connectionLog}
              flameHistory={ctx.flameHistory}
              liveData={ctx.liveData}
              errorCount={ctx.errorCount}
              settings={ctx.settings}
              setSettings={ctx.setSettings}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              settings={ctx.settings}
              setSettings={ctx.setSettings}
              historyData={ctx.historyData}
              setHistoryData={ctx.setHistoryData}
              sessionHits={ctx.sessionHits}
              setSessionHits={ctx.setSessionHits}
              goals={ctx.goals}
              setGoals={ctx.setGoals}
              showRecovery={ctx.showRecovery}
              setShowRecovery={ctx.setShowRecovery}
              isSimulating={ctx.isSimulating}
              setIsSimulating={ctx.setIsSimulating}
            />
          )}
        </div>
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 overflow-x-auto">
        <MobNavBtn id="dashboard" icon={<LayoutDashboard/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="calendar" icon={<CalendarIcon/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="strains" icon={<Tag/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="charts" icon={<BarChart3/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="analytics" icon={<Brain/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="badges" icon={<Trophy/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="esp32" icon={<Radio/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="settings" icon={<Settings/>} active={activeTab} set={setActiveTab}/>
      </div>
    </div>
  );
}