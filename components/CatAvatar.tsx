
import React, { useState, useEffect, useMemo } from 'react';
import { CatMood } from '../types';

interface CatAvatarProps {
  mood: CatMood;
  lastReply?: string;
}

const CatAvatar: React.FC<CatAvatarProps> = ({ mood, lastReply = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blinkTrigger, setBlinkTrigger] = useState(false);

  // Determine intensity based on length and aggression (keywords)
  const animationIntensity = useMemo(() => {
    let score = 1.0;
    if (lastReply.length > 40) score += 0.5;
    if (lastReply.length > 80) score += 0.5;
    
    const abusiveKeywords = ['bkl', 'bsdk', 'chomu', 'bhkkk', 'tharki', 'gadha'];
    const lowerReply = lastReply.toLowerCase();
    if (abusiveKeywords.some(word => lowerReply.includes(word))) {
      score += 1.0;
    }
    
    return Math.min(score, 3.5); // Cap at 3.5x intensity
  }, [lastReply]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // If thinking, eyes dart automatically, otherwise follow mouse
      if (mood !== CatMood.THINKING) {
        const x = (e.clientX / window.innerWidth - 0.5) * 8;
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        setMousePos({ x, y });
      }
    };

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.6) {
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
    switch (mood) {
      case CatMood.THINKING:
        return {
          eyes: { left: "M 38 45 A 2 2 0 1 1 37.9 45", right: "M 62 45 A 2 2 0 1 1 61.9 45", t: 3 },
          mouth: "M 46 70 Q 50 68 54 70",
          glow: "bg-amber-500/10",
          eyeClass: "animate-dart"
        };
      case CatMood.SARCASTIC:
        return {
          eyes: { left: "M 32 46 L 48 46", right: "M 52 44 Q 60 38 68 44", t: 3.5 },
          mouth: "M 44 72 Q 54 74 62 68",
          glow: "bg-slate-400/25"
        };
      case CatMood.CURIOUS:
        return {
          eyes: { left: "M 40 43 A 3.5 3.5 0 1 1 39.9 43", right: "M 60 43 A 3.5 3.5 0 1 1 59.9 43", t: 2.5 },
          mouth: "M 46 72 Q 50 66 54 72",
          glow: "bg-cyan-500/20"
        };
      case CatMood.ANNOYED:
        return {
          eyes: { left: "M 32 46 L 48 46", right: "M 52 46 L 68 46", t: 4 },
          mouth: "M 42 70 Q 50 72 58 70",
          glow: "bg-orange-600/25"
        };
      case CatMood.PLOTTING:
        return {
          eyes: { left: "M 32 46 Q 40 42 48 46", right: "M 52 46 Q 60 42 68 46", t: 3.5 },
          mouth: "M 38 68 Q 50 74 62 68 L 60 70 Q 50 74 40 70 Z",
          glow: "bg-emerald-900/40"
        };
      case CatMood.EVIL_SMILE:
        return {
          eyes: { left: "M 32 46 Q 40 38 48 46", right: "M 52 46 Q 60 38 68 46", t: 4.5 },
          mouth: "M 32 68 Q 50 88 68 68 L 62 66 Q 50 80 38 66 Z",
          glow: "bg-red-900/50"
        };
      case CatMood.HAPPY_SMILE:
        return {
          eyes: { left: "M 35 45 Q 40 40 45 45", right: "M 55 45 Q 60 40 65 45", t: 3 },
          mouth: "M 38 70 Q 50 80 62 70",
          glow: "bg-green-500/10"
        };
      case CatMood.SMUG:
        return {
          eyes: { left: "M 34 44 Q 40 41 46 44", right: "M 54 44 Q 60 38 66 44", t: 3.5 },
          mouth: "M 45 68 Q 55 72 68 64",
          glow: "bg-purple-600/20"
        };
      case CatMood.ANGRY:
        return {
          eyes: { left: "M 30 40 L 48 50", right: "M 70 40 L 52 50", t: 5.5 },
          mouth: "M 40 75 L 60 75",
          glow: "bg-red-600/40"
        };
      case CatMood.ROASTING:
        return {
          eyes: { left: "M 34 44 Q 40 38 46 44", right: "M 54 44 Q 60 38 66 44", t: 4.5 },
          mouth: "M 40 68 Q 50 76 60 68",
          glow: "bg-white/30"
        };
      case CatMood.LAUGHING:
        return {
          eyes: { left: "M 35 48 Q 40 42 45 48", right: "M 55 48 Q 60 42 65 48", t: 3.5 },
          mouth: "M 35 65 Q 50 85 65 65",
          glow: "bg-zinc-400/20"
        };
      case CatMood.DISGUSTED:
        return {
          eyes: { left: "M 32 44 L 48 48", right: "M 68 44 L 52 48", t: 4 },
          mouth: "M 44 76 Q 50 68 56 76",
          glow: "bg-zinc-800/30"
        };
      case CatMood.BORED:
        return {
          eyes: { left: "M 35 47 L 45 47", right: "M 55 47 L 65 47", t: 2.5 },
          mouth: "M 45 68 Q 50 70 55 68",
          glow: "bg-zinc-900/10"
        };
      case CatMood.SURPRISED:
        return {
          eyes: { left: "M 40 44 A 4.5 4.5 0 1 1 39.9 44", right: "M 60 44 A 4.5 4.5 0 1 1 59.9 44", t: 3 },
          mouth: "M 47 74 A 3 3 0 1 1 46.9 74",
          glow: "bg-yellow-500/20"
        };
      case CatMood.SLEEPY:
        return {
          eyes: { left: "M 33 48 L 47 48", right: "M 53 48 L 67 48", t: 2 },
          mouth: "M 47 70 Q 50 72 53 70",
          glow: "bg-blue-950/25"
        };
      default:
        return {
          eyes: { left: "M 35 45 Q 40 42 45 45", right: "M 55 45 Q 60 42 65 45", t: 3.5 },
          mouth: "M 44 68 Q 50 70 56 68",
          glow: "bg-zinc-800/10"
        };
    }
  }, [mood]);

  const isIntense = [CatMood.ROASTING, CatMood.LAUGHING, CatMood.ANGRY, CatMood.EVIL_SMILE, CatMood.PLOTTING, CatMood.SARCASTIC].includes(mood);
  const isIdle = [CatMood.NEUTRAL, CatMood.BORED, CatMood.SLEEPY, CatMood.ANNOYED].includes(mood);

  // Dynamic variables based on score
  const tailDuration = isIntense ? `${0.9 / animationIntensity}s` : `${5 / animationIntensity}s`;
  const tailAngle = `${(isIntense ? 32 : isIdle ? 6 : 16) * Math.sqrt(animationIntensity)}deg`;
  const earDelay = isIdle ? `${9 / animationIntensity}s` : `${3 / animationIntensity}s`;
  const earTwitchScale = 1.6 * animationIntensity;
  const breatheDuration = isIntense ? `${1.2 / animationIntensity}s` : `${3.5 / animationIntensity}s`;
  const breatheScale = 1 + (0.06 * animationIntensity);

  return (
    <div className="relative w-48 h-48 md:w-80 md:h-80 animate-float group cursor-pointer active:scale-95 transition-all duration-300">
      <style>{`
        @keyframes tail-swish-fx {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(${tailAngle}); }
        }
        @keyframes ear-twitch-l-fx {
          0%, 82%, 100% { transform: rotate(0deg); }
          86% { transform: rotate(${-18 * earTwitchScale}deg); }
          90% { transform: rotate(${4 * earTwitchScale}deg); }
        }
        @keyframes ear-twitch-r-fx {
          0%, 78%, 100% { transform: rotate(0deg); }
          82% { transform: rotate(${20 * earTwitchScale}deg); }
          86% { transform: rotate(${-6 * earTwitchScale}deg); }
        }
        @keyframes breathe-fx {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(${breatheScale}) translateY(${-2 * animationIntensity}px); }
        }
        @keyframes subtle-posture {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          33% { transform: rotate(${isIdle ? '1.5deg' : '0.2deg'}) translateX(${isIdle ? '3px' : '0.5px'}); }
          66% { transform: rotate(${isIdle ? '-1deg' : '-0.2deg'}) translateX(${isIdle ? '-2px' : '-0.5px'}); }
        }
        @keyframes eyes-dart-fx {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3px, -1px); }
          40% { transform: translate(3px, 1px); }
          60% { transform: translate(-2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        .animate-tail { transform-origin: 20px 80px; animation: tail-swish-fx ${tailDuration} ease-in-out infinite; }
        .animate-ear-l { transform-origin: 35px 35px; animation: ear-twitch-l-fx ${earDelay} infinite; }
        .animate-ear-r { transform-origin: 65px 35px; animation: ear-twitch-r-fx ${earDelay} infinite; }
        .animate-breathe { transform-origin: center; animation: breathe-fx ${breatheDuration} ease-in-out infinite; }
        .animate-posture { transform-origin: bottom center; animation: subtle-posture 10s ease-in-out infinite; }
        .animate-dart { animation: eyes-dart-fx 1.5s ease-in-out infinite; }
      `}</style>

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_60px_rgba(255,255,255,0.12)]">
        <path 
          d="M 22 82 Q 5 85 8 95 Q 12 100 25 92" 
          fill="none" stroke="#0a0a0a" strokeWidth="4.5" strokeLinecap="round"
          className="animate-tail"
        />

        <g className="animate-breathe animate-posture">
          <g className="animate-ear-l"><path d="M 15 35 L 35 10 L 45 40 Z" fill="#080808" /></g>
          <g className="animate-ear-r"><path d="M 85 35 L 65 10 L 55 40 Z" fill="#080808" /></g>
          
          <circle cx="50" cy="50" r="42" fill="#000" stroke="#111" strokeWidth="1.8" />
          
          <g transform={mood === CatMood.THINKING ? undefined : `translate(${mousePos.x}, ${mousePos.y})`}>
            <g className={styles.eyeClass || ''} style={{ transform: blinkTrigger ? 'scaleY(0.02)' : 'scaleY(1)', transition: 'transform 0.08s', transformOrigin: 'center 45px' }}>
               <path d={styles.eyes.left} fill="none" stroke="#fff" strokeWidth={styles.eyes.t} strokeLinecap="round" className="transition-all duration-500" />
               <path d={styles.eyes.right} fill="none" stroke="#fff" strokeWidth={styles.eyes.t} strokeLinecap="round" className="transition-all duration-500" />
            </g>
            
            <path d="M 48 58 L 52 58 L 50 61 Z" fill="#fff" opacity="0.9" />
            
            <path 
              d={styles.mouth} 
              fill={mood === CatMood.EVIL_SMILE || mood === CatMood.PLOTTING ? "#fff" : "none"} 
              stroke="#fff" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              className="transition-all duration-500 ease-in-out"
            />
            
            <g stroke="#1a1a1a" strokeWidth="0.6">
              <line x1="25" y1="55" x2="8" y2="52" /><line x1="25" y1="60" x2="5" y2="60" />
              <line x1="75" y1="55" x2="92" y2="52" /><line x1="75" y1="60" x2="95" y2="60" />
            </g>
          </g>
        </g>
      </svg>
      
      <div className={`absolute inset-0 rounded-full blur-[90px] -z-10 transition-all duration-1000 ${styles.glow} ${isIntense ? 'scale-150' : 'scale-100'}`}></div>
    </div>
  );
};

export default CatAvatar;
