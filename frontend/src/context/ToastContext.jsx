import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
  error: <XCircle className="w-5 h-5 text-rose-400" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-spectrum-cyan" aria-hidden="true" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900/95 backdrop-blur px-4 py-3 shadow-2xl animate-drift-in"
          >
            {ICONS[t.type]}
            <p className="text-sm text-paper/90 flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-paper/50 hover:text-paper transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
