import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import ImageGallery from '../components/ImageGallery.jsx';
import ImageModal from '../components/ImageModal.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

const STYLES = ['', 'realistic', 'cinematic', 'anime', 'digital-art', 'fantasy', '3d', 'illustration', 'watercolor', 'minimalist'];

export default function MyImages({ favoritesOnly = false }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [activeImage, setActiveImage] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/images', {
        params: { search, style: style || undefined, sort, page, limit: 20, favoritesOnly: favoritesOnly || undefined },
      });
      setImages(data.images);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, style, sort, page, favoritesOnly]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  const handleDownload = async (image) => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prism-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Could not download the image.', 'error');
    }
  };

  const handleToggleFavorite = async (image) => {
    try {
      if (image.is_favorite) {
        await api.delete(`/images/${image.id}/favorite`);
      } else {
        await api.post(`/images/${image.id}/favorite`);
      }
      if (favoritesOnly) {
        setImages((prev) => prev.filter((img) => img.id !== image.id));
      } else {
        setImages((prev) => prev.map((img) => (img.id === image.id ? { ...img, is_favorite: !img.is_favorite } : img)));
      }
      setActiveImage((prev) => (prev && prev.id === image.id ? { ...prev, is_favorite: !prev.is_favorite } : prev));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (image) => {
    try {
      await api.delete(`/images/${image.id}`);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      setActiveImage(null);
      showToast('Image deleted.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleCopyPrompt = async (image) => {
    await navigator.clipboard.writeText(image.prompt);
    showToast('Prompt copied to clipboard.', 'success');
  };

  const handleRegenerate = (image) => {
    window.location.href = '/dashboard/generate';
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">{favoritesOnly ? 'Favorites' : 'My Images'}</h1>
      <p className="text-paper/50 text-sm mb-6">
        {favoritesOnly ? 'Images you have starred for safekeeping.' : 'Every image you have generated, in one place.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by prompt…"
            aria-label="Search images by prompt"
            className="input-field pl-10"
          />
        </div>
        <select value={style} onChange={(e) => { setStyle(e.target.value); setPage(1); }} className="input-field sm:w-44" aria-label="Filter by style">
          <option value="">All styles</option>
          {STYLES.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-40" aria-label="Sort order">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <ImageGallery
            images={images}
            loading={loading}
            onOpen={setActiveImage}
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
            onDelete={handleDelete}
            emptyMessage={favoritesOnly ? 'Favorite an image to see it here.' : 'Generate your first image to see it here.'}
          />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-paper/50">Page {page} of {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {activeImage && (
        <ImageModal
          image={activeImage}
          onClose={() => setActiveImage(null)}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onCopyPrompt={handleCopyPrompt}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
