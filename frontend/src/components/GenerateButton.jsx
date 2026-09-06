import { Sparkles, Loader2 } from 'lucide-react';

export default function GenerateButton({ onClick, loading, disabled, statusText }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Generating…' : 'Generate Image'}
      </button>
      {loading && statusText && <p className="text-xs text-paper/50">{statusText}</p>}
    </div>
  );
}
