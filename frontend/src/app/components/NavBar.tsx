'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import AuthDialog from './AuthDialog';

export default function NavBar() {
  const { username, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4">
        {username ? (
          <>
            <span className="text-[10px] uppercase tracking-widest italic opacity-60">
              {username}
            </span>
            <Link href="/archive" className="no-underline text-[10px] uppercase font-bold tracking-widest hover:italic">
              My Archive
            </Link>
            <button
              onClick={logout}
              className="text-[10px] uppercase font-bold tracking-widest border border-[var(--border)] px-3 py-1 hover:bg-[var(--border)] hover:text-[var(--background)] transition-all"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="text-[10px] uppercase font-bold tracking-widest border border-[var(--border)] px-3 py-1 hover:bg-[var(--border)] hover:text-[var(--background)] transition-all"
          >
            Sign In
          </button>
        )}
      </div>
      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
    </>
  );
}
