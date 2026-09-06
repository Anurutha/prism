import { AlertTriangle, RotateCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-rose-900/40 bg-rose-950/10">
      <AlertTriangle className="w-8 h-8 text-rose-400 mb-3" aria-hidden="true" />
      <p className="text-sm text-paper/80 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-ink-800 hover:bg-ink-700 transition-colors"
        >
          <RotateCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}
