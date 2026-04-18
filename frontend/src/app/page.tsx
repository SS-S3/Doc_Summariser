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
    <main className="min-h-screen p-8 lg:p-24 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Document Intelligence
          </h1>
          <p className="text-gray-400 text-lg">AI-powered insights for your library</p>
        </div>
        <Link href="/qa">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.8)]">
            Ask AI
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No books found. Run the scraper to populate data.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link href={`/book/${book.id}`} key={book.id}>
              <div className="h-full bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer p-6 flex flex-col group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div className="flex justify-between items-start mb-4 z-10">
                  <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                    {book.genre || 'Unknown'}
                  </span>
                  <div className="flex items-center space-x-3 text-sm">
                    {book.sentiment && (
                      <div className={`w-2 h-2 rounded-full ${
                        book.sentiment.toLowerCase() === 'positive' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' :
                        book.sentiment.toLowerCase() === 'negative' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' :
                        'bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.5)]'
                      }`} title={`${book.sentiment} Sentiment`}></div>
                    )}
                    <div className="flex items-center text-yellow-500">
                      <span className="mr-1">★</span> {book.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2 text-white line-clamp-2 z-10 group-hover:text-indigo-400 transition-colors">
                  {book.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 z-10 flex-grow">
                  {book.summary || book.description || 'No summary available.'}
                </p>
                <div className="mt-auto z-10 pt-4 border-t border-gray-800/50 text-indigo-400 text-sm font-medium flex items-center">
                  View Insights
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
