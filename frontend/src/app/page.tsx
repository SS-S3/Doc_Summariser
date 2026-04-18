'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/books/')
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch books', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-5xl mx-auto font-serif">
      <header className="border-b-2 border-double border-[var(--border)] pb-8 mb-12 flex flex-col md:flex-row justify-between items-baseline gap-4">
        <div>
          <h1 className="text-5xl font-bold italic mb-2">
            The Digital Library
          </h1>
          <p className="text-[#6b6256] italic text-lg uppercase tracking-widest text-sm">Automated Intelligence & Literary Insights</p>
        </div>
        <Link href="/qa" className="no-underline">
          <button className="border border-[var(--border)] px-8 py-2 hover:bg-[var(--border)] hover:text-[var(--background)] transition-colors uppercase tracking-widest text-xs font-bold">
            Query the Archive
          </button>
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 italic">
          Fetching records...
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 italic text-gray-600 border border-dashed border-[var(--border)]">
          The archive is currently empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {books.map((book) => (
            <article key={book.id} className="group flex flex-col md:flex-row gap-8 pb-12 border-b border-[var(--border)] last:border-0">
              <div className="flex-grow">
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-3xl font-bold group-hover:italic transition-all">
                    <Link href={`/book/${book.id}`} className="no-underline">
                      {book.title}
                    </Link>
                  </h2>
                  <div className="text-sm font-mono uppercase tracking-tighter">
                    Ref: {book.id.toString().padStart(4, '0')}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-sm uppercase tracking-wider font-semibold text-[#7c4d3a]">
                  <span>{book.author}</span>
                  <span className="w-1 h-1 bg-[var(--border)] rounded-full"></span>
                  <span>{book.genre || 'General'}</span>
                  <span className="w-1 h-1 bg-[var(--border)] rounded-full"></span>
                  <span className="flex items-center">
                    Rating: {book.rating.toFixed(1)}/5.0
                  </span>
                </div>

                <p className="text-lg leading-relaxed text-[#4a453e] mb-6 line-clamp-3 italic">
                  "{book.summary || book.description || 'No description available in the records.'}"
                </p>

                <div className="flex items-center justify-between">
                  <Link href={`/book/${book.id}`} className="text-xs uppercase font-bold tracking-widest hover:pl-2 transition-all">
                    Read Full Entry →
                  </Link>
                  {book.sentiment && (
                    <div className="text-[10px] uppercase border border-[var(--border)] px-2 py-0.5 rounded italic">
                      Tone: {book.sentiment}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-[var(--border)] text-center text-xs italic text-gray-500 uppercase tracking-widest">
        End of Records — Curated by AI Librarian
      </footer>
    </main>
  );
}
