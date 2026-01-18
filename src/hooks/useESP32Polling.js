import { useEffect, useRef, useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';

// IP Normalisierungs-Helper
const normalizeIp = (ip) => {
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
 * @param {any} value - Value to fingerprint (typically an object with timestamp and hit data)
 * @returns {string} A short, deterministic hash in base-36 format
 */
const createHitFingerprint = (value) => {
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
const NativeCapacitor = (typeof window !== 'undefined' && window.Capacitor)
  ? window.Capacitor
  : { isNativePlatform: () => false };

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
}) {
  const [connected, setConnected] = useState(false);
  const [liveData, setLiveData] = useState({
    flame: false,
    today: 0,
    total: 0,
    batteryVoltage: null,
    batteryPercent: null,
    minSessionDuration: null,
    maxSessionDuration: null,
    timeSync: false
  });
  const [lastError, setLastError] = useState(null);
  const [isSensorInhaling, setIsSensorInhaling] = useState(false);
  const [connectionLog, setConnectionLog] = useState([]);
  const [flameHistory, setFlameHistory] = useState([]);
  const [currentErrorCount, setCurrentErrorCount] = useState(0);

  const prevApiTotalRef = useRef(0);
  const hasSyncedRef = useRef(false);
  const isSyncingRef = useRef(false);
  const simRef = useRef({
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

      const { pendingHits = [], pendingCount = 0, espUptime = 0, timeSync = false } = json;

      // **FIX v8.9**: Vollständiger Sync - Erstelle Hit-Objekte und sync zu sessionHits
      if (pendingCount > 0 && pendingHits.length > 0) {
        console.log(`🔄 Auto-Sync: ${pendingCount} pending hits gefunden (timeSync: ${timeSync})`);

        const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || { name: '?', price: 0 };
        const now = Date.now();

        // Konvertiere ESP32 Hits in App-Format mit allen Details
        const importedHits = pendingHits.map((hit) => {
          let realTimestamp;

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
            type: 'Sensor',
            strainName: strain.name,
            strainPrice: strain.price,
            strainId: strain.id,
            duration: validatedDuration,
            bowlSize: settings.bowlSize,
            weedRatio: settings.weedRatio
          };
        });

        // Importiere Hits in sessionHits mit Duplikatsprüfung
        let actuallyImportedCount = 0;
        setSessionHits(prev => {
          const existingIds = new Set(prev.map(h => h.id));
          const newHits = importedHits.filter(h => !existingIds.has(h.id));
          actuallyImportedCount = newHits.length;
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
          setTimeout(() => setNotification(null), 4000);

          console.log(`✅ Auto-Sync erfolgreich: ${actuallyImportedCount} hits importiert (${pendingCount - actuallyImportedCount} Duplikate übersprungen)`);
        } else {
          console.log(`✓ Auto-Sync: Alle ${pendingCount} hits bereits vorhanden (Duplikate)`);
        }

        // Sync Complete aufrufen (auch bei Duplikaten!)
        await completeSyncRequest();
      } else {
        console.log('✓ Auto-Sync: Keine pending hits');
      }

      hasSyncedRef.current = true;
    } catch (e) {
      console.error('❌ Auto-Sync Fehler:', e.message);
    } finally {
      isSyncingRef.current = false;
    }
  }, [isSimulating, ip, currentStrainId, settings.strains, settings.bowlSize, settings.weedRatio, setSessionHits, setHistoryData, setNotification, rebuildHistoryFromSessions]);

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
          let json;
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
            registerHitCallback(false, duration);
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
        } catch (e) {
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

  return {
    connected,
    setConnected,
    liveData,
    lastError,
    isSensorInhaling,
    connectionLog,
    flameHistory,
    errorCount: currentErrorCount
  };
}
