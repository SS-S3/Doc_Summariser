'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
}

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    
    // Fetch book details
    fetch(`http://127.0.0.1:8000/api/books/${params.id}/`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        // Fetch recommendations once book is loaded
        fetch(`http://127.0.0.1:8000/api/books/${params.id}/recommendations/`)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h1 className="text-2xl text-gray-300 mb-4">Book not found</h1>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-5xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-flex items-center transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Dashboard
      </Link>

      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-semibold rounded-full border border-indigo-500/30 shadow-[0_0_10px_rgba(79,70,229,0.2)]">
                {book.genre || 'Unknown Genre'}
              </span>
              <div className="flex items-center text-yellow-500">
                <span className="mr-1 text-lg">★</span> {book.rating.toFixed(1)}
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 text-white">
              {book.title}
            </h1>
            <p className="text-xl text-gray-400 mb-8">by {book.author}</p>
            
            <div className="mb-8 p-6 bg-indigo-900/20 rounded-2xl border border-indigo-500/20 relative">
              <h3 className="text-indigo-400 font-bold mb-2 flex items-center uppercase tracking-wider text-xs">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                AI Summary
              </h3>
              <p className="text-gray-200 leading-relaxed text-lg">
                {book.summary || 'Summary is being generated...'}
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-400 font-semibold mb-2">Original Description</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {book.description || 'No description available.'}
              </p>
            </div>
            
            {book.book_url && (
              <a href={book.book_url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-gray-600">
                View Original Source
              </a>
            )}
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <span className="w-8 h-1 bg-indigo-500 rounded-full mr-3"></span>
            Similar Books
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <Link href={`/book/${rec.id}`} key={rec.id}>
                <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-colors cursor-pointer group h-full flex flex-col">
                  <div className="text-xs text-indigo-400 mb-2">{rec.genre}</div>
                  <h3 className="text-gray-200 font-bold mb-2 line-clamp-2 group-hover:text-white transition-colors">{rec.title}</h3>
                  <div className="mt-auto pt-3 flex items-center text-yellow-500 text-xs border-t border-gray-800">
                    <span className="mr-1">★</span> {rec.rating.toFixed(1)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
