
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
    if (lastReply.length > 40) score += 0.5;
    const abusiveKeywords = ['bkl', 'bsdk', 'chomu', 'bhkkk', 'namuna', 'mental', 'nalla', 'gaandu'];
    const lowerReply = lastReply.toLowerCase();
    if (abusiveKeywords.some(word => lowerReply.includes(word))) score += 2.0;
    return Math.min(score, 5.0);
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
        const maxOffset = mood === CatMood.SILLY || mood === CatMood.PLAYFUL ? 14 : 10; 
        const angle = Math.atan2(dy, dx);
        const sensitivity = 45; 
        const moveX = Math.cos(angle) * Math.min(maxOffset, dist / sensitivity);
        const moveY = Math.sin(angle) * Math.min(maxOffset, dist / sensitivity);
        setMousePos({ x: moveX, y: moveY });
      } else if (mood === CatMood.THINKING) {
        const time = Date.now();
        setMousePos({ x: Math.sin(time / 700) * 1.5, y: Math.cos(time / 800) * 1.2 });
      }
    };

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.75 && mood !== CatMood.SLEEPY && mood !== CatMood.THINKING) {
        setBlinkTrigger(true);
        setTimeout(() => setBlinkTrigger(false), 120);
      }
    }, 4000);

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(blinkInterval);
    };
  }, [mood]);

  const styles = useMemo(() => {
    const hasQuestion = userInput.includes('?');
    const hasAggression = ['bkl', 'bsdk', 'chomu', 'gaandu', 'nalla'].some(w => userInput.toLowerCase().includes(w));

    switch (mood) {
      case CatMood.THINKING:
        return {
          eyes: { left: "M 38 41 A 2.5 2.5 0 1 1 37.9 41", right: "M 62 41 A 2.5 2.5 0 1 1 61.9 41", t: 2.2 },
          mouth: "M 48 62 Q 50 60 52 62",
          glow: hasAggression ? "bg-orange-600/30" : "bg-blue-600/30",
          eyeClass: "animate-pulse-subtle",
          isThinking: true,
          breatheType: 'animate-breathe-gentle',
          eyebrows: { 
            left: hasAggression ? "M 30 35 L 45 42" : "M 32 32 Q 38 29 44 32", 
            right: hasAggression ? "M 70 35 L 55 42" : "M 56 32 Q 62 29 68 32", 
            t: 1.2, 
            class: "animate-eyebrow-raise" 
          },
          headClass: hasQuestion ? "animate-curious-tilt" : "animate-head-bob-thinking",
        };
      case CatMood.PLAYFUL:
        return {
          eyes: { left: "M 30 40 A 6.5 6.5 0 1 1 29.9 40", right: "M 70 40 A 6.5 6.5 0 1 1 69.9 40", t: 3 },
          mouth: "M 38 66 Q 50 82 62 66 Z",
          glow: "bg-yellow-300/40",
          showBlush: true,
          breatheType: 'animate-breathe-heavy',
          bodyClass: "animate-playful-bounce",
          tailClass: "animate-tail-cute",
          earLClass: "animate-ear-l",
          earRClass: "animate-ear-r",
          eyebrows: { left: "M 28 32 Q 38 24 48 32", right: "M 52 32 Q 62 24 72 32", t: 1.8, class: "animate-bounce-subtle" }
        };
      case CatMood.SILLY:
        return {
          eyes: { left: "M 33 42 A 3.5 3.5 0 1 1 32.9 42", right: "M 67 42 A 3.5 3.5 0 1 1 66.9 42", t: 2 },
          mouth: "M 38 64 Q 50 78 62 64",
          glow: "bg-pink-500/50",
          showTongue: true,
          showBlush: true,
          breatheType: 'animate-breathe-heavy',
          eyebrows: { left: "M 30 35 Q 38 28 46 35", right: "M 54 35 Q 62 28 70 35", t: 1.5, class: "animate-wiggle" }
        };
      case CatMood.ANGRY:
        return {
          eyes: { left: "M 30 36 L 48 45", right: "M 70 36 L 52 45", t: 6 },
          mouth: "M 42 66 L 58 66",
          glow: "bg-red-600/70",
          showAngryMark: true,
          breatheType: 'animate-breathe-heavy',
          eyebrows: { left: "M 28 29 L 48 40", right: "M 72 29 L 52 40", t: 4, class: "" }
        };
      case CatMood.EVIL_SMILE:
      case CatMood.PLOTTING:
        return {
          eyes: { left: "M 32 42 Q 40 34 48 42", right: "M 52 42 Q 60 34 68 42", t: 4.5 },
          mouth: "M 34 62 Q 50 82 66 62 L 62 60 Q 50 76 38 60 Z",
          glow: "bg-purple-600/60",
          breatheType: 'animate-breathe-heavy',
          eyebrows: { left: "M 30 32 L 48 38", right: "M 70 32 L 52 38", t: 2.5, class: "" }
        };
      case CatMood.LAUGHING:
        return {
          eyes: { left: "M 35 44 Q 40 38 45 44", right: "M 55 44 Q 60 38 65 44", t: 3.5 },
          mouth: "M 35 56 Q 50 84 65 56",
          glow: "bg-emerald-600/40",
          showBlush: true,
          breatheType: 'animate-breathe-heavy',
          eyebrows: { left: "M 30 36 Q 40 28 48 36", right: "M 52 36 Q 60 28 70 36", t: 1.2, class: "animate-bounce-subtle" }
        };
      case CatMood.SURPRISED:
        return {
          eyes: { left: "M 30 40 A 6.5 6.5 0 1 1 29.9 40", right: "M 70 40 A 6.5 6.5 0 1 1 69.9 40", t: 3 },
          mouth: "M 50 72 A 4 4 0 1 1 49.9 72",
          glow: "bg-yellow-400/40",
          showSweatDrop: true,
          breatheType: 'animate-breathe-gentle',
          eyebrows: { left: "M 25 28 Q 35 20 45 28", right: "M 55 28 Q 65 20 75 28", t: 1.8, class: "" }
        };
      case CatMood.HAPPY_SMILE:
        return {
          eyes: { left: "M 32 42 Q 40 36 48 42", right: "M 52 42 Q 60 36 68 42", t: 4 },
          mouth: "M 38 62 Q 50 78 62 62",
          glow: "bg-green-400/30",
          showBlush: true,
          showHearts: true,
          breatheType: 'animate-breathe-gentle',
          eyebrows: { left: "M 32 34 Q 40 30 48 34", right: "M 52 34 Q 60 30 68 34", t: 1.2, class: "" }
        };
      case CatMood.SLEEPY:
        return {
          eyes: { left: "M 32 41 Q 40 47 48 41", right: "M 52 41 Q 60 47 68 41", t: 1.8 },
          mouth: "M 40 64 Q 50 84 60 64",
          glow: "bg-blue-900/30",
          mouthClass: "animate-yawn",
          breatheType: 'animate-breathe-sleep',
          eyebrows: { left: "M 32 39 Q 40 41 48 39", right: "M 52 39 Q 60 41 68 39", t: 1, class: "" }
        };
      case CatMood.NEUTRAL:
        return {
          eyes: { left: "M 33 40 A 5.5 5.5 0 1 1 32.9 40", right: "M 67 40 A 5.5 5.5 0 1 1 66.9 40", t: 3 },
          mouth: "M 41 60 Q 45 64 50 60 Q 55 64 59 60",
          glow: "bg-rose-300/25",
          showBlush: true,
          breatheType: 'animate-breathe-gentle',
          eyebrows: { left: "M 32 32 Q 40 30 48 32", right: "M 52 32 Q 60 30 68 32", t: 1, class: "" },
          headClass: "animate-idle-purr",
          bodyClass: "animate-weight-shift",
          tailClass: "animate-tail-slow",
          earLClass: "animate-ear-l-flick",
          earRClass: "animate-ear-r-flick"
        };
      case CatMood.BORED:
        return {
          eyes: { left: "M 34 40 L 46 44", right: "M 66 40 L 54 44", t: 4 },
          mouth: "M 44 70 Q 50 64 56 70",
          glow: "bg-zinc-800/40",
          breatheType: 'animate-breathe-gentle',
          eyebrows: { left: "M 32 34 L 46 36", right: "M 68 34 L 54 36", t: 2, class: "" },
          headClass: "animate-idle-purr",
          bodyClass: "animate-weight-shift-heavy",
          tailClass: "animate-tail-slow-heavy",
          earLClass: "animate-ear-l-flick-slow",
          earRClass: "animate-ear-r-flick-slow"
        };
      case CatMood.DISGUSTED:
      case CatMood.ANNOYED:
      default:
        return {
          eyes: { left: "M 34 40 L 46 44", right: "M 66 40 L 54 44", t: 4 },
          mouth: "M 44 70 Q 50 64 56 70",
          glow: "bg-zinc-800/40",
          breatheType: 'animate-breathe-gentle',
          eyebrows: { left: "M 32 34 L 46 36", right: "M 68 34 L 54 36", t: 2, class: "" },
          headClass: "animate-idle-purr",
          tailClass: "animate-tail-slow",
          earLClass: "animate-ear-l-flick",
          earRClass: "animate-ear-r-flick"
        };
      case CatMood.SARCASTIC:
      case CatMood.SMUG:
        return {
          eyes: { left: "M 34 40 A 3 3 0 1 1 33.9 40", right: "M 66 40 A 3 3 0 1 1 65.9 40", t: 3.5 },
          mouth: "M 44 64 Q 55 70 66 60",
          glow: "bg-indigo-600/40",
          showBlush: true,
          breatheType: 'animate-breathe-gentle',
          eyebrows: { left: "M 30 30 Q 38 32 46 30", right: "M 54 26 Q 62 23 70 26", t: 1.4, class: "" }
        };
    }
  }, [mood, userInput]);

  const breatheDuration = mood === CatMood.SLEEPY ? '8s' : (isIntense(mood) ? `${1.0 / animationIntensity}s` : `${4.5 / animationIntensity}s`);

  function isIntense(m: CatMood) {
    return [CatMood.ROASTING, CatMood.LAUGHING, CatMood.ANGRY, CatMood.EVIL_SMILE, CatMood.SILLY, CatMood.PLAYFUL].includes(m);
  }

  return (
    <div 
      key={moodKey} 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-visible ${mood === CatMood.SLEEPY ? 'animate-mood-stretch-slow' : 'animate-mood-stretch'}`}
    >
      <style>{`
        @keyframes purr-sway {
          0%, 100% { transform: translate(0, 0) rotate(-1.2deg); }
          50% { transform: translate(1.2px, -1.8px) rotate(1.2deg); }
        }
        @keyframes weight-shift-fx {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1.8px, 0.6px); }
          50% { transform: translate(0.6px, -1px); }
          75% { transform: translate(1.8px, 0.3px); }
        }
        @keyframes weight-shift-heavy-fx {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(-2.5px, 1.2px); }
          80% { transform: translate(2.5px, 0.8px); }
        }
        @keyframes playful-bounce-fx {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-4px) scale(1.02, 0.98); }
          75% { transform: translateY(2px) scale(0.98, 1.02); }
        }
        @keyframes head-bob-thinking {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(1px, -2px) rotate(1.5deg); }
        }
        @keyframes curious-tilt-fx {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          50% { transform: translate(3px, -4px) rotate(18deg); }
        }
        @keyframes breathe-heavy-fx {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08, 1.04) translate(0, -1.5px); }
        }
        @keyframes breathe-gentle-fx {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.03, 1.01) translate(0, -0.5px); }
        }
        @keyframes breathe-sleep-fx {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.02, 1.005) translate(0, -0.2px); }
        }
        @keyframes chest-expand-fx {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.2; }
          50% { transform: scale(1.15, 1.1) translate(0, -2px); opacity: 0.4; }
        }
        @keyframes ear-twitch-left-refined {
          0%, 80%, 100% { transform: rotate(0deg); }
          81% { transform: rotate(-8deg); }
          82% { transform: rotate(2deg); }
          83% { transform: rotate(-1deg); }
          92% { transform: rotate(-12deg); }
          94% { transform: rotate(4deg); }
        }
        @keyframes ear-twitch-right-refined {
          0%, 85%, 100% { transform: rotate(0deg); }
          86% { transform: rotate(8deg); }
          87% { transform: rotate(-2deg); }
          88% { transform: rotate(1deg); }
          94% { transform: rotate(12deg); }
          96% { transform: rotate(-4deg); }
        }
        @keyframes tail-swish-cute {
          0%, 100% { transform: rotate(-10deg); }
          45% { transform: rotate(18deg); }
          50% { transform: rotate(14deg); }
          55% { transform: rotate(16deg); }
        }
        @keyframes tail-swish-slow {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes tail-swish-slow-heavy {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(6deg); }
        }
        @keyframes sweat-drip {
          0% { transform: translateY(0) opacity(0); }
          20% { opacity: 1; }
          100% { transform: translateY(12px) opacity(0); }
        }
        @keyframes float-heart {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.2) translateY(-20px); opacity: 0; }
        }
        @keyframes angry-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        .animate-idle-purr { animation: purr-sway 5s ease-in-out infinite; transform-origin: bottom center; }
        .animate-weight-shift { animation: weight-shift-fx 10s ease-in-out infinite; }
        .animate-weight-shift-heavy { animation: weight-shift-heavy-fx 14s ease-in-out infinite; }
        .animate-playful-bounce { animation: playful-bounce-fx 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .animate-head-bob-thinking { animation: head-bob-thinking 3s ease-in-out infinite; transform-origin: center center; }
        .animate-curious-tilt { animation: curious-tilt-fx 3s ease-in-out infinite; transform-origin: center center; }
        .animate-breathe-heavy { transform-origin: bottom center; animation: breathe-heavy-fx ${breatheDuration} ease-in-out infinite; }
        .animate-breathe-gentle { transform-origin: bottom center; animation: breathe-gentle-fx ${breatheDuration} ease-in-out infinite; }
        .animate-breathe-sleep { transform-origin: bottom center; animation: breathe-sleep-fx ${breatheDuration} ease-in-out infinite; }
        .animate-chest-expand { transform-origin: center center; animation: chest-expand-fx ${breatheDuration} ease-in-out infinite; }
        
        .animate-ear-l { animation: ear-twitch-left-refined 6s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 30px 26px; }
        .animate-ear-r { animation: ear-twitch-right-refined 6s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 70px 26px; }
        .animate-ear-l-flick { animation: ear-twitch-left-refined 11s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 30px 26px; }
        .animate-ear-r-flick { animation: ear-twitch-right-refined 13s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 70px 26px; }
        .animate-ear-l-flick-slow { animation: ear-twitch-left-refined 16s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 30px 26px; }
        .animate-ear-r-flick-slow { animation: ear-twitch-right-refined 19s cubic-bezier(0.45, 0, 0.55, 1) infinite; transform-origin: 70px 26px; }

        .animate-tail-cute { animation: tail-swish-cute 3.5s cubic-bezier(0.36, 0, 0.64, 1) infinite; transform-origin: 22px 84px; }
        .animate-tail-slow { animation: tail-swish-slow 7s ease-in-out infinite; transform-origin: 22px 84px; }
        .animate-tail-slow-heavy { animation: tail-swish-slow-heavy 9s ease-in-out infinite; transform-origin: 22px 84px; }
        
        .animate-sweat { animation: sweat-drip 1.5s linear infinite; }
        .animate-heart { animation: float-heart 2s ease-out infinite; }
        .animate-angry-mark { animation: angry-pulse 1s ease-in-out infinite; }
        .animate-wiggle { animation: purr-sway 0.5s ease-in-out infinite; }

        .transition-cat { transition: d 0.6s cubic-bezier(0.4, 0, 0.2, 1), fill 0.6s ease, stroke 0.6s ease, transform 0.4s ease; }
      `}</style>

      <svg viewBox="0 0 100 100" className={`w-[96%] h-[96%] overflow-visible drop-shadow-[0_0_40px_rgba(255,255,255,0.08)] ${styles.bodyClass || ''}`}>
        {/* Tail (Elastic Swish) */}
        <path d="M 22 84 Q 5 80 5 95 Q 15 100 22 92" fill="none" stroke="#080808" strokeWidth="8" strokeLinecap="round" className={styles.tailClass || "animate-tail-cute"} />
        
        {styles.isThinking && (
          <g className="opacity-25">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="0.8" strokeDasharray="10 15" className="animate-spin-slow" />
          </g>
        )}

        <g className={`${styles.breatheType} ${styles.headClass || ''}`}>
          {/* Cuter Pointy Ears (Snap & Settle Twitch) */}
          <path d="M 22 36 L 30 16 Q 38 12 45 36 Z" fill="#080808" className={`${styles.earLClass || 'animate-ear-l'} transition-cat`} />
          <path d="M 78 36 L 70 16 Q 62 12 55 36 Z" fill="#080808" className={`${styles.earRClass || 'animate-ear-r'} transition-cat`} />
          
          {/* Chibi Cat Silhouette */}
          <path 
            id="cat-body"
            d="M 50 20 
               C 65 20, 78 30, 78 46 
               C 78 58, 72 65, 84 88 
               C 86 94, 78 98, 50 98 
               C 22 98, 14 94, 16 88 
               C 28 65, 22 58, 22 46 
               C 22 30, 35 20, 50 20 Z" 
            fill="#000" 
            stroke="#121212" 
            strokeWidth="1.5" 
            className="transition-cat"
          />

          {/* Breathing Chest Highlight (Expansion Effect) */}
          <ellipse cx="50" cy="72" rx="12" ry="8" fill="rgba(255,255,255,0.08)" filter="blur(4px)" className="animate-chest-expand" />

          {/* Emotional Decoratives */}
          {styles.showAngryMark && (
            <g transform="translate(75, 25)" className="animate-angry-mark">
              <path d="M-4,-4 L4,4 M4,-4 L-4,4" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
          {styles.showSweatDrop && (
            <path d="M 20 35 Q 18 38 20 42 Q 22 38 20 35" fill="#3b82f6" className="animate-sweat" />
          )}
          {styles.showHearts && (
            <>
              <path d="M 15 25 Q 15 20 20 20 Q 25 20 25 25 Q 25 30 20 35 Q 15 30 15 25" fill="#f43f5e" className="animate-heart" style={{ animationDelay: '0s' }} />
              <path d="M 85 20 Q 85 15 90 15 Q 95 15 95 20 Q 95 25 90 30 Q 85 25 85 20" fill="#f43f5e" className="animate-heart" style={{ animationDelay: '0.8s' }} />
            </>
          )}
          
          {/* Facial Elements */}
          <g transform={`translate(${mousePos.x}, ${mousePos.y})`} className="transition-transform duration-700 ease-out">
            {/* Blush */}
            {styles.showBlush && (
              <g className="opacity-40">
                <circle cx="32" cy="52" r="5" fill="#f43f5e" filter="blur(3px)" />
                <circle cx="68" cy="52" r="5" fill="#f43f5e" filter="blur(3px)" />
              </g>
            )}

            {/* Eyebrows */}
            {styles.eyebrows && (
              <g className={styles.eyebrows.class}>
                <path d={styles.eyebrows.left} fill="none" stroke="#fff" strokeWidth={styles.eyebrows.t} strokeLinecap="round" className="opacity-40 transition-cat" />
                <path d={styles.eyebrows.right} fill="none" stroke="#fff" strokeWidth={styles.eyebrows.t} strokeLinecap="round" className="opacity-40 transition-cat" />
              </g>
            )}
            
            {/* Eyes */}
            <g style={{ transform: blinkTrigger ? 'scaleY(0.05)' : 'scaleY(1)', transition: 'transform 0.1s', transformOrigin: 'center 40px' }}>
               <path d={styles.eyes.left} fill="none" stroke="#fff" strokeWidth={styles.eyes.t} strokeLinecap="round" className="transition-cat" />
               <path d={styles.eyes.right} fill="none" stroke="#fff" strokeWidth={styles.eyes.t} strokeLinecap="round" className="transition-cat" />
               {!styles.isThinking && !blinkTrigger && (
                 <>
                   <circle cx="36" cy="37" r="2.2" fill="#fff" opacity="0.85" />
                   <circle cx="34" cy="42" r="1" fill="#fff" opacity="0.4" />
                   <circle cx="64" cy="37" r="2.2" fill="#fff" opacity="0.85" />
                   <circle cx="66" cy="42" r="1" fill="#fff" opacity="0.4" />
                 </>
               )}
            </g>
            
            {/* Small Nose */}
            <path d="M 48 51 L 52 51 L 50 54 Z" fill="#fff" opacity="0.95" />
            
            {/* Tongue */}
            {styles.showTongue && (
               <path d="M 47 68 Q 50 78 53 68" fill="#f43f5e" className="animate-pulse" style={{ animationDuration: '0.3s' }} />
            )}
            
            {/* Mouth */}
            <path d={styles.mouth} fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" className={`transition-cat ${styles.mouthClass || ''}`} />
          </g>
        </g>
      </svg>
      {/* Soft Dynamic Glow */}
      <div className={`absolute inset-0 rounded-full blur-[90px] -z-10 transition-all duration-1000 ease-in-out ${styles.glow}`}></div>
    </div>
  );
};

export default CatAvatar;
