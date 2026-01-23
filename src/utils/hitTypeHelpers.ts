/**
 * Centralized Hit Type Definitions and Helpers
 *
 * This module provides:
 * - Type-safe constants for hit types
 * - Helper functions for styling and labeling
 * - Consistent type handling across components
 */

// Hit Type Constants
export const HIT_TYPES = {
  OFFLINE: 'Offline',
  SENSOR: 'Sensor',
  MANUAL: 'Manuell',
} as const;

export type HitType = typeof HIT_TYPES[keyof typeof HIT_TYPES];

// Type guard for runtime validation
export function isValidHitType(type: string): type is HitType {
  return Object.values(HIT_TYPES).includes(type as HitType);
}

// Label Helper
export function getHitTypeLabel(type: string): string {
  switch (type) {
    case HIT_TYPES.OFFLINE:
      return 'Offline (ESP32)';
    case HIT_TYPES.SENSOR:
      return 'Sensor';
    case HIT_TYPES.MANUAL:
      return 'Manuell';
    default:
      return 'Unbekannt';
  }
}

// Style Helper for Session Details Modal
export interface HitTypeStyle {
  backgroundColor: string;
  color: string;
  borderColor: string;
}

export function getHitTypeStyle(type: string): HitTypeStyle {
  switch (type) {
    case HIT_TYPES.OFFLINE:
      return {
        backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)',
        color: 'var(--accent-warning)',
        borderColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
      };
    case HIT_TYPES.SENSOR:
      return {
        backgroundColor: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
        color: 'var(--accent-success)',
        borderColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
      };
    case HIT_TYPES.MANUAL:
    default:
      return {
        backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)',
        color: 'var(--accent-info)',
        borderColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)',
      };
  }
}

// Badge Style Helper for Hit Rows
export interface BadgeStyle {
  backgroundColor: string;
  color: string;
  borderColor: string;
  text: string;
  title: string;
}

export function getOfflineBadgeStyle(): BadgeStyle {
  return {
    backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)',
    color: 'var(--accent-warning)',
    borderColor: 'color-mix(in srgb, var(--accent-warning) 30%, transparent)',
    text: 'OFFLINE',
    title: 'Offline vom ESP32 synchronisiert',
  };
}
