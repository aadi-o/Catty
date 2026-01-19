
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
    if ([CatMood.NEUTRAL, CatMood.SURPRISED, CatMood.CURIOUS, CatMood.HAPPY_SMILE, CatMood.PLAYFUL].includes(mood)) {
      setBlinkTrigger(true);
      const timer = setTimeout(() => setBlinkTrigger(false), 120);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  const animationIntensity = useMemo(() => {
    let score = 1.0;
    const abusiveKeywords = ['bkl', 'bsdk', 'chomu', 'bhkkk', 'namuna', 'mental', 'nalla', 'gaandu'];
    const lowerReply = lastReply.toLowerCase();
    if (abusiveKeywords.some(word => lowerReply.includes(word))) score += 2.0;
    return Math.min(score, 5.0);
  }, [lastReply]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (mood !== CatMood.THINKING && containerRef.current) {
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
        // Subtle drift when thinking
        const time = Date.now();
        setMousePos({ x: Math.sin(time / 1000) * 1.5, y: Math.cos(time / 1200) * 1.5 });
      }
    };

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.8 && mood !== CatMood.SLEEPY && mood !== CatMood.THINKING) {
        setBlinkTrigger(true);
        setTimeout(() => setBlinkTrigger(false), 120);
      }
    }, 3500);

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(blinkInterval);
    };
  }, [mood]);

  const styles = useMemo(() => {
    const hasAggression = ['bkl', 'bsdk', 'chomu', 'gaandu', 'nalla'].some(w => userInput.toLowerCase().includes(w));

    // Base properties defined in 'common' to ensure all members of the styles union have these keys.
    const common = {
      bowColor: "#e6007e",
      shirtColor: "#e6007e",
      bodyColor: "#ffffff",
      strokeColor: "#000000",
      noseColor: "#fcd116",
      eyebrows: null as { left: string; right: string } | null,
      eyebrowClass: "",
      mouth: null as string | null,
    };

    switch (mood) {
      case CatMood.THINKING:
        return {
          ...common,
          eyes: { left: "M 38 48 A 1 1 0 1 1 37.9 48", right: "M 62 48 A 1 1 0 1 1 61.9 48", w: 3, h: 4 },
          eyebrows: { 
            left: "M 32 40 Q 36 38 40 40", 
            right: "M 60 40 Q 64 38 68 40" 
          },
          eyebrowClass: "animate-thinking-eyebrows",
          glow: hasAggression ? "bg-orange-600/30" : "bg-blue-600/30",
          headClass: "animate-head-bob-thinking-refined",
        };
      case CatMood.ANGRY:
        return {
          ...common,
          eyes: { left: "M 32 44 L 42 52", right: "M 68 44 L 58 52", w: 5, h: 2 },
          mouth: "M 45 65 L 55 65",
          eyebrows: { 
            left: "M 30 38 L 42 45", 
            right: "M 70 38 L 58 45" 
          },
          glow: "bg-red-600/50",
          headClass: "animate-wiggle",
        };
      case CatMood.LAUGHING:
        return {
          ...common,
          eyes: { left: "M 34 50 Q 40 44 46 50", right: "M 54 50 Q 60 44 66 50", w: 4, h: 4 },
          mouth: "M 42 62 Q 50 72 58 62",
          glow: "bg-emerald-500/30",
          headClass: "animate-playful-bounce",
        };
      case CatMood.PLAYFUL:
        return {
          ...common,
          eyes: { left: "M 35 48 A 4 4 0 1 1 34.9 48", right: "M 65 48 A 4 4 0 1 1 64.9 48", w: 5, h: 6 },
          mouth: "M 45 62 Q 50 68 55 62",
          glow: "bg-pink-400/30",
          headClass: "animate-playful-bounce",
        };
      case CatMood.SLEEPY:
        return {
          ...common,
          eyes: { left: "M 34 50 Q 40 54 46 50", right: "M 54 50 Q 60 54 66 50", w: 4, h: 2 },
          glow: "bg-blue-900/20",
          headClass: "animate-breathe-sleep",
        };
      default: // NEUTRAL / IDLE
        return {
          ...common,
          eyes: { left: "M 36 48 A 3.5 4.5 0 1 1 35.9 48", right: "M 64 48 A 3.5 4.5 0 1 1 63.9 48", w: 4.5, h: 6 },
          glow: "bg-zinc-800/20",
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
          50% { transform: scale(1.02); }
        }
        @keyframes wiggle-fx {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-idle-purr { animation: purr-sway 4s ease-in-out infinite; transform-origin: center center; }
        .animate-playful-bounce { animation: playful-bounce-fx 0.6s ease-in-out infinite; }
        .animate-head-bob-thinking-refined { animation: head-bob-thinking-refined-fx 4s ease-in-out infinite; transform-origin: center center; }
        .animate-thinking-eyebrows { animation: thinking-eyebrows-fx 3s ease-in-out infinite; }
        .animate-breathe-sleep { animation: breathe-sleep-fx 6s ease-in-out infinite; }
        .animate-wiggle { animation: wiggle-fx 0.2s linear infinite; }
      `}</style>

      <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] ${styles.headClass}`}>
        {/* Body (Shirt) */}
        <path 
          d="M 30 70 Q 20 70 20 85 L 20 95 L 80 95 L 80 85 Q 80 70 70 70 Z" 
          fill={styles.shirtColor} 
          stroke={styles.strokeColor} 
          strokeWidth="3" 
        />
        
        {/* Feet */}
        <ellipse cx="35" cy="95" rx="15" ry="5" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3" />
        <ellipse cx="65" cy="95" rx="15" ry="5" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3" />

        {/* Arms */}
        <path d="M 22 75 Q 10 75 10 88" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 78 75 Q 90 75 90 88" fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />

        {/* Head */}
        <path 
          d="M 50 15 
             C 25 15, 12 25, 12 45 
             C 12 65, 25 75, 50 75 
             C 75 75, 88 65, 88 45 
             C 88 25, 75 15, 50 15 Z" 
          fill={styles.bodyColor} 
          stroke={styles.strokeColor} 
          strokeWidth="3.5" 
        />

        {/* Ears */}
        <path d="M 22 24 L 15 5 Q 30 5 35 20" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3.5" />
        <path d="M 78 24 L 85 5 Q 70 5 65 20" fill={styles.bodyColor} stroke={styles.strokeColor} strokeWidth="3.5" />

        {/* The Bow */}
        <g transform="translate(62, 10) scale(1.1)">
          {/* Left Loop */}
          <path d="M 0 5 Q -12 -5 -5 12 Q 0 8 0 5" fill={styles.bowColor} stroke={styles.strokeColor} strokeWidth="2.5" />
          {/* Right Loop */}
          <path d="M 12 5 Q 24 -5 17 12 Q 12 8 12 5" fill={styles.bowColor} stroke={styles.strokeColor} strokeWidth="2.5" />
          {/* Center Knot */}
          <circle cx="6" cy="7" r="5" fill={styles.bowColor} stroke={styles.strokeColor} strokeWidth="2.5" />
        </g>

        {/* Whiskers */}
        <g stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="42" x2="5" y2="40" />
          <line x1="18" y1="48" x2="5" y2="50" />
          <line x1="18" y1="54" x2="5" y2="60" />

          <line x1="82" y1="42" x2="95" y2="40" />
          <line x1="82" y1="48" x2="95" y2="50" />
          <line x1="82" y1="54" x2="95" y2="60" />
        </g>

        {/* Face Elements */}
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
          {/* Eyebrows */}
          {styles.eyebrows && (
            <g className={styles.eyebrowClass}>
              <path d={styles.eyebrows.left} fill="none" stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
              <path d={styles.eyebrows.right} fill="none" stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* Eyes */}
          <g style={{ transform: blinkTrigger ? 'scaleY(0.1)' : 'scaleY(1)', transition: 'transform 0.1s', transformOrigin: 'center 48px' }}>
            {mood === CatMood.NEUTRAL || mood === CatMood.PLAYFUL ? (
               <>
                 <ellipse cx="36" cy="48" rx={styles.eyes.w} ry={styles.eyes.h} fill={styles.strokeColor} />
                 <ellipse cx="64" cy="48" rx={styles.eyes.w} ry={styles.eyes.h} fill={styles.strokeColor} />
               </>
            ) : (
               <>
                 <path d={styles.eyes.left} fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
                 <path d={styles.eyes.right} fill="none" stroke={styles.strokeColor} strokeWidth="3" strokeLinecap="round" />
               </>
            )}
          </g>

          {/* Nose */}
          <ellipse cx="50" cy="56" rx="4.5" ry="3.5" fill={styles.noseColor} stroke={styles.strokeColor} strokeWidth="2" />

          {/* Mouth (if any) */}
          {styles.mouth && (
            <path d={styles.mouth} fill="none" stroke={styles.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          )}
        </g>
      </svg>
      {/* Soft Dynamic Glow */}
      <div className={`absolute inset-0 rounded-full blur-[100px] -z-10 transition-all duration-1000 ease-in-out ${styles.glow}`}></div>
    </div>
  );
};

export default CatAvatar;
