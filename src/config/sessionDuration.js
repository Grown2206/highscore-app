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
// WICHTIG: Diese Werte müssen innerhalb der globalen Limits liegen:
//   MIN_SESSION_DURATION_MS <= MIN_DURATION_SLIDER_MAX <= MAX_SESSION_DURATION_MS
//   MIN_SESSION_DURATION_MS <= MAX_DURATION_SLIDER_MIN <= MAX_SESSION_DURATION_MS
export const MIN_DURATION_SLIDER_MAX = 2000;  // Obere Grenze für Min-Dauer Slider
export const MAX_DURATION_SLIDER_MIN = 1000;  // Untere Grenze für Max-Dauer Slider

// **FIX v8.6**: Validation helpers to reduce repetition
/**
 * Asserts that a value is within a given range [min, max]
 * @param {string} name - Name of the constant being validated
 * @param {number} value - Value to check
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @throws {Error} If value is outside the range
 */
function assertInRange(name, value, min, max) {
  if (value < min || value > max) {
    throw new Error(`${name} (${value}) must be between ${min} and ${max}`);
  }
}

/**
 * Asserts that firstValue < secondValue
 * @param {string} firstName - Name of first constant
 * @param {number} firstValue - First value
 * @param {string} secondName - Name of second constant
 * @param {number} secondValue - Second value
 * @throws {Error} If firstValue >= secondValue
 */
function assertLessThan(firstName, firstValue, secondName, secondValue) {
  if (firstValue >= secondValue) {
    throw new Error(`${firstName} (${firstValue}) must be less than ${secondName} (${secondValue})`);
  }
}

// **FIX v8.5**: Validierung der Slider-Ranges zur Laufzeit
assertInRange('MIN_DURATION_SLIDER_MAX', MIN_DURATION_SLIDER_MAX, MIN_SESSION_DURATION_MS, MAX_SESSION_DURATION_MS);
assertInRange('MAX_DURATION_SLIDER_MIN', MAX_DURATION_SLIDER_MIN, MIN_SESSION_DURATION_MS, MAX_SESSION_DURATION_MS);
assertInRange('DEFAULT_MIN_SESSION_DURATION_MS', DEFAULT_MIN_SESSION_DURATION_MS, MIN_SESSION_DURATION_MS, MAX_SESSION_DURATION_MS);
assertInRange('DEFAULT_MAX_SESSION_DURATION_MS', DEFAULT_MAX_SESSION_DURATION_MS, MIN_SESSION_DURATION_MS, MAX_SESSION_DURATION_MS);
assertLessThan('DEFAULT_MIN_SESSION_DURATION_MS', DEFAULT_MIN_SESSION_DURATION_MS, 'DEFAULT_MAX_SESSION_DURATION_MS', DEFAULT_MAX_SESSION_DURATION_MS);

