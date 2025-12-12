import React, { useState, useEffect } from 'react';
import { lookupWord, LookupMode } from '../services/unified-dictionary';
import { getWord, saveWord, toggleDrillStatus, getRecentWords, deleteWord } from '../services/storage';
import { WordEntry } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const LookupPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WordEntry | null>(null);
  const [history, setHistory] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lookupMode, setLookupMode] = useState<LookupMode>('ai');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const recent = await getRecentWords(50);
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
      // 1. 先检查本地历史记录
      const localData = await getWord(targetWord);
      if (localData) {
        setResult(localData);
        setLoading(false);
        return;
      }

      // 2. 使用统一查询服务（根据模式查询）
      const dictData = await lookupWord(targetWord, lookupMode);

      if (dictData) {
        setResult(dictData);
        await saveWord(dictData);
        await loadHistory();
      } else {
        if (lookupMode === 'offline') {
          setError("离线模式下未找到该单词。请切换到AI模式或尝试其他单词。");
        } else {
          setError("无法查询该单词，请检查网络连接。");
        }
      }
    } catch (err) {
      setError("查询失败，请检查网络连接。");
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDrill = async () => {
    if (!result) return;
    const newStatus = !result.inDrill;
    await toggleDrillStatus(result.word, newStatus);
    setResult({ ...result, inDrill: newStatus });
    setHistory(prev => prev.map(w => w.word === result.word ? { ...w, inDrill: newStatus } : w));
  };

  const handleDelete = async () => {
    if (!result) return;
    if (!confirm(`确定要删除单词 "${result.word}" 吗?`)) return;
    
    try {
      await deleteWord(result.word);
      setResult(null);
      setQuery('');
      await loadHistory();
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-4 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Mode Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant={lookupMode === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLookupMode('ai')}
              className="flex-1 max-w-[200px] rounded-xl transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 查词
            </Button>
            <Button
              type="button"
              variant={lookupMode === 'offline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLookupMode('offline')}
              className="flex-1 max-w-[200px] rounded-xl transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              离线查词
            </Button>
          </div>

          {/* Search Input */}
          <form onSubmit={(e) => handleSearch(e)} className="relative flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lookupMode === 'ai' ? "AI智能查词..." : "离线词典查询..."}
              className="text-lg h-14 pl-5 shadow-sm rounded-2xl border-border bg-card focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 rounded-2xl shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </Button>
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {loading && (
          <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
             <Skeleton className="h-64 w-full rounded-3xl" />
             <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
            <div className="text-destructive text-5xl mb-4">!</div>
            <p className="text-destructive text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Result View */}
        {result && !loading && (
          <div className="p-6 max-w-2xl mx-auto space-y-6 animate-slide-up">
            
            {/* Word Header Card */}
            <Card className="rounded-3xl border-border bg-card shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-primary/20"></div>
              
              <div className="p-6 flex justify-between items-start relative z-10">
                <div className="space-y-2 flex-1 mr-4">
                  <h1 className={cn("font-extrabold text-foreground tracking-tight break-words", result.word.length > 20 ? 'text-2xl' : 'text-4xl')}>
                    {result.word}
                  </h1>
                  
                  {result.phonetic ? (
                    <div className="flex items-center space-x-3 text-primary mt-2">
                      <span className="font-mono text-lg opacity-80 bg-primary/10 px-2 py-1 rounded">/{result.phonetic}/</span>
                      <Button variant="ghost" size="icon" onClick={() => speak(result.word)} className="rounded-full">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      </Button>
                    </div>
                  ) : (
                     <Button variant="ghost" onClick={() => speak(result.word)} className="text-primary mt-2 pl-0 hover:bg-transparent hover:text-primary/80">
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                         Play Audio
                      </Button>
                  )}
                </div>
                
                <Button
                  onClick={handleToggleDrill}
                  variant={result.inDrill ? "default" : "secondary"}
                  className={cn("flex flex-col h-16 w-16 rounded-2xl transition-all", result.inDrill && "shadow-lg shadow-primary/30")}
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span className="text-[10px] font-bold uppercase">{result.inDrill ? 'ON' : 'OFF'}</span>
                </Button>
              </div>

              <div className="p-6 pt-2 border-t border-border/50">
                <p className="text-2xl text-foreground font-bold mb-2 break-words">{result.translation_cn}</p>
                <p className="text-muted-foreground leading-relaxed text-base">{result.definition}</p>
              </div>
            </Card>

            {/* Example Card */}
            <Card className="rounded-3xl border-border bg-card shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Context</h3>
                <div className="flex items-start gap-4">
                  <p className="text-lg text-secondary-foreground italic leading-relaxed flex-1 break-words">"{result.example}"</p>
                  <Button size="icon" variant="secondary" onClick={() => speak(result.example)} className="shrink-0 rounded-full h-10 w-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="ghost"
                onClick={() => {setResult(null); setQuery('');}}
                className="h-12 text-muted-foreground hover:text-foreground"
              >
                返回列表
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                className="h-12"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                删除单词
              </Button>
            </div>
          </div>
        )}

        {/* History List */}
        {!result && !loading && (
          <div className="max-w-2xl mx-auto p-4 animate-fade-in">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">Recent Discoveries</h2>
            
            {history.length === 0 ? (
              <div className="text-center py-20 opacity-50 flex flex-col items-center">
                <svg className="w-16 h-16 mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p>No words yet.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {history.map((item, idx) => (
                  <div 
                    key={`${item.word}-${idx}`}
                    onClick={() => { setResult(item); setQuery(item.word); }}
                    className="group bg-card hover:bg-accent/10 active:scale-[0.99] transition-all p-4 rounded-xl border border-border flex justify-between items-center cursor-pointer shadow-sm"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-foreground font-bold text-lg mr-3 block truncate group-hover:text-primary transition-colors">{item.word}</span>
                      <span className="text-muted-foreground text-sm block truncate">{item.translation_cn}</span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      {item.inDrill && <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50"></span>}
                      <svg className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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