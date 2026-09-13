"use client";

import { HistoryPoint } from "@/lib/types";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function formatHour(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", hour12: false });
}

export default function TrendChart({ data }: { data: HistoryPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-sm text-mist-500 backdrop-blur-md">
        No history yet — once the ESP32 starts pushing to <code>/history</code>, the trend shows up here.
      </div>
    );
  }

  const chartData = data.map((d) => ({ time: formatHour(d.timestamp), temp: d.temperature, humidity: d.humidity }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-mist-500">24 hour trend</span>
        <div className="flex items-center gap-3 text-xs text-mist-400">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Temp
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-400" /> Humidity
          </span>
        </div>
      </div>
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
