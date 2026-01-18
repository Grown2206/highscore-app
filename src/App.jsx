import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './utils/constants';
import { useAutoBackup } from './hooks/useAutoBackup.ts';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { useESP32Polling } from './hooks/useESP32Polling.ts';
import { useHitManagement } from './hooks/useHitManagement.ts';
import AppLayout from './components/AppLayout';

// --- MAIN APP COMPONENT ---

export default function App() {
  // **FIX v8.9**: sessionHits als primäre Quelle, historyData wird automatisch synchronisiert
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.SETTINGS, {
    ...DEFAULT_SETTINGS,
    adminMode: false,
    strains: [{ id: 1, name: "Lemon Haze", price: 10, thc: 22 }]
  });
  const [sessionHits, setSessionHits] = useLocalStorage(STORAGE_KEYS.SESSION_HITS, []);
  const [historyData, setHistoryData] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, { dailyLimit: 0, tBreakDays: 0 });
  const [lastActiveDate, setLastActiveDate] = useLocalStorage(STORAGE_KEYS.LAST_DATE, '');
  const [manualOffset, setManualOffset] = useLocalStorage(STORAGE_KEYS.OFFSET, 0);
  const [lastHitTime, setLastHitTime] = useLocalStorage(STORAGE_KEYS.LAST_HIT_TS, null);
  const [ip, setIp] = useLocalStorage(STORAGE_KEYS.DEVICE_IP, '192.168.178.XXX');

  // **FIX v8.9**: Auto-Sync - Rebuild historyData aus sessionHits
  const rebuildHistoryFromSessions = useCallback((sessions) => {
    const historyMap = {};

    sessions.forEach(hit => {
      const dateStr = new Date(hit.timestamp).toISOString().split('T')[0];
      if (!historyMap[dateStr]) {
        historyMap[dateStr] = { date: dateStr, count: 0, strainId: null, note: "" };
      }
      historyMap[dateStr].count++;
      // Verwende die letzte strain ID des Tages
      if (hit.strainId) historyMap[dateStr].strainId = hit.strainId;
    });

    // Behalte Notizen aus bestehendem historyData
    const result = Object.values(historyMap).map(day => {
      const existing = historyData.find(h => h.date === day.date);
      return { ...day, note: existing?.note || "" };
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [historyData]);

  // **FIX v8.9.3**: Auto-Rebuild historyData aus sessionHits beim App-Start
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    // Einmaliger Rebuild beim ersten Mount wenn sessionHits vorhanden
    if (!hasInitializedRef.current && sessionHits && sessionHits.length > 0) {
      const rebuiltHistory = rebuildHistoryFromSessions(sessionHits);
      // Rebuild nur wenn historyData leer oder veraltet ist
      if (historyData.length === 0 || rebuiltHistory.length !== historyData.length) {
        console.log('🔄 Auto-Rebuild: historyData aus sessionHits aktualisiert');
        setHistoryData(rebuiltHistory);
      }
      hasInitializedRef.current = true;
    }
  }, [sessionHits, historyData, rebuildHistoryFromSessions, setHistoryData]);

  // **FIX v8.9.2**: Automatische Testdaten entfernt - nur manuell in Einstellungen

  // **NEW**: Session-System - zählt Hits des heutigen Tages, reset bei Tageswechsel
  const [sessionHitsCount, setSessionHitsCount] = useState(() => {
    const saved = localStorage.getItem('sessionHitsCount');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [sessionDate, setSessionDate] = useState(() => {
    const saved = localStorage.getItem('sessionDate');
    const currentDate = new Date().toDateString();
    // **FIX**: Persistiere initialen Wert sofort
    if (!saved) {
      localStorage.setItem('sessionDate', currentDate);
    }
    return saved || currentDate;
  });

  // **FIX**: Initialer Tageswechsel-Check beim App-Start
  useEffect(() => {
    const storedDate = localStorage.getItem('sessionDate');
    const currentDate = new Date().toDateString();

    if (storedDate && storedDate !== currentDate) {
      console.log('📅 Tageswechsel beim Start erkannt - Session zurückgesetzt');
      setSessionHitsCount(0);
      setSessionDate(currentDate);
      localStorage.setItem('sessionHitsCount', '0');
      localStorage.setItem('sessionDate', currentDate);
    }
  }, []); // Einmalig beim Mount

  // Auto-Reset bei Tageswechsel
  useEffect(() => {
    const checkDayChange = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== sessionDate) {
        console.log('📅 Tageswechsel erkannt - Session zurückgesetzt');
        setSessionHitsCount(0);
        setSessionDate(currentDate);
        localStorage.setItem('sessionHitsCount', '0');
        localStorage.setItem('sessionDate', currentDate);
      }
    }, 60000); // Prüfe jede Minute

    return () => clearInterval(checkDayChange);
  }, [sessionDate]);

  // Persistiere sessionHitsCount
  useEffect(() => {
    localStorage.setItem('sessionHitsCount', String(sessionHitsCount));
  }, [sessionHitsCount]);

  // Load persisted strain ID from localStorage, fallback to first strain
  const [currentStrainId, setCurrentStrainId] = useState(() => {
    const saved = localStorage.getItem('currentStrainId');
    return saved ? parseInt(saved, 10) : (settings.strains[0]?.id || 0);
  });

  // Persist currentStrainId whenever it changes
  useEffect(() => {
    localStorage.setItem('currentStrainId', String(currentStrainId));
  }, [currentStrainId]);

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestHits, setGuestHits] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false); // v7.0: Sensor-Modus als Standard (kein Demo)
  const [selectedSession, setSelectedSession] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isManuallyHolding, setIsManuallyHolding] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  // **FIX v8.9**: Auto-Backup mit sessionHits (primäre Quelle)
  useAutoBackup(settings, historyData, sessionHits, goals);

  // **FIX v8.9**: Recovery Handler mit sessionHits und Auto-Sync
  const handleDataRestore = useCallback((backupData) => {
    try {
      if (backupData.settings) setSettings(backupData.settings);
      if (backupData.sessionHits) {
        setSessionHits(backupData.sessionHits);
        // Auto-Sync: Rebuild historyData aus sessionHits
        const rebuiltHistory = rebuildHistoryFromSessions(backupData.sessionHits);
        setHistoryData(rebuiltHistory);
      } else if (backupData.historyData) {
        // Fallback für alte Backups ohne sessionHits
        setHistoryData(backupData.historyData);
      }
      if (backupData.goals) setGoals(backupData.goals);

      setShowRecovery(false);
      setNotification({ type: 'success', msg: '✅ Daten erfolgreich wiederhergestellt!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', msg: '❌ Wiederherstellung fehlgeschlagen!' });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [setSettings, setSessionHits, setHistoryData, setGoals, setNotification, rebuildHistoryFromSessions]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate !== todayStr) { setManualOffset(0); setLastActiveDate(todayStr); }
  }, [lastActiveDate, setLastActiveDate, setManualOffset]);

  // Use Hit Management Hook
  const {
    registerHit,
    resetGuestHits,
    deleteHit,
    deleteHits
  } = useHitManagement({
    isGuestMode,
    setGuestHits,
    currentStrainId,
    settings,
    sessionHits,
    setSessionHits,
    rebuildHistoryFromSessions,
    setHistoryData,
    setManualOffset,
    setSessionHitsCount,
    setLastHitTime,
    goals,
    setNotification
  });

  // Use ESP32 Polling Hook
  const {
    connected,
    setConnected,
    liveData,
    lastError,
    isSensorInhaling,
    connectionLog,
    flameHistory,
    errorCount
  } = useESP32Polling({
    isSimulating,
    ip,
    manualOffset,
    isManuallyHolding,
    errorCount: 0,
    settings,
    currentStrainId,
    rebuildHistoryFromSessions,
    setSessionHits,
    setHistoryData,
    setNotification,
    registerHitCallback: registerHit
  });

  // Low-Battery Warning (v7.1)
  const [lowBatteryWarningShown, setLowBatteryWarningShown] = useState(false);
  useEffect(() => {
    if (liveData.batteryPercent !== null && liveData.batteryPercent < 20 && !lowBatteryWarningShown && connected) {
      setNotification({
        type: 'warning',
        message: '⚠️ Akku niedrig - bitte aufladen!',
        icon: () => <span className="text-amber-500">🔋</span>
      });
      setTimeout(() => setNotification(null), 5000);
      setLowBatteryWarningShown(true);
    }
    // Reset warning wenn Akku wieder über 20%
    if (liveData.batteryPercent !== null && liveData.batteryPercent >= 30) {
      setLowBatteryWarningShown(false);
    }
  }, [liveData.batteryPercent, lowBatteryWarningShown, connected]);

  // **FIX v8.9**: Context mit sessionHits/setSessionHits
  // **NEW**: sessionHitsCount hinzugefügt
  const ctx = useMemo(() => ({
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    goals, setGoals, lastHitTime, sessionHitsCount,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits, resetGuestHits, deleteHit, deleteHits,
    connected, setConnected, isSimulating, setIsSimulating, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    connectionLog, flameHistory, errorCount, isManuallyHolding,
    showRecovery, setShowRecovery, handleDataRestore,
    onManualTrigger: (d) => registerHit(true, d),
    onHoldStart: () => setIsManuallyHolding(true),
    onHoldEnd: () => setIsManuallyHolding(false)
  }), [
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    goals, setGoals, lastHitTime, sessionHitsCount,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits, resetGuestHits, deleteHit, deleteHits,
    connected, setConnected, isSimulating, setIsSimulating, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    connectionLog, flameHistory, errorCount, isManuallyHolding,
    showRecovery, setShowRecovery, handleDataRestore, registerHit
  ]);

  return <AppLayout ctx={ctx} />;
}