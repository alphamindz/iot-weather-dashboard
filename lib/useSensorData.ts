"use client";

import { useEffect, useState } from "react";
import { DeviceStatus, HistoryPoint, SensorReading } from "./types";

// ⚠️ TEMPORARY MOCK VERSION — sirf UI dekhne ke liye, database ki zaroorat nahi.
// Jab Supabase ready ho jaye, is file ko wapas asli wale code se replace kar dena.

export function useSensorData() {
  const [state, setState] = useState<{
    current: SensorReading | null;
    history: HistoryPoint[];
    status: DeviceStatus;
    loading: boolean;
    error: string | null;
  }>({
    current: null,
    history: [],
    status: { online: false, lastSeen: null },
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Thoda delay taaki loading skeleton bhi dikh jaye (real app jaisa feel)
    const timer = setTimeout(() => {
      const now = Date.now();

      const current: SensorReading = {
        temperature: 24.5,
        humidity: 62,
        windSpeed: 12.3,
        uvIndex: 6.5,
        rainfall: 2.1,
        timestamp: now,
      };

      const history: HistoryPoint[] = Array.from({ length: 20 }, (_, i) => ({
        id: `mock-${i}`,
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        uvIndex: Math.random() * 10,
        rainfall: Math.random() * 5,
        timestamp: now - (20 - i) * 60000,
      }));

      setState({
        current,
        history,
        status: { online: true, lastSeen: now },
        loading: false,
        error: null,
      });
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return state;
}