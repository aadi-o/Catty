
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CatMood } from '../types';

interface CatAvatarProps {
  mood: CatMood;
  lastReply?: string;
}

const CatAvatar: React.FC<CatAvatarProps> = ({ mood, lastReply = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blinkTrigger, setBlinkTrigger] = useState(false);
  const [moodKey, setMoodKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger a subtle "pop" on mood change to signal state shift
  useEffect(() => {
    setMoodKey(prev => prev + 1);
  }, [mood]);

  const animationIntensity = useMemo(() => {
    let score = 1.0;
    if (lastReply.length > 40) score += 0.5;
    if (lastReply.length > 80) score += 0.5;
    
    const abusiveKeywords = ['bkl', 'bsdk', 'chomu', 'bhkkk', 'namuna', 'mental', 'nalla', 'gaandu'];
    const lowerReply = lastReply.toLowerCase();
    if (abusiveKeywords.some(word => lowerReply.includes(word))) {
      score += 1.2;
    }
    
    return Math.min(score, 4.0);
  }, [lastReply, mood]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (mood !== CatMood.THINKING && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const catCenterX = rect.left + rect.width / 2;
        const catCenterY = rect.top + rect.height / 2;
        
        const dx = e.clientX - catCenterX;
        const dy = e.clientY - catCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxOffset = mood === CatMood.SILLY ? 22 : 18; 
        const angle = Math.atan2(dy, dx);
        const sensitivity = 25; 
        const moveX = Math.cos(angle) * Math.min(maxOffset, dist / sensitivity);
        const moveY = Math.sin(angle) * Math.min(maxOffset, dist / sensitivity);
        
        setMousePos({ x: moveX, y: moveY });
      } else if (mood === CatMood.THINKING) {
        // Subtle drift when thinking
        setMousePos({ x: Math.sin(Date.now() / 1000) * 2, y: Math.cos(Date.now() / 1000) * 2 });
      }
    };

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.6 && mood !== CatMood.SLEEPY && mood !== CatMood.THINKING) {
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
          eyes: { left: "M 38 45 A 2 2 0 1 1 37.9 45", right: "M 62 45 A 2 2 0 1 1 61.9 45", t: 2.5 },
          mouth: "M 46 70 Q 50 68 54 70",
          glow: "bg-blue-600/30",
          eyeClass: "animate-pulse",
          isThinking: true,
          breatheType: 'animate-breathe-gentle'
        };
      case CatMood.SILLY:
        return {
          eyes: { left: "M 32 45 A 5 5 0 1 1 31.9 45", right: "M 68 45 A 5 5 0 1 1 67.9 45", t: 3 },
          mouth: "M 38 72 Q 50 85 62 72",
          glow: "bg-pink-500/40",
          showTongue: true,
          breatheType: 'animate-breathe-heavy'
        };
      case CatMood.SLEEPY:
        return {
          eyes: { left: "M 32 46 Q 40 50 48 46", right: "M 52 46 Q 60 50 68 46", t: 2 },
          mouth: "M 44 72 Q 50 82 56 72",
          glow: "bg-blue-900/10",
          mouthClass: "animate-yawn",
          breatheType: 'animate-breathe-sleep'
        };
      case CatMood.ANGRY:
        return {
          eyes: { left: "M 30 40 L 48 50", right: "M 70 40 L 52 50", t: 6 },
          mouth: "M 40 75 L 60 75",
          glow: "bg-red-600/60",
          breatheType: 'animate-breathe-heavy'
        };
      case CatMood.LAUGHING:
        return {
          eyes: { left: "M 35 48 Q 40 42 45 48", right: "M 55 48 Q 60 42 65 48", t: 4 },
          mouth: "M 35 65 Q 50 85 65 65",
          glow: "bg-emerald-600/20",
          breatheType: 'animate-breathe-heavy'
        };
      case CatMood.ROASTING:
        return {
          eyes: { left: "M 32 46 Q 40 38 48 46", right: "M 52 46 Q 60 38 68 46", t: 4 },
          mouth: "M 32 68 Q 50 80 68 68",
          glow: "bg-red-500/30",
          breatheType: 'animate-breathe-heavy'
        };
      case CatMood.EVIL_SMILE:
        return {
          eyes: { left: "M 32 46 Q 40 38 48 46", right: "M 52 46 Q 60 38 68 46", t: 5 },
          mouth: "M 32 68 Q 50 88 68 68 L 62 66 Q 50 80 38 66 Z",
          glow: "bg-red-900/70",
          breatheType: 'animate-breathe-heavy'
        };
      case CatMood.DISGUSTED:
        return {
          eyes: { left: "M 32 44 L 48 48", right: "M 68 44 L 52 48", t: 4.5 },
          mouth: "M 44 76 Q 50 68 56 76",
          glow: "bg-purple-900/40",
          breatheType: 'animate-breathe-gentle'
        };
      case CatMood.SARCASTIC:
        return {
          eyes: { left: "M 34 43 Q 40 40 46 43", right: "M 54 43 Q 60 46 66 43", t: 3.5 },
          mouth: "M 44 70 Q 55 75 66 65",
          glow: "bg-indigo-600/30",
          breatheType: 'animate-breathe-gentle'
        };
      case CatMood.BORED:
        return {
          eyes: { left: "M 32 48 Q 40 50 48 48", right: "M 52 48 Q 60 50 68 48", t: 2 },
          mouth: "M 44 70 Q 50 72 56 70",
          glow: "bg-zinc-800/20",
          breatheType: 'animate-breathe-gentle'
        };
      default:
        return {
          eyes: { left: "M 35 45 Q 40 42 45 45", right: "M 55 45 Q 60 42 65 45", t: 4 },
          mouth: "M 44 68 Q 50 70 56 68",
          glow: "bg-zinc-800/10",
          breatheType: 'animate-breathe-gentle'
        };
    }
  }, [mood]);

  const isIntense = [CatMood.ROASTING, CatMood.LAUGHING, CatMood.ANGRY, CatMood.EVIL_SMILE, CatMood.SILLY].includes(mood);
  const breatheDuration = mood === CatMood.SLEEPY ? '7s' : (isIntense ? `${1.2 / animationIntensity}s` : `${3.5 / animationIntensity}s`);
  const tailDuration = isIntense ? '0.6s' : '2.5s';

  return (
    <div 
      key={moodKey} 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center animate-mood-stretch overflow-visible"
    >
      <style>{`
        @keyframes circular-spin {
          0% { transform: rotate(0deg); stroke-dashoffset: 280; }
          50% { stroke-dashoffset: 70; }
          100% { transform: rotate(360deg); stroke-dashoffset: 280; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(0.95); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes yawn {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2) translateY(3px); }
        }
        @keyframes tongue-wiggle {
          0%, 100% { transform: rotate(-5deg) scaleY(1); }
          50% { transform: rotate(5deg) scaleY(1.2); }
        }
        @keyframes ear-twitch-left {
          0%, 90%, 100% { transform: rotate(0deg); }
          93% { transform: rotate(-8deg); }
          96% { transform: rotate(5deg); }
        }
        @keyframes ear-twitch-right {
          0%, 85%, 100% { transform: rotate(0deg); }
          88% { transform: rotate(8deg); }
          91% { transform: rotate(-5deg); }
        }
        @keyframes tail-swish {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes mood-stretch {
          0% { transform: scale(1); }
          30% { transform: scale(1.08, 0.92); }
          60% { transform: scale(0.95, 1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes breathe-heavy-fx {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes breathe-gentle-fx {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes breathe-sleep-fx {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }

        .animate-spin-loader { transform-origin: center; animation: circular-spin 2s linear infinite; }
        .animate-pulse-glow { transform-origin: center; animation: pulse-glow 2s ease-in-out infinite; }
        
        .animate-breathe-heavy { transform-origin: center; animation: breathe-heavy-fx ${breatheDuration} ease-in-out infinite; }
        .animate-breathe-gentle { transform-origin: center; animation: breathe-gentle-fx ${breatheDuration} ease-in-out infinite; }
        .animate-breathe-sleep { transform-origin: center; animation: breathe-sleep-fx ${breatheDuration} ease-in-out infinite; }

        .animate-yawn { transform-origin: 50% 72%; animation: yawn 5s ease-in-out infinite; }
        .animate-tongue { transform-origin: 50% 75%; animation: tongue-wiggle 0.3s ease-in-out infinite; }
        .animate-ear-l { transform-origin: 35px 40px; animation: ear-twitch-left 4s ease-in-out infinite; }
        .animate-ear-r { transform-origin: 65px 40px; animation: ear-twitch-right 5.2s ease-in-out infinite; }
        .animate-tail { transform-origin: 15px 75px; animation: tail-swish ${tailDuration} ease-in-out infinite; }
        .animate-mood-stretch { animation: mood-stretch 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        /* Morphing transitions for paths */
        .path-morph {
          transition: d 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.5s ease-in-out, opacity 0.5s ease-in-out, fill 0.5s ease-in-out;
        }
        .fade-in {
          animation: fade-in-ring 0.8s ease-out forwards;
        }
        @keyframes fade-in-ring {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] overflow-visible drop-shadow-[0_0_50px_rgba(255,255,255,0.08)]">
        <path d="M 20 75 Q 5 85 10 95 Q 20 100 25 85" fill="none" stroke="#080808" strokeWidth="6" strokeLinecap="round" className="animate-tail" />
        
        {styles.isThinking && (
          <g className="fade-in">
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.2" strokeDasharray="40 260" className="animate-spin-loader" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.8" className="animate-pulse-glow" />
          </g>
        )}

        <g className={styles.breatheType}>
          <path d="M 15 35 L 35 10 L 45 40 Z" fill="#080808" className="animate-ear-l" />
          <path d="M 85 35 L 65 10 L 55 40 Z" fill="#080808" className="animate-ear-r" />
          <circle cx="50" cy="50" r="42" fill="#000" stroke="#151515" strokeWidth="2" />
          
          <g transform={`translate(${mousePos.x}, ${mousePos.y})`} className="transition-transform duration-300 ease-out">
            <g className={styles.eyeClass || ''} style={{ transform: blinkTrigger ? 'scaleY(0.02)' : 'scaleY(1)', transition: 'transform 0.08s', transformOrigin: 'center 45px' }}>
               <path d={styles.eyes.left} fill="none" stroke="#fff" strokeWidth={styles.eyes.t} strokeLinecap="round" className="path-morph" />
               <path d={styles.eyes.right} fill="none" stroke="#fff" strokeWidth={styles.eyes.t} strokeLinecap="round" className="path-morph" />
            </g>
            <path d="M 48 58 L 52 58 L 50 61 Z" fill="#fff" opacity="0.95" />
            {styles.showTongue && (
               <path d="M 46 76 Q 50 85 54 76" fill="#f43f5e" className="animate-tongue" />
            )}
            <path d={styles.mouth} fill={mood === CatMood.EVIL_SMILE ? "#fff" : "none"} stroke="#fff" strokeWidth="2.2" strokeLinecap="round" className={`path-morph ${styles.mouthClass || ''}`} />
          </g>
        </g>
      </svg>
      <div className={`absolute inset-0 rounded-full blur-[90px] -z-10 transition-all duration-1000 ease-in-out ${styles.glow}`}></div>
    </div>
  );
};

export default CatAvatar;
