'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import NavBar from '../../components/NavBar';

type ArchiveStatus = 'bookmarked' | 'reading' | 'finished' | null;

interface Book {
  id: number;
  title: string;
  author: string;
  rating: number;
  reviews_count: number;
  description: string;
  book_url: string;
  summary: string;
  genre: string;
  sentiment: string;
  user_status?: { status: ArchiveStatus; notes: string } | null;
}

export default function BookDetailPage() {
  const params = useParams();
  const { token, authHeader } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus>(null);
  const [archiveSaving, setArchiveSaving] = useState(false);

  const handleArchive = async (newStatus: ArchiveStatus) => {
    if (!book || !token) return;
    setArchiveSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/books/${book.id}/archive/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(newStatus ? { status: newStatus } : {}),
      });
      if (res.ok) setArchiveStatus(newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setArchiveSaving(false);
    }
  };

  useEffect(() => {
    if (!params.id) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/books/${params.id}/`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setArchiveStatus(data.user_status ?? null);
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/books/${params.id}/recommendations/`)
          .then((res) => res.json())
          .then((recData) => setRecommendations(recData))
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        console.error('Failed to fetch book', err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-serif italic">
        Consulting the archive...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col font-serif">
        <h1 className="text-2xl mb-4 italic">Record not found.</h1>
        <Link href="/" className="text-[var(--accent)] hover:italic transition-all">Return to Library</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-4xl mx-auto font-serif">
      <nav className="mb-12 border-b border-[var(--border)] pb-4 flex justify-between items-center">
        <Link href="/" className="no-underline text-xs uppercase font-bold tracking-widest hover:italic">
          ← Back to Collection
        </Link>
        <div className="flex gap-4 items-center">
          <NavBar />
          <Link href="/qa" className="no-underline text-xs uppercase font-bold tracking-widest hover:italic">
            Inquire with the Archive →
          </Link>
        </div>
      </nav>

      <article className="border-4 border-double border-[var(--border)] p-10 lg:p-16 mb-20 bg-white/30 relative">
        <div className="absolute top-4 right-4 text-[10px] uppercase font-mono border border-[var(--border)] px-2 py-1">
          Catalog No. {book.id.toString().padStart(5, '0')}
        </div>

        <header className="mb-12 text-center">
          <div className="text-sm uppercase tracking-[0.3em] font-semibold text-[#7c4d3a] mb-4">
            {book.genre || 'General Literature'}
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {book.title}
          </h1>
          <p className="text-2xl italic text-gray-600">by {book.author}</p>
          
          <div className="mt-6 flex justify-center items-center gap-6 text-sm uppercase font-bold tracking-widest">
            <span>Rating: {book.rating.toFixed(1)}/5.0</span>
            {book.sentiment && <span className="italic border border-[var(--border)] px-3 py-1">{book.sentiment} Tone</span>}
          </div>

          {/* Personal Archive Controls */}
          {token && (
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              {(['bookmarked', 'reading', 'finished'] as const).map((s) => (
                <button
                  key={s}
                  disabled={archiveSaving}
                  onClick={() => handleArchive(archiveStatus === s ? null : s)}
                  className={`text-[10px] uppercase font-bold tracking-widest px-4 py-2 border transition-all ${
                    archiveStatus === s
                      ? 'bg-[var(--border)] text-[var(--background)]'
                      : 'border-[var(--border)] hover:bg-[var(--border)] hover:text-[var(--background)]'
                  } disabled:opacity-40`}
                >
                  {s === 'bookmarked' ? '✦ Bookmark' : s === 'reading' ? '◎ Reading' : '✓ Finished'}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="space-y-12 max-w-2xl mx-auto">
          <section>
            <h3 className="text-xs uppercase font-black tracking-widest mb-6 border-b border-[var(--border)] pb-2 flex justify-between items-center">
              <span>Artificial Intelligence Synthesis</span>
              <span className="text-[10px] font-normal italic">Generated Report</span>
            </h3>
            <div className="text-xl leading-relaxed italic text-[#2d2a26] first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-[1]">
              {book.summary || 'Summary pending analysis.'}
            </div>
          </section>

          <section className="pt-8 opacity-70">
            <h3 className="text-xs uppercase font-bold tracking-widest mb-4">Source Description</h3>
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
              {book.description || 'No source description provided.'}
            </p>
          </section>

          {book.book_url && (
            <div className="text-center pt-12">
              <a href={book.book_url} target="_blank" rel="noopener noreferrer" className="no-underline text-xs uppercase font-bold tracking-tighter border-b-2 border-[var(--border)] hover:bg-[var(--border)] hover:text-white transition-all px-4 py-2">
                Consult Original Manuscript
              </a>
            </div>
          )}
        </div>
      </article>

      {recommendations.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xs uppercase font-black tracking-[0.4em] mb-12 text-center border-y border-[var(--border)] py-4">
            Further Reading In This Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {recommendations.map((rec) => (
              <Link href={`/book/${rec.id}`} key={rec.id} className="no-underline group">
                <div className="border border-[var(--border)] p-8 hover:bg-[var(--border)] hover:text-white transition-all">
                  <div className="text-[10px] uppercase mb-2 opacity-60 tracking-widest">{rec.genre}</div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:italic">{rec.title}</h3>
                  <div className="text-xs uppercase font-bold tracking-widest">Reference {rec.id.toString().padStart(4, '0')} →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-32 pt-8 border-t border-[var(--border)] text-center text-xs italic text-gray-500 uppercase tracking-widest">
        Official Digital Archive Entry — Page {book.id}
      </footer>
    </main>
  );
}
