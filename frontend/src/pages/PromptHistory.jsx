import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { LineSkeleton } from '../components/LoadingSkeleton.jsx';
import { History } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';

export default function PromptHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/prompts');
      setHistory(data.history);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reuse = (item) => {
    navigate('/dashboard/generate', { state: { prompt: item.prompt } });
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Prompt History</h1>
      <p className="text-paper/50 text-sm mb-6">Every unique prompt you've used, most recent first.</p>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-ink-800">
              <div className="w-14 h-14 rounded-lg bg-ink-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2"><LineSkeleton width="w-2/3" /><LineSkeleton width="w-1/3" /></div>
            </div>
          ))}
        </div>
      )}

      {!error && !loading && history.length === 0 && (
        <EmptyState icon={History} title="No prompts yet" description="Prompts you use to generate images will show up here." />
      )}

      {!error && !loading && history.length > 0 && (
        <ul className="space-y-3">
          {history.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-ink-800 hover:border-ink-700 transition-colors">
              <img src={item.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-paper/90 line-clamp-1">{item.prompt}</p>
                <p className="text-xs text-paper/40 mt-0.5">{new Date(item.created_at).toLocaleDateString()} · {item.style}</p>
              </div>
              <button onClick={() => reuse(item)} className="btn-secondary shrink-0 px-3 py-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Reuse
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
