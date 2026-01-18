
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Instagram, Zap, Ghost, MoreHorizontal, Copy, Check, MessageSquareOff, Share2 } from 'lucide-react';
import { CatMood, Message } from './types';
import { getCattyRoast } from './services/geminiService';
import CatAvatar from './components/CatAvatar';

const SUGGESTIONS = [
  "Roast my hairstyle 💇‍♂️",
  "Tu kitna bada namuna hai? 😺",
  "Am I smart? 🧠",
  "Chal ek badiya gaali de 🤬"
];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Oye chomu! Chatting shuru kar, warna nikal yahan se. blehhh",
      sender: 'cat',
      mood: CatMood.DISGUSTED,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<CatMood>(CatMood.DISGUSTED);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollHeight = scrollRef.current.scrollHeight;
      const height = scrollRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      scrollRef.current.scrollTo({
        top: maxScrollTop > 0 ? maxScrollTop : 0,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-5).map(m => ({ text: m.text, sender: m.sender }));
    
    try {
      const roast = await getCattyRoast(messageText, history);
      
      // Intentional personality delay
      await new Promise(r => setTimeout(r, 1000));

      const catMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: roast.reply,
        sender: 'cat',
        mood: roast.mood,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, catMsg]);
      setCurrentMood(roast.mood);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoast = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setShowToast(true);
    setTimeout(() => {
        setCopiedId(null);
        setShowToast(false);
    }, 2000);
  };

  const shareRoast = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Catty Roasted Me!',
          text: `"${text}" - Roasted by Catty`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
        copyRoast(text, 'share-fallback');
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      text: "Wipe kar diya memory? Chomu ka dimaag hi aisa hota hai. hehe",
      sender: 'cat',
      mood: CatMood.LAUGHING,
      timestamp: Date.now()
    }]);
    setCurrentMood(CatMood.LAUGHING);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white selection:bg-white selection:text-black overflow-hidden relative">
      {/* Toast Notification */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-none ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2">
            <Check size={14} /> Roast Copied, Bsdk!
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl">
            <Ghost size={18} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bungee leading-none">CATTY</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-white animate-ping' : 'bg-zinc-700'}`}></span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.1em]">
                {isLoading ? 'Thinking Roast...' : 'Awaiting Insult'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={clearChat}
            className="p-2 text-zinc-600 hover:text-white transition-all bg-zinc-900/40 rounded-lg border border-white/5"
          >
            <MessageSquareOff size={16} />
          </button>
          <a 
            href="https://instagram.com/aadi.nq" 
            target="_blank" 
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all shadow-white/10 shadow-lg"
          >
            <Instagram size={12} />
            <span className="hidden xs:inline">By aadi</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="scanner"></div>

        {/* Left Section (Cat Display) */}
        <div className="h-[30vh] md:h-full w-full md:w-[35%] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black to-zinc-950/50 md:border-r border-white/5 z-10">
          <CatAvatar mood={currentMood} />
          <div className="mt-4 md:mt-8 flex flex-col items-center gap-2">
             <div className="px-4 py-1 bg-zinc-900/60 rounded-full border border-white/5">
                <span className="text-[9px] text-zinc-400 font-black tracking-[0.4em] uppercase">
                  {currentMood}
                </span>
             </div>
             <p className="text-[10px] text-zinc-600 italic mono">"bhkkk chomu..."</p>
          </div>
        </div>

        {/* Right Section (Chat) */}
        <div className="flex-1 flex flex-col relative bg-zinc-950/20">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-10 pt-8 pb-44 space-y-6 scroll-smooth"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-pop group`}
              >
                <div className="relative max-w-[95%] sm:max-w-[85%]">
                  <div className={`px-5 py-3.5 rounded-2xl text-[13px] md:text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-white text-black font-bold rounded-tr-none' 
                      : 'bg-zinc-900/90 text-zinc-100 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.sender === 'cat' && (
                    <div className="absolute -bottom-6 left-0 flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                            onClick={() => copyRoast(msg.text, msg.id)}
                            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white uppercase tracking-tighter"
                        >
                            {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                            <span>Copy</span>
                        </button>
                        <button 
                            onClick={() => shareRoast(msg.text)}
                            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white uppercase tracking-tighter"
                        >
                            <Share2 size={12} />
                            <span>Share</span>
                        </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start message-pop">
                <div className="bg-zinc-900/40 px-5 py-3.5 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 space-y-4 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
            {/* Quick Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar max-w-2xl mx-auto">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(s)}
                  className="whitespace-nowrap px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-full text-[10px] font-medium text-zinc-400 hover:text-white transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="max-w-3xl mx-auto glass rounded-2xl p-1.5 flex items-center shadow-2xl transition-all hover:border-white/20">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Insult Catty..."
                className="flex-1 bg-transparent border-none px-4 py-3 focus:outline-none text-sm placeholder:text-zinc-700 placeholder:uppercase placeholder:text-[9px] placeholder:tracking-[0.2em] font-medium"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center ${
                  input.trim() && !isLoading 
                  ? 'bg-white text-black scale-100 shadow-[0_0_25px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-900 text-zinc-700 opacity-40'
                } active:scale-90`}
              >
                {isLoading ? <MoreHorizontal size={20} className="animate-pulse" /> : <Zap size={20} fill="currentColor" />}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Invisible Mobile Footer fix */}
      <div className="h-[env(safe-area-inset-bottom)] bg-black"></div>
    </div>
  );
}

export default App;
