/**
 * AUTO-BACKUP SYSTEM
 * Automatisches Speichern und Wiederherstellen von Daten
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { STORAGE_KEYS } from './constants';

/**
 * Erstelle automatisches Backup der wichtigen Daten
 */
export async function createAutoBackup(data) {
  try {
    const timestamp = Date.now();
    const backupData = {
      timestamp,
      version: '8.9',
      data: {
        settings: data.settings,
        historyData: data.historyData,
        sessionHits: data.sessionHits,
        goals: data.goals,
      }
    };

    // 1. Redundantes localStorage Backup (3 Slots rotierend)
    const currentSlot = Math.floor(timestamp / (1000 * 60 * 5)) % 3; // Alle 5 Minuten, 3 Slots
    localStorage.setItem(`hs_backup_slot_${currentSlot}`, JSON.stringify(backupData));
    localStorage.setItem('hs_last_backup_time', timestamp.toString());

    // 2. Capacitor Filesystem Backup (für Android/iOS)
    if (isNativePlatform()) {
      await saveToFilesystem(backupData);
    }

    console.log('✅ Auto-Backup erstellt:', new Date(timestamp).toLocaleString());
    return true;
  } catch (error) {
    console.error('❌ Auto-Backup fehlgeschlagen:', error);
    return false;
  }
}

/**
 * Lade letztes verfügbares Backup
 */
export async function loadLatestBackup() {
  try {
    let latestBackup = null;
    let latestTimestamp = 0;

    // 1. Prüfe alle localStorage Backup-Slots
    for (let i = 0; i < 3; i++) {
      const slotData = localStorage.getItem(`hs_backup_slot_${i}`);
      if (slotData) {
        try {
          const backup = JSON.parse(slotData);
          if (backup.timestamp > latestTimestamp) {
            latestBackup = backup;
            latestTimestamp = backup.timestamp;
          }
        } catch (e) {
          console.warn(`Backup Slot ${i} korrupt, überspringe...`);
        }
      }
    }

    // 2. Prüfe Filesystem Backup (Native Platform)
    if (isNativePlatform()) {
      const filesystemBackup = await loadFromFilesystem();
      if (filesystemBackup && filesystemBackup.timestamp > latestTimestamp) {
        latestBackup = filesystemBackup;
        latestTimestamp = filesystemBackup.timestamp;
      }
    }

    if (latestBackup) {
      console.log('✅ Backup gefunden:', new Date(latestTimestamp).toLocaleString());
      return latestBackup.data;
    }

    return null;
  } catch (error) {
    console.error('❌ Backup-Laden fehlgeschlagen:', error);
    return null;
  }
}

/**
 * Speichere Backup auf Gerät (Android/iOS)
 */
async function saveToFilesystem(backupData) {
  try {
    const filename = 'highscore_auto_backup.json';
    const content = JSON.stringify(backupData, null, 2);

    await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Data,
      encoding: 'utf8'
    });

    console.log('✅ Filesystem Backup gespeichert');
    return true;
  } catch (error) {
    console.error('❌ Filesystem Backup fehlgeschlagen:', error);
    return false;
  }
}

/**
 * Lade Backup vom Gerät
 */
async function loadFromFilesystem() {
  try {
    const filename = 'highscore_auto_backup.json';

    const result = await Filesystem.readFile({
      path: filename,
      directory: Directory.Data,
      encoding: 'utf8'
    });

    const backup = JSON.parse(result.data);
    console.log('✅ Filesystem Backup geladen');
    return backup;
  } catch (error) {
    // Kein Backup vorhanden (normal beim ersten Start)
    return null;
  }
}

/**
 * **FIX v8.9**: Prüfe ob Daten intakt sind (mit sessionHits)
 */
export function validateData(data) {
  try {
    // Prüfe kritische Keys
    const hasSettings = data.settings && typeof data.settings === 'object';
    const hasHistory = Array.isArray(data.historyData);
    const hasSessions = Array.isArray(data.sessionHits);

    return hasSettings && (hasHistory || hasSessions);
  } catch (error) {
    return false;
  }
}

/**
 * Prüfe ob wir auf nativer Platform laufen
 */
function isNativePlatform() {
  // Capacitor ist verfügbar und nicht im Browser
  return typeof window !== 'undefined' &&
         window.Capacitor &&
         window.Capacitor.isNativePlatform &&
         window.Capacitor.isNativePlatform();
}

/**
 * Erstelle Export-Datei für manuelles Backup
 */
export async function exportToDevice(data) {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `highscore-backup-${timestamp}.json`;

    const exportData = {
      version: '7.0',
      exportDate: new Date().toISOString(),
      ...data
    };

    const content = JSON.stringify(exportData, null, 2);

    if (isNativePlatform()) {
      // Native: Speichere in Documents
      await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        encoding: 'utf8'
      });

      return { success: true, path: Directory.Documents, filename };
    } else {
      // Browser: Download
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      return { success: true, type: 'download', filename };
    }
  } catch (error) {
    console.error('❌ Export fehlgeschlagen:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Recovery: Versuche Daten aus allen Quellen zu laden
 */
export async function attemptDataRecovery() {
  const sources = [];

  // **FIX v8.9**: localStorage Haupt-Daten mit sessionHits
  try {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null');
    const historyData = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    const sessionHits = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_HITS) || '[]');
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || 'null');

    if (settings && (historyData.length > 0 || sessionHits.length > 0)) {
      sources.push({
        source: 'localStorage (Primary)',
        timestamp: Date.now(),
        data: { settings, historyData, sessionHits, goals }
      });
    }
  } catch (e) {
    console.warn('localStorage Primary korrupt');
  }

  // 2. Backup Slots
  const backup = await loadLatestBackup();
  if (backup) {
    sources.push({
      source: 'Auto-Backup',
      timestamp: backup.timestamp || Date.now(),
      data: backup
    });
  }

  // Sortiere nach Timestamp (neueste zuerst)
  sources.sort((a, b) => b.timestamp - a.timestamp);

  return sources;
}

/**
 * Lösche alte Backups (Speicherplatz-Management)
 */
export async function cleanupOldBackups() {
  try {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 Tage

    // Prüfe localStorage Backups
    for (let i = 0; i < 3; i++) {
      const slotKey = `hs_backup_slot_${i}`;
      const slotData = localStorage.getItem(slotKey);

      if (slotData) {
        try {
          const backup = JSON.parse(slotData);
          if (now - backup.timestamp > maxAge) {
            localStorage.removeItem(slotKey);
            console.log(`🗑️ Altes Backup gelöscht: Slot ${i}`);
          }
        } catch (e) {
          // Korruptes Backup → löschen
          localStorage.removeItem(slotKey);
        }
      }
    }

    console.log('✅ Backup-Cleanup abgeschlossen');
  } catch (error) {
    console.error('❌ Backup-Cleanup fehlgeschlagen:', error);
  }
}
