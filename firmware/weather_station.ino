#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// --- Wi-Fi Credentials ---
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// --- Supabase Credentials ---
#define SUPABASE_URL "https://sodblwhzmopifolfwlak.supabase.co"
#define SUPABASE_ANON_KEY "sb_publishable_SMyUrbzjH413upCv3yqOiw_Vo1yTwtU"

// --- Pin Definitions (As per your project) ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define WIND_PIN 34    // Analog Pin
#define RAIN_PIN 35    // Analog Pin
#define IR_PIN 18      // Digital Pin

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
DHT dht(DHTPIN, DHTTYPE);

const unsigned long PUSH_INTERVAL_MS = 5000; // Har 5 second me send hoga
unsigned long lastPushTime = 0;

struct SensorData {
  float temperature;
  float humidity;
  float wind_speed;
  float uv_index;
  float rainfall;
  int ir_trigger;
};

void setup() {
  Serial.begin(115200);

  // Initialize Sensors
  dht.begin();
  pinMode(WIND_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT);
  pinMode(IR_PIN, INPUT);

  // Initialize OLED (I2C default pins: SDA 21, SCL 22)
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED allocation failed");
  }
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.println("Connecting WiFi...");
  display.display();

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected: " + WiFi.localIP().toString());

  display.clearDisplay();
  display.setCursor(0, 10);
  display.println("WiFi Connected!");
  display.display();
}

SensorData readSensors() {
  SensorData data;

  // 1. DHT22
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  if (isnan(data.temperature)) data.temperature = 0.0;
  if (isnan(data.humidity)) data.humidity = 0.0;

  // 2. Wind Sensor (ADC to Wind speed km/h conversion)
  int windRaw = analogRead(WIND_PIN);
  data.wind_speed = (windRaw / 4095.0) * 32.4; // Max ~32.4 km/h mapping

  // 3. Rain Sensor (Inverted: Low value = High moisture)
  int rainRaw = analogRead(RAIN_PIN);
  data.rainfall = map(4095 - rainRaw, 0, 4095, 0, 50) / 10.0; // 0 - 5.0 mm

  // 4. IR Sensor
  data.ir_trigger = digitalRead(IR_PIN) == LOW ? 1 : 0;

  // Default UV metric
  data.uv_index = 5.2;

  return data;
}

void updateOLED(const SensorData &d) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("ESP32 WEATHER LIVE");
  display.drawLine(0, 10, 128, 10, WHITE);

  display.setCursor(0, 16);
  display.printf("Temp: %.1f C\n", d.temperature);
  display.printf("Hum:  %.0f %%\n", d.humidity);
  display.printf("Wind: %.1f km/h\n", d.wind_speed);
  display.printf("Rain: %.1f mm\n", d.rainfall);
  display.printf("Drop: %s\n", d.ir_trigger ? "DETECTED" : "CLEAR");

  display.display();
}

void pushToSupabase(const SensorData &d) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure(); // Supabase SSL certificate bypass

  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/weather_logs";
  http.begin(client, url);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  http.addHeader("Prefer", "return=minimal");

  // JSON matching exact database column names
  String payload = "{";
  payload += "\"temperature\":" + String(d.temperature, 1) + ",";
  payload += "\"humidity\":" + String(d.humidity, 1) + ",";
  payload += "\"wind_speed\":" + String(d.wind_speed, 1) + ",";
  payload += "\"uv_index\":" + String(d.uv_index, 1) + ",";
  payload += "\"rainfall\":" + String(d.rainfall, 1) + ",";
  payload += "\"ir_trigger\":" + String(d.ir_trigger);
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode >= 200 && httpCode < 300) {
    Serial.println("Pushed reading OK -> " + payload);
  } else {
    Serial.println("Push Failed [" + String(httpCode) + "]: " + http.getString());
  }

  http.end();
}

void loop() {
  unsigned long now = millis();

  if (now - lastPushTime >= PUSH_INTERVAL_MS) {
    lastPushTime = now;
    SensorData data = readSensors();
    updateOLED(data);
    pushToSupabase(data);
  }
}