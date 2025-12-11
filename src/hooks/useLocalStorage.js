import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  // State initialisieren
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Fehler beim Lesen aus LocalStorage:", error);
      return initialValue;
    }
  });

  // Setter Funktion (wie setState, aber speichert auch)
  const setValue = (value) => {
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