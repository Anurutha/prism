import ImageCard from './ImageCard.jsx';
import EmptyState from './EmptyState.jsx';
import { ImageGridSkeleton } from './LoadingSkeleton.jsx';
import { ImageOff } from 'lucide-react';

export default function ImageGallery({ images, loading, onOpen, onToggleFavorite, onDownload, onDelete, emptyMessage }) {
  if (loading) return <ImageGridSkeleton />;

  if (!images || images.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title="No images yet"
        description={emptyMessage || 'Generate your first image to see it appear here.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
