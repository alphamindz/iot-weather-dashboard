export type SensorReading = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  rainfall: number;
  timestamp: number; // epoch ms
};

export type HistoryPoint = SensorReading & { id: string };

export type DeviceStatus = {
  online: boolean;
  lastSeen: number | null;
};
