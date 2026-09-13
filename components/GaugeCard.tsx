type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  sublabel?: string;
  colorClass: string; // tailwind stroke-* class
  icon: React.ReactNode;
};

// A 270° arc gauge, open at the bottom — same reading style as the reference
// dashboard, redrawn as one shared component for any bounded metric.
const RADIUS = 60;
const SWEEP_DEG = 270;
const TOTAL_CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = TOTAL_CIRCUMFERENCE * (SWEEP_DEG / 360);
// Rotates the arc so its open gap sits centered at the bottom of the circle.
const ROTATION = 135;

export default function GaugeCard({ label, value, min, max, unit, sublabel, colorClass, icon }: Props) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2 text-mist-400">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
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
              className={colorClass}
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
      {sublabel && <p className="mt-1 text-center text-xs text-mist-500">{sublabel}</p>}
    </div>
  );
}
