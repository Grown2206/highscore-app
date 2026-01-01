/**
 * **FIX v8.8.1**: Utility zum Generieren von Testdaten - NUR historyData
 * Entfernt: sessionHits komplett
 */

export function generateTestData(days = 30, settings) {
  const historyData = [];
  const strains = settings?.strains || [
    { id: 1, name: "Lemon Haze", price: 10, thc: 22 },
    { id: 2, name: "Northern Lights", price: 12, thc: 18 },
    { id: 3, name: "Blue Dream", price: 11, thc: 20 }
  ];

  const now = new Date();

  // Generiere Daten für die letzten X Tage
  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split('T')[0];

    // Zufällige Anzahl an Hits pro Tag (0-12, mit Tendenz zu 3-7)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Manche Tage haben keine Sessions (T-Break)
    const skipDay = Math.random() < 0.15; // 15% Chance für Pause

    // **FIX v8.8.1**: Nur noch Hit-Count, keine einzelnen Sessions mehr
    let hitsToday = 0;
    if (!skipDay) {
      // Wochenende tendenziell mehr Sessions
      const baseHits = isWeekend ? 5 : 4;
      hitsToday = Math.max(1, Math.floor(baseHits + (Math.random() * 5) - 2));
    }

    // History-Eintrag für diesen Tag (nur Count, keine Details)
    if (hitsToday > 0) {
      historyData.push({
        date: dateStr,
        count: hitsToday,
        note: getRandomNote(hitsToday, isWeekend)
      });
    }
  }

  return {
    historyData
  };
}

function getRandomNote(hits, isWeekend) {
  const notes = [
    "",
    "",
    "", // Meistens keine Notiz
    "Guter Tag 👍",
    "Entspannter Abend",
    "Mit Freunden",
    "Sehr chillig",
    "Kreativ gewesen",
    "Produktiv trotzdem",
    isWeekend ? "Wochenende genießen" : "Nach der Arbeit",
    hits > 7 ? "Vielleicht etwas viel..." : "Perfekte Menge"
  ];

  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * **FIX v8.8.1**: Fügt Testdaten hinzu - nur historyData
 */
export function mergeTestData(existing, testData) {
  const mergedHistoryData = [...existing.historyData];

  testData.historyData.forEach(newDay => {
    const existingDay = mergedHistoryData.find(d => d.date === newDay.date);
    if (existingDay) {
      // Addiere Counts
      existingDay.count += newDay.count;
    } else {
      mergedHistoryData.push(newDay);
    }
  });

  return {
    historyData: mergedHistoryData.sort((a, b) => a.date.localeCompare(b.date))
  };
}

/**
 * **FIX v8.8.1**: Löscht alle Testdaten - setzt historyData zurück
 */
export function removeTestData(historyData) {
  // Da wir keine Hit-IDs mehr haben, entfernen wir einfach alles
  // (Echte Daten würden vom ESP32 neu synchronisiert werden)
  return {
    historyData: []
  };
}
