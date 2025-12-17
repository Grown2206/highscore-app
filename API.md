# HIGH SCORE PRO - API Documentation

Diese Dokumentation beschreibt die REST API, die von der ESP32-Hardware bereitgestellt wird und von der HIGH SCORE PRO App genutzt wird.

---

## 📋 Übersicht

Die ESP32-Firmware stellt eine HTTP REST API über WiFi bereit. Die App kommuniziert mit dieser API, um Live-Daten zu empfangen und Befehle zu senden.

### Basis-Informationen

- **Protocol**: HTTP
- **Port**: 80 (Standard)
- **Format**: JSON
- **Base URL**: `http://[ESP32_IP]` (z.B. `http://192.168.4.1`)
- **Authentication**: Keine (optional implementierbar)

---

## 🔌 Endpoints

### 1. GET `/api/data`

Liefert Live-Daten für die Hauptansicht der App.

#### Request

```http
GET /api/data HTTP/1.1
Host: 192.168.4.1
```

#### Response

**Status**: `200 OK`

**Body** (ESP32 Standard - DHT22):
```json
{
  "temp": 23.5,
  "humidity": 45.2,
  "today": 5,
  "total": 127,
  "inhaling": false,
  "streak": 3,
  "longestStreak": 7,
  "lastSession": "14:32"
}
```

**Body** (ESP32-C3 - DS18B20):
```json
{
  "temp": 23.5,
  "today": 5,
  "total": 127,
  "inhaling": false,
  "streak": 3,
  "longestStreak": 7,
  "lastSession": "14:32"
}
```

#### Response Fields

| Field | Type | Description | Unit |
|-------|------|-------------|------|
| `temp` | float | Aktuelle Temperatur | °C |
| `humidity` | float | Luftfeuchtigkeit (nur DHT22) | % |
| `today` | int | Hits heute | - |
| `total` | int | Gesamte Hits | - |
| `inhaling` | boolean | Session aktiv? | - |
| `streak` | int | Aktuelle Streak (aufeinanderfolgende Tage) | Tage |
| `longestStreak` | int | Rekord-Streak | Tage |
| `lastSession` | string | Zeitpunkt der letzten Session | HH:MM |

#### Error Responses

```json
// 500 Internal Server Error
{
  "error": "Sensor read failed"
}
```

#### Usage in App

```javascript
async function fetchSensorData(ip) {
  try {
    const response = await fetch(`http://${ip}/api/data`);
    const data = await response.json();

    // Update UI with live data
    setTemperature(data.temp);
    setHumidity(data.humidity);
    setTodayHits(data.today);

    // Trigger session if inhaling
    if (data.inhaling) {
      startSession();
    }
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
  }
}

// Poll every 2 seconds
setInterval(() => fetchSensorData(deviceIP), 2000);
```

---

### 2. GET `/api/stats`

Liefert erweiterte Statistiken und Metadaten.

#### Request

```http
GET /api/stats HTTP/1.1
Host: 192.168.4.1
```

#### Response

**Status**: `200 OK`

**Body**:
```json
{
  "totalHits": 127,
  "todayHits": 5,
  "currentStreak": 3,
  "longestStreak": 7,
  "lastSessionDuration": 3500,
  "lastSessionTemp": 87.3,
  "lastSessionTime": "14:32",
  "uptime": 3600,
  "ip": "192.168.4.1",
  "ssid": "HighScore-Sensor"
}
```

#### Response Fields

| Field | Type | Description | Unit |
|-------|------|-------------|------|
| `totalHits` | int | Gesamte Hits seit Inbetriebnahme | - |
| `todayHits` | int | Hits heute | - |
| `currentStreak` | int | Aktuelle Streak | Tage |
| `longestStreak` | int | Rekord-Streak | Tage |
| `lastSessionDuration` | int | Dauer der letzten Session | ms |
| `lastSessionTemp` | float | Max. Temperatur der letzten Session | °C |
| `lastSessionTime` | string | Zeitpunkt der letzten Session | HH:MM |
| `uptime` | int | ESP32 Uptime | Sekunden |
| `ip` | string | IP-Adresse des ESP32 | - |
| `ssid` | string | WiFi-SSID | - |

#### Usage in App

```javascript
async function fetchStats(ip) {
  const response = await fetch(`http://${ip}/api/stats`);
  const stats = await response.json();

  // Display in stats view
  console.log(`Uptime: ${Math.floor(stats.uptime / 60)} minutes`);
  console.log(`Last session: ${stats.lastSessionTemp}°C for ${stats.lastSessionDuration/1000}s`);
}
```

---

### 3. POST `/api/reset-today`

Setzt den Heute-Counter auf 0 zurück (z.B. für manuellen Reset bei Mitternacht-Bug).

#### Request

```http
POST /api/reset-today HTTP/1.1
Host: 192.168.4.1
Content-Type: application/json
```

**Body**: Leer oder optional:
```json
{
  "confirm": true
}
```

#### Response

**Status**: `200 OK`

**Body**:
```
Today counter reset
```

#### Usage in App

```javascript
async function resetTodayCounter(ip) {
  try {
    const response = await fetch(`http://${ip}/api/reset-today`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('Today counter reset successfully');
      // Refresh data
      fetchSensorData(ip);
    }
  } catch (error) {
    console.error('Failed to reset counter:', error);
  }
}
```

---

## 🔐 Authentication (Optional)

Für produktive Umgebungen kann Basic Authentication hinzugefügt werden.

### ESP32 Implementation

```cpp
server.on("/api/data", HTTP_GET, []() {
  // Basic Auth
  if (!server.authenticate("admin", "password")) {
    return server.requestAuthentication();
  }

  // ... rest of handler
});
```

### App Implementation

```javascript
async function fetchSensorData(ip, username, password) {
  const credentials = btoa(`${username}:${password}`);

  const response = await fetch(`http://${ip}/api/data`, {
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });

  return await response.json();
}
```

---

## 🌐 WiFi Configuration

### Access Point Mode (Standard)

Die ESP32-Firmware erstellt standardmäßig einen eigenen WiFi-Access-Point:

```cpp
// Firmware Configuration
const char* ssid = "HighScore-Sensor";
const char* password = "highscore2024";

