/**
 * False Trigger Prevention - Session Duration Configuration
 *
 * WICHTIG: Diese Werte müssen mit den Konstanten in
 * esp32-firmware/highscore-sensor-c3.ino synchron bleiben!
 *
 * ESP32 Firmware Konstanten:
 * - MIN_SESSION_DURATION_MS = 100
 * - MAX_SESSION_DURATION_MS = 10000
 */

export const MIN_SESSION_DURATION_MS = 100;
export const MAX_SESSION_DURATION_MS = 10000;

// Default-Werte (entsprechen den Firmware-Defaults)
export const DEFAULT_MIN_SESSION_DURATION_MS = 800;
export const DEFAULT_MAX_SESSION_DURATION_MS = 4500;

// Slider-Ranges für bessere UX (Min-Slider: 100-2000ms, Max-Slider: 1000-10000ms)
export const MIN_DURATION_SLIDER_MAX = 2000;  // Obere Grenze für Min-Dauer Slider
export const MAX_DURATION_SLIDER_MIN = 1000;  // Untere Grenze für Max-Dauer Slider
