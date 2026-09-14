import { HistoryPoint } from "./types";

// Heat Index (Feels Like) using Rothfusz regression equation
export function calculateHeatIndex(tempC: number, humidity: number): number {
  if (tempC < 27 || humidity < 40) {
    return tempC; // Heat index sirf warm weather me standard effect deta hai
  }

  const T = (tempC * 9) / 5 + 32; // Convert to Fahrenheit
  const R = humidity;

  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  let hiF =
    c1 +
    c2 * T +
    c3 * R +
    c4 * T * R +
    c5 * T * T +
    c6 * R * R +
    c7 * T * T * R +
    c8 * T * R * R +
    c9 * T * T * R * R;

  const hiC = ((hiF - 32) * 5) / 9;
  return parseFloat(hiC.toFixed(1));
}

// Dew Point calculation using Magnus-Tetens formula
export function calculateDewPoint(
  tempC: number,
  humidity: number
): { value: number; label: string } {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100.0);
  const dewPoint = (b * alpha) / (a - alpha);
  const dpValue = parseFloat(dewPoint.toFixed(1));

  let label = "Dry";
  if (dpValue >= 13 && dpValue <= 16) label = "Comfortable";
  else if (dpValue > 16 && dpValue <= 20) label = "Humid";
  else if (dpValue > 20) label = "Very Muggy";

  return { value: dpValue, label };
}

// 24-Hour Min, Max, and Average Aggregator
export function calculateMinMaxAvg(history: HistoryPoint[]) {
  if (!history || history.length === 0) {
    return {
      tempMin: 0,
      tempMax: 0,
      tempAvg: 0,
      humMin: 0,
      humMax: 0,
      humAvg: 0,
    };
  }

  const temps = history.map((h) => h.temperature);
  const hums = history.map((h) => h.humidity);

  const sumTemp = temps.reduce((acc, curr) => acc + curr, 0);
  const sumHum = hums.reduce((acc, curr) => acc + curr, 0);

  return {
    tempMin: parseFloat(Math.min(...temps).toFixed(1)),
    tempMax: parseFloat(Math.max(...temps).toFixed(1)),
    tempAvg: parseFloat((sumTemp / temps.length).toFixed(1)),
    humMin: parseFloat(Math.min(...hums).toFixed(1)),
    humMax: parseFloat(Math.max(...hums).toFixed(1)),
    humAvg: parseFloat((sumHum / hums.length).toFixed(1)),
  };
}