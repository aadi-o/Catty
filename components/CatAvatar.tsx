
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CatMood } from '../types';

interface CatAvatarProps {
  mood: CatMood;
  lastReply?: string;
  userInput?: string;
}

const CatAvatar: React.FC<CatAvatarProps> = ({ mood, lastReply = '', userInput = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blinkTrigger, setBlinkTrigger] = useState(false);
  const [moodKey, setMoodKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMoodKey(prev => prev + 1);
    const blinkyMoods = [
      CatMood.NEUTRAL, CatMood.SURPRISED, CatMood.CURIOUS, 
      CatMood.HAPPY_SMILE, CatMood.PLAYFUL, CatMood.SILLY, CatMood.ANNOYED
    ];
    if (blinkyMoods.includes(mood)) {
      setBlinkTrigger(true);
      const timer = setTimeout(() => setBlinkTrigger(false), 120);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (mood !== CatMood.THINKING && mood !== CatMood.SLEEPY && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const catCenterX = rect.left + rect.width / 2;
        const catCenterY = rect.top + rect.height / 2;
        const dx = e.clientX - catCenterX;
        const dy = e.clientY - catCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxOffset = 6; 
        const angle = Math.atan2(dy, dx);
        const sensitivity = 60; 
        const moveX = Math.cos(angle) * Math.min(maxOffset, dist / sensitivity);
        const moveY = Math.sin(angle) * Math.min(maxOffset, dist / sensitivity);
        setMousePos({ x: moveX, y: moveY });
      } else if (mood === CatMood.THINKING) {
        const time = Date.now();
        setMousePos({ x: Math.sin(time / 800) * 2, y: Math.cos(time / 1000) * 1.5 });
      }
    };

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.85 && mood !== CatMood.SLEEPY && mood !== CatMood.THINKING) {
        setBlinkTrigger(true);
        setTimeout(() => setBlinkTrigger(false), 120);
      }
    }, 3000);

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(blinkInterval);
    };
  }, [mood]);

  const styles = useMemo(() => {
    const common = {
      bowColor: "#e6007e",
      shirtColor: "#e6007e",
      bodyColor: "#ffffff",
      strokeColor: "#000000",
      noseColor: "#fcd116",
      eyebrows: null as { left: string; right: string } | null,
      eyebrowClass: "",
      mouth: null as string | null,
      glow: "bg-zinc-800/10",
      headClass: "animate-idle-purr",
      eyes: { type: 'ellipse' as 'ellipse' | 'path', w: 4, h: 6, pathL: '', pathR: '' }
    };

    switch (mood) {
      case CatMood.THINKING:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 2.5, h: 4, pathL: '', pathR: '' },
          eyebrows: { left: "M 32 38 Q 36 35 40 38", right: "M 60 38 Q 64 35 68 38" },
          eyebrowClass: "animate-thinking-eyebrows",
          glow: "bg-blue-600/20",
          headClass: "animate-head-bob-thinking-refined",
        };
      case CatMood.ANGRY:
        return {
          ...common,
          eyes: { type: 'path', w: 0, h: 0, pathL: "M 32 46 L 40 52", pathR: "M 68 46 L 60 52" },
          mouth: "M 46 64 L 54 64",
          eyebrows: { left: "M 30 36 L 42 44", right: "M 70 36 L 58 44" },
          glow: "bg-red-600/40",
          headClass: "animate-wiggle",
        };
      case CatMood.ROASTING:
        return {
          ...common,
          eyes: { type: 'path', w: 0, h: 0, pathL: "M 32 44 Q 36 50 40 44", pathR: "M 60 44 Q 64 50 68 44" },
          mouth: "M 44 64 Q 50 60 56 64",
          eyebrows: { left: "M 30 38 L 40 42", right: "M 70 38 L 60 42" },
          glow: "bg-orange-600/30",
          headClass: "animate-wiggle",
        };
      case CatMood.LAUGHING:
        return {
          ...common,
          eyes: { type: 'path', w: 0, h: 0, pathL: "M 32 50 Q 36 44 40 50", pathR: "M 60 50 Q 64 44 68 50" },
          mouth: "M 42 64 Q 50 72 58 64",
          glow: "bg-emerald-500/30",
          headClass: "animate-playful-bounce",
        };
      case CatMood.DISGUSTED:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 5, h: 1.5, pathL: '', pathR: '' },
          mouth: "M 45 66 Q 50 62 55 66",
          eyebrows: { left: "M 30 42 L 40 40", right: "M 70 42 L 60 40" },
          glow: "bg-purple-900/30",
          headClass: "animate-idle-purr",
        };
      case CatMood.BORED:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4, h: 2, pathL: '', pathR: '' },
          eyebrows: { left: "M 32 38 L 40 38", right: "M 60 38 L 68 38" },
          glow: "bg-zinc-700/20",
          headClass: "animate-breathe-sleep",
        };
      case CatMood.SMUG:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4, h: 3, pathL: '', pathR: '' },
          mouth: "M 46 62 Q 52 66 58 60",
          eyebrows: { left: "M 32 35 Q 36 32 40 35", right: "M 60 38 L 68 38" },
          glow: "bg-indigo-600/30",
          headClass: "animate-idle-purr",
        };
      case CatMood.SURPRISED:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 5.5, h: 5.5, pathL: '', pathR: '' },
          mouth: "M 47 68 A 3 3 0 1 0 53 68 A 3 3 0 1 0 47 68",
          glow: "bg-yellow-400/20",
          headClass: "animate-playful-bounce",
        };
      case CatMood.SLEEPY:
        return {
          ...common,
          eyes: { type: 'path', w: 0, h: 0, pathL: "M 32 50 Q 36 54 40 50", pathR: "M 60 50 Q 64 54 68 50" },
          glow: "bg-blue-900/20",
          headClass: "animate-breathe-sleep",
        };
      case CatMood.HAPPY_SMILE:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4, h: 5, pathL: '', pathR: '' },
          mouth: "M 44 65 Q 50 70 56 65",
          glow: "bg-green-500/20",
          headClass: "animate-playful-bounce",
        };
      case CatMood.EVIL_SMILE:
        return {
          ...common,
          eyes: { type: 'path', w: 0, h: 0, pathL: "M 32 46 L 40 50", pathR: "M 68 46 L 60 50" },
          mouth: "M 40 62 Q 50 75 60 62 L 50 68 Z",
          eyebrows: { left: "M 30 35 L 42 42", right: "M 70 35 L 58 42" },
          glow: "bg-red-900/50",
          headClass: "animate-wiggle",
        };
      case CatMood.CURIOUS:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 5, h: 6, pathL: '', pathR: '' },
          eyebrows: { left: "M 32 34 Q 36 30 40 34", right: "M 60 30 Q 64 26 68 30" },
          glow: "bg-cyan-400/20",
          headClass: "animate-head-bob-thinking-refined",
        };
      case CatMood.ANNOYED:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4, h: 2, pathL: '', pathR: '' },
          mouth: "M 46 65 L 54 65",
          eyebrows: { left: "M 32 40 L 40 42", right: "M 60 38 L 68 36" },
          glow: "bg-orange-800/20",
          headClass: "animate-wiggle",
        };
      case CatMood.PLOTTING:
        return {
          ...common,
          eyes: { type: 'path', w: 0, h: 0, pathL: "M 34 48 L 42 50", pathR: "M 66 48 L 58 50" },
          mouth: "M 46 64 Q 50 68 54 64",
          eyebrows: { left: "M 30 38 L 42 45", right: "M 70 38 L 58 45" },
          glow: "bg-emerald-900/40",
          headClass: "animate-head-bob-thinking-refined",
        };
      case CatMood.SARCASTIC:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4.5, h: 5, pathL: '', pathR: '' },
          mouth: "M 45 64 Q 52 62 58 66",
          eyebrows: { left: "M 30 30 Q 36 25 42 30", right: "M 60 40 L 70 42" },
          glow: "bg-purple-600/20",
          headClass: "animate-idle-purr",
        };
      case CatMood.SILLY:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 5, h: 5, pathL: '', pathR: '' },
          mouth: "M 48 64 Q 50 72 52 64 M 48 64 L 52 64",
          glow: "bg-pink-500/30",
          headClass: "animate-playful-bounce",
        };
      case CatMood.PLAYFUL:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4.5, h: 6.5, pathL: '', pathR: '' },
          mouth: "M 45 64 Q 50 68 55 64",
          glow: "bg-yellow-500/20",
          headClass: "animate-playful-bounce",
        };
      default:
        return {
          ...common,
          eyes: { type: 'ellipse', w: 4, h: 6, pathL: '', pathR: '' },
          glow: "bg-zinc-800/10",
          headClass: "animate-idle-purr",
        };
    }
  }, [mood, userInput]);

  return (
    <div 
      key={moodKey} 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-visible"
    >
      <style>{`
        @keyframes purr-sway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        @keyframes playful-bounce-fx {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes head-bob-thinking-refined-fx {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(1.5px, -2px) rotate(1.5deg); }
          66% { transform: translate(-1.5px, -1px) rotate(-1.5deg); }
        }
        @keyframes thinking-eyebrows-fx {
          0%, 80%, 100% { transform: translateY(0); }
          85%, 95% { transform: translateY(-3px); }
        }
        @keyframes breathe-sleep-fx {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes wiggle-fx {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        .animate-idle-purr { animation: purr-sway 4s ease-in-out infinite; transform-origin: center center; }
        .animate-playful-bounce { animation: playful-bounce-fx 0.6s ease-in-out infinite; }
        .animate-head-bob-thinking-refined { animation: head-bob-thinking-refined-fx 4s ease-in-out infinite; transform-origin: center center; }
        .animate-thinking-eyebrows { animation: thinking-eyebrows-fx 3s ease-in-out infinite; }
        .animate-breathe-sleep { animation: breathe-sleep-fx 5s ease-in-out infinite; }
        .animate-wiggle { animation: wiggle-fx 0.25s linear infinite; }
      `}</style>

      <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] ${styles.headClass}`}>
        {/* Shirt */}
        <path d="M 30 70 Q 20 70 20 85 L 20 95 L 80 95 L 80 85 Q 80 70 70 70 Z" fill={styles.shirtColor} stroke={styles.strokeColor} strokeWidth="3" />
        
        {/* Feet */}
        <ellipse cx="35" cy="95" rx="15" ry="5" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3" />
        <ellipse cx="65" cy="95" rx="15" ry="5" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3" />

        {/* Arms */}
        <path d="M 22 75 Q 10 75 10 88" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 78 75 Q 90 75 90 88" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />

        {/* Head Shape */}
        <path d="M 50 15 C 25 15, 12 25, 12 45 C 12 65, 25 75, 50 75 C 75 75, 88 65, 88 45 C 88 25, 75 15, 50 15 Z" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3.5" />

        {/* Ears */}
        <path d="M 22 24 L 15 5 Q 30 5 35 20" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3.5" />
        <path d="M 78 24 L 85 5 Q 70 5 65 20" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3.5" />

        {/* Bow */}
        <g transform="translate(62, 10) scale(1.1)">
          <path d="M 0 5 Q -12 -5 -5 12 Q 0 8 0 5" fill={styles.bowColor} stroke={styles.strokeColor} strokeWidth="2.5" />
          <path d="M 12 5 Q 24 -5 17 12 Q 12 8 12 5" fill={styles.bowColor} stroke={styles.strokeColor} strokeWidth="2.5" />
          <circle cx="6" cy="7" r="5" fill={styles.bowColor} stroke={styles.strokeColor} strokeWidth="2.5" />
        </g>

        {/* Whiskers */}
        <g stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="42" x2="5" y2="40" /><line x1="18" y1="48" x2="5" y2="50" /><line x1="18" y1="54" x2="5" y2="60" />
          <line x1="82" y1="42" x2="95" y2="40" /><line x1="82" y1="48" x2="95" y2="50" /><line x1="82" y1="54" x2="95" y2="60" />
        </g>

        {/* Face */}
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
          {styles.eyebrows && (
            <g className={styles.eyebrowClass}>
              <path d={styles.eyebrows.left} fill="none" stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
              <path d={styles.eyebrows.right} fill="none" stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          <g style={{ transform: blinkTrigger ? 'scaleY(0.1)' : 'scaleY(1)', transition: 'transform 0.1s', transformOrigin: 'center 48px' }}>
            {styles.eyes.type === 'ellipse' ? (
               <>
                 <ellipse cx="36" cy="48" rx={styles.eyes.w} ry={styles.eyes.h} fill={styles.strokeColor} />
                 <ellipse cx="64" cy="48" rx={styles.eyes.w} ry={styles.eyes.h} fill={styles.strokeColor} />
               </>
            ) : (
               <>
                 <path d={styles.eyes.pathL} fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
                 <path d={styles.eyes.pathR} fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
               </>
            )}
          </g>

          <ellipse cx="50" cy="56" rx="4.5" ry="3.5" fill={styles.noseColor} stroke={styles.strokeColor} strokeWidth="2" />

          {styles.mouth && (
            <path d={styles.mouth} fill="none" stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          )}
        </g>
      </svg>
      <div className={`absolute inset-0 rounded-full blur-[100px] -z-10 transition-all duration-1000 ease-in-out ${styles.glow}`}></div>
    </div>
  );
};

export default CatAvatar;
