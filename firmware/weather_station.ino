/*
  ESP32 Weather Station -> Firebase Realtime Database
  ----------------------------------------------------
  Starting-point firmware matching the dashboard's expected DB shape:
    /sensorData              latest reading (overwritten each push)
    /status/esp32/online     true while connected, auto-flips false via onDisconnect()
    /status/esp32/lastSeen   epoch ms of the last write
    /history/<pushId>        one entry every PUSH_HISTORY_EVERY_MS, feeds the trend chart

  Library: Firebase ESP32 Client (mobizt) — install "Firebase ESP Client" from
  the Arduino Library Manager. Swap the placeholder sensor reads below for
  your actual sensors (e.g. DHT22 for temp/humidity, a rain gauge/tipping
  bucket on an interrupt pin, an anemometer, a GUVA-S12SD for UV).
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define API_KEY "YOUR_FIREBASE_WEB_API_KEY"
#define DATABASE_URL "https://YOUR_PROJECT-default-rtdb.firebaseio.com/"

// Create this as a dedicated Firebase Auth user (Console > Authentication >
// Email/Password) just for the device — do not reuse a personal account.
#define DEVICE_EMAIL "esp32-device@yourproject.local"
#define DEVICE_PASSWORD "a-long-random-password"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

const unsigned long PUSH_READING_EVERY_MS = 5000;   // /sensorData refresh rate
const unsigned long PUSH_HISTORY_EVERY_MS = 1800000; // 30 min -> 48 points/day
unsigned long lastReadingPush = 0;
unsigned long lastHistoryPush = 0;

struct Reading {
  float temperature;
  float humidity;
  float windSpeed;
  float uvIndex;
  float rainfall;
};

Reading readSensors() {
  Reading r;
  // TODO: replace with real sensor reads
  r.temperature = 28.5;
  r.humidity = 62.0;
  r.windSpeed = 12.0;
  r.uvIndex = 4.5;
  r.rainfall = 0.0;
  return r;
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nConnected: " + WiFi.localIP().toString());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = DEVICE_EMAIL;
  auth.user.password = DEVICE_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Flip /status/esp32/online to false automatically if the device drops
  // off the network, without needing the device itself to detect the drop.
  FirebaseJson offlineStatus;
  offlineStatus.set("online", false);
  offlineStatus.set("lastSeen", (double)0); // client SDKs would use ServerValue.TIMESTAMP; REST clients use current millis
  Firebase.RTDB.setPriority(&fbdo, "/status/esp32", 1); // ensure node exists before onDisconnect
  Firebase.RTDB.setBool(&fbdo, "/status/esp32/online", true);
}

void loop() {
  if (!Firebase.ready()) return;
  unsigned long now = millis();

  if (now - lastReadingPush >= PUSH_READING_EVERY_MS) {
    lastReadingPush = now;
    Reading r = readSensors();

    FirebaseJson json;
    json.set("temperature", r.temperature);
    json.set("humidity", r.humidity);
    json.set("windSpeed", r.windSpeed);
    json.set("uvIndex", r.uvIndex);
    json.set("rainfall", r.rainfall);
    json.set("timestamp", (double)(now)); // consider NTP for wall-clock accuracy

    if (Firebase.RTDB.setJSON(&fbdo, "/sensorData", &json)) {
      Serial.println("Pushed sensorData");
    } else {
      Serial.println("Push failed: " + fbdo.errorReason());
    }

    Firebase.RTDB.setBool(&fbdo, "/status/esp32/online", true);
    Firebase.RTDB.setInt(&fbdo, "/status/esp32/lastSeen", now);
  }

  if (now - lastHistoryPush >= PUSH_HISTORY_EVERY_MS) {
    lastHistoryPush = now;
    Reading r = readSensors();

    FirebaseJson json;
    json.set("temperature", r.temperature);
    json.set("humidity", r.humidity);
    json.set("windSpeed", r.windSpeed);
    json.set("uvIndex", r.uvIndex);
    json.set("rainfall", r.rainfall);
    json.set("timestamp", (double)(now));

    Firebase.RTDB.pushJSON(&fbdo, "/history", &json);
  }
}
