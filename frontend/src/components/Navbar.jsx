import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Triangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#gallery', label: 'Gallery' },
  { to: '/#about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-ink-950/80 backdrop-blur border-b border-ink-800">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2 font-display text-lg" aria-label="Prism home">
          <Triangle className="w-5 h-5 fill-spectrum-magenta text-spectrum-magenta" />
          Prism
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-paper/70">
          {LINKS.map((link) => (
            <a key={link.to} href={link.to} className="hover:text-paper transition-colors">{link.label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="btn-primary px-5 py-2">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-paper/70 hover:text-paper transition-colors">Log in</Link>
              <Link to="/register" className="btn-primary px-5 py-2">Get Started</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-4 border-t border-ink-800 pt-4">
          {LINKS.map((link) => (
            <a key={link.to} href={link.to} onClick={() => setOpen(false)} className="text-sm text-paper/80">{link.label}</a>
          ))}
          {user ? (
            <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary justify-center">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-paper/80">Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary justify-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
