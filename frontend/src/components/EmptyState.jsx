export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-dashed border-ink-700">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-ink-800 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-spectrum-magenta" aria-hidden="true" />
        </div>
      )}
      <h3 className="font-display text-xl text-paper mb-1.5">{title}</h3>
      {description && <p className="text-sm text-paper/60 max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
