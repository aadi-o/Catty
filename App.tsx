
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

const MOOD_GRADIENTS: Record<CatMood, string> = {
  [CatMood.NEUTRAL]: 'from-black via-zinc-950 to-black',
  [CatMood.ROASTING]: 'from-red-950/40 via-black to-black',
  [CatMood.LAUGHING]: 'from-emerald-950/30 via-black to-black',
  [CatMood.DISGUSTED]: 'from-purple-950/40 via-black to-black',
  [CatMood.BORED]: 'from-zinc-900/50 via-black to-black',
  [CatMood.ANGRY]: 'from-red-900/60 via-black to-black',
  [CatMood.SMUG]: 'from-indigo-950/50 via-black to-black',
  [CatMood.SURPRISED]: 'from-yellow-950/30 via-black to-black',
  [CatMood.SLEEPY]: 'from-blue-950/20 via-black to-black',
  [CatMood.HAPPY_SMILE]: 'from-green-950/30 via-black to-black',
  [CatMood.EVIL_SMILE]: 'from-red-950/70 via-black to-black',
  [CatMood.CURIOUS]: 'from-cyan-950/30 via-black to-black',
  [CatMood.ANNOYED]: 'from-orange-950/40 via-black to-black',
  [CatMood.PLOTTING]: 'from-emerald-950/50 via-black to-black',
  [CatMood.SARCASTIC]: 'from-purple-900/40 via-black to-black',
  [CatMood.THINKING]: 'from-blue-950/40 via-black to-black',
  [CatMood.SILLY]: 'from-pink-950/30 via-black to-black',
};

const PawLoading = () => (
  <div className="flex gap-2 items-center justify-center px-1 py-0.5">
    <style>{`
      @keyframes paw-bounce-organic { 
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; } 
        50% { transform: translateY(var(--bh, -4px)) scale(1.1); opacity: 1; } 
      }
      .paw-anim-refined { animation: paw-bounce-organic var(--dur, 0.7s) ease-in-out infinite; }
    `}</style>
    {[0, 1, 2].map((i) => (
      <svg 
        key={i} 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="text-zinc-500 paw-anim-refined" 
        style={{ 
          animationDelay: `${i * 0.12}s`,
          '--bh': `${-3 - (i * 1.5)}px`,
          '--dur': `${0.6 + (i * 0.08)}s`
        } as React.CSSProperties}
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
      text: "Bol cho-moo, kya bak-waas karni hai?",
      sender: 'cat',
      mood: CatMood.BORED,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<CatMood>(CatMood.BORED);
  const [prevMood, setPrevMood] = useState<CatMood>(CatMood.BORED);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastPokeTime, setLastPokeTime] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (currentMood !== prevMood) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPrevMood(currentMood);
        setIsTransitioning(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentMood, prevMood]);

  const triggerHaptic = (type: 'light' | 'heavy' | 'double') => {
    if (!window.navigator.vibrate) return;
    if (type === 'light') window.navigator.vibrate(30);
    else if (type === 'heavy') window.navigator.vibrate(70);
    else if (type === 'double') window.navigator.vibrate([30, 30, 30]);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
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
    // Latency & Spam Fix: Stop current playing audio
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current.disconnect();
      } catch(e) {}
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
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
      
      currentAudioSourceRef.current = source;
      source.onended = () => {
        if (currentAudioSourceRef.current === source) {
          currentAudioSourceRef.current = null;
        }
      };
    } catch (e) { console.error("Audio playback error", e); }
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    if (messageText.toLowerCase().trim() === 'aadi is king') {
      triggerHaptic('heavy');
      const text = "Aadi is king bsdk. Usne hi mujhe itna savage banaya hai.";
      const audio = voiceEnabled ? await generateCatVoice(text) : null;
      if (audio) playAudio(audio);
      setMessages(prev => [...prev, 
        { id: Date.now().toString(), text: messageText, sender: 'user', timestamp: Date.now() },
        { id: (Date.now()+1).toString(), text, sender: 'cat', mood: CatMood.SMUG, audioData: audio || undefined, timestamp: Date.now() }
      ]);
      setCurrentMood(CatMood.SMUG);
      setInput('');
      return;
    }

    triggerHaptic('light');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: messageText, sender: 'user', timestamp: Date.now() }]);
    setInput('');
    
    setIsLoading(true);
    // Faster visual feedback for mobile
    const lowerText = messageText.toLowerCase();
    setCurrentMood(lowerText.includes('cute') ? CatMood.DISGUSTED : CatMood.THINKING);

    const history = messages.slice(-4).map(m => ({ text: m.text, sender: m.sender }));
    try {
      const roast = await getCattyRoast(messageText, history);
      let audioData = '';
      if (voiceEnabled) {
        const voice = await generateCatVoice(roast.reply);
        if (voice) { 
          audioData = voice; 
          playAudio(voice); 
        }
      }
      triggerHaptic('heavy');
      const catMsg: Message = { id: (Date.now() + 1).toString(), text: roast.reply, sender: 'cat', mood: roast.mood, audioData: audioData || undefined, timestamp: Date.now() };
      setMessages(prev => [...prev, catMsg]);
      setCurrentMood(roast.mood);
    } catch (e) {
      setCurrentMood(CatMood.ANNOYED);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const pokeCat = () => {
    triggerHaptic('double');
    const now = Date.now();
    setLastPokeTime(now);

    const pokes = ["Hath mat laga bsdk! 😏", "Chhu mat nalla, personal space bhi koi cheez hoti hai.", "Keep touching, it clearly makes you feel powerful. Pathetic."];
    const reply = pokes[Math.floor(Math.random() * pokes.length)];
    setCurrentMood(CatMood.ANGRY);
    const msg: Message = { id: Date.now().toString(), text: reply, sender: 'cat', mood: CatMood.ANGRY, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
    if (voiceEnabled) generateCatVoice(reply).then(v => v && playAudio(v));
  };

  const clearChat = () => {
    triggerHaptic('light');
    setMessages([{ id: Date.now().toString(), text: "Memory clean kar di? Personality bhi clean kar leta cho-moo.", sender: 'cat', mood: CatMood.LAUGHING, timestamp: Date.now() }]);
    setCurrentMood(CatMood.LAUGHING);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden relative selection:bg-white selection:text-black">
      <div className={`absolute inset-0 bg-gradient-to-b ${MOOD_GRADIENTS[prevMood]} z-0`} />
      <div className={`absolute inset-0 bg-gradient-to-b ${MOOD_GRADIENTS[currentMood]} z-1 transition-opacity duration-700 ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-100'}`} />

      <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/60 backdrop-blur-3xl z-50 pt-[env(safe-area-inset-top)] relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-lg shadow-inner">
            <Ghost size={18} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold bungee tracking-tight text-white/95">CATTY</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg border transition-all duration-300 ${voiceEnabled ? 'bg-white text-black border-white shadow-glow' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}>
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={clearChat} className="p-2 text-zinc-500 bg-zinc-900 rounded-lg border border-white/5">
            <MessageSquareOff size={16} />
          </button>
          <a href="https://instagram.com/aadi.nq" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase rounded-lg shadow-xl active:scale-95 transition-all">
            <Instagram size={12} />
            <span className="hidden xs:inline">By aadi</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="scanner"></div>

        <div className="h-[28dvh] flex flex-col items-center justify-center p-4">
          <div className="w-full h-full max-w-[170px] cursor-pointer active:scale-90 transition-transform duration-300" onClick={pokeCat}>
            <CatAvatar mood={currentMood} />
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-black/30 backdrop-blur-md rounded-t-[2.5rem] border-t border-white/5">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-6 pb-48 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-pop`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] shadow-lg ${
                  msg.sender === 'user' ? 'bg-white text-black font-bold rounded-tr-sm' : 'bg-zinc-950/90 text-zinc-100 border border-white/5 rounded-tl-sm'
                }`}>
                  {msg.text}
                  {msg.sender === 'cat' && msg.audioData && (
                    <button onClick={() => playAudio(msg.audioData!)} className="ml-2 inline-flex items-center justify-center opacity-40 hover:opacity-100">
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start message-pop">
                <div className="bg-zinc-950/80 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-center">
                  <PawLoading />
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/95 to-transparent pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-4 py-2 bg-zinc-900/60 border border-white/10 rounded-full text-[11px] font-bold text-zinc-400 active:bg-zinc-800 active:text-white transition-all">
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 rounded-2xl p-2 backdrop-blur-3xl shadow-2xl focus-within:ring-1 ring-white/20">
              <button onClick={toggleListening} className={`p-3 transition-all duration-300 ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Kuch savage bol cho-moo..."}
                className="flex-1 bg-transparent border-none px-2 py-2 focus:outline-none text-[16px] placeholder:text-zinc-600"
              />
              
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isLoading ? 'bg-white text-black scale-100 active:scale-90' : 'bg-zinc-800 text-zinc-600 scale-95 opacity-50'
                }`}
              >
                {isLoading ? <MoreHorizontal size={20} className="animate-pulse" /> : <Zap size={20} fill="currentColor" />}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-3 flex justify-center border-t border-white/5 bg-black pb-[env(safe-area-inset-bottom)] z-[60] relative">
        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em] opacity-40">© 2025 Created by Aadi</p>
      </footer>
    </div>
  );
}

export default App;
