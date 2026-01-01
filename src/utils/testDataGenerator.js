/**
 * **FIX v8.9**: Utility zum Generieren von Testdaten - sessionHits mit Details
 * sessionHits = primäre Quelle, historyData wird auto-synchronisiert in App.jsx
 */

export function generateTestData(days = 30, settings) {
  const sessionHits = [];
  const strains = settings?.strains || [
    { id: 1, name: "Lemon Haze", price: 10, thc: 22 },
    { id: 2, name: "Northern Lights", price: 12, thc: 18 },
    { id: 3, name: "Blue Dream", price: 11, thc: 20 }
  ];

  const now = Date.now();
  let idCounter = now;

  // Generiere Daten für die letzten X Tage
  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Manche Tage haben keine Sessions (T-Break)
    const skipDay = Math.random() < 0.15; // 15% Chance für Pause

    if (!skipDay) {
      // Wochenende tendenziell mehr Sessions
      const baseHits = isWeekend ? 5 : 4;
      const hitsToday = Math.max(1, Math.floor(baseHits + (Math.random() * 5) - 2));

      // Erstelle einzelne Hit-Objekte mit Details
      for (let i = 0; i < hitsToday; i++) {
        // Zufällige Uhrzeit zwischen 10:00 und 23:00
        const hour = 10 + Math.floor(Math.random() * 13);
        const minute = Math.floor(Math.random() * 60);
        const hitDate = new Date(date);
        hitDate.setHours(hour, minute, 0, 0);

        // Zufällige Sorte
        const strain = strains[Math.floor(Math.random() * strains.length)];

        // Zufällige Duration 2-8 Sekunden
        const duration = 2 + Math.floor(Math.random() * 6);

        sessionHits.push({
          id: `test_${idCounter++}`,
          timestamp: hitDate.getTime(),
          type: 'Sensor',
          strainName: strain.name,
          strainPrice: strain.price,
          strainId: strain.id,
          duration: duration
        });
      }
    }
  }

  // Sortiere chronologisch (neueste zuerst)
  sessionHits.sort((a, b) => b.timestamp - a.timestamp);

  return {
    sessionHits
  };
}

/**
 * **FIX v8.9**: Fügt Testdaten hinzu - sessionHits mergen
 */
export function mergeTestData(existing, testData) {
  // Merge sessionHits (primäre Quelle)
  const existingIds = new Set(existing.sessionHits?.map(h => h.id) || []);
  const newHits = testData.sessionHits.filter(h => !existingIds.has(h.id));
  const mergedSessionHits = [...newHits, ...(existing.sessionHits || [])];

  return {
    sessionHits: mergedSessionHits
  };
}

/**
 * **FIX v8.9**: Löscht alle Testdaten - entfernt test_ IDs
 */
export function removeTestData(sessionHits) {
  const cleaned = sessionHits.filter(h => !h.id.toString().startsWith('test_'));

  return {
    sessionHits: cleaned
  };
}
