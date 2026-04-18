'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function QAPage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setAnswer('');
    setCitations([]);
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/qa/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });
      
      const data = await res.json();
      setAnswer(data.answer || 'No answer generated.');
      setCitations(data.citations || []);
    } catch (err) {
      console.error(err);
      setAnswer('Failed to get an answer. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-4xl mx-auto flex flex-col">
      <Link href="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-flex items-center transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Dashboard
      </Link>
      
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Intelligent Q&A
        </h1>
        <p className="text-gray-400 text-lg">Ask questions across your entire library using our advanced RAG pipeline.</p>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[60vh] relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg className="w-64 h-64 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>

        <div className="flex-grow p-6 overflow-y-auto z-10 flex flex-col space-y-4">
          {/* Welcome Message */}
          <div className="flex justify-start">
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-tl-none px-6 py-4 max-w-[80%]">
              <p className="text-gray-200">Hello! I am your AI Librarian. What would you like to know about your book collection?</p>
            </div>
          </div>

          {/* User Query */}
          {query && (answer || loading) && (
            <div className="flex justify-end">
              <div className="bg-indigo-600 border border-indigo-500/50 rounded-2xl rounded-tr-none px-6 py-4 max-w-[80%] text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <p>{query}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-tl-none px-6 py-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {/* Answer */}
          {answer && !loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-tl-none px-6 py-4 max-w-[90%]">
                <div className="text-gray-200 prose prose-invert max-w-none mb-4 whitespace-pre-wrap">
                  {answer}
                </div>
                
                {citations && citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Sources Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {citations.map((cit, idx) => (
                        <Link href={`/book/${cit.book_id}`} key={idx}>
                          <span className="inline-block bg-gray-900 border border-gray-700 hover:border-indigo-500/50 text-xs text-gray-400 hover:text-indigo-300 px-2 py-1 rounded transition-colors cursor-pointer">
                            {cit.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800/50 bg-gray-900/80 z-10">
          <form onSubmit={handleAsk} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the books..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-4 pl-6 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent placeholder-gray-500 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6m0 0l-7 7m7-7l7 7"></path></svg>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
