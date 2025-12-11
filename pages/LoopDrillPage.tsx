import React, { useState, useEffect, useRef } from 'react';
import { getAllDrillWords } from '../services/storage';
import { getDrillScenario, checkDrillResponse } from '../services/gemini';
import { WordEntry, IWindow } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

type DrillState = 'idle' | 'generating' | 'ready' | 'listening' | 'analyzing' | 'feedback';

const LoopDrillPage: React.FC = () => {
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
      setCurrentScenario("Connection error. Try again.");
      setStatus('idle');
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setStatus('listening');
      recognitionRef.current.start();
    } else {
        alert("Microphone not supported.");
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
    <div className="h-full flex flex-col p-6 bg-background">
      <header className="mb-8 border-b border-border pb-4">
         <h2 className="text-2xl font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="text-3xl">↻</span> The Loop
         </h2>
         <p className="text-muted-foreground text-sm font-medium">Strict Mode. Repetition is key.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
        
        {status === 'idle' && (
          <div className="text-center space-y-8">
            <div className="space-y-2">
                <p className="text-muted-foreground">Words in queue</p>
                <div className="text-6xl font-black text-foreground">{drillWords.length}</div>
            </div>
            <Button 
                onClick={startRound}
                size="lg"
                className="rounded-full text-lg h-16 px-10 shadow-lg shadow-primary/20"
            >
                Start Drill
            </Button>
          </div>
        )}

        {status === 'generating' && (
             <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-primary font-medium">Configuring Scenario...</div>
             </div>
        )}

        {(status === 'ready' || status === 'listening' || status === 'analyzing' || status === 'feedback') && (
            <div className="w-full max-w-md space-y-6">
                {/* Scenario Card */}
                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-6">
                        <h3 className="text-muted-foreground text-xs font-bold uppercase mb-2">Scenario</h3>
                        <p className="text-xl text-foreground font-medium leading-relaxed">{currentScenario}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {drillWords.map(w => (
                                <span key={w.word} className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground border border-border font-mono">
                                    {w.word}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback Area */}
                {feedback && (
                    <div className={cn("p-6 rounded-2xl border animate-slide-up", feedback.passed ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500')}>
                        <p className="font-bold text-lg text-center">{feedback.msg}</p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex justify-center pt-4">
                    {status === 'feedback' ? (
                        <div className="flex gap-4 w-full">
                            {!feedback?.passed && (
                                <Button onClick={startListening} variant="destructive" className="flex-1 h-14 text-lg">
                                    Try Again
                                </Button>
                            )}
                            {feedback?.passed && (
                                <Button onClick={startRound} className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700">
                                    Next Rep
                                </Button>
                            )}
                        </div>
                    ) : (
                         <button 
                            onClick={startListening}
                            disabled={status === 'analyzing'}
                            className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                                status === 'listening' ? 'border-red-500 bg-red-500/20 scale-110 shadow-lg shadow-red-500/40' : 'border-primary text-primary hover:bg-primary/10',
                                status === 'analyzing' && 'opacity-50'
                            )}
                        >
                             {status === 'analyzing' ? (
                                 <span className="animate-pulse text-2xl">...</span>
                             ) : (
                                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                             )}
                        </button>
                    )}
                </div>
                
                {userTranscript && (
                    <p className="text-center text-muted-foreground text-sm italic">"{userTranscript}"</p>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default LoopDrillPage;