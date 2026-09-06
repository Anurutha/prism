import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Images, Heart, MessageSquare, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import { StatCardSkeleton } from '../components/LoadingSkeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: profileData }, { data: imagesData }] = await Promise.all([
        api.get('/profile'),
        api.get('/images', { params: { limit: 6 } }),
      ]);
      setStats(profileData.stats);
      setRecent(imagesData.images);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-paper/50 text-sm mt-1">Here's what's happening in your workspace.</p>
        </div>
        <Link to="/dashboard/generate" className="btn-primary px-5 py-2.5 hidden sm:inline-flex">
          <Sparkles className="w-4 h-4" /> Generate New Image
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {loading ? (
              <>
                <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard label="Total Images" value={stats.totalImages} icon={Images} accent="violet" />
                <StatCard label="Favorites" value={stats.totalFavorites} icon={Heart} accent="magenta" />
                <StatCard label="Total Prompts" value={stats.totalPrompts} icon={MessageSquare} accent="cyan" />
              </>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent generations</h2>
            <Link to="/dashboard/images" className="text-sm text-spectrum-cyan hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-ink-800 animate-pulse" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center">
              <p className="text-paper/60 mb-4">You haven't generated any images yet.</p>
              <Link to="/dashboard/generate" className="btn-primary px-5 py-2.5 inline-flex">Generate your first image</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recent.map((img) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-ink-800">
                  <img src={img.image_url} alt={img.prompt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
