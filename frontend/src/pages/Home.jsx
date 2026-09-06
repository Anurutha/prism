import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Palette, Zap, History, Images, Heart, Lock, Cloud, Smartphone, ShieldCheck,
  Github, ArrowRight, Wand2,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon: Sparkles, title: 'AI Image Generation', desc: 'Turn a sentence into a fully realized image using state-of-the-art diffusion models.' },
  { icon: Palette, title: 'Multiple Styles', desc: 'Realistic, cinematic, anime, watercolor and more — nine distinct visual styles to choose from.' },
  { icon: Zap, title: 'Fast Generation', desc: 'Most images are ready in under 20 seconds, with clear progress feedback the whole way.' },
  { icon: History, title: 'Prompt History', desc: 'Every prompt you write is saved, so you can revisit and regenerate variations instantly.' },
  { icon: Images, title: 'Image Gallery', desc: 'A searchable, filterable gallery of everything you have ever generated.' },
  { icon: Heart, title: 'Favorites', desc: 'Star the images worth keeping and find them again in one place.' },
  { icon: Lock, title: 'Secure Authentication', desc: 'Passwords are hashed with bcrypt and sessions are protected with signed tokens.' },
  { icon: Cloud, title: 'Cloud Storage', desc: 'Every image is stored durably in the cloud and tied to your account only.' },
  { icon: Smartphone, title: 'Responsive Design', desc: 'A workspace that feels equally at home on a phone, tablet, or widescreen monitor.' },
  { icon: ShieldCheck, title: 'Privacy & Security', desc: 'You control your own images — nobody else can see, edit, or delete them.' },
];

const STEPS = [
  { title: 'Enter a prompt', desc: 'Describe the image you want in plain language.' },
  { title: 'We validate it', desc: 'Your request is checked for length and content before it goes anywhere.' },
  { title: 'The model gets to work', desc: 'Your prompt is sent to the image-generation model with your chosen style.' },
  { title: 'An image comes back', desc: 'The model renders a unique image matched to your description.' },
  { title: "It's stored safely", desc: 'The result is saved to your private cloud gallery.' },
  { title: 'You see the result', desc: 'The image appears in your workspace, ready to review.' },
  { title: 'Keep or refine it', desc: 'Download it, favorite it, or generate again with a tweaked prompt.' },
];

