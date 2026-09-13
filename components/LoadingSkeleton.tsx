export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-56 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}
