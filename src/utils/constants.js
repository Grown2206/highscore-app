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

// **FIX v8.9.3**: Timestamp Validation Constants for Corrupt Hit Detection
// These define the acceptable range for hit timestamps
export const TIMESTAMP_VALIDATION = {
  // Minimum year for valid hits (data before this is likely corrupt)
  // Set to 2015 to allow some historical data while catching obvious errors
  MIN_VALID_YEAR: 2015,

  // Maximum future offset in milliseconds (1 year = 365.25 days)
  // Allows for some clock skew while catching obviously wrong future dates
  // Using Math.round to ensure integer value and avoid floating-point precision issues
  MAX_FUTURE_OFFSET_MS: Math.round(365.25 * 24 * 60 * 60 * 1000),

  // Precomputed minimum timestamp for performance (computed once at module initialization)
  // Using Date constructor with numeric arguments to avoid timezone-dependent string parsing
  get MIN_VALID_TIMESTAMP_MS() {
    return new Date(this.MIN_VALID_YEAR, 0, 1).getTime();
  },
};
