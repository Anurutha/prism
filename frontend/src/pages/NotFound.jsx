import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-center px-5">
      <p className="font-display text-6xl text-spectrum-magenta mb-4">404</p>
      <h1 className="font-display text-2xl mb-2">Page not found</h1>
      <p className="text-paper/50 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary px-6 py-3">Back to home</Link>
    </div>
  );
}
