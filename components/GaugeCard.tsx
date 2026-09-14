import React from "react";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  sublabel?: string;
  colorClass: string; // tailwind stroke-* class
  icon: React.ReactNode;
  stats?: { min: number; max: number; avg?: number }; // 24H Min/Max stats prop
};

const RADIUS = 60;
const SWEEP_DEG = 270;
const TOTAL_CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = TOTAL_CIRCUMFERENCE * (SWEEP_DEG / 360);
const ROTATION = 135;

export default function GaugeCard({
  label,
  value,
  min,
  max,
  unit,
  sublabel,
  colorClass,
  icon,
  stats,
}: Props) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
      {/* Header: Label + 24H Min/Max Badge */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-mist-400">
          <span className="h-4 w-4">{icon}</span>
          <span className="text-xs uppercase tracking-wide">{label}</span>
        </div>

        {/* Min / Max Summary Tags */}
        {stats && (stats.min !== 0 || stats.max !== 0) && (
          <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-mist-400">
            <span className="text-cyan-300/80">L: {stats.min}{unit}</span>
            <span className="text-mist-600">•</span>
            <span className="text-rose-300/80">H: {stats.max}{unit}</span>
          </div>
        )}
      </div>

      {/* Dial Gauge */}
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
        <svg viewBox="0 0 160 160" className="h-full w-full">
          <g transform={`rotate(${ROTATION} 80 80)`}>
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH} ${TOTAL_CIRCUMFERENCE - ARC_LENGTH}`}
              className="stroke-white/10"
            />
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH * pct} ${TOTAL_CIRCUMFERENCE - ARC_LENGTH * pct}`}
              className={`${colorClass} transition-all duration-700 ease-out`}
            />
          </g>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-3xl font-semibold text-mist-200">
            {value.toFixed(1)}
            <span className="text-base font-normal text-mist-500">{unit}</span>
          </span>
        </div>
      </div>

      {/* Styled Sublabel Badge (Feels Like / Dew Point) */}
      {sublabel && (
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-mist-300">
            {sublabel}
          </span>
        </div>
      )}
    </div>
  );
}