import LiveAlerts from "./LiveAlerts";
import { DeviceStatus } from "@/lib/types";

function formatLastSeen(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface StatusBannerProps {
  status: DeviceStatus;
  rainfall?: number;
  irTrigger?: number;
}

export default function StatusBanner({
  status,
  rainfall = 0,
  irTrigger = 0,
}: StatusBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {status.online && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-400 opacity-60" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                status.online ? "bg-leaf-400" : "bg-rose-400"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-mist-200">
            ESP32 {status.online ? "Online" : "Offline"}
          </span>
        </div>

        {/* Dynamic Alerts */}
        <LiveAlerts rainfall={rainfall} irTrigger={irTrigger} />
      </div>

      <span className="text-xs text-mist-500">
        Last update: {formatLastSeen(status.lastSeen)}
      </span>
    </div>
  );
}