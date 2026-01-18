import { useState } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State initialisieren
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Fehler beim Lesen aus LocalStorage:", error);
      return initialValue;
    }
  });

  // Setter Funktion (wie setState, aber speichert auch)
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Fehler beim Schreiben in LocalStorage:", error);
    }
  };

  return [storedValue, setValue];
}
