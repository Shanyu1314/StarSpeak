import React, { useState, useEffect } from 'react';
import { lookupWord, LookupMode } from '../services/unified-dictionary';
import { getWord, saveWord, toggleDrillStatus, getRecentWords, deleteWord } from '../services/storage';
import { WordEntry } from '../types';
import { SearchBar } from '../components/ui/search-bar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/ui/loading-spinner';
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
    <div className="h-full flex flex-col">
      {/* Header with Search Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {/* Mode Toggle Pills */}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setLookupMode('ai')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200",
                lookupMode === 'ai'
                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30 scale-105"
                  : "bg-white border-2 border-border text-foreground hover:border-sky-300 hover:bg-sky-50"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI 智能</span>
            </button>
            <button
              type="button"
              onClick={() => setLookupMode('offline')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200",
                lookupMode === 'offline'
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                  : "bg-white border-2 border-border text-foreground hover:border-emerald-300 hover:bg-emerald-50"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>离线词典</span>
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={(word) => handleSearch(undefined, word)}
            placeholder={lookupMode === 'ai' ? "输入单词，AI 智能查询..." : "输入单词，离线查询..."}
            suggestions={history.slice(0, 5).map(w => w.word)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">

        {loading && (
          <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
            <LoadingSpinner size="xl" text="正在查询..." className="py-20" />
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-rose-600 text-lg font-semibold mb-2">查询失败</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Result View */}
        {result && !loading && (
          <div className="p-6 max-w-4xl mx-auto space-y-6 animate-slide-up">

            {/* Word Header Card - Premium Design */}
            <Card className="rounded-3xl border-2 border-border bg-gradient-to-br from-white to-slate-50 shadow-2xl overflow-hidden relative group hover:shadow-3xl transition-all duration-300">
              {/* Decorative top bar */}
              <div className="h-2 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500"></div>

              {/* Floating decoration */}
              <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-sky-400/10 to-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>

              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 space-y-3 mr-6">
                    <div className="flex items-center gap-3">
                      <h1 className={cn("font-extrabold text-foreground tracking-tight", result.word.length > 20 ? 'text-3xl' : 'text-5xl')}>
                        {result.word}
                      </h1>
                      <Badge variant="primary" size="sm" className="ml-2">
                        {lookupMode === 'ai' ? 'AI' : '离线'}
                      </Badge>
                    </div>

                    {result.phonetic && (
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xl text-primary bg-sky-100 px-4 py-2 rounded-xl">
                          /{result.phonetic}/
                        </span>
                        <button
                          onClick={() => speak(result.word)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          <span className="text-sm font-medium">发音</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Drill Toggle */}
                  <button
                    onClick={handleToggleDrill}
                    className={cn(
                      "flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-200 shadow-lg",
                      result.inDrill
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30 scale-105"
                        : "bg-white border-2 border-border text-muted-foreground hover:border-emerald-400"
                    )}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-xs font-bold">{result.inDrill ? '已加入' : '加入练习'}</span>
                  </button>
                </div>

                {/* Translation & Definition */}
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-2">中文释义</p>
                    <p className="text-3xl text-foreground font-bold">{result.translation_cn}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">英文释义</p>
                    <p className="text-lg text-muted-foreground leading-relaxed">{result.definition}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Example Card */}
            <Card className="rounded-3xl border-2 border-border bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">例句</h3>
                </div>
                <div className="flex items-start gap-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                  <p className="text-xl text-foreground italic leading-relaxed flex-1">"{result.example}"</p>
                  <button
                    onClick={() => speak(result.example)}
                    className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white hover:shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {setResult(null); setQuery('');}}
                className="flex-1 h-14 text-base rounded-2xl border-2 hover:bg-slate-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回列表
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="h-14 px-6 text-base rounded-2xl shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                删除
              </Button>
            </div>
          </div>
        )}

        {/* History List */}
        {!result && !loading && (
          <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">最近查询</h2>
                  <p className="text-sm text-muted-foreground">{history.length} 个单词</p>
                </div>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-32 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 animate-float">
                  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-muted-foreground mb-2">还没有查询记录</p>
                <p className="text-sm text-muted-foreground">开始搜索单词，建立你的词汇库</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {history.map((item, idx) => (
                  <div
                    key={`${item.word}-${idx}`}
                    onClick={() => { setResult(item); setQuery(item.word); }}
                    className="group relative bg-white hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 active:scale-[0.98] transition-all duration-200 p-5 rounded-2xl border-2 border-border hover:border-sky-300 flex justify-between items-center cursor-pointer shadow-md hover:shadow-xl"
                  >
                    {/* Drill indicator dot */}
                    {item.inDrill && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full"></div>
                    )}

                    <div className="flex items-center gap-4 flex-1 min-w-0 pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-foreground group-hover:text-sky-600 transition-colors truncate">
                            {item.word}
                          </span>
                          {item.inDrill && (
                            <Badge variant="success" size="sm">练习中</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground block truncate">{item.translation_cn}</span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-sky-100 group-hover:to-cyan-100 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                        <svg className="w-5 h-5 text-muted-foreground group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
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