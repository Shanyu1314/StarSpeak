import React, { useState, useEffect, useRef } from 'react';
import { getAllDrillWords } from '../services/storage';
import { getDrillScenario, checkDrillResponse } from '../services/gemini';
import { WordEntry, IWindow } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { cn } from '../lib/utils';
import { useLanguage } from '../src/i18n/LanguageContext';

type DrillState = 'idle' | 'generating' | 'ready' | 'listening' | 'analyzing' | 'feedback';

const LoopDrillPage: React.FC = () => {
  const { t } = useLanguage();
  const [drillWords, setDrillWords] = useState<WordEntry[]>([]);
  const [currentScenario, setCurrentScenario] = useState('');
  const [status, setStatus] = useState<DrillState>('idle');
  const [feedback, setFeedback] = useState<{ passed: boolean; msg: string } | null>(null);
  const [userTranscript, setUserTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadWords();
    initSpeech();
  }, []);

  const initSpeech = () => {
    const win = window as unknown as IWindow;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setUserTranscript(text);
        handleSubmitResponse(text);
      };
      recognitionRef.current.onerror = () => setStatus('ready');
    }
  };

  const loadWords = async () => {
    const words = await getAllDrillWords();
    const shuffled = words.sort(() => 0.5 - Math.random()).slice(0, 3);
    setDrillWords(shuffled);
  };

  const startRound = async () => {
    setStatus('generating');
    setFeedback(null);
    setUserTranscript('');
    
    const wordList = drillWords.map(w => w.word);
    if (wordList.length === 0) {
        wordList.push('coffee', 'morning');
    }
    
    try {
      const scenario = await getDrillScenario(wordList);
      setCurrentScenario(scenario);
      speak(scenario);
      setStatus('ready');
    } catch (e) {
      setCurrentScenario(t('loopDrill.connectionError'));
      setStatus('idle');
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setStatus('listening');
      recognitionRef.current.start();
    } else {
        alert(t('loopDrill.microphoneNotSupported'));
    }
  };

  const handleSubmitResponse = async (text: string) => {
    setStatus('analyzing');
    try {
      const result = await checkDrillResponse(currentScenario, text);
      setFeedback({ passed: result.passed, msg: result.feedback });
      speak(result.feedback);
      setStatus('feedback');
    } catch (e) {
      setStatus('ready');
    }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-border px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  {t('loopDrill.title')}
                </h2>
                <p className="text-muted-foreground text-sm">{t('loopDrill.subtitle')}</p>
              </div>
            </div>
            <Badge variant="primary" size="lg" className="hidden sm:flex">
              {drillWords.length} {t('loopDrill.wordCount')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in overflow-y-auto"  style={{background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 50%, #ECFDF5 100%)'}}>
        
        {status === 'idle' && (
          <div className="text-center space-y-10">
            <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center animate-float">
              <div className="text-7xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {drillWords.length}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{t('loopDrill.readyToStart')}</p>
              <p className="text-muted-foreground">{t('common.words')} {drillWords.length} {t('loopDrill.queueStatus')}</p>
            </div>
            <Button
              onClick={startRound}
              className="h-16 px-12 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('loopDrill.startPractice')}
            </Button>
          </div>
        )}

        {status === 'generating' && (
          <div className="text-center space-y-6">
            <LoadingSpinner size="xl" />
            <div className="space-y-2">
              <p className="text-xl font-bold text-primary">{t('loopDrill.generatingScenario')}</p>
              <p className="text-muted-foreground">{t('loopDrill.pleaseWait')}</p>
            </div>
          </div>
        )}

        {(status === 'ready' || status === 'listening' || status === 'analyzing' || status === 'feedback') && (
            <div className="w-full max-w-2xl space-y-6">
                {/* Scenario Card */}
                <Card className="bg-white border-2 border-border shadow-2xl rounded-3xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('loopDrill.scenarioLabel')}</h3>
                    </div>
                    <p className="text-2xl text-foreground font-medium leading-relaxed mb-6">{currentScenario}</p>
                    <div className="flex flex-wrap gap-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                      {drillWords.map(w => (
                        <Badge key={w.word} variant="primary" size="md" className="font-mono">
                          {w.word}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Area */}
                {feedback && (
                  <Card className={cn(
                    "border-2 shadow-2xl rounded-3xl overflow-hidden animate-slide-up",
                    feedback.passed
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400'
                      : 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-400'
                  )}>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          feedback.passed ? 'bg-emerald-500' : 'bg-rose-500'
                        )}>
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {feedback.passed ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "text-xl font-bold mb-2",
                            feedback.passed ? 'text-emerald-700' : 'text-rose-700'
                          )}>
                            {feedback.passed ? t('loopDrill.excellent') : t('loopDrill.tryAgain')}
                          </p>
                          <p className={cn(
                            "text-base leading-relaxed",
                            feedback.passed ? 'text-emerald-600' : 'text-rose-600'
                          )}>
                            {feedback.msg}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Controls */}
                <div className="flex justify-center pt-4">
                    {status === 'feedback' ? (
                        <div className="flex gap-4 w-full">
                            {!feedback?.passed && (
                                <Button
                                  onClick={startListening}
                                  className="flex-1 h-16 text-lg font-semibold rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
                                >
                                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  {t('loopDrill.tryAgain')}
                                </Button>
                            )}
                            {feedback?.passed && (
                                <Button
                                  onClick={startRound}
                                  className="flex-1 h-16 text-lg font-semibold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl"
                                >
                                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  {t('loopDrill.nextOne')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                          <button
                            onClick={startListening}
                            disabled={status === 'analyzing'}
                            className={cn(
                              "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 relative",
                              status === 'listening'
                                ? 'bg-gradient-to-br from-rose-500 to-red-500 scale-110 shadow-2xl shadow-rose-500/50 animate-pulse'
                                : 'bg-gradient-to-br from-sky-500 to-cyan-500 hover:scale-105 shadow-xl hover:shadow-2xl',
                              status === 'analyzing' && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {status === 'analyzing' ? (
                              <LoadingSpinner size="lg" className="text-white" />
                            ) : (
                              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            )}
                            {status === 'listening' && (
                              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                            )}
                          </button>
                          <p className="text-lg font-medium text-muted-foreground">
                            {status === 'listening' ? t('loopDrill.listening') : status === 'analyzing' ? t('drill.analyzing') : t('loopDrill.clickToSpeak')}
                          </p>
                        </div>
                    )}
                </div>

                {userTranscript && (
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-indigo-600 mb-2">{t('loopDrill.yourResponse')}</p>
                      <p className="text-lg text-indigo-900 italic">"{userTranscript}"</p>
                    </CardContent>
                  </Card>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default LoopDrillPage;