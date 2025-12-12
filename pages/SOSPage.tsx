import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IWindow } from '../types';
import { aiSOSResponse } from '../services/gemini';
import { saveSOSScenario } from '../services/storage';
import { useAuth } from '../src/hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

const SOSPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<{ native: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleProcess(text);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const handleRecord = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    setTranscript('');
    setResult(null);
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const handleProcess = async (text: string) => {
    setLoading(true);
    try {
      const sosResult = await aiSOSResponse(text);
      setResult(sosResult);
      await saveSOSScenario({
        originalText: text,
        nativeExpression: sosResult.native,
        createdAt: Date.now()
      });
      speak(sosResult.native);
    } catch (e) {
      console.error(e);
      setTranscript("Error processing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-full flex flex-col p-6 bg-gradient-to-b from-background to-secondary/20">
      
      <header className="mb-10 mt-6 animate-slide-up">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Scene <span className="text-destructive">SOS</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Stuck? Say it in Chinese.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-2">{user?.email}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-10">
        
        {!result && !loading && (
          <button
            onClick={handleRecord}
            disabled={isRecording}
            className={`w-56 h-56 rounded-full flex items-center justify-center shadow-[0_0_50px_-10px_rgba(248,113,113,0.3)] transition-all duration-500 animate-fade-in
              ${isRecording 
                ? 'bg-destructive scale-110 shadow-[0_0_80px_-10px_rgba(248,113,113,0.6)] animate-pulse-slow' 
                : 'bg-gradient-to-br from-destructive to-red-700 hover:scale-105 active:scale-95'
              }`}
          >
            <div className="text-center">
              {isRecording ? (
                 <span className="text-white font-bold text-2xl animate-pulse">Listening...</span>
              ) : (
                <>
                  <svg className="w-20 h-20 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  <span className="text-white font-bold text-xl tracking-wider">Hold to Ask</span>
                </>
              )}
            </div>
          </button>
        )}

        {loading && (
           <div className="w-full max-w-md space-y-4 animate-fade-in">
             <Skeleton className="h-32 w-full rounded-3xl" />
             <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
             </div>
           </div>
        )}

        {result && (
          <Card className="w-full border-none bg-card/80 backdrop-blur shadow-2xl animate-slide-up overflow-hidden ring-1 ring-white/10">
            <CardContent className="p-8">
              <div className="mb-6 text-muted-foreground text-sm border-b border-border pb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                <span>You wanted to say:</span> 
                <span className="text-foreground italic font-medium">"{transcript}"</span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Native Option</h3>
                <p className="text-3xl text-foreground font-semibold leading-tight">{result.native}</p>
              </div>

              <div className="mb-8">
                 <h3 className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-2">Why?</h3>
                 <p className="text-secondary-foreground text-base leading-relaxed">{result.explanation}</p>
              </div>

              <div className="grid gap-3">
                <Button 
                  onClick={() => speak(result.native)}
                  size="lg"
                  className="w-full text-lg h-14"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  Listen Again
                </Button>
                
                <Button
                   variant="ghost"
                   onClick={() => { setResult(null); setTranscript(''); }}
                   className="w-full text-muted-foreground hover:text-foreground"
                >
                  Ask Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SOSPage;