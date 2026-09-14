const SUPABASE_URL = "https://sodblwhzmopifolfwlak.supabase.co";
const SUPABASE_KEY = "sb_publishable_SMyUrbzjH413upCv3yqOiw_Vo1yTwtU";

let temp = 26.5;
let humidity = 58.0;
let wind = 12.0;

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

async function sendTelemetry() {
  temp += getRandom(-0.4, 0.4);
  temp = Math.max(18, Math.min(38, temp));

  humidity += getRandom(-1.2, 1.2);
  humidity = Math.max(30, Math.min(95, humidity));

  wind += getRandom(-1.5, 1.5);
  wind = Math.max(2, Math.min(35, wind));

  const isRaining = Math.random() < 0.15;
  const rainfall = isRaining ? parseFloat(getRandom(1.2, 6.5).toFixed(1)) : 0.0;
  const irTrigger = isRaining || Math.random() < 0.1 ? 1 : 0;
  const uvIndex = parseFloat(getRandom(4.0, 8.5).toFixed(1));

  const payload = {
    temperature: parseFloat(temp.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    wind_speed: parseFloat(wind.toFixed(1)),
    uv_index: uvIndex,
    rainfall: rainfall,
    ir_trigger: irTrigger,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/weather_logs`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(
        `[SUCCESS] Temp: ${payload.temperature}°C | Humidity: ${payload.humidity}% | Rain: ${payload.rainfall}mm | IR: ${payload.ir_trigger}`
      );
    } else {
      const err = await res.text();
      console.error(`[ERROR]:`, err);
    }
  } catch (err) {
    console.error("[NETWORK ERROR]:", err.message);
  }
}

console.log("Virtual ESP32 Started! Sending data every 5 seconds...");
sendTelemetry();
setInterval(sendTelemetry, 5000);