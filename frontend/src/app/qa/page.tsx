'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QAPage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Persistence logic
  useEffect(() => {
    const savedQuery = localStorage.getItem('qa_query');
    const savedAnswer = localStorage.getItem('qa_answer');
    const savedCitations = localStorage.getItem('qa_citations');
    
    if (savedQuery) setQuery(savedQuery);
    if (savedAnswer) setAnswer(savedAnswer);
    if (savedCitations) setCitations(JSON.parse(savedCitations));
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setAnswer('');
    setCitations([]);
    
    // Save query immediately
    localStorage.setItem('qa_query', query);
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/qa/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });
      
      const data = await res.json();
      const newAnswer = data.answer || 'The archive provides no record for this inquiry.';
      const newCitations = data.citations || [];
      
      setAnswer(newAnswer);
      setCitations(newCitations);
      
      // Save results
      localStorage.setItem('qa_answer', newAnswer);
      localStorage.setItem('qa_citations', JSON.stringify(newCitations));
    } catch (err) {
      console.error(err);
      setAnswer('Communication with the archival server has failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-24 max-w-4xl mx-auto font-serif">
      <nav className="mb-12 border-b border-[var(--border)] pb-4">
        <Link href="/" className="no-underline text-xs uppercase font-bold tracking-widest hover:italic">
          ← Back to Library
        </Link>
      </nav>
      
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 italic">The Inquisitor</h1>
        <p className="text-[#6b6256] uppercase tracking-[0.4em] text-xs font-bold">Inquire within the Digital Archive</p>
      </header>
      
      <div className="border-t border-b-4 border-double border-[var(--border)] py-12 mb-12">
        <form onSubmit={handleAsk} className="mb-12">
          <label className="block text-center text-xs uppercase font-black tracking-widest mb-6 italic">
            State your inquiry below
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Which books involve mystery and high stakes?"
              className="flex-grow bg-transparent border-b-2 border-[var(--border)] py-4 text-2xl focus:outline-none focus:italic placeholder:italic placeholder:opacity-30"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="border-2 border-[var(--border)] px-10 py-4 uppercase font-bold tracking-widest hover:bg-[var(--border)] hover:text-white transition-all disabled:opacity-30"
            >
              Consult
            </button>
          </div>
        </form>

        <div className="min-h-[300px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center italic text-gray-500 animate-pulse">
              Scrutinizing the manuscripts...
            </div>
          )}

          {!loading && answer && (
            <div className="animate-in fade-in duration-700 relative group">
              <div className="absolute top-0 right-0 flex gap-4 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(answer);
                    alert('Record copied to clipboard.');
                  }}
                  className="text-[10px] uppercase font-bold border border-[var(--border)] px-3 py-1 hover:bg-[var(--border)] hover:text-white transition-all"
                >
                  Copy Record
                </button>
                <button 
                  onClick={() => window.print()}
                  className="text-[10px] uppercase font-bold border border-[var(--border)] px-3 py-1 hover:bg-[var(--border)] hover:text-white transition-all"
                >
                  Print Page
                </button>
              </div>

              <div className="text-xs uppercase font-bold tracking-widest mb-6 border-b border-[var(--border)] pb-2">
                Archival Response
              </div>
              <div className="text-2xl leading-relaxed italic text-[#2d2a26] mb-12 whitespace-pre-wrap">
                {answer}
              </div>
              
              {citations && citations.length > 0 && (
                <div className="pt-8 border-t border-dashed border-[var(--border)]">
                  <h4 className="text-xs uppercase font-bold tracking-widest mb-4 opacity-60">References cited in this response:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {citations.map((cit, idx) => (
                      <Link href={`/book/${cit.book_id}`} key={idx} className="no-underline">
                        <div className="border border-[var(--border)] p-4 text-sm hover:italic transition-all flex justify-between items-center">
                          <span>{cit.title}</span>
                          <span className="text-[10px] opacity-60">Ref: {cit.book_id}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !answer && (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Awaiting your command.
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 pt-8 text-center text-[10px] italic text-gray-500 uppercase tracking-widest">
        Proprietary Intelligence System — All queries logged in archival records.
      </footer>
    </main>
  );
}
