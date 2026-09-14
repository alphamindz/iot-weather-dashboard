"use client";

import { useState, useMemo } from "react";
import { HistoryPoint } from "@/lib/types";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function formatHour(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function TrendChart({ data }: { data: HistoryPoint[] }) {
  const [range, setRange] = useState<"1H" | "6H" | "24H">("24H");

  // Filter based on selected time window
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = Date.now();
    const cutoffMap = {
      "1H": 1 * 60 * 60 * 1000,
      "6H": 6 * 60 * 60 * 1000,
      "24H": 24 * 60 * 60 * 1000,
    };
    const cutoff = now - cutoffMap[range];
    const filtered = data.filter((d) => d.timestamp >= cutoff);
    return filtered.length > 0 ? filtered : data;
  }, [data, range]);

  // Export CSV handler
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = "Timestamp,Date Time,Temperature (C),Humidity (%)\n";
    const rows = data
      .map(
        (d) =>
          `${d.timestamp},"${new Date(d.timestamp).toLocaleString()}",${d.temperature},${d.humidity}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `weather_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-sm text-mist-500 backdrop-blur-md">
        No history yet — once the ESP32 starts pushing, the trend shows up here.
      </div>
    );
  }

  const chartData = filteredData.map((d) => ({
    time: formatHour(d.timestamp),
    temp: d.temperature,
    humidity: d.humidity,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
      {/* Top Controls Row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-mist-400 font-medium">Sensor History</span>
          <span className="text-[11px] text-mist-500">({filteredData.length} pts)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Pills */}
          <div className="flex rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
            {(["1H", "6H", "24H"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                  range === t
                    ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                    : "text-mist-500 hover:text-mist-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-mist-300 transition hover:border-cyan-500/40 hover:bg-white/[0.08] hover:text-cyan-300"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 stroke-current" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3" />
            </svg>
            Export CSV
          </button>

          {/* Existing Legend */}
          <div className="flex items-center gap-3 text-xs text-mist-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Temp
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-ember-400" /> Humidity
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#8A96AC" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8A96AC" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#111A2E",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#AAB4C8" }}
            />
            <Line type="monotone" dataKey="temp" stroke="#3FD9E8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="humidity" stroke="#FB923C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}