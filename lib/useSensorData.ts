"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { DeviceStatus, HistoryPoint, SensorReading } from "./types";

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
    // 1. Database se initial data aur history load karna
    async function initData() {
      try {
        const { data, error } = await supabase
          .from("weather_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          const latestRow = data[0];
          const lastSeenTime = new Date(latestRow.created_at).getTime();

          const current: SensorReading = {
            temperature: latestRow.temperature ?? 0,
            humidity: latestRow.humidity ?? 0,
            windSpeed: latestRow.wind_speed ?? 0,
            uvIndex: latestRow.uv_index ?? 0,
            rainfall: latestRow.rainfall ?? 0,
            timestamp: lastSeenTime,
          };

          const history: HistoryPoint[] = [...data].reverse().map((row) => ({
            id: String(row.id),
            temperature: row.temperature ?? 0,
            humidity: row.humidity ?? 0,
            windSpeed: row.wind_speed ?? 0,
            uvIndex: row.uv_index ?? 0,
            rainfall: row.rainfall ?? 0,
            timestamp: new Date(row.created_at).getTime(),
          }));

          // Check if ESP32 sent data in last 60 seconds
          const isOnline = Date.now() - lastSeenTime < 60000;

          setState({
            current,
            history,
            status: { online: isOnline, lastSeen: lastSeenTime },
            loading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to fetch data from Supabase",
        }));
      }
    }

    initData();

    // 2. Realtime WebSocket listener (jaise hi ESP32 se naya data insert hoga, ye trigger hoga)
    const channel = supabase
      .channel("realtime-weather-readings")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "weather_logs",
        },
        (payload) => {
          const newRow = payload.new;
          const newTime = new Date(newRow.created_at).getTime();

          const newReading: SensorReading = {
            temperature: newRow.temperature ?? 0,
            humidity: newRow.humidity ?? 0,
            windSpeed: newRow.wind_speed ?? 0,
            uvIndex: newRow.uv_index ?? 0,
            rainfall: newRow.rainfall ?? 0,
            timestamp: newTime,
          };

          setState((prev) => ({
            ...prev,
            current: newReading,
            history: [
              ...prev.history.slice(1),
              {
                id: String(newRow.id),
                ...newReading,
              },
            ],
            status: { online: true, lastSeen: newTime },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return state;
}