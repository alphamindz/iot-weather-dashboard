/*
  ESP32 Weather Station -> Supabase (PostgreSQL REST API)
  ----------------------------------------------------
  Dashboard ke expected tables:
    readings table        -> har reading ek naya row (insert)
    device_status table   -> ek row per device (update), online/last_seen

  Koi extra library ki zaroorat nahi — HTTPClient built-in hai ESP32 core mein.
  Bas apna WiFi + Supabase URL/API key neeche fill karein.
*/

#include <WiFi.h>
#include <HTTPClient.h>

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Supabase dashboard -> Settings -> API se milega
#define SUPABASE_URL "https://YOUR_PROJECT.supabase.co"
#define SUPABASE_ANON_KEY "YOUR_SUPABASE_ANON_KEY"

const unsigned long PUSH_READING_EVERY_MS = 5000;   // har 5 sec naya reading
unsigned long lastReadingPush = 0;

struct Reading {
  float temperature;
  float humidity;
  float windSpeed;
  float uvIndex;
  float rainfall;
};

Reading readSensors() {
  Reading r;
  // TODO: yahan real sensor reads daalein
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

  // Device ko "online" mark karein
  updateDeviceStatus(true);
}

void loop() {
  unsigned long now = millis();

  if (now - lastReadingPush >= PUSH_READING_EVERY_MS) {
    lastReadingPush = now;
    pushReading();
    updateDeviceStatus(true);
  }
}

void pushReading() {
  if (WiFi.status() != WL_CONNECTED) return;

  Reading r = readSensors();
  HTTPClient http;

  String url = String(SUPABASE_URL) + "/rest/v1/readings";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  http.addHeader("Prefer", "return=minimal");

  String payload = "{";
  payload += "\"temperature\":" + String(r.temperature) + ",";
  payload += "\"humidity\":" + String(r.humidity) + ",";
  payload += "\"windSpeed\":" + String(r.windSpeed) + ",";
  payload += "\"uvIndex\":" + String(r.uvIndex) + ",";
  payload += "\"rainfall\":" + String(r.rainfall) + ",";
  payload += "\"timestamp\":" + String((unsigned long long)millis());
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0 && httpCode < 300) {
    Serial.println("Pushed reading OK");
  } else {
    Serial.println("Push failed: " + String(httpCode) + " " + http.getString());
  }

  http.end();
}

void updateDeviceStatus(bool online) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  // upsert: agar device_id already hai to update, warna insert
  String url = String(SUPABASE_URL) + "/rest/v1/device_status?on_conflict=device_id";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  http.addHeader("Prefer", "resolution=merge-duplicates,return=minimal");

  String payload = "{";
  payload += "\"device_id\":\"esp32\",";
  payload += "\"online\":" + String(online ? "true" : "false") + ",";
  payload += "\"last_seen\":" + String((unsigned long long)millis());
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0 && httpCode < 300) {
    Serial.println("Status updated OK");
  } else {
    Serial.println("Status update failed: " + String(httpCode) + " " + http.getString());
  }

  http.end();
}