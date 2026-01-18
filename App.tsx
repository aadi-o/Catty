
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Instagram, Zap, Ghost, MoreHorizontal } from 'lucide-react';
import { CatMood, Message } from './types';
import { getCattyRoast } from './services/geminiService';
import CatAvatar from './components/CatAvatar';

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
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    const history = messages.slice(-5).map(m => ({ text: m.text, sender: m.sender }));
    
    try {
      const roast = await getCattyRoast(currentInput, history);
      
      // Artificial delay for personality
      await new Promise(r => setTimeout(r, 800));

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
      setIsTyping(false);
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
    <div className="flex flex-col h-screen max-h-screen bg-black text-white font-normal selection:bg-white selection:text-black">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-zinc-900/50 rounded-xl border border-white/5">
            <Ghost size={20} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bungee">CATTY</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-white animate-pulse' : 'bg-zinc-700'}`}></span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                {isLoading ? 'Thinking Roast...' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-zinc-900 rounded-lg"
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
          <a 
            href="https://instagram.com/aadi.nq" 
            target="_blank" 
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-lg"
          >
            <Instagram size={12} />
            <span>Support</span>
          </a>
        </div>
      </header>

      {/* Main Responsive Grid */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Cat Visual Section - Smaller on Mobile, Persistent on Desktop */}
        <div className="h-[35vh] md:h-full w-full md:w-[40%] lg:w-[35%] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 to-black md:border-r border-white/5 relative">
          <div className="absolute top-4 left-6 md:hidden">
             <a href="https://instagram.com/aadi.nq" target="_blank" className="text-zinc-500"><Instagram size={16} /></a>
          </div>
          <CatAvatar mood={currentMood} />
          <div className="mt-6 text-center space-y-1">
             <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.6em] transition-all duration-700">
               {currentMood}
             </div>
             <div className="text-[10px] text-zinc-800 italic">"I'm not an AI, chomu"</div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col relative bg-black md:bg-zinc-950/20">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-32 scroll-smooth"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-pop`}
              >
                <div className={`relative max-w-[92%] sm:max-w-[80%] px-5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed tracking-wide transition-all ${
                  msg.sender === 'user' 
                    ? 'bg-white text-black font-semibold rounded-tr-none shadow-2xl' 
                    : 'bg-zinc-900/80 text-zinc-200 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                  <div className={`absolute top-0 ${msg.sender === 'user' ? '-right-1.5' : '-left-1.5'} w-3 h-3 ${msg.sender === 'user' ? 'bg-white' : 'bg-zinc-900'} rotate-45 -z-10`}></div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start message-pop">
                <div className="bg-zinc-900/40 px-5 py-3 rounded-2xl border border-white/5 flex gap-1.5 items-center">
                  <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
            <div className="max-w-3xl mx-auto glass rounded-2xl p-2 flex items-center shadow-2xl transition-all border-white/10 hover:border-white/20">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a roast, chomu..."
                className="flex-1 bg-transparent border-none px-4 py-3 focus:outline-none text-sm placeholder:text-zinc-700 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                  input.trim() && !isLoading 
                  ? 'bg-white text-black scale-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-900 text-zinc-600 scale-95 opacity-50'
                } active:scale-90`}
              >
                {isLoading ? <MoreHorizontal size={18} className="animate-pulse" /> : <Zap size={18} fill="currentColor" />}
              </button>
            </div>
            <div className="mt-3 text-[9px] text-zinc-700 text-center uppercase tracking-[0.3em] font-bold">
              Tap enter to receive pain
            </div>
          </div>
        </div>
      </main>

      {/* Credit Bar */}
      <footer className="hidden sm:flex items-center justify-between px-8 py-3 text-[9px] text-zinc-700 bg-black border-t border-white/5 tracking-[0.2em] uppercase font-bold">
        <span>Catty OS v2.4.0</span>
        <div className="flex gap-4">
          <a href="https://instagram.com/aadi.nq" className="hover:text-zinc-400 transition-colors">Instagram</a>
          <span>© 2025</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
