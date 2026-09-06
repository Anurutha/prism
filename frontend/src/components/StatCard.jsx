export default function StatCard({ label, value, icon: Icon, accent = 'violet' }) {
  const accentMap = {
    violet: 'text-spectrum-violet',
    magenta: 'text-spectrum-magenta',
    amber: 'text-spectrum-amber',
    cyan: 'text-spectrum-cyan',
  };
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-paper/50 mb-1.5">{label}</p>
        <p className="font-display text-3xl">{value}</p>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl bg-ink-800 flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