WiFi.softAP(ssid, password);
IPAddress IP = WiFi.softAPIP();  // Meist 192.168.4.1
```

**App-Konfiguration**:
1. Verbinde dein Smartphone mit WiFi "HighScore-Sensor"
2. Passwort: `highscore2024`
3. IP-Adresse in App eintragen: `192.168.4.1`
4. Demo-Modus deaktivieren

### Station Mode (Optional)

Alternativ kann der ESP32 sich in ein bestehendes WiFi einwählen:

```cpp
WiFi.begin("Your_WiFi_SSID", "Your_Password");
while (WiFi.status() != WL_CONNECTED) {
  delay(500);
}
IPAddress IP = WiFi.localIP();  // z.B. 192.168.1.147
```

---

## 📊 Polling Strategy

Die App pollt die API in regelmäßigen Intervallen:

### Empfohlene Intervalle

| View | Endpoint | Intervall | Grund |
|------|----------|-----------|-------|
| **Dashboard** | `/api/data` | 2s | Live-Tracking während Session |
| **Settings** | `/api/stats` | 10s | Weniger zeitkritisch |
| **Idle** | `/api/data` | 5s | Energie sparen |

### Implementation

```javascript
let pollingInterval = null;

function startPolling(ip, interval = 2000) {
  stopPolling(); // Clear existing

  pollingInterval = setInterval(async () => {
    try {
      const data = await fetch(`http://${ip}/api/data`).then(r => r.json());
      updateUI(data);

      // Slow down if no activity
      if (!data.inhaling && interval === 2000) {
        startPolling(ip, 5000); // Switch to 5s
      }
    } catch (error) {
      console.error('Polling error:', error);
      // Maybe show "Offline" indicator
    }
  }, interval);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// Start when app opens
startPolling(deviceIP);

// Stop when app closes
window.addEventListener('beforeunload', stopPolling);
```

---

## 🔄 WebSocket (Future)

Für Echtzeit-Updates könnte zukünftig WebSocket genutzt werden:

### Planned Implementation

```cpp
// ESP32 (Future)
WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    // Handle incoming messages
  }
}

void setup() {
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  // Broadcast updates
  if (inhaling) {
    String json = "{\"temp\":" + String(temp) + ",\"inhaling\":true}";
    webSocket.broadcastTXT(json);
  }
}
```

```javascript
// App (Future)
// HINWEIS: ws:// nur für lokales ESP32-Netzwerk! Für externe Verbindungen wss:// verwenden!
// nosemgrep: javascript.lang.security.detect-insecure-websocket
const ws = new WebSocket('ws://192.168.4.1:81');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

**Vorteile**:
- Keine Polling-Verzögerung
- Weniger Netzwerk-Traffic
- Echtzeit-Updates

