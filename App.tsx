
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Instagram, Zap, Ghost, MoreHorizontal, Copy, Check, MessageSquareOff, Share2, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { CatMood, Message } from './types';
import { getCattyRoast, generateCatVoice } from './services/geminiService';
import CatAvatar from './components/CatAvatar';

const SUGGESTIONS = [
  "Roast my life 💀",
  "Who's your baap? 😼",
  "Dark roast do 😈",
  "Am I smart? 🧠"
];

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Vibration helper
  const triggerHaptic = (type: 'light' | 'heavy' | 'double') => {
    if (!window.navigator.vibrate) return;
    if (type === 'light') window.navigator.vibrate(50);
    else if (type === 'heavy') window.navigator.vibrate([100, 50, 100]);
    else if (type === 'double') window.navigator.vibrate([40, 40, 40]);
  };

  // Shake detection (Simple implementation for Web)
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let threshold = 15;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || {};
      if (x === null || y === null || z === null) return;

      if (lastX !== null) {
        let deltaX = Math.abs(lastX - x!);
        let deltaY = Math.abs(lastY! - y!);
        let deltaZ = Math.abs(lastZ! - z!);

        if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
          // Shaken!
          if (!isLoading) {
            handleSend("Don't shake me bsdk! blehhh");
          }
        }
      }

      lastX = x!;
      lastY = y!;
      lastZ = z!;
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isLoading]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Set to Hindi/Hinglish preference

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
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      triggerHaptic('light');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const playAudio = async (base64Data: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    triggerHaptic('light');
    const userMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCurrentMood(CatMood.THINKING);

    const history = messages.slice(-6).map(m => ({ text: m.text, sender: m.sender }));
    
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
      const catMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: roast.reply,
        sender: 'cat',
        mood: roast.mood,
        audioData: audioData || undefined,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, catMsg]);
      setCurrentMood(roast.mood);
      setLastCatReply(roast.reply);
    } catch (e) {
      console.error(e);
      setCurrentMood(CatMood.ANNOYED);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const pokeCat = () => {
    triggerHaptic('double');
    const pokes = [
      "Hath mat laga bsdk! 😏",
      "Touch kyu kar raha hai mental? blehhh",
      "Dur reh gadhe, tharki hai kya? 😼",
      "Personal space ka naam suna hai chomu? bhkkk"
    ];
    const reply = pokes[Math.floor(Math.random() * pokes.length)];
    setCurrentMood(CatMood.ANGRY);
    setLastCatReply(reply);
    const msg: Message = {
      id: Date.now().toString(),
      text: reply,
      sender: 'cat',
      mood: CatMood.ANGRY,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
    if (voiceEnabled) generateCatVoice(reply).then(v => v && playAudio(v));
  };

  const clearChat = () => {
    triggerHaptic('light');
    setMessages([{ id: Date.now().toString(), text: "Memory clean? Chomu hi rahega tu. hehe", sender: 'cat', mood: CatMood.LAUGHING, timestamp: Date.now() }]);
    setCurrentMood(CatMood.LAUGHING);
    setLastCatReply('');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden relative selection:bg-white selection:text-black">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-black/60 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl">
            <Ghost size={18} strokeWidth={2.5} />
          </div>
          <h1 className="text-sm md:text-lg font-bold bungee tracking-tight">CATTY</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg border transition-all ${voiceEnabled ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={clearChat} className="p-2 text-zinc-500 bg-zinc-900 rounded-lg border border-white/5">
            <MessageSquareOff size={16} />
          </button>
          <a href="https://instagram.com/aadi.nq" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[9px] font-black uppercase rounded-lg">
            <Instagram size={12} />
            <span className="hidden xs:inline">By aadi</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="scanner"></div>

        <div className="h-[28vh] md:h-full w-full md:w-[35%] flex flex-col items-center justify-center p-4 bg-zinc-950 md:border-r border-white/5 z-10 overflow-hidden">
          <div className="transform scale-[0.6] md:scale-100 origin-center cursor-pointer active:scale-[0.55] transition-transform" onClick={pokeCat}>
            <CatAvatar mood={currentMood} lastReply={lastCatReply} />
          </div>
          <div className="mt-[-20px] md:mt-8 px-3 py-1 bg-zinc-900 rounded-full border border-white/10 shadow-xl">
            <span className="text-[8px] md:text-[10px] text-zinc-400 font-black tracking-widest uppercase">{currentMood}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-zinc-950/20">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 pt-6 pb-48 space-y-6 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-pop`}>
                <div className="max-w-[85%] md:max-w-[70%]">
                  <div className={`px-4 py-3 rounded-2xl md:rounded-3xl text-sm md:text-base shadow-lg transition-all ${
                    msg.sender === 'user' ? 'bg-white text-black font-extrabold rounded-tr-none' : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                    {msg.sender === 'cat' && msg.audioData && (
                      <button onClick={() => playAudio(msg.audioData!)} className="ml-3 inline-flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start message-pop">
                <div className="bg-zinc-900/40 px-5 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                  <PawLoading />
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 space-y-4 bg-gradient-to-t from-black via-black to-transparent z-20">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-2xl mx-auto px-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-white transition-all shadow-md active:scale-95">
                  {s}
                </button>
              ))}
            </div>

            <div className="max-w-3xl mx-auto glass rounded-2xl p-1.5 flex items-center shadow-2xl relative">
              <button 
                onClick={toggleListening}
                className={`p-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'}`}
                title="Speak to Catty"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Insult search kar chomu..."}
                className="flex-1 bg-transparent border-none px-2 py-3 focus:outline-none text-sm md:text-base placeholder:text-zinc-800 placeholder:uppercase placeholder:text-[9px] font-medium"
              />
              
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl transition-all flex items-center justify-center ${
                  input.trim() && !isLoading ? 'bg-white text-black shadow-lg scale-100' : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'
                } active:scale-90`}
              >
                {isLoading ? <MoreHorizontal size={20} className="animate-pulse" /> : <Zap size={20} fill="currentColor" />}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-2 px-6 flex justify-center border-t border-white/5 bg-black pb-[env(safe-area-inset-bottom)]">
        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em]">Savagery by aadi.nq</p>
      </footer>
    </div>
  );
}

export default App;
