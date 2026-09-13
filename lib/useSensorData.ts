"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { DeviceStatus, HistoryPoint, SensorReading } from "./types";

type State = {
  current: SensorReading | null;
  history: HistoryPoint[];
  status: DeviceStatus;
  loading: boolean;
  error: string | null;
};

const initialState: State = {
  current: null,
  history: [],
  status: { online: false, lastSeen: null },
  loading: true,
  error: null,
};

// Expected Supabase shape (see README for the matching ESP32 sketch):
//   readings table        → one row per push, latest row = current reading
//   device_status table   → single row per device, updated on connect/disconnect
export function useSensorData() {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Supabase isn't configured yet — add your project's keys to .env.local.",
      }));
      return;
    }

    let cancelled = false;

    async function loadInitial() {
      const { data: latestRows, error: latestErr } = await supabase
        .from("readings")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1);

      const { data: historyRows, error: historyErr } = await supabase
        .from("readings")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(48);

      const { data: statusRow, error: statusErr } = await supabase
        .from("device_status")
        .select("*")
        .eq("device_id", "esp32")
        .maybeSingle();

      if (cancelled) return;

      if (latestErr || historyErr || statusErr) {
        setState((s) => ({
          ...s,
          loading: false,
          error: (latestErr || historyErr || statusErr)?.message ?? "Unknown error",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        current: (latestRows?.[0] as SensorReading) ?? null,
        history: ((historyRows as HistoryPoint[]) ?? []).slice().reverse(),
        status: {
          online: Boolean(statusRow?.online),
          lastSeen: statusRow?.last_seen ?? null,
        },
        loading: false,
        error: null,
      }));
    }

    loadInitial();

    const readingsChannel = supabase
      .channel("readings-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings" },
        (payload) => {
          const row = payload.new as HistoryPoint;
          setState((s) => ({
            ...s,
            current: row as SensorReading,
            history: [...s.history, row].slice(-48),
          }));
        }
      )
      .subscribe();

    const statusChannel = supabase
      .channel("status-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_status", filter: "device_id=eq.esp32" },
        (payload) => {
          const row = payload.new as { online: boolean; last_seen: number };
          setState((s) => ({
            ...s,
            status: { online: Boolean(row.online), lastSeen: row.last_seen ?? null },
          }));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(readingsChannel);
      supabase.removeChannel(statusChannel);
    };
  }, []);

  return state;
}