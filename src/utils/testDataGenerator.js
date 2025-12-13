/**
 * Utility zum Generieren von realistischen Testdaten für die High Score App
 */

export function generateTestData(days = 30, settings) {
  const sessionHits = [];
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

    let hitsToday = 0;
    if (!skipDay) {
      // Wochenende tendenziell mehr Sessions
      const baseHits = isWeekend ? 5 : 4;
      hitsToday = Math.max(1, Math.floor(baseHits + (Math.random() * 5) - 2));
    }

    // Generiere Sessions für diesen Tag
    const sessions = [];
    for (let i = 0; i < hitsToday; i++) {
      // Realistische Tageszeiten (Morgen bis Nacht)
      let hour, minute;

      if (i === 0) {
        // Erste Session: 10-14 Uhr
        hour = 10 + Math.floor(Math.random() * 4);
        minute = Math.floor(Math.random() * 60);
      } else if (i === hitsToday - 1) {
        // Letzte Session: 20-23 Uhr
        hour = 20 + Math.floor(Math.random() * 3);
        minute = Math.floor(Math.random() * 60);
      } else {
        // Dazwischen: 15-20 Uhr
        hour = 15 + Math.floor(Math.random() * 5);
        minute = Math.floor(Math.random() * 60);
      }

      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, Math.floor(Math.random() * 60));

      // Zufällige Sorte
      const strain = strains[Math.floor(Math.random() * strains.length)];

      // Realistische Inhalationsdauer (2-8 Sekunden)
      const duration = (2000 + Math.random() * 6000);

      sessions.push({
        id: `test_${dayOffset}_${i}_${Date.now()}`,
        timestamp: timestamp.getTime(),
        strainName: strain.name,
        strainPrice: strain.price,
        strainThc: strain.thc,
        duration: duration,
        type: 'manual' // oder 'sensor'
      });
    }

    // Sortiere Sessions nach Zeit
    sessions.sort((a, b) => a.timestamp - b.timestamp);
    sessionHits.push(...sessions);

    // History-Eintrag für diesen Tag
    if (hitsToday > 0) {
      historyData.push({
        date: dateStr,
        count: hitsToday,
        note: getRandomNote(hitsToday, isWeekend)
      });
    }
  }

  return {
    sessionHits: sessionHits.sort((a, b) => a.timestamp - b.timestamp),
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
 * Fügt Testdaten zu bestehenden Daten hinzu (ohne Duplikate)
 */
export function mergeTestData(existing, testData) {
  const existingIds = new Set(existing.sessionHits.map(h => h.id));
  const newSessionHits = [
    ...existing.sessionHits,
    ...testData.sessionHits.filter(h => !existingIds.has(h.id))
  ].sort((a, b) => a.timestamp - b.timestamp);

  const existingDates = new Set(existing.historyData.map(h => h.date));
  const mergedHistoryData = [...existing.historyData];

  testData.historyData.forEach(newDay => {
    const existingDay = mergedHistoryData.find(d => d.date === newDay.date);
    if (existingDay) {
      // Update count wenn nötig
      const actualCount = newSessionHits.filter(h => {
        const hitDate = new Date(h.timestamp).toISOString().split('T')[0];
        return hitDate === newDay.date;
      }).length;
      existingDay.count = actualCount;
    } else {
      mergedHistoryData.push(newDay);
    }
  });

  return {
    sessionHits: newSessionHits,
    historyData: mergedHistoryData.sort((a, b) => a.date.localeCompare(b.date))
  };
}

/**
 * Löscht alle Testdaten (IDs die mit "test_" beginnen)
 */
export function removeTestData(sessionHits, historyData) {
  // FIX: ID kann Number oder String sein, konvertiere zu String
  const cleanedSessionHits = sessionHits.filter(h => !String(h.id).startsWith('test_'));

  // Aktualisiere History-Counts
  const historyMap = {};
  cleanedSessionHits.forEach(hit => {
    const date = new Date(hit.timestamp).toISOString().split('T')[0];
    historyMap[date] = (historyMap[date] || 0) + 1;
  });

  const cleanedHistoryData = historyData.map(day => ({
    ...day,
    count: historyMap[day.date] || 0
  })).filter(day => day.count > 0 || day.note);

  return {
    sessionHits: cleanedSessionHits,
    historyData: cleanedHistoryData
  };
}
