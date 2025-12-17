/**
 * Zentrale App-Konfiguration und Konstanten
 * Single source of truth für Default-Werte und Storage-Keys
 */

// Default Settings für die App
export const DEFAULT_SETTINGS = {
  bowlSize: 0.3,
  weedRatio: 80,
  triggerThreshold: 50,
};

// localStorage Keys (Version 6)
export const STORAGE_KEYS = {
  SETTINGS: 'hs_settings_v6',
  HISTORY: 'hs_history_v6',
  SESSION_HITS: 'hs_session_hits_v6',
  ACHIEVEMENTS: 'hs_achievements_v6',
  GOALS: 'hs_goals_v6',
  LAST_DATE: 'hs_last_date',
  OFFSET: 'hs_offset',
  LAST_HIT_TS: 'hs_last_hit_ts',
  DEVICE_IP: 'hs_device_ip',
};

// App Version
export const APP_VERSION = '7.0.0';
