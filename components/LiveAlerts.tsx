"use client";

interface LiveAlertsProps {
  rainfall: number;
  irTrigger: number;
}

export default function LiveAlerts({ rainfall, irTrigger }: LiveAlertsProps) {
  const isRaining = rainfall > 0;
  const isMotionDetected = irTrigger === 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Rain Alert Badge */}
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
          isRaining
            ? "border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse"
            : "border border-slate-800 bg-slate-900/50 text-slate-400"
        }`}
      >
        <span>{isRaining ? "🌧️ Rain:" : "☀️ Weather:"}</span>
        <span className="font-semibold text-slate-200">
          {isRaining ? `${rainfall.toFixed(1)} mm` : "Clear"}
        </span>
      </div>

      {/* IR Motion / Droplet Detection Badge */}
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
          isMotionDetected
            ? "border border-amber-500/40 bg-amber-950/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
            : "border border-slate-800 bg-slate-900/50 text-slate-400"
        }`}
      >
        <span>🚨 Sensor Drop:</span>
        <span className="font-semibold text-slate-200">
          {isMotionDetected ? "Active" : "Clear"}
        </span>
      </div>
    </div>
  );
}