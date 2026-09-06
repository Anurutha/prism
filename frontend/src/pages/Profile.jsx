import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { StatCardSkeleton } from '../components/LoadingSkeleton.jsx';
import StatCard from '../components/StatCard.jsx';
import { Images, Heart, MessageSquare } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/profile');
        setStats(data.stats);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Profile</h1>

      <div className="rounded-2xl border border-ink-800 bg-ink-900 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-spectrum-fan flex items-center justify-center font-display text-2xl text-ink-950">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-medium text-lg">{user?.name}</h2>
            <p className="text-sm text-paper/50">{user?.email}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-paper/50">Account created</dt>
          <dd>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</dd>
          <dt className="text-paper/50">Role</dt>
          <dd className="capitalize">{user?.role}</dd>
        </dl>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {loading ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          <>
            <StatCard label="Total Generations" value={stats.totalImages} icon={Images} accent="violet" />
            <StatCard label="Favorites" value={stats.totalFavorites} icon={Heart} accent="magenta" />
            <StatCard label="Total Prompts" value={stats.totalPrompts} icon={MessageSquare} accent="cyan" />
          </>
        )}
      </div>

      <button onClick={logout} className="btn-secondary text-rose-400 hover:bg-rose-950/40">
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </div>
  );
}
