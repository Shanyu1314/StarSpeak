import React, { useState, useEffect, useRef } from 'react';
import { getAllDrillWords } from '../services/storage';
import { getDrillScenario, checkDrillResponse } from '../services/gemini';
import { WordEntry, IWindow } from '../types';

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
      recognitionRef.current.onerror = () => setStatus('ready'); // Reset if error
    }
  };

  const loadWords = async () => {
    const words = await getAllDrillWords();
    // Shuffle and pick 3 max for a micro-drill
    const shuffled = words.sort(() => 0.5 - Math.random()).slice(0, 3);
    setDrillWords(shuffled);
  };

  const startRound = async () => {
    setStatus('generating');
    setFeedback(null);
    setUserTranscript('');
    
    const wordList = drillWords.map(w => w.word);
    if (wordList.length === 0) {
        // Fallback if no words saved
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
      setStatus('ready'); // Allow retry
    }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 0.9; // Lower pitch for "Coach" persona
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-space-900">
      <header className="mb-6 border-b border-space-700 pb-4">
         <h2 className="text-2xl font-bold text-space-accent uppercase tracking-widest flex items-center gap-2">
            <span className="text-3xl">↻</span> The Loop
         </h2>
         <p className="text-slate-500 text-sm">Strict Mode. Repetition is key.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        
        {status === 'idle' && (
          <div className="text-center">
            <p className="text-slate-400 mb-6">
              Words in queue: <span className="text-white font-bold">{drillWords.length}</span>
            </p>
            <button 
                onClick={startRound}
                className="bg-space-accent text-space-900 font-bold px-8 py-4 rounded-full text-lg shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 transition-transform"
            >
                Start Drill
            </button>
          </div>
        )}

        {status === 'generating' && (
             <div className="animate-pulse text-space-accent">Configuring Scenario...</div>
        )}

        {(status === 'ready' || status === 'listening' || status === 'analyzing' || status === 'feedback') && (
            <div className="w-full max-w-md space-y-6">
                {/* Scenario Card */}
                <div className="bg-space-800 p-6 rounded-2xl border border-space-700">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Scenario</h3>
                    <p className="text-xl text-white font-medium">{currentScenario}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {drillWords.map(w => (
                            <span key={w.word} className="px-2 py-1 bg-space-700 rounded text-xs text-space-accent border border-space-600">
                                {w.word}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Feedback Area */}
                {feedback && (
                    <div className={`p-4 rounded-xl border ${feedback.passed ? 'bg-space-success/10 border-space-success text-space-success' : 'bg-space-danger/10 border-space-danger text-space-danger'}`}>
                        <p className="font-bold text-lg">{feedback.msg}</p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex justify-center pt-4">
                    {status === 'feedback' ? (
                        <div className="flex gap-4">
                            {!feedback?.passed && (
                                <button onClick={startListening} className="bg-space-danger text-white px-6 py-3 rounded-xl font-bold">
                                    Try Again
                                </button>
                            )}
                            {feedback?.passed && (
                                <button onClick={startRound} className="bg-space-success text-space-900 px-6 py-3 rounded-xl font-bold">
                                    Next Rep
                                </button>
                            )}
                        </div>
                    ) : (
                         <button 
                            onClick={startListening}
                            disabled={status === 'analyzing'}
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all
                                ${status === 'listening' ? 'border-red-500 bg-red-500/20 animate-pulse' : 'border-space-accent text-space-accent hover:bg-space-accent/10'}
                                ${status === 'analyzing' ? 'opacity-50' : ''}
                            `}
                        >
                             {status === 'analyzing' ? '...' : (
                                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                             )}
                        </button>
                    )}
                </div>
                
                {userTranscript && (
                    <p className="text-center text-slate-500 text-sm italic">"{userTranscript}"</p>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default LoopDrillPage;