**⚠️ Sicherheitshinweis - WebSocket-Verschlüsselung**:

Das obige Beispiel verwendet `ws://` (unverschlüsseltes WebSocket) für die **lokale Entwicklung** mit ESP32 im privaten Netzwerk (`192.168.4.1`).

**Für Produktiv-Umgebungen mit externen Verbindungen**:
- ✅ **Verwende `wss://`** (WebSocket Secure) mit TLS/SSL-Verschlüsselung
- ❌ **NIEMALS `ws://`** für öffentlich erreichbare Server
- ℹ️ **Ausnahme**: Lokale ESP32 Access Points (192.168.4.x) im privaten Netzwerk → `ws://` akzeptabel, da Traffic nicht das Gerät verlässt

**Beispiel für sichere Verbindung**:
```javascript
// Für externe/öffentliche Server IMMER wss:// verwenden!
const ws = new WebSocket('wss://your-server.com/ws');
```

---

## 🐛 Error Handling

### Common Errors

#### 1. Connection Timeout

```javascript
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
```

#### 2. Network Offline

```javascript
if (!navigator.onLine) {
  showOfflineMessage();
  return;
}

fetch(url)
  .catch(error => {
    if (error.message === 'Failed to fetch') {
      // Device not reachable
      showDeviceOfflineMessage();
    }
  });
```

#### 3. Invalid JSON

```javascript
try {
  const data = await response.json();
} catch (error) {
  console.error('Invalid JSON response:', error);
  // Fallback to default values
  return {
    temp: 0,
    today: 0,
    total: 0,
    inhaling: false
  };
}
```

### App Error States

```javascript
const [connectionStatus, setConnectionStatus] = useState('connected');

async function checkConnection(ip) {
  try {
    const response = await fetchWithTimeout(`http://${ip}/api/data`, 3000);
    setConnectionStatus('connected');
  } catch (error) {
    setConnectionStatus('offline');
  }
}

// UI
{connectionStatus === 'offline' && (
  <div className="bg-red-500 text-white p-2 rounded">
    ⚠️ Hardware Offline - Aktiviere Demo-Modus
  </div>
)}
```

---

## 🔧 Testing

### Manual Testing

#### cURL Examples

```bash
# Test /api/data
curl http://192.168.4.1/api/data

# Test /api/stats
curl http://192.168.4.1/api/stats

# Test reset
curl -X POST http://192.168.4.1/api/reset-today

# With timeout
curl --max-time 5 http://192.168.4.1/api/data
```

#### Browser Testing

```javascript
// Open Browser Console on http://192.168.4.1

// Test basic fetch
fetch('/api/data')
  .then(r => r.json())
  .then(d => console.table(d));

// Test reset
fetch('/api/reset-today', { method: 'POST' })
  .then(r => r.text())
  .then(t => console.log(t));
```

### Mock API (Development)

Für Development ohne Hardware:

```javascript
// src/utils/mockAPI.js
export const mockSensorData = {
  temp: Math.random() * 30 + 20,
  humidity: Math.random() * 20 + 40,
  today: 5,
  total: 127,
  inhaling: Math.random() > 0.9,
  streak: 3,
  longestStreak: 7,
  lastSession: "14:32"
};

export async function fetchMockData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockSensorData);
    }, 100);
  });
}
```

---

## 📈 Performance

### Response Times

| Endpoint | Avg | Max |
|----------|-----|-----|
| `/api/data` | ~50ms | 200ms |
| `/api/stats` | ~80ms | 300ms |
| `/api/reset-today` | ~30ms | 100ms |

### Optimization Tips

1. **Cache Static Data**: IP, SSID (ändern sich selten)
2. **Batch Requests**: Nur notwendige Daten abrufen
3. **Reduce Payload**: Minimiere JSON-Größe
4. **Connection Reuse**: HTTP Keep-Alive nutzen

---

## 🚀 Future Enhancements

### Geplant für v7.1+

- [ ] **WebSocket Support** für Echtzeit-Updates
- [ ] **Bulk History Export** (`/api/history`)
- [ ] **Configuration API** (`/api/config`)
- [ ] **OTA Update API** (`/api/update`)
- [ ] **MQTT Integration** für Home Assistant
- [ ] **GraphQL Endpoint** für flexible Queries

---

## 📝 Changelog

### API v1.0 (ESP32 v6.2)
- Initial REST API
- `/api/data` endpoint
- `/api/stats` endpoint
- `/api/reset-today` endpoint

---

**Happy Integrating! 🌿🔌**
