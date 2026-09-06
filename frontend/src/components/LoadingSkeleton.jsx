export function ImageGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-ink-800 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink-700/60 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
        </div>
      ))}
      <style>{`@keyframes shimmer { 100% { transform: translateX(200%); } }`}</style>
    </div>
  );
}

export function StatCardSkeleton() {
  return <div className="h-24 rounded-2xl bg-ink-800 animate-pulse" aria-hidden="true" />;
}

export function LineSkeleton({ width = 'w-full' }) {
  return <div className={`h-4 ${width} rounded bg-ink-800 animate-pulse`} aria-hidden="true" />;
}
