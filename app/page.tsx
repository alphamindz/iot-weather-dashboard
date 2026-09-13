"use client";

import ConnectionError from "@/components/ConnectionError";
import GaugeCard from "@/components/GaugeCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import StatusBanner from "@/components/StatusBanner";
import TrendChart from "@/components/TrendChart";
import { useSensorData } from "@/lib/useSensorData";

export default function Home() {
  const { current, history, status, loading, error } = useSensorData();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-5 py-10 sm:py-14">
      <header>
        <h1 className="font-display text-xl font-semibold text-mist-200">Weather Monitor ESP32</h1>
        <p className="text-sm text-mist-500">Live readings from Supabase.</p>
      </header>

      {loading && <LoadingSkeleton />}

      {!loading && error && <ConnectionError message={error} />}

      {!loading && !error && (
        <div className="space-y-4">
          <StatusBanner status={status} />

          {current ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <GaugeCard
                  label="Temperature"
                  value={current.temperature}
                  min={-10}
                  max={50}
                  unit="°C"
                  colorClass="stroke-cyan-400"
                  icon={
                    <svg viewBox="0 0 24 24" className="stroke-current" fill="none">
                      <path d="M12 15V4a2 2 0 1 0-4 0v11a4 4 0 1 0 4 0Z" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <GaugeCard
                  label="Humidity"
                  value={current.humidity}
                  min={0}
                  max={100}
                  unit="%"
                  colorClass="stroke-ember-400"
                  icon={
                    <svg viewBox="0 0 24 24" className="stroke-current" fill="none">
                      <path d="M12 3s7 7.5 7 12a7 7 0 1 1-14 0c0-4.5 7-12 7-12Z" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  label="Wind Speed"
                  value={current.windSpeed.toFixed(1)}
                  unit="km/h"
                  barColorClass="bg-cyan-400"
                  barPct={current.windSpeed / 60}
                  icon={
                    <svg viewBox="0 0 24 24" className="stroke-current" fill="none">
                      <path d="M3 8h11a3 3 0 1 0-3-3" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M3 16h14a3 3 0 1 1-3 3" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  }
                />
                <StatCard
                  label="UV Index"
                  value={current.uvIndex.toFixed(1)}
                  barColorClass={current.uvIndex >= 8 ? "bg-rose-400" : current.uvIndex >= 6 ? "bg-ember-400" : "bg-leaf-400"}
                  barPct={current.uvIndex / 11}
                  icon={
                    <svg viewBox="0 0 24 24" className="stroke-current" fill="none">
                      <circle cx="12" cy="12" r="4" strokeWidth="1.6" />
                      <line x1="12" y1="2" x2="12" y2="4" strokeWidth="1.6" strokeLinecap="round" />
                      <line x1="12" y1="20" x2="12" y2="22" strokeWidth="1.6" strokeLinecap="round" />
                      <line x1="2" y1="12" x2="4" y2="12" strokeWidth="1.6" strokeLinecap="round" />
                      <line x1="20" y1="12" x2="22" y2="12" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  }
                />
                <StatCard
                  label="Rainfall"
                  value={current.rainfall.toFixed(1)}
                  unit="mm"
                  barColorClass="bg-cyan-400"
                  barPct={current.rainfall / 20}
                  icon={
                    <svg viewBox="0 0 24 24" className="stroke-current" fill="none">
                      <path d="M7 15a5 5 0 0 1 1-9.9A6 6 0 0 1 19 8a4.5 4.5 0 0 1-1 9H7Z" strokeWidth="1.6" strokeLinejoin="round" />
                      <line x1="9" y1="19" x2="8" y2="22" strokeWidth="1.6" strokeLinecap="round" />
                      <line x1="15" y1="19" x2="14" y2="22" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  }
                />
              </div>

              <TrendChart data={history} />
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="font-display text-lg font-medium text-mist-200">Waiting for the first reading</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-mist-400">
                Nothing in the <code>readings</code> table yet — once the ESP32 pushes its first reading, it'll show up here automatically.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}