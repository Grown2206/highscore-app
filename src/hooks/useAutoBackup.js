/**
 * **FIX v8.9**: useAutoBackup Hook mit sessionHits als primäre Quelle
 * Automatisches Backup bei Datenänderungen
 */

import { useEffect, useRef } from 'react';
import { createAutoBackup, cleanupOldBackups } from '../utils/autoBackup';

export function useAutoBackup(settings, historyData, sessionHits, goals) {
  const lastBackupRef = useRef(0);
  const backupTimeoutRef = useRef(null);

  useEffect(() => {
    // Debounced Backup: Warte 5 Sekunden nach letzter Änderung
    const performBackup = async () => {
      const now = Date.now();
      const timeSinceLastBackup = now - lastBackupRef.current;

      // Backup nur alle 5 Minuten (außer bei wichtigen Änderungen)
      if (timeSinceLastBackup < 5 * 60 * 1000) {
        return;
      }

      const success = await createAutoBackup({
        settings,
        historyData,
        sessionHits,
        goals
      });

      if (success) {
        lastBackupRef.current = now;
      }
    };

    // Debounce: Führe Backup 5 Sekunden nach letzter Änderung aus
    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
    }

    backupTimeoutRef.current = setTimeout(performBackup, 5000);

    return () => {
      if (backupTimeoutRef.current) {
        clearTimeout(backupTimeoutRef.current);
      }
    };
  }, [settings, historyData, sessionHits, goals]);

  // Cleanup alte Backups beim Mount
  useEffect(() => {
    cleanupOldBackups();
  }, []);

  // beforeunload: Backup beim Schließen
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Synchrones Backup für beforeunload
      try {
        const backupData = {
          timestamp: Date.now(),
          version: '8.9',
          data: { settings, historyData, sessionHits, goals }
        };

        // Speichere in localStorage (synchron)
        localStorage.setItem('hs_emergency_backup', JSON.stringify(backupData));
        console.log('✅ Emergency Backup erstellt');
      } catch (error) {
        console.error('❌ Emergency Backup fehlgeschlagen:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [settings, historyData, sessionHits, goals]);

  // Visibility Change: Backup wenn App in Hintergrund geht
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App geht in Hintergrund → Backup erstellen
        await createAutoBackup({
          settings,
          historyData,
          sessionHits,
          goals
        });
        console.log('✅ Background Backup erstellt');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings, historyData, sessionHits, goals]);
}