const GALLERY_SAMPLES = [
  { prompt: 'Bioluminescent forest at midnight', style: 'Fantasy', color: 'from-spectrum-violet to-ink-900' },
  { prompt: 'Vintage motorcycle in the desert', style: 'Cinematic', color: 'from-spectrum-amber to-ink-900' },
  { prompt: 'Koi fish made of stained glass', style: '3D', color: 'from-spectrum-cyan to-ink-900' },
  { prompt: 'A librarian cat in a cardigan', style: 'Illustration', color: 'from-spectrum-magenta to-ink-900' },
  { prompt: 'Floating tea house above the clouds', style: 'Watercolor', color: 'from-spectrum-violet to-spectrum-magenta' },
  { prompt: 'Neon-lit night market, rain-soaked streets', style: 'Realistic', color: 'from-spectrum-cyan to-spectrum-violet' },
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard/generate', { state: { prompt } });
    } else {
      navigate('/register', { state: { prompt } });
    }
  };

  return (
    <div className="bg-ink-950 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        <div>
          <p className="text-sm font-medium text-spectrum-cyan mb-4">Text-to-image, taken seriously</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
            Turn your imagination into stunning visuals with AI.
          </h1>
          <p className="text-paper/60 text-lg max-w-md mb-8">
            Write a sentence. Prism renders it into a fully-formed image in seconds —
            then keeps it organized, searchable, and yours alone.
          </p>

          <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
            <label htmlFor="hero-prompt" className="sr-only">Describe an image</label>
            <input
              id="hero-prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A lighthouse made of stained glass, sunrise..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary px-6 py-3 whitespace-nowrap">
              <Wand2 className="w-4 h-4" /> Generate Image
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#gallery" className="text-sm text-paper/70 hover:text-paper inline-flex items-center gap-1.5 transition-colors">
              Explore Gallery <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-paper/70 hover:text-paper inline-flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-4 h-4" /> View on GitHub
            </a>
          </div>
        </div>

        <div className="relative h-80 sm:h-96" aria-hidden="true">
          <div className="absolute inset-0 rounded-3xl bg-spectrum-fan opacity-90" />
          <div
            className="absolute top-6 left-2 w-40 rounded-2xl bg-ink-900/95 border border-ink-700 p-3 shadow-2xl animate-drift"
            style={{ '--tilt': '-6deg' }}
          >
            <div className="h-24 rounded-lg bg-gradient-to-br from-spectrum-violet to-ink-800 mb-2" />
            <p className="text-[11px] text-paper/70 line-clamp-1">Generating…</p>
          </div>
          <div
            className="absolute bottom-8 right-2 w-44 rounded-2xl bg-ink-900/95 border border-ink-700 p-3 shadow-2xl animate-drift"
            style={{ '--tilt': '5deg', animationDelay: '1.2s' }}
          >
            <div className="h-24 rounded-lg bg-gradient-to-br from-spectrum-amber to-ink-800 mb-2" />
            <p className="text-[11px] text-paper/70 line-clamp-1">"Neon night market…"</p>
          </div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 rounded-2xl bg-ink-900 border border-ink-700 p-3 shadow-2xl animate-drift"
            style={{ '--tilt': '2deg', animationDelay: '0.6s' }}
          >
            <div className="h-28 rounded-lg bg-gradient-to-br from-spectrum-cyan to-spectrum-magenta mb-2" />
            <p className="text-[11px] text-paper/80">Done in 14s</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-5 py-20 border-t border-ink-800">
        <h2 className="font-display text-3xl mb-2">Everything a generation workflow needs</h2>
        <p className="text-paper/60 mb-12 max-w-lg">No filler features — just the tools that make generating, organizing, and revisiting images painless.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-ink-800 p-5 hover:border-ink-700 transition-colors">
              <Icon className="w-5 h-5 text-spectrum-magenta mb-3" aria-hidden="true" />
              <h3 className="font-medium mb-1.5">{title}</h3>
              <p className="text-sm text-paper/55">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-20 border-t border-ink-800">
        <h2 className="font-display text-3xl mb-12">How it works</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-ink-800 p-5 relative">
              <span className="font-display text-2xl text-spectrum-cyan/70">{i + 1}</span>
              <h3 className="font-medium mt-2 mb-1.5">{step.title}</h3>
              <p className="text-sm text-paper/55">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Gallery */}
      <section id="gallery" className="max-w-6xl mx-auto px-5 py-20 border-t border-ink-800">
        <h2 className="font-display text-3xl mb-2">From the community</h2>
        <p className="text-paper/60 mb-10 max-w-lg">A glimpse of what people are creating. Sign up to build your own gallery.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GALLERY_SAMPLES.map((item) => (
            <div key={item.prompt} className="group rounded-2xl overflow-hidden border border-ink-800">
              <div className={`aspect-square bg-gradient-to-br ${item.color} relative`}>
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-ink-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm text-paper">{item.prompt}</p>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-paper/60">{item.style}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="max-w-6xl mx-auto px-5 py-24 border-t border-ink-800 text-center">
        <h2 className="font-display text-3xl sm:text-4xl mb-4">Built as a final-year AI &amp; Data Science project</h2>
        <p className="text-paper/60 max-w-xl mx-auto mb-8">
          Prism demonstrates a full production pipeline — authentication, a real diffusion-model
          integration, cloud storage, and role-based administration — end to end.
        </p>
        <Link to="/register" className="btn-primary px-7 py-3 inline-flex">Get Started for Free</Link>
      </section>

      <footer className="border-t border-ink-800 py-8 text-center text-xs text-paper/40">
        Prism — an AI image generation platform.
      </footer>
    </div>
  );
}
