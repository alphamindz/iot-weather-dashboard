import { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  barColorClass: string; // tailwind bg-* class for the underline
  barPct: number; // 0..1
};

export default function StatCard({ label, value, unit, icon, barColorClass, barPct }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-mist-500">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-display text-xl font-semibold text-mist-200">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-mist-500">{unit}</span>}
      </p>
      <div className="mt-3 h-1 w-full rounded-full bg-white/10">
        <div
          className={`h-1 rounded-full ${barColorClass}`}
          style={{ width: `${Math.min(Math.max(barPct, 0), 1) * 100}%` }}
        />
      </div>
    </div>
  );
}
