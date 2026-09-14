"use client";

interface WeatherBackdropProps {
  rainfall: number;
  temperature: number;
}

export default function WeatherBackdrop({ rainfall, temperature }: WeatherBackdropProps) {
  const isRaining = rainfall > 0;
  const isHot = temperature >= 32;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-1000">
      {/* Dynamic Radial Ambient Lights */}
      <div
        className={`absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full blur-[140px] transition-all duration-1000 ${
          isRaining
            ? "bg-cyan-500/15"
            : isHot
            ? "bg-rose-500/15"
            : "bg-indigo-500/10"
        }`}
      />
      <div
        className={`absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full blur-[140px] transition-all duration-1000 ${
          isRaining
            ? "bg-blue-600/15"
            : isHot
            ? "bg-amber-500/15"
            : "bg-emerald-500/10"
        }`}
      />

      {/* Subtle Rain Particle Layer (Only renders when raining) */}
      {isRaining && (
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 animate-[pulse_3s_ease-in-out_infinite]" />
      )}
    </div>
  );
}