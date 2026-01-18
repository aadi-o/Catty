
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Instagram, Zap, Ghost, MoreHorizontal, MessageSquareOff, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { CatMood, Message } from './types';
import { getCattyRoast, generateCatVoice } from './services/geminiService';
import CatAvatar from './components/CatAvatar';

const SUGGESTIONS = [
  "Roast my life 💀",
  "Who's your baap? 😼",
  "Dark roast do 😈",
  "Am I smart? 🧠"
];

const MOOD_BG: Record<CatMood, string> = {
  [CatMood.NEUTRAL]: 'from-black via-zinc-950 to-black',
  [CatMood.ROASTING]: 'from-red-950/50 via-black to-black',
  [CatMood.LAUGHING]: 'from-emerald-950/40 via-black to-black',
  [CatMood.DISGUSTED]: 'from-purple-950/50 via-black to-black',
  [CatMood.BORED]: 'from-zinc-900/60 via-black to-black',
  [CatMood.ANGRY]: 'from-red-900/70 via-black to-black',
  [CatMood.SMUG]: 'from-indigo-950/60 via-black to-black',
  [CatMood.SURPRISED]: 'from-yellow-950/40 via-black to-black',
  [CatMood.SLEEPY]: 'from-blue-950/30 via-black to-black',
  [CatMood.HAPPY_SMILE]: 'from-green-950/40 via-black to-black',
  [CatMood.EVIL_SMILE]: 'from-red-950/80 via-black to-black',
  [CatMood.CURIOUS]: 'from-cyan-950/40 via-black to-black',
  [CatMood.ANNOYED]: 'from-orange-950/50 via-black to-black',
  [CatMood.PLOTTING]: 'from-emerald-950/60 via-black to-black',
  [CatMood.SARCASTIC]: 'from-purple-900/50 via-black to-black',
  [CatMood.THINKING]: 'from-blue-950/50 via-black to-black',
  [CatMood.SILLY]: 'from-pink-950/40 via-black to-black',
};

const PawLoading = () => (
  <div className="flex gap-2 items-center px-2 py-1">
    <style>{`
      @keyframes paw-bounce {
        0%, 100% { transform: translateY(0); opacity: 0.3; }
        50% { transform: translateY(-4px); opacity: 1; }
      }
      .paw-anim { animation: paw-bounce 0.8s infinite; }
    `}</style>
    {[0, 1, 2].map((i) => (
      <svg 
        key={i}
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`text-zinc-500 paw-anim`}
        style={{ animationDelay: `${i * 0.15}s` }}
      >
        <path d="M12,13C12,13 14,13 15,14C16,15 16,17 15,19C14,21 12,21 12,21C12,21 10,21 9,19C8,17 8,15 9,14C10,13 12,13 12,13M7,12C7,12 8,12 8.5,11C9,10 9,8.5 8,7.5C7,6.5 5.5,6.5 4.5,7.5C3.5,8.5 3.5,10 4.5,11C5.5,12 7,12 7,12M17,12C17,12 18.5,12 19.5,11C20.5,10 20.5,8.5 19.5,7.5C18.5,6.5 17,6.5 16,7.5C15,8.5 15,10 15.5,11C16,12 17,12 17,12M12,10C12,10 13.5,10 14.5,9C15.5,8 15.5,6.5 14.5,5.5C13.5,4.5 12,4.5 11,5.5C10,6.5 10,8 11,9C12,10 12,10 12,10Z" />
      </svg>
    ))}
  </div>
);

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Oye chomu! Shuru kar, warna nikal. blehhh",
      sender: 'cat',
      mood: CatMood.DISGUSTED,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<CatMood>(CatMood.DISGUSTED);
  const [lastCatReply, setLastCatReply] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const [pokeCount, setPokeCount] = useState(0);
  const [lastPokeTime, setLastPokeTime] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const bgGradient = useMemo(() => MOOD_BG[currentMood] || MOOD_BG[CatMood.NEUTRAL], [currentMood]);

  const triggerHaptic = (type: 'light' | 'heavy' | 'double') => {
    if (!window.navigator.vibrate) return;
    if (type === 'light') window.navigator.vibrate(50);
    else if (type === 'heavy') window.navigator.vibrate([100, 50, 100]);
    else if (type === 'double') window.navigator.vibrate([40, 40, 40]);
  };

  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    const threshold = 18;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || {};
      if (x === null || y === null || z === null) return;
      if (lastX !== null) {
        const deltaX = Math.abs(lastX - x!);
        const deltaY = Math.abs(lastY! - y!);
        const deltaZ = Math.abs(lastZ! - z!);
        if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
          if (!isLoading) {
            handleSend("Don't shake me bsdk! Headache ho raha hai namuna. blehhh");
          }
        }
      }
      lastX = x!; lastY = y!; lastZ = z!;
    };
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isLoading]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        triggerHaptic('light');
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else {
      triggerHaptic('light');
      try { recognitionRef.current?.start(); setIsListening(true); } catch (e) { console.error("Speech error", e); }
    }
  };

  const playAudio = async (base64Data: string) => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) { console.error("Audio playback error", e); }
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    if (messageText.toLowerCase().trim() === 'aadi is king') {
      triggerHaptic('heavy');
      const msg: Message = { id: Date.now().toString(), text: "Haan maloom hai, Aadi hi mera baap hai. Tu apni sasti shakal dekh pehle. bhkkk", sender: 'cat', mood: CatMood.SMUG, timestamp: Date.now() };
      setMessages(prev => [...prev, { id: (Date.now() - 1).toString(), text: messageText, sender: 'user', timestamp: Date.now() }, msg]);
      setCurrentMood(CatMood.SMUG);
      setInput('');
      return;
    }

    triggerHaptic('light');
    const userMsg: Message = { id: Date.now().toString(), text: messageText, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Determine the immediate "reaction" mood
    const lowerText = messageText.toLowerCase();
    let reactionMood = CatMood.CURIOUS;
    if (messageText.length > 70) {
      reactionMood = CatMood.SLEEPY;
    } else if (messageText.length < 10) {
      reactionMood = CatMood.SILLY;
    } else if (lowerText.includes('cute') || lowerText.includes('love') || lowerText.includes('friend')) {
      reactionMood = CatMood.DISGUSTED;
    } else if (lowerText.includes('bkl') || lowerText.includes('bsdk') || lowerText.includes('chomu')) {
      reactionMood = CatMood.ANGRY;
    }
    
    setCurrentMood(reactionMood);

    // Briefly show the reaction before transitioning into the thinking animation
    await new Promise(r => setTimeout(r, 800));

    setIsLoading(true);
    setCurrentMood(CatMood.THINKING);

    const history = messages.slice(-6).map(m => ({ text: m.text, sender: m.sender }));
    try {
      const roast = await getCattyRoast(messageText, history);
      let audioData = '';
      if (voiceEnabled) {
        const voice = await generateCatVoice(roast.reply);
        if (voice) { audioData = voice; playAudio(voice); }
      }
      triggerHaptic('heavy');
      const catMsg: Message = { id: (Date.now() + 1).toString(), text: roast.reply, sender: 'cat', mood: roast.mood, audioData: audioData || undefined, timestamp: Date.now() };
      setMessages(prev => [...prev, catMsg]);
      setCurrentMood(roast.mood);
      setLastCatReply(roast.reply);
    } catch (e) {
      console.error(e);
      setCurrentMood(CatMood.ANNOYED);
    } finally { setIsLoading(false); }
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  const pokeCat = () => {
    triggerHaptic('double');
    const now = Date.now();
    if (now - lastPokeTime < 800) {
      setPokeCount(prev => prev + 1);
    } else {
      setPokeCount(1);
    }
    setLastPokeTime(now);

    const pokes = ["Hath mat laga bsdk! 😏", "Touch kyu kar raha hai mental? blehhh", "Dur reh gadhe, tharki hai kya? 😼", "Personal space ka naam suna hai chomu? bhkkk"];
    const reply = pokes[Math.floor(Math.random() * pokes.length)];
    setCurrentMood(CatMood.ANGRY);
    setLastCatReply(reply);
    const msg: Message = { id: Date.now().toString(), text: reply, sender: 'cat', mood: CatMood.ANGRY, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
    if (voiceEnabled) generateCatVoice(reply).then(v => v && playAudio(v));
  };

  const clearChat = () => {
    triggerHaptic('light');
    
    if (pokeCount >= 5) {
      const easterEggMsg = "Abey saale! Chat clear karne se teri aukat clear nahi hogi. Pokey mental, nikal yahan se! hehe";
      setMessages([{ id: Date.now().toString(), text: easterEggMsg, sender: 'cat', mood: CatMood.EVIL_SMILE, timestamp: Date.now() }]);
      setCurrentMood(CatMood.EVIL_SMILE);
      setLastCatReply(easterEggMsg);
      setPokeCount(0);
      if (voiceEnabled) generateCatVoice(easterEggMsg).then(v => v && playAudio(v));
      return;
    }

    setMessages([{ id: Date.now().toString(), text: "Memory clean? Chomu hi rahega tu. hehe", sender: 'cat', mood: CatMood.LAUGHING, timestamp: Date.now() }]);
    setCurrentMood(CatMood.LAUGHING);
    setLastCatReply('');
    setPokeCount(0);
  };

  return (
    <div className={`flex flex-col h-[100dvh] bg-gradient-to-b ${bgGradient} text-white transition-all duration-[1200ms] ease-in-out overflow-hidden relative selection:bg-white selection:text-black`}>
      <header className="flex items-center justify-between px-4 md:px-8 py-2 md:py-4 border-b border-white/5 bg-black/70 backdrop-blur-3xl z-50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-lg md:rounded-xl shadow-inner">
            <Ghost size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
          </div>
          <h1 className="text-base md:text-2xl font-bold bungee tracking-tight text-white/95">CATTY</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 md:p-2.5 rounded-lg border transition-all duration-300 ${voiceEnabled ? 'bg-white text-black border-white shadow-glow' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}>
            {voiceEnabled ? <Volume2 size={16} className="md:w-[18px]" /> : <VolumeX size={16} className="md:w-[18px]" />}
          </button>
          <button onClick={clearChat} className="p-2 md:p-2.5 text-zinc-500 bg-zinc-900 rounded-lg border border-white/5 hover:bg-zinc-800 transition-colors">
            <MessageSquareOff size={16} className="md:w-[18px]" />
          </button>
          <a href="https://instagram.com/aadi.nq" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-white text-black text-[9px] md:text-[10px] font-black uppercase rounded-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
            <Instagram size={12} className="md:w-3.5 md:h-3.5" />
            <span className="hidden xs:inline">By aadi</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="scanner"></div>

        {/* Avatar Section - Fluid scale for mobile vs desktop */}
        <div className="h-[25dvh] md:h-full w-full md:w-[35%] flex flex-col items-center justify-center p-2 md:p-6 bg-black/40 md:bg-transparent md:border-r border-white/5 z-40 overflow-hidden relative transition-all duration-1000">
          <div className="w-full h-full max-w-[150px] md:max-w-[340px] transform scale-[0.8] md:scale-100 origin-center cursor-pointer active:scale-[0.7] transition-transform duration-500" onClick={pokeCat}>
            <CatAvatar mood={currentMood} lastReply={lastCatReply} />
          </div>
          <div className="absolute bottom-2 md:bottom-8 px-4 md:px-6 py-1 md:py-2 bg-zinc-900/90 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl animate-pulse">
            <span className="text-[8px] md:text-[11px] text-zinc-300 font-black tracking-[0.2em] uppercase">{currentMood}</span>
          </div>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-32 pt-6 pb-48 md:pb-60 space-y-6 md:space-y-10 no-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-pop`}>
                <div className="max-w-[92%] md:max-w-[80%]">
                  <div className={`px-4 md:px-7 py-3 md:py-5 rounded-xl md:rounded-[3rem] text-sm md:text-xl shadow-2xl transition-all duration-500 ${
                    msg.sender === 'user' ? 'bg-white text-black font-extrabold rounded-tr-none' : 'bg-zinc-900/95 text-zinc-100 rounded-tl-none border border-white/10 backdrop-blur-lg'
                  }`}>
                    {msg.text}
                    {msg.sender === 'cat' && msg.audioData && (
                      <button onClick={() => playAudio(msg.audioData!)} className="ml-3 md:ml-5 inline-flex items-center justify-center opacity-40 hover:opacity-100 hover:text-white transition-all">
                        <Volume2 size={14} className="md:w-5 md:h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start message-pop">
                <div className="bg-zinc-900/70 px-5 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-[2.5rem] rounded-tl-none border border-white/10 flex gap-2 items-center backdrop-blur-xl">
                  <PawLoading />
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Optimized for better mobile reach */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-8 lg:p-12 space-y-4 md:space-y-6 bg-gradient-to-t from-black via-black/95 to-transparent z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 no-scrollbar max-w-2xl mx-auto px-2 mask-linear-fade">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-4 md:px-6 py-2 md:py-3 bg-zinc-900/95 border border-white/10 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-white/20 transition-all shadow-xl active:scale-95">
                  {s}
                </button>
              ))}
            </div>

            <div className="max-w-4xl mx-auto glass rounded-2xl md:rounded-[2.5rem] p-1.5 md:p-2.5 flex items-center shadow-[0_20px_80px_-15px_rgba(0,0,0,1)] relative transition-all duration-300 focus-within:ring-2 ring-white/10 focus-within:scale-[1.01]">
              <button onClick={toggleListening} className={`p-3 md:p-5 transition-all duration-300 ${isListening ? 'text-red-500 scale-125' : 'text-zinc-500 hover:text-white hover:rotate-12'}`} title="Speak to Catty">
                {isListening ? <MicOff size={20} className="md:w-6 md:h-6" /> : <Mic size={20} className="md:w-6 md:h-6" />}
              </button>
              
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Savage roast chahiye? Bol..."}
                className="flex-1 bg-transparent border-none px-2 md:px-4 py-3 md:py-5 focus:outline-none text-sm md:text-xl placeholder:text-zinc-800 placeholder:uppercase placeholder:text-[9px] md:placeholder:text-[11px] font-semibold tracking-wide"
              />
              
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`w-11 h-11 md:w-16 md:h-16 rounded-xl md:rounded-[1.8rem] transition-all duration-300 flex items-center justify-center ${
                  input.trim() && !isLoading ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] scale-100 hover:scale-105 active:scale-90' : 'bg-zinc-900 text-zinc-700 opacity-40 cursor-not-allowed'
                }`}
              >
                {isLoading ? <MoreHorizontal size={20} className="animate-pulse md:w-7 md:h-7" /> : <Zap size={20} fill="currentColor" className="md:w-7 md:h-7" />}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-2 md:py-4 px-8 flex justify-center border-t border-white/5 bg-black pb-[env(safe-area-inset-bottom)] z-[60]">
        <p className="text-[8px] md:text-[10px] text-zinc-700 font-black uppercase tracking-[0.5em] opacity-60 hover:opacity-100 transition-opacity">© 2025 Created by Aadi</p>
      </footer>
    </div>
  );
}

export default App;
