import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const STYLES = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: '3d', label: '3D' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'minimalist', label: 'Minimalist' },
];

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export default function PromptInput({ settings, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <label htmlFor="prompt" className="block text-sm font-medium text-paper/70 mb-2">
        Describe the image you want to create
      </label>
      <textarea
        id="prompt"
        rows={4}
        value={settings.prompt}
        onChange={(e) => update('prompt', e.target.value)}
        placeholder="A futuristic city skyline at sunset, cinematic lighting, ultra realistic, highly detailed."
        maxLength={1000}
        className="input-field resize-none"
      />
      <p className="text-xs text-paper/40 mt-1 text-right">{settings.prompt.length}/1000</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        <div>
          <label htmlFor="style" className="block text-xs text-paper/60 mb-1.5">Style</label>
          <select id="style" value={settings.style} onChange={(e) => update('style', e.target.value)} className="input-field">
            {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="aspectRatio" className="block text-xs text-paper/60 mb-1.5">Aspect ratio</label>
          <select id="aspectRatio" value={settings.aspectRatio} onChange={(e) => update('aspectRatio', e.target.value)} className="input-field">
            {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="numImages" className="block text-xs text-paper/60 mb-1.5">Number of images</label>
          <select id="numImages" value={settings.numImages} onChange={(e) => update('numImages', Number(e.target.value))} className="input-field">
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-paper/60 hover:text-paper mt-4 transition-colors"
        aria-expanded={showAdvanced}
      >
        Advanced settings {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showAdvanced && (
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label htmlFor="negativePrompt" className="block text-xs text-paper/60 mb-1.5">Negative prompt</label>
            <input
              id="negativePrompt"
              type="text"
              value={settings.negativePrompt}
              onChange={(e) => update('negativePrompt', e.target.value)}
              placeholder="blurry, low quality, watermark"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="seed" className="block text-xs text-paper/60 mb-1.5">Seed (optional)</label>
            <input
              id="seed"
              type="number"
              value={settings.seed}
              onChange={(e) => update('seed', e.target.value)}
              placeholder="Random"
              className="input-field"
            />
          </div>
        </div>
      )}
    </div>
  );
}
