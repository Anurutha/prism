import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Triangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../services/api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!', 'success');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display text-lg justify-center mb-8">
          <Triangle className="w-5 h-5 fill-spectrum-magenta text-spectrum-magenta" /> Prism
        </Link>

        <div className="rounded-2xl border border-ink-800 bg-ink-900 p-7">
          <h1 className="font-display text-2xl mb-1">Welcome back</h1>
          <p className="text-sm text-paper/50 mb-6">Log in to continue generating.</p>

          {error && (
            <p role="alert" className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm text-paper/70 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-paper/70 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Log in
            </button>
          </form>

          <p className="text-sm text-paper/50 text-center mt-6">
            Don't have an account? <Link to="/register" className="text-spectrum-cyan hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
