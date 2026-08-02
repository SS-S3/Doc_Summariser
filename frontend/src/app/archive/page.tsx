'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import AuthDialog from '../components/AuthDialog';
import NavBar from '../components/NavBar';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  sentiment: string;
  notes?: string;
}

type ArchiveData = {
  bookmarked?: Book[];
  reading?: Book[];
  finished?: Book[];
};

const SECTIONS: { key: keyof ArchiveData; label: string; icon: string }[] = [
  { key: 'reading', label: 'Currently Reading', icon: '◎' },
  { key: 'bookmarked', label: 'Bookmarked', icon: '✦' },
  { key: 'finished', label: 'Finished', icon: '✓' },
];

export default function ArchivePage() {
  const { token, username, authHeader } = useAuth();
  const [archive, setArchive] = useState<ArchiveData>({});
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/books/archive/`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => { setArchive(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const total = Object.values(archive).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-4xl mx-auto font-serif">
      <nav className="mb-12 border-b border-[var(--border)] pb-4 flex justify-between items-center">
        <Link href="/" className="no-underline text-xs uppercase font-bold tracking-widest hover:italic">
          ← Back to Library
        </Link>
        <NavBar />
      </nav>

      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 italic">My Archive</h1>
        <p className="text-[#6b6256] uppercase tracking-[0.4em] text-xs font-bold">
          {username ? `${username}'s Collection` : 'Personal Collection'} — {total} {total === 1 ? 'Manuscript' : 'Manuscripts'}
        </p>
      </header>

      {!token ? (
        <div className="text-center py-20 italic text-gray-600 border border-dashed border-[var(--border)]">
          <p className="mb-4">Sign in to access your personal archive.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="text-xs uppercase font-bold tracking-widest border border-[var(--border)] px-6 py-2 hover:bg-[var(--border)] hover:text-[var(--background)] transition-all"
          >
            Sign In
          </button>
          {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20 italic">Consulting personal records...</div>
      ) : total === 0 ? (
        <div className="text-center py-20 italic text-gray-600 border border-dashed border-[var(--border)]">
          <p className="mb-4">Your archive is empty.</p>
          <Link href="/" className="text-xs uppercase font-bold tracking-widest hover:italic no-underline">
            Browse the Library →
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {SECTIONS.map(({ key, label, icon }) => {
            const books = archive[key];
            if (!books?.length) return null;
            return (
              <section key={key}>
                <h2 className="text-xs uppercase font-black tracking-[0.4em] mb-8 border-y border-[var(--border)] py-3 flex items-center gap-3">
                  <span>{icon}</span>
                  <span>{label}</span>
                  <span className="font-normal opacity-50 ml-auto">{books.length}</span>
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {books.map((book) => (
                    <Link href={`/book/${book.id}`} key={book.id} className="no-underline group">
                      <article className="border border-[var(--border)] p-6 hover:bg-[var(--border)] hover:text-[var(--background)] transition-all">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-2xl font-bold group-hover:italic">{book.title}</h3>
                          <span className="text-[10px] font-mono opacity-60">Ref: {book.id.toString().padStart(4, '0')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs uppercase tracking-wider font-semibold opacity-70">
                          <span>{book.author}</span>
                          {book.genre && <><span className="w-1 h-1 bg-current rounded-full"></span><span>{book.genre}</span></>}
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          <span>{book.rating.toFixed(1)}/5.0</span>
                          {book.sentiment && <><span className="w-1 h-1 bg-current rounded-full"></span><span className="italic">{book.sentiment}</span></>}
                        </div>
                        {book.notes && (
                          <p className="mt-3 text-sm italic opacity-70 border-t border-current pt-3">
                            Note: {book.notes}
                          </p>
                        )}
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-[var(--border)] text-center text-xs italic text-gray-500 uppercase tracking-widest">
        Personal Archive — Curated by You
      </footer>
    </main>
  );
}
