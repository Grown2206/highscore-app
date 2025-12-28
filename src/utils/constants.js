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

// localStorage Keys (Active Schema v6-v8)
// NOTE: Schema v6 is used across versions 6.0-8.0 without breaking changes
export const STORAGE_KEYS = {
  SETTINGS: 'hs_settings_v6',
  HISTORY: 'hs_history_v6',
  SESSION_HITS: 'hs_session_hits_v6',
  GOALS: 'hs_goals_v6',
  LAST_DATE: 'hs_last_date',
  OFFSET: 'hs_offset',
  LAST_HIT_TS: 'hs_last_hit_ts',
  DEVICE_IP: 'hs_device_ip',
  BADGE_HISTORY: 'hs_badge_history_v7', // Badge unlock timestamps
};

// Legacy Keys (Deprecated - for cleanup only)
// These keys are no longer actively used but may need to be removed during data resets
export const LEGACY_KEYS = {
  ACHIEVEMENTS_V6: 'hs_achievements_v6', // Deprecated in v7.0, removed in v8.0
};

// App Version
export const APP_VERSION = '8.0.0';
