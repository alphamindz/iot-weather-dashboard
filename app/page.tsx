"use client";

import Link from "next/link";
import ConnectionError from "@/components/ConnectionError";
import GaugeCard from "@/components/GaugeCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import StatusBanner from "@/components/StatusBanner";
import TrendChart from "@/components/TrendChart";
import WeatherBackdrop from "@/components/WeatherBackdrop";
import { useSensorData } from "@/lib/useSensorData";
import { calculateHeatIndex, calculateDewPoint, calculateMinMaxAvg } from "@/lib/weatherMath";

export default function Home() {
  const { current, history, status, loading, error } = useSensorData();
  const irTrigger = current && "irTrigger" in current ? (current as any).irTrigger : 0;

  // Real-time calculations
  const temp = current?.temperature ?? 0;
  const hum = current?.humidity ?? 0;
  const feelsLike = calculateHeatIndex(temp, hum);
  const dewPoint = calculateDewPoint(temp, hum);

  // 24H Min / Max / Avg summary calculation
  const statsSummary = calculateMinMaxAvg(history);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-5 py-10 sm:py-14">
      {/* Dynamic Ambient Background (Glows based on weather/rain) */}
      <WeatherBackdrop 
        rainfall={current?.rainfall ?? 0} 
        temperature={current?.temperature ?? 25} 
      />

      {/* Header with Settings Button */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-mist-200">Weather Monitor ESP32</h1>
          <p className="text-sm text-mist-500">Live readings from Supabase.</p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-cyan-400 transition hover:bg-white/[0.1] hover:border-cyan-500/40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Device Settings
        </Link>
      </header>

      {loading && <LoadingSkeleton />}

      {!loading && error && <ConnectionError message={error} />}

      {!loading && !error && (
        <div className="space-y-4">
          <StatusBanner
            status={status}
            rainfall={current?.rainfall ?? 0}
            irTrigger={irTrigger}
          />

          {current ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Temperature Card with 24H Min/Max */}
                <GaugeCard
                  label="Temperature"
                  value={current.temperature}
                  min={-10}
                  max={50}
                  unit="°C"
                  sublabel={`Feels like ${feelsLike}°C`}
                  stats={{ min: statsSummary.tempMin, max: statsSummary.tempMax }}
                  colorClass="stroke-cyan-400"
                  icon={
                    <svg viewBox="0 0 24 24" className="stroke-current" fill="none">
                      <path d="M12 15V4a2 2 0 1 0-4 0v11a4 4 0 1 0 4 0Z" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  }
                />

                {/* Humidity Card with 24H Min/Max */}
                <GaugeCard
                  label="Humidity"
                  value={current.humidity}
                  min={0}
                  max={100}
                  unit="%"
                  sublabel={`Dew Point: ${dewPoint.value}°C (${dewPoint.label})`}
                  stats={{ min: statsSummary.humMin, max: statsSummary.humMax }}
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
                Nothing in the <code>weather_logs</code> table yet — once the ESP32 pushes its first reading, it&apos;ll show up here automatically.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}