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
// NOTE: v7.0 reuses the v6 storage schema - no breaking changes in data structure
export const STORAGE_KEYS = {
  SETTINGS: 'hs_settings_v6',
  HISTORY: 'hs_history_v6',
  SESSION_HITS: 'hs_session_hits_v6',

  /**
   * @deprecated since v7.0 - Achievement system replaced by Badge system
   * This key is kept only for cleanup of legacy data in SettingsView reset function.
   * Will be removed in v8.0 once migration period is complete.
   * Do NOT use this key for reading or writing new data.
   */
  ACHIEVEMENTS: 'hs_achievements_v6',

  GOALS: 'hs_goals_v6',
  LAST_DATE: 'hs_last_date',
  OFFSET: 'hs_offset',
  LAST_HIT_TS: 'hs_last_hit_ts',
  DEVICE_IP: 'hs_device_ip',
  BADGE_HISTORY: 'hs_badge_history_v7', // Badge unlock timestamps
};

// App Version
export const APP_VERSION = '7.0.0';
