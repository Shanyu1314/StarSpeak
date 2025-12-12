import React, { useState, useRef, useEffect } from 'react';
import { getFreeTalkResponse } from '../services/gemini';
import { ChatMessage, IWindow } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LoadingDots } from '../components/ui/loading-spinner';
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-border px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">自由对话</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></span>
                <p className="text-sm font-medium text-emerald-600">AI 正在倾听</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6" ref={scrollRef} style={{background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)'}}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full animate-slide-up", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-lg",
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white rounded-br-md'
                  : 'bg-white text-foreground border-2 border-border rounded-bl-md'
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white px-6 py-4 rounded-2xl rounded-bl-md border-2 border-border shadow-lg">
                <LoadingDots />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t-2 border-border safe-area-pb">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={toggleVoice}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-sky-100 hover:to-cyan-100 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <div className="relative flex-1 focus-glow rounded-2xl">
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="h-14 pl-5 pr-5 text-base rounded-2xl border-2 border-border bg-white shadow-md hover:shadow-lg transition-all"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            className="h-14 w-14 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FreeTalkPage;