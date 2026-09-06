import { useEffect, useState } from 'react';
import { Users, Images, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { StatCardSkeleton } from '../components/LoadingSkeleton.jsx';
import api, { getErrorMessage } from '../services/api.js';

const PIE_COLORS = ['#7C6FFF', '#F2569B', '#F4A93E', '#3FD1D6', '#8B7CF6', '#E0447A'];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Admin</h1>
      <p className="text-paper/50 text-sm mb-6">Platform-wide usage and activity.</p>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          <>
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} accent="violet" />
            <StatCard label="Total Images" value={stats.totalImages} icon={Images} accent="magenta" />
            <StatCard label="Today's Generations" value={stats.todayGenerations} icon={Activity} accent="amber" />
            <StatCard label="Popular Style" value={stats.popularStyles[0]?.style?.replace('-', ' ') || '—'} icon={TrendingUp} accent="cyan" />
          </>
        )}
      </div>

      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
            <h2 className="font-medium mb-4">Images generated (last 30 days)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.dailyGenerations}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#F4F1EA99' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#F4F1EA99' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#11141F', border: '1px solid #252A3B', borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#F2569B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
            <h2 className="font-medium mb-4">Popular styles</h2>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.popularStyles.map((item) => ({
                    name: item.style,
                    value: item.count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
                >
                  {stats.popularStyles.map((entry, i) => (
                    <Cell
                      key={entry.style}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: '#11141F',
                    border: '1px solid #252A3B',
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
            <h2 className="font-medium mb-4">Recent users</h2>
            <ul className="space-y-3">
              {stats.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-paper/90">{u.name}</p>
                    <p className="text-paper/40 text-xs">{u.email}</p>
                  </div>
                  <span className="text-paper/40 text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
            <h2 className="font-medium mb-4">Recent generations</h2>
            <ul className="space-y-3">
              {stats.recentImages.map((img) => (
                <li key={img.id} className="flex items-center justify-between text-sm gap-3">
                  <p className="text-paper/90 line-clamp-1 flex-1">{img.prompt}</p>
                  <span className="text-paper/40 text-xs capitalize shrink-0">{img.style}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
