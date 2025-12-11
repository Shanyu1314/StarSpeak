import React, { useState, useRef, useEffect } from 'react';
import { getFreeTalkResponse } from '../services/gemini';
import { ChatMessage, IWindow } from '../types';

const FreeTalkPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hey! I'm here to listen. What's on your mind today?", timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Format history for Gemini SDK
      const history = messages.concat(userMsg).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getFreeTalkResponse(history);
      
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Sorry, I got disconnected. Can you say that again?", timestamp: Date.now() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoice = () => {
    const win = window as unknown as IWindow;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return alert("Microphone not supported");

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.start();
    
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInputText(text);
      // Optional: Auto send
    };
  };

  return (
    <div className="h-full flex flex-col bg-space-900">
      <header className="p-4 border-b border-space-700 bg-space-800">
        <h1 className="font-bold text-white">Free Talk</h1>
        <p className="text-xs text-space-success">● Empathetic Mode Active</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-space-accent text-space-900 rounded-br-none' 
                : 'bg-space-800 text-slate-200 border border-space-700 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-space-800 p-4 rounded-2xl rounded-bl-none border border-space-700">
               <span className="animate-pulse">...</span>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-space-800 border-t border-space-700 safe-area-pb">
        <div className="flex items-center gap-2">
          <button onClick={toggleVoice} className="p-3 rounded-full bg-space-700 text-slate-300 hover:text-white hover:bg-space-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Say something..."
            className="flex-1 bg-space-900 border border-space-600 rounded-full py-3 px-4 text-white focus:border-space-accent focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            className="p-3 rounded-full bg-space-accent text-space-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeTalkPage;
