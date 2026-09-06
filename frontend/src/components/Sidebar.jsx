import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, Images, Heart, History, User, LogOut, Triangle, ShieldCheck, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/generate', label: 'Generate', icon: Sparkles },
  { to: '/dashboard/images', label: 'My Images', icon: Images },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { to: '/dashboard/history', label: 'Prompt History', icon: History },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = user?.role === 'admin'
    ? [...NAV_ITEMS, { to: '/dashboard/admin', label: 'Admin', icon: ShieldCheck }]
    : NAV_ITEMS;

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
      isActive ? 'bg-ink-800 text-paper' : 'text-paper/60 hover:text-paper hover:bg-ink-800/60'
    }`;

  const content = (
    <>
      <div className="flex items-center gap-2 font-display text-lg px-2 mb-8">
        <Triangle className="w-5 h-5 fill-spectrum-magenta text-spectrum-magenta" />
        Prism
      </div>
      <nav className="flex flex-col gap-1 flex-1" aria-label="Dashboard">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses} onClick={() => setMobileOpen(false)}>
            <Icon className="w-4.5 h-4.5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-paper/60 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
      >
        <LogOut className="w-4.5 h-4.5" /> Logout
      </button>
    </>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-ink-900 border border-ink-700"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-ink-800 p-5 h-screen sticky top-0">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-950/80" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-ink-950 border-r border-ink-800 p-5 flex flex-col">
            <button
              className="self-end p-1.5 mb-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
