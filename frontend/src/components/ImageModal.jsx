import { useEffect, useRef } from 'react';
import { X, Download, Heart, Copy, RefreshCw, Trash2 } from 'lucide-react';

export default function ImageModal({ image, onClose, onToggleFavorite, onDownload, onDelete, onCopyPrompt, onRegenerate }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image details"
      onClick={onClose}
    >
      <div
        className="relative bg-ink-900 border border-ink-700 rounded-2xl max-w-4xl w-full grid md:grid-cols-2 overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover max-h-[45vh] md:max-h-[90vh]" />

        <div className="p-6 flex flex-col overflow-y-auto">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="self-end p-2 rounded-lg hover:bg-ink-800 transition-colors mb-2"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-display text-xl mb-3">Prompt</h2>
          <p className="text-sm text-paper/80 mb-5">{image.prompt}</p>

          <dl className="grid grid-cols-2 gap-y-2 text-sm mb-6">
            <dt className="text-paper/50">Style</dt>
            <dd className="capitalize">{image.style?.replace('-', ' ')}</dd>
            <dt className="text-paper/50">Aspect ratio</dt>
            <dd>{image.aspect_ratio}</dd>
            <dt className="text-paper/50">Model</dt>
            <dd>{image.model}</dd>
            <dt className="text-paper/50">Created</dt>
            <dd>{new Date(image.created_at).toLocaleString()}</dd>
          </dl>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <button onClick={() => onDownload(image)} className="btn-secondary">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={() => onToggleFavorite(image)} className="btn-secondary">
              <Heart className={`w-4 h-4 ${image.is_favorite ? 'fill-spectrum-magenta text-spectrum-magenta' : ''}`} />
              {image.is_favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button onClick={() => onCopyPrompt(image)} className="btn-secondary">
              <Copy className="w-4 h-4" /> Copy prompt
            </button>
            <button onClick={() => onRegenerate(image)} className="btn-secondary">
              <RefreshCw className="w-4 h-4" /> Generate again
            </button>
            <button onClick={() => onDelete(image)} className="btn-secondary col-span-2 text-rose-400 hover:bg-rose-950/40">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
