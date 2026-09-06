import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PromptInput from '../components/PromptInput.jsx';
import GenerateButton from '../components/GenerateButton.jsx';
import ImageModal from '../components/ImageModal.jsx';
import { ImageGridSkeleton } from '../components/LoadingSkeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

const STATUS_MESSAGES = [
  'Sending your prompt to the model…',
  'Rendering pixels…',
  'Adding finishing touches…',
  'Almost there…',
];

export default function Generate() {
  const location = useLocation();
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    prompt: location.state?.prompt || '',
    negativePrompt: '',
    style: 'realistic',
    aspectRatio: '1:1',
    numImages: 1,
    seed: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [results, setResults] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const statusIntervalRef = useRef(null);

  useEffect(() => () => clearInterval(statusIntervalRef.current), []);

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) {
      showToast('Please enter a prompt first.', 'error');
      return;
    }
    setLoading(true);
    setResults([]);
    let i = 0;
    setStatusText(STATUS_MESSAGES[0]);
    statusIntervalRef.current = setInterval(() => {
      i = (i + 1) % STATUS_MESSAGES.length;
      setStatusText(STATUS_MESSAGES[i]);
    }, 3500);

    try {
      const payload = {
        prompt: settings.prompt,
        negativePrompt: settings.negativePrompt,
        style: settings.style,
        aspectRatio: settings.aspectRatio,
        numImages: settings.numImages,
        ...(settings.seed ? { seed: Number(settings.seed) } : {}),
      };
      const { data } = await api.post('/images/generate', payload);
      setResults(data.images);
      showToast(
        data.images.length > 1 ? `${data.images.length} images generated.` : 'Image generated.',
        'success'
      );
      if (data.partialFailures) {
        showToast(`${data.partialFailures} image(s) failed to generate.`, 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      clearInterval(statusIntervalRef.current);
      setLoading(false);
      setStatusText('');
    }
  };

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
      setResults((prev) => prev.map((img) => (img.id === image.id ? { ...img, is_favorite: !img.is_favorite } : img)));
      setActiveImage((prev) => (prev && prev.id === image.id ? { ...prev, is_favorite: !prev.is_favorite } : prev));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (image) => {
    try {
      await api.delete(`/images/${image.id}`);
      setResults((prev) => prev.filter((img) => img.id !== image.id));
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
    setSettings((s) => ({ ...s, prompt: image.prompt, style: image.style, aspectRatio: image.aspect_ratio }));
    setActiveImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Generate</h1>
      <p className="text-paper/50 text-sm mb-6">Describe what you want to see, tune the settings, and generate.</p>

      <PromptInput settings={settings} onChange={setSettings} />

      <div className="my-6">
        <GenerateButton
          onClick={handleGenerate}
          loading={loading}
          disabled={!settings.prompt.trim()}
          statusText={statusText}
        />
      </div>

      {loading && <ImageGridSkeleton count={settings.numImages} />}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((image) => (
            <button
              key={image.id}
              onClick={() => setActiveImage(image)}
              className="aspect-square rounded-xl overflow-hidden bg-ink-800 border border-ink-700 group relative"
            >
              <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>
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
