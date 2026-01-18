import { useCallback, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';

/**
 * Custom Hook für Hit Management
 *
 * Verwaltet:
 * - Hit Registration (manuell & sensor)
 * - Hit Deletion (einzeln & batch)
 * - Auto-Sync mit historyData
 * - Guest Mode Handling
 * - Daily Limit Notifications
 */
export function useHitManagement({
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
}) {
  const cooldownUntilRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  // **FIX v8.9**: registerHit - sessionHits als Primärquelle, historyData wird auto-synchronisiert
  const registerHit = useCallback((isManual, duration) => {
    const now = Date.now();
    setLastHitTime(now);

    // Cooldown setzen: 3 Sekunden nach Hit (angepasst an Flame Sensor)
    if (!isManual) {
      cooldownUntilRef.current = now + 3000; // 3 Sekunden Cooldown
      hasTriggeredRef.current = false; // Reset Trigger-Flag
    }

    if (isGuestMode) {
      setGuestHits(p => p + 1);
      return;
    }

    const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || { name: '?', price: 0 };

    // Erstelle Hit-Objekt mit allen Details (inkl. Settings für historische Genauigkeit)
    const newHit = {
      id: now,
      timestamp: now,
      type: isManual ? 'Manuell' : 'Sensor',
      strainName: strain.name,
      strainPrice: strain.price,
      strainId: strain.id,
      duration: duration || 0,
      bowlSize: settings.bowlSize,
      weedRatio: settings.weedRatio
    };

    // Update sessionHits (primäre Quelle)
    const updatedSessionHits = [newHit, ...sessionHits];
    setSessionHits(updatedSessionHits);

    // Auto-Sync: Rebuild historyData aus sessionHits
    const updatedHistoryData = rebuildHistoryFromSessions(updatedSessionHits);
    setHistoryData(updatedHistoryData);
    setManualOffset(p => p + 1);

    // **NEW**: Erhöhe Session-Counter
    setSessionHitsCount(p => p + 1);

    // Check Daily Limit Goal
    const todayStr = new Date().toISOString().split('T')[0];
    const todayData = updatedHistoryData.find(d => d.date === todayStr);
    const todayCount = todayData ? todayData.count : 0;

    if (goals.dailyLimit > 0 && todayCount >= goals.dailyLimit) {
      setNotification({
        type: 'warning',
        message: `Tägliches Limit erreicht! (${goals.dailyLimit} Hits)`,
        icon: Bell
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [isGuestMode, setGuestHits, currentStrainId, settings, sessionHits, setSessionHits, rebuildHistoryFromSessions, setHistoryData, setManualOffset, setSessionHitsCount, setLastHitTime, goals, setNotification]);

  // GÄSTE-MODUS: Reset Funktion
  const resetGuestHits = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(50);
    setGuestHits(0);
    console.log('🔄 Gäste-Hits zurückgesetzt');
  }, [setGuestHits]);

  // **FIX v8.9**: DELETE HIT - Lösche aus sessionHits, historyData wird auto-synchronisiert
  const deleteHit = useCallback((hitId) => {
    if (!window.confirm('Diesen Hit wirklich löschen?')) return;

    // Lösche aus sessionHits
    const updatedSessionHits = sessionHits.filter(h => h.id !== hitId);
    setSessionHits(updatedSessionHits);

    // Auto-Sync: Rebuild historyData aus sessionHits
    const updatedHistoryData = rebuildHistoryFromSessions(updatedSessionHits);
    setHistoryData(updatedHistoryData);

    setNotification({
      type: 'success',
      message: '✅ Hit gelöscht - Diagramme aktualisiert',
      icon: Trash2
    });
    setTimeout(() => setNotification(null), 2000);
    console.log('🗑️ Hit gelöscht:', hitId);
  }, [sessionHits, setSessionHits, rebuildHistoryFromSessions, setHistoryData, setNotification]);

  // **NEW v8.8**: DELETE MULTIPLE HITS - Batch delete without per-hit confirmation
  const deleteHits = useCallback((hitIds) => {
    // Lösche alle Hits in einem Batch
    const hitIdSet = new Set(hitIds);
    const updatedSessionHits = sessionHits.filter(h => !hitIdSet.has(h.id));
    setSessionHits(updatedSessionHits);

    // Auto-Sync: Rebuild historyData aus sessionHits
    const updatedHistoryData = rebuildHistoryFromSessions(updatedSessionHits);
    setHistoryData(updatedHistoryData);

    setNotification({
      type: 'success',
      message: `✅ ${hitIds.length} Hit(s) gelöscht`,
      icon: Trash2
    });
    setTimeout(() => setNotification(null), 2000);
    console.log(`🗑️ ${hitIds.length} Hits gelöscht:`, hitIds);
  }, [sessionHits, setSessionHits, rebuildHistoryFromSessions, setHistoryData, setNotification]);

  return {
    registerHit,
    resetGuestHits,
    deleteHit,
    deleteHits,
    cooldownUntilRef,
    hasTriggeredRef
  };
}
