/**
 * **FIX v8.8.1**: useAutoBackup Hook ohne sessionHits
 * Automatisches Backup bei Datenänderungen
 */

import { useEffect, useRef } from 'react';
import { createAutoBackup, cleanupOldBackups } from '../utils/autoBackup';

export function useAutoBackup(settings, historyData, goals) {
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
  }, [settings, historyData, goals]);

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
          version: '8.8',
          data: { settings, historyData, goals }
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
  }, [settings, historyData, goals]);

  // Visibility Change: Backup wenn App in Hintergrund geht
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App geht in Hintergrund → Backup erstellen
        await createAutoBackup({
          settings,
          historyData,
          goals
        });
        console.log('✅ Background Backup erstellt');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings, historyData, goals]);
}
