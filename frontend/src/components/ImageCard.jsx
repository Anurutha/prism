import { Heart, Download, Trash2 } from 'lucide-react';

export default function ImageCard({ image, onOpen, onToggleFavorite, onDownload, onDelete }) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-ink-800 border border-ink-700">
      <button
        onClick={() => onOpen(image)}
        className="block w-full aspect-square"
        aria-label={`Open image for prompt: ${image.prompt}`}
      >
        <img
          src={image.image_url}
          alt={image.prompt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-ink-950/90 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <p className="text-xs text-paper/80 line-clamp-1 mb-2">{image.prompt}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFavorite(image)}
            aria-label={image.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={image.is_favorite}
            className="p-1.5 rounded-lg bg-ink-900/80 hover:bg-ink-700 transition-colors"
          >
            <Heart className={`w-4 h-4 ${image.is_favorite ? 'fill-spectrum-magenta text-spectrum-magenta' : 'text-paper'}`} />
          </button>
          <button
            onClick={() => onDownload(image)}
            aria-label="Download image"
            className="p-1.5 rounded-lg bg-ink-900/80 hover:bg-ink-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(image)}
            aria-label="Delete image"
            className="p-1.5 rounded-lg bg-ink-900/80 hover:bg-rose-900/60 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
