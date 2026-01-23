import { useEffect, useRef, useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { HistoryDataEntry } from '../utils/historyDataHelpers';
import { Hit } from './useHitSelection';
import { Settings, Notification } from './useHitManagement';
import { HIT_TYPES } from '../utils/hitTypeHelpers';

// Type Definitions
export interface LiveData {
  flame: boolean;
  today: number;
  total: number;
  batteryVoltage: number | null;
  batteryPercent: number | null;
  minSessionDuration: number | null;
  maxSessionDuration: number | null;
  timeSync: boolean;
}

export interface ConnectionLogEntry {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export interface FlameHistoryEntry {
  time: number;
  flame: boolean;
  inhaling: boolean;
}

export interface ESP32PollingParams {
  isSimulating: boolean;
  ip: string;
  manualOffset: number;
  isManuallyHolding: boolean;
  errorCount: number;
  settings: Settings;
  currentStrainId: number;
  rebuildHistoryFromSessions: (hits: Hit[]) => HistoryDataEntry[];
  setSessionHits: React.Dispatch<React.SetStateAction<Hit[]>>;
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryDataEntry[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
  registerHitCallback: (isManual: boolean, duration?: number) => void;
}

export interface ESP32PollingReturn {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  liveData: LiveData;
  lastError: string | null;
  isSensorInhaling: boolean;
  connectionLog: ConnectionLogEntry[];
  flameHistory: FlameHistoryEntry[];
  errorCount: number;
  forceSyncPendingHits: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

interface SimulationRef {
  flame: boolean;
  lastTrigger: number;
  counts: { today: number; total: number };
  sessionActive: boolean;
  sessionStartTime: number;
}

interface CapacitorHttpResponse {
  status: number;
  data: any;
}

interface CapacitorType {
  isNativePlatform: () => boolean;
  Plugins?: {
    CapacitorHttp?: {
      get: (options: { url: string }) => Promise<CapacitorHttpResponse>;
      post: (options: { url: string }) => Promise<CapacitorHttpResponse>;
    };
  };
}

interface ESP32PendingHit {
  id?: string;
  timestamp: number;
  duration?: number;
}

interface ESP32SyncResponse {
  pendingHits?: ESP32PendingHit[];
  pendingCount?: number;
  espUptime?: number;
  timeSync?: boolean;
}

interface ESP32DataResponse {
  flame?: boolean;
  isInhaling?: boolean;
  today: number;
  total: number;
  lastDuration?: number;
  batteryVoltage?: number;
  batteryPercent?: number;
  minSessionDuration?: number;
  maxSessionDuration?: number;
  timeSync?: boolean;
}

// IP Normalisierungs-Helper
const normalizeIp = (ip: string): string => {
  if (!ip || typeof ip !== 'string') return '';
  return ip
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
};

/**
 * Stable, deterministic fingerprint for objects based on their JSON representation.
 * This avoids order-dependent index-based IDs and is stable across imports
 * as long as the underlying hit properties remain the same.
 *
 * @param value - Value to fingerprint (typically an object with timestamp and hit data)
 * @returns A short, deterministic hash in base-36 format
 */
const createHitFingerprint = (value: any): string => {
  const json = JSON.stringify(value);
  let hash = 0;

  for (let i = 0; i < json.length; i++) {
    const chr = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr; // hash * 31 + chr
    hash |= 0; // Convert to 32bit integer
  }

  // Make sure it's positive and reasonably short
  return Math.abs(hash).toString(36);
};

// Native Capacitor Detection
const NativeCapacitor: CapacitorType = (typeof window !== 'undefined' && (window as any).Capacitor)
  ? (window as any).Capacitor
  : { isNativePlatform: () => false };

// Native HTTP Helper (versucht CapacitorHttp zu nutzen, falls vorhanden)
const nativeHttp = async (url: string, method: 'GET' | 'POST' = 'GET'): Promise<CapacitorHttpResponse> => {
  if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.Plugins && (window as any).Capacitor.Plugins.CapacitorHttp) {
    if (method === 'POST') {
      return await (window as any).Capacitor.Plugins.CapacitorHttp.post({ url });
    }
    return await (window as any).Capacitor.Plugins.CapacitorHttp.get({ url });
  }
  throw new Error("Native HTTP plugin not found");
};

/**
 * Custom Hook für ESP32 Polling und Auto-Sync
 *
 * Verwaltet:
 * - Netzwerk Polling vom ESP32
 * - Auto-Sync von offline Hits
 * - Flame Detection Processing
 * - Connection Status & Error Handling
 * - Connection Logging
 */
export function useESP32Polling({
  isSimulating,
  ip,
  manualOffset,
  isManuallyHolding,
  errorCount,
  settings,
  currentStrainId,
  rebuildHistoryFromSessions,
  setSessionHits,
  setHistoryData,
  setNotification,
  registerHitCallback
}: ESP32PollingParams): ESP32PollingReturn {
  const [connected, setConnected] = useState(false);
  const [liveData, setLiveData] = useState<LiveData>({
    flame: false,
    today: 0,
    total: 0,
    batteryVoltage: null,
    batteryPercent: null,
    minSessionDuration: null,
    maxSessionDuration: null,
    timeSync: false
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const [isSensorInhaling, setIsSensorInhaling] = useState(false);
  const [connectionLog, setConnectionLog] = useState<ConnectionLogEntry[]>([]);
  const [flameHistory, setFlameHistory] = useState<FlameHistoryEntry[]>([]);
  const [currentErrorCount, setCurrentErrorCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const prevApiTotalRef = useRef(0);
  const hasSyncedRef = useRef(false);
  const isSyncingRef = useRef(false);
  const notificationTimeoutRef = useRef<number | undefined>(undefined);
  const visibilityTimeoutRef = useRef<number | undefined>(undefined);
  const recentOnlineHitsRef = useRef<number[]>([]); // Timestamps von Hits die während Online-Modus erfasst wurden
  const simRef = useRef<SimulationRef>({
    flame: false,
    lastTrigger: 0,
    counts: { today: 0, total: 0 },
    sessionActive: false,
    sessionStartTime: 0
  });

  // Reset Sync-Flag bei IP-Änderung (damit neue Verbindung erneut synchronisiert)
  useEffect(() => {
    hasSyncedRef.current = false;
  }, [ip]);

  // Helper: Schedule notification clear with timeout cleanup
  const scheduleNotificationClear = useCallback((delayMs: number) => {
    if (notificationTimeoutRef.current !== undefined) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => setNotification(null), delayMs);
  }, [setNotification]);

  // CORE SYNC LOGIC: Pending Hits vom ESP32 abrufen und importieren
  const performSync = useCallback(async (source: string = 'auto') => {
    // IP-Validierung
    const cleanIp = normalizeIp(ip);
    if (!cleanIp) {
      console.warn(`⚠️ ${source}-Sync übersprungen: keine gültige IP konfiguriert`);
      return;
    }

    if (isSimulating) {
      console.log(`⚠️ ${source}-Sync übersprungen: Simulation aktiv`);
      return;
    }

    // Prevent concurrent syncs
    if (isSyncingRef.current) {
      console.log(`⚠️ ${source}-Sync übersprungen: Sync bereits läuft`);
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const url = `http://${cleanIp}/api/sync`;

      let json: ESP32SyncResponse;
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

      const { pendingHits = [], pendingCount = 0, espUptime = 0, timeSync = false } = json;

      // **FIX v8.9**: Vollständiger Sync - Erstelle Hit-Objekte und sync zu sessionHits
      if (pendingCount > 0 && pendingHits.length > 0) {
        console.log(`🔄 Auto-Sync: ${pendingCount} pending hits gefunden (timeSync: ${timeSync})`);

        const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || { id: 0, name: '?', price: 0 };
        const now = Date.now();

        // Konvertiere ESP32 Hits in App-Format mit allen Details
        const importedHits: Hit[] = pendingHits.map((hit) => {
          let realTimestamp: number;

          // **FIX v8.8**: Nutze expliziten timeSync-Flag statt Auto-Detection
          if (timeSync) {
            // ESP32 mit NTP sendet echte Unix timestamps (Millisekunden)
            realTimestamp = hit.timestamp;
          } else {
            // ESP32 ohne NTP sendet millis() → konvertiere mit espUptime
            const hitAgeMs = espUptime - hit.timestamp;
            realTimestamp = now - hitAgeMs;
          }

          // Stabiler Hash-basierter Fallback für ID
          const fallbackIdSuffix = createHitFingerprint({
            ts: realTimestamp,
            payload: hit,
          });

          // **CRITICAL FIX**: Validiere Duration - ignoriere unrealistische Werte
          let validatedDuration = hit.duration || 0;
          if (validatedDuration < 0 || validatedDuration > 8) {
            console.warn(`⚠️ Ungültige Duration ${validatedDuration}s ignoriert (Hit ID: ${hit.id})`);
            validatedDuration = 0;
          }

          return {
            id: hit.id || `fallback_${fallbackIdSuffix}`,
            timestamp: realTimestamp,
            type: HIT_TYPES.OFFLINE,
            strainName: strain.name,
            strainPrice: strain.price,
            strainId: strain.id,
            duration: validatedDuration,
            bowlSize: settings.bowlSize,
            weedRatio: settings.weedRatio
          };
        });

        // **FIX v8.10**: Filtere Duplikate - Hits die zeitlich sehr nah an Online-Hits liegen
        const DUPLICATE_WINDOW_MS = 10000; // 10 Sekunden Toleranz
        const filteredImportedHits = importedHits.filter(hit => {
          // Prüfe ob dieser Hit zeitlich zu nah an einem Online-Hit liegt
          const isDuplicate = recentOnlineHitsRef.current.some(onlineHitTs =>
            Math.abs(hit.timestamp - onlineHitTs) < DUPLICATE_WINDOW_MS
          );

          if (isDuplicate) {
            console.log(`🔍 Duplikat gefiltert: Offline-Hit @ ${new Date(hit.timestamp).toLocaleTimeString()} zu nah an Online-Hit`);
          }

          return !isDuplicate;
        });

        // Importiere Hits in sessionHits mit Duplikatsprüfung
        let actuallyImportedCount = 0;
        let filteredDuplicateCount = 0;
        setSessionHits(prev => {
          const existingIds = new Set(prev.map(h => h.id));
          const newHits = filteredImportedHits.filter(h => !existingIds.has(h.id));
          actuallyImportedCount = newHits.length;
          filteredDuplicateCount = importedHits.length - filteredImportedHits.length;
          const updated = newHits.length > 0 ? [...newHits, ...prev] : prev;

          // Auto-Sync: Rebuild historyData aus aktualisierten sessionHits
          if (newHits.length > 0) {
            const updatedHistoryData = rebuildHistoryFromSessions(updated);
            setHistoryData(updatedHistoryData);
          }

          return updated;
        });

        if (actuallyImportedCount > 0) {
          setNotification({
            type: 'success',
            message: `✅ ${actuallyImportedCount} Offline-Hits importiert!`,
            icon: RefreshCw
          });
          scheduleNotificationClear(4000);

          const totalDuplicates = pendingCount - actuallyImportedCount;
          const timeBasedDuplicates = filteredDuplicateCount;
          const idBasedDuplicates = totalDuplicates - timeBasedDuplicates;

          console.log(`✅ Auto-Sync erfolgreich: ${actuallyImportedCount} hits importiert (${timeBasedDuplicates} Online-Duplikate, ${idBasedDuplicates} ID-Duplikate gefiltert)`);
        } else {
          const timeBasedDuplicates = filteredDuplicateCount;
          console.log(`✓ Auto-Sync: Alle ${pendingCount} hits bereits vorhanden (${timeBasedDuplicates} Online-Duplikate, ${pendingCount - timeBasedDuplicates} ID-Duplikate)`);
        }

        // Sync Complete aufrufen (auch bei Duplikaten!)
        await completeSyncRequest();
      } else {
        console.log('✓ Auto-Sync: Keine pending hits');
      }

      hasSyncedRef.current = true;
      setLastSyncTime(Date.now());
    } catch (e: any) {
      console.error(`❌ ${source}-Sync Fehler:`, e.message);
      setNotification({
        type: 'error',
        message: `Sync fehlgeschlagen: ${e.message}`,
        icon: RefreshCw
      });
      scheduleNotificationClear(3000);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [isSimulating, ip, currentStrainId, settings.strains, settings.bowlSize, settings.weedRatio, setSessionHits, setHistoryData, setNotification, rebuildHistoryFromSessions, scheduleNotificationClear]);

  // AUTO-SYNC: Wird nur beim ersten Reconnect aufgerufen
  const syncPendingHits = useCallback(async () => {
    if (hasSyncedRef.current) return;
    await performSync('auto');
  }, [performSync]);

  // FORCE SYNC: Kann jederzeit manuell aufgerufen werden (z.B. Button, Visibility API)
  const forceSyncPendingHits = useCallback(async () => {
    await performSync('manual');
  }, [performSync]);

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
    } catch (e: any) {
      console.error('⚠️ Sync-Complete Fehler:', e.message);
    }
  };

  // Flame Sensor Detection Logic (B05 Sensor)
  // Der ESP32 verwaltet die gesamte Logik, wir empfangen nur den Status
  const processFlameDetection = (flameDetected: boolean, isInhaling: boolean): boolean => {
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

    const addLog = (type: ConnectionLogEntry['type'], message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setConnectionLog(prev => [{ type, message, timestamp }, ...prev].slice(0, 100)); // Max 100 Einträge
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
          total: simData.counts.total + manualOffset,
          batteryVoltage: null,
          batteryPercent: null,
          minSessionDuration: 800,
          maxSessionDuration: 4500,
          timeSync: false
        });
        setConnected(true);
        setLastError(null);
        setCurrentErrorCount(0);
      } else {
        try {
          const cleanIp = normalizeIp(ip);
          if (!cleanIp) throw new Error("Keine IP");

          const startTime = Date.now();
          let json: ESP32DataResponse;
          const url = `http://${cleanIp}/api/data`;

          if (NativeCapacitor.isNativePlatform()) {
            const response = await nativeHttp(url);
            if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
            json = response.data;
          } else {
            // Browser Fallback (für Entwicklung)
            const c = new AbortController(); setTimeout(() => c.abort(), 3000);
            const res = await fetch(url, { signal: c.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            json = await res.json();
          }

          const responseTime = Date.now() - startTime;

          // Hit Detection: ESP32 zählt bereits selbst, wir müssen nur bei Änderung reagieren
          if (json.total > prevApiTotalRef.current && prevApiTotalRef.current !== 0) {
            const duration = json.lastDuration || 0;
            const hitTimestamp = Date.now();
            registerHitCallback(false, duration);

            // **FIX v8.10**: Merke Timestamp von Online-Hits für Duplikatsprüfung
            recentOnlineHitsRef.current.push(hitTimestamp);
            // Behalte nur Hits der letzten 60 Sekunden (für Duplikatsprüfung)
            recentOnlineHitsRef.current = recentOnlineHitsRef.current.filter(ts => hitTimestamp - ts < 60000);
          }
          prevApiTotalRef.current = json.total;

          // Flame Detection Processing
          const flameDetected = json.flame || false;
          const isInhaling = json.isInhaling || false;
          processFlameDetection(flameDetected, isInhaling);

          setLiveData({
            flame: flameDetected,
            today: json.today + manualOffset,
            total: json.total + manualOffset,
            batteryVoltage: json.batteryVoltage ?? null,
            batteryPercent: json.batteryPercent ?? null,
            minSessionDuration: json.minSessionDuration ?? null,
            maxSessionDuration: json.maxSessionDuration ?? null,
            timeSync: json.timeSync ?? false
          });

          // Success
          const wasDisconnected = !connected;
          if (wasDisconnected) {
            addLog('success', `Verbunden mit ${cleanIp} (${responseTime}ms)`);
          }
          setConnected(true);
          setLastError(null);
          setCurrentErrorCount(0);

          // AUTO-SYNC: Beim ersten erfolgreichen Verbinden pending hits synchronisieren
          if (wasDisconnected && !hasSyncedRef.current) {
            setTimeout(() => syncPendingHits(), 1000); // 1s Delay für stabilere Verbindung
          }
        } catch (e: any) {
          setCurrentErrorCount(prev => prev + 1);
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
      return baseInterval * Math.min(1 + currentErrorCount * 0.3, 4); // Max 4x langsamer bei Fehlern
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
  }, [isSimulating, ip, manualOffset, isManuallyHolding, currentErrorCount, connected, syncPendingHits, registerHitCallback]);

  // VISIBILITY API: Auto-Sync beim Tab-Fokus / App-Rückkehr
  useEffect(() => {
    // Guard for SSR/non-browser environments
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!document.hidden && connected && !isSimulating) {
        console.log('👁️ Tab fokussiert - Auto-Sync wird ausgeführt...');

        // Clear previous timeout to avoid duplicate syncs
        if (visibilityTimeoutRef.current !== undefined) {
          window.clearTimeout(visibilityTimeoutRef.current);
        }

        // Kurzer Delay für stabilere Verbindung
        visibilityTimeoutRef.current = window.setTimeout(() => {
          forceSyncPendingHits();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clean up pending timeout on unmount
      if (visibilityTimeoutRef.current !== undefined) {
        window.clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [connected, isSimulating, forceSyncPendingHits]);

  // APP MOUNT: Initial Sync beim ersten App-Start
  useEffect(() => {
    if (connected && !isSimulating && !hasSyncedRef.current) {
      console.log('🚀 App-Mount - Initial Sync wird ausgeführt...');
      setTimeout(() => syncPendingHits(), 1000);
    }
  }, [connected, isSimulating, syncPendingHits]);

  // Cleanup: Clear notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current !== undefined) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  return {
    connected,
    setConnected,
    liveData,
    lastError,
    isSensorInhaling,
    connectionLog,
    flameHistory,
    errorCount: currentErrorCount,
    forceSyncPendingHits,
    isSyncing,
    lastSyncTime
  };
}
