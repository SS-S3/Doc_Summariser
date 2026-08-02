'use client';
import { useState } from 'react';
import { useAuth } from './AuthContext';

interface AuthDialogProps {
  onClose: () => void;
}

export default function AuthDialog({ onClose }: AuthDialogProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? 'auth/login/' : 'auth/register/';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        login(data.access, data.username);
        onClose();
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--background)] border-4 border-double border-[var(--border)] p-10 w-full max-w-md font-serif relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs uppercase font-bold tracking-widest opacity-50 hover:opacity-100"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold italic mb-2 text-center">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#6b6256] mb-8">
          {mode === 'login' ? 'Access your personal archive' : 'Join the digital library'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border-b-2 border-[var(--border)] py-2 text-lg focus:outline-none focus:italic"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-[var(--border)] py-2 text-lg focus:outline-none focus:italic"
            />
          </div>

          {error && (
            <p className="text-[11px] italic text-[var(--accent)] border border-[var(--accent)] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-[var(--border)] py-3 uppercase font-bold tracking-widest hover:bg-[var(--border)] hover:text-[var(--background)] transition-all disabled:opacity-40"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--border)] pt-6">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-[11px] uppercase font-bold tracking-widest hover:italic"
          >
            {mode === 'login' ? 'No account? Register here →' : '← Back to Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
