import React, { useState, useEffect, useRef } from 'react';
import { IWindow } from '../types';
import { aiSOSResponse } from '../services/gemini';
import { saveSOSScenario, getRecentSOS } from '../services/storage';

const SOSPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<{ native: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'zh-CN'; // Input language is Chinese as per requirements
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
      
      // Save to local history
      await saveSOSScenario({
        originalText: text,
        nativeExpression: sosResult.native,
        createdAt: Date.now()
      });

      // Auto play audio
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
    <div className="min-h-full flex flex-col p-6 bg-gradient-to-b from-space-900 to-space-800">
      
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Scene <span className="text-space-danger">SOS</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Stuck? Say it in Chinese.</p>
      </header>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        
        {!result && !loading && (
          <button
            onClick={handleRecord}
            disabled={isRecording}
            className={`w-48 h-48 rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(248,113,113,0.3)] transition-all duration-300 
              ${isRecording 
                ? 'bg-space-danger scale-110 shadow-[0_0_60px_-10px_rgba(248,113,113,0.6)] animate-pulse' 
                : 'bg-gradient-to-br from-space-danger to-red-600 hover:scale-105 active:scale-95'
              }`}
          >
            <div className="text-center">
              {isRecording ? (
                 <span className="text-white font-bold text-lg animate-bounce">Listening...</span>
              ) : (
                <>
                  <svg className="w-16 h-16 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  <span className="text-white font-bold text-lg">Hold to Ask</span>
                </>
              )}
            </div>
          </button>
        )}

        {loading && (
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-accent"></div>
        )}

        {result && (
          <div className="w-full bg-space-800 rounded-2xl p-6 border border-space-700 shadow-xl animate-fade-in-up">
            <div className="mb-4 text-slate-400 text-sm border-b border-space-700 pb-2">
              You wanted to say: <span className="text-slate-200 italic">"{transcript}"</span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-space-accent font-bold text-xs uppercase tracking-widest mb-1">Native Option</h3>
              <p className="text-2xl text-white font-medium leading-relaxed">{result.native}</p>
            </div>

            <div className="mb-6">
               <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Why?</h3>
               <p className="text-slate-300 text-sm">{result.explanation}</p>
            </div>

            <button 
              onClick={() => speak(result.native)}
              className="w-full py-3 bg-space-700 hover:bg-space-600 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              <span>Listen Again</span>
            </button>
            
            <button
               onClick={() => { setResult(null); setTranscript(''); }}
               className="w-full mt-3 py-3 text-slate-400 text-sm hover:text-white"
            >
              Ask Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSPage;
