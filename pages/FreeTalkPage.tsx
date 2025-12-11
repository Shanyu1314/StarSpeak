import React, { useState, useRef, useEffect } from 'react';
import { getFreeTalkResponse } from '../services/gemini';
import { ChatMessage, IWindow } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

const FreeTalkPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hey! I'm here to listen. What's on your mind today?", timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="p-4 border-b border-border bg-card/80 backdrop-blur z-10 shadow-sm">
        <h1 className="font-bold text-foreground">Free Talk</h1>
        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
            Empathetic Mode Active
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex w-full animate-slide-up", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-card text-card-foreground border border-border rounded-bl-none'
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start animate-fade-in">
             <div className="bg-card p-4 rounded-2xl rounded-bl-none border border-border flex gap-1">
               <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-card border-t border-border safe-area-pb">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button variant="secondary" size="icon" onClick={toggleVoice} className="rounded-full shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </Button>
          <Input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Say something..."
            className="flex-1 rounded-full border-border bg-background focus-visible:ring-primary"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            size="icon"
            className="rounded-full shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FreeTalkPage;