import React, { useState, useEffect } from 'react';
import { aiLookupWord } from '../services/gemini';
import { getWord, saveWord, toggleDrillStatus, getRecentWords } from '../services/storage';
import { WordEntry } from '../types';

const LookupPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WordEntry | null>(null);
  const [history, setHistory] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const recent = await getRecentWords(50); // Fetch more history
      setHistory(recent);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleSearch = async (e?: React.FormEvent, searchWord?: string) => {
    if (e) e.preventDefault();
    const targetWord = (searchWord || query).trim();
    if (!targetWord) return;

    setLoading(true);
    setError('');
    setResult(null);
    setQuery(targetWord);

    try {
      // 1. Try Local First
      const localData = await getWord(targetWord);
      
      if (localData) {
        setResult(localData);
      } else {
        // 2. Fallback to AI
        const aiData = await aiLookupWord(targetWord);
        setResult(aiData);
        await saveWord(aiData);
        await loadHistory(); // Refresh history immediately
      }
    } catch (err) {
      setError("Could not find definition. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDrill = async () => {
    if (!result) return;
    const newStatus = !result.inDrill;
    await toggleDrillStatus(result.word, newStatus);
    setResult({ ...result, inDrill: newStatus });
    // Also update history list state to reflect change
    setHistory(prev => prev.map(w => w.word === result.word ? { ...w, inDrill: newStatus } : w));
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="h-full flex flex-col bg-space-900">
      {/* Search Bar */}
      <div className="p-4 bg-space-800/90 backdrop-blur-md border-b border-space-700 sticky top-0 z-20">
        <form onSubmit={(e) => handleSearch(e)} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lightning Lookup..."
            className="w-full bg-space-900 border border-space-600 rounded-2xl py-4 pl-5 pr-14 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-space-accent focus:ring-1 focus:ring-space-accent transition-all shadow-lg"
          />
          <button 
            type="submit"
            className="absolute right-3 top-3 bottom-3 bg-space-700 hover:bg-space-600 text-white p-2 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {loading && (
          <div className="flex flex-col items-center justify-center mt-20 space-y-4 animate-fade-in-up">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-space-accent"></div>
            <p className="text-slate-500 text-sm animate-pulse">Consulting the archive...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in-up">
            <div className="text-space-danger text-5xl mb-4">!</div>
            <p className="text-space-danger text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Result View */}
        {result && !loading && (
          <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            
            {/* Word Header Card */}
            <div className="bg-gradient-to-br from-space-800 to-slate-900 rounded-3xl p-6 border border-space-700 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-space-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-space-accent/10"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1 flex-1 mr-4">
                  {/* Word / Sentence Display */}
                  <h1 className={`font-extrabold text-white tracking-tight break-words ${result.word.length > 20 ? 'text-2xl' : 'text-4xl'}`}>
                    {result.word}
                  </h1>
                  
                  {/* Phonetic (Only show if present) */}
                  {result.phonetic && (
                    <div className="flex items-center space-x-3 text-space-accent mt-2">
                      <span className="font-mono text-lg opacity-80">/{result.phonetic}/</span>
                      <button 
                        onClick={() => speak(result.word)}
                        className="p-1.5 hover:bg-space-accent/10 rounded-full transition-colors"
                        aria-label="Play pronunciation"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      </button>
                    </div>
                  )}
                  {/* If no phonetic (sentence mode), still allow TTS for the sentence */}
                  {!result.phonetic && (
                     <button 
                        onClick={() => speak(result.word)}
                        className="mt-2 text-space-accent flex items-center space-x-2 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                         <span>Play Audio</span>
                      </button>
                  )}
                </div>
                
                {/* Drill Toggle */}
                <button
                  onClick={handleToggleDrill}
                  className={`flex shrink-0 flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                    result.inDrill 
                      ? 'bg-space-accent text-space-900 shadow-[0_0_15px_rgba(56,189,248,0.4)]' 
                      : 'bg-space-700 text-slate-400'
                  }`}
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span className="text-[10px] font-bold uppercase">{result.inDrill ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-space-700/50">
                <p className="text-2xl text-slate-100 font-bold mb-1 break-words">{result.translation_cn}</p>
                <p className="text-slate-400 leading-relaxed">{result.definition}</p>
              </div>
            </div>

            {/* Example Card */}
            <div className="bg-space-800 rounded-3xl p-6 border border-space-700 shadow-lg">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Context</h3>
              <div className="flex items-start gap-4">
                <p className="text-lg text-slate-200 italic leading-relaxed flex-1 break-words">"{result.example}"</p>
                <button 
                  onClick={() => speak(result.example)}
                  className="shrink-0 p-3 bg-space-700 hover:bg-space-600 rounded-full text-space-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
              </div>
            </div>

            <button 
              onClick={() => {setResult(null); setQuery('');}}
              className="w-full py-4 text-slate-500 text-sm hover:text-white transition-colors"
            >
              Close & Back to History
            </button>
          </div>
        )}

        {/* History List (Only show when no result) */}
        {!result && !loading && (
          <div className="max-w-2xl mx-auto p-4 animate-fade-in-up">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Recent Discoveries</h2>
            
            {history.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p>No words yet. Search to build your deck.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div 
                    key={`${item.word}-${idx}`}
                    onClick={() => { setResult(item); setQuery(item.word); }}
                    className="bg-space-800 hover:bg-space-700/80 active:scale-[0.99] transition-all p-4 rounded-xl border border-space-700/50 flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-white font-bold text-lg mr-3 block truncate">{item.word}</span>
                      <span className="text-slate-400 text-sm block truncate">{item.translation_cn}</span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      {item.inDrill && <span className="w-2 h-2 rounded-full bg-space-accent shadow-[0_0_8px_rgba(56,189,248,0.6)]"></span>}
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LookupPage;