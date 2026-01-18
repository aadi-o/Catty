
import React, { useState, useEffect } from 'react';
import { CatMood } from '../types';

interface CatAvatarProps {
  mood: CatMood;
}

const CatAvatar: React.FC<CatAvatarProps> = ({ mood }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // Subtle parallax for eyes
      const x = (e.clientX / window.innerWidth - 0.5) * 4;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const getEyeStyles = () => {
    switch (mood) {
      case CatMood.ROASTING:
        return {
          left: "M 34 44 Q 40 39 46 44",
          right: "M 54 44 Q 60 39 66 44",
          thickness: "4"
        };
      case CatMood.LAUGHING:
        return {
          left: "M 35 48 Q 40 42 45 48",
          right: "M 55 48 Q 60 42 65 48",
          thickness: "3"
        };
      case CatMood.DISGUSTED:
        return {
          left: "M 33 43 L 47 49",
          right: "M 53 49 L 67 43",
          thickness: "4"
        };
      case CatMood.BORED:
        return {
          left: "M 35 47 L 45 47",
          right: "M 55 47 L 65 47",
          thickness: "2"
        };
      default:
        return {
          left: "M 35 45 Q 40 42 45 45",
          right: "M 55 45 Q 60 42 65 45",
          thickness: "3.5"
        };
    }
  };

  const mouthPath = mood === CatMood.ROASTING ? "M 40 68 Q 50 74 60 68" 
                   : mood === CatMood.LAUGHING ? "M 38 66 Q 50 82 62 66"
                   : mood === CatMood.DISGUSTED ? "M 42 74 Q 50 68 58 74"
                   : "M 44 68 Q 50 70 56 68";

  const eyes = getEyeStyles();

  return (
    <div className="relative w-44 h-44 md:w-72 md:h-72 animate-float group cursor-pointer active:scale-95 transition-all duration-300">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_40px_rgba(255,255,255,0.12)]">
        {/* Ears */}
        <path d="M 15 35 L 35 10 L 45 40 Z" fill="#080808" stroke="#1a1a1a" strokeWidth="0.8" />
        <path d="M 85 35 L 65 10 L 55 40 Z" fill="#080808" stroke="#1a1a1a" strokeWidth="0.8" />
        
        {/* Face Shape */}
        <circle cx="50" cy="50" r="42" fill="#000" stroke="#111" strokeWidth="1.5" />
        
        {/* Eyes with Parallax */}
        <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
          <path d={eyes.left} fill="none" stroke="#fff" strokeWidth={eyes.thickness} strokeLinecap="round" className="transition-all duration-700 ease-out" />
          <path d={eyes.right} fill="none" stroke="#fff" strokeWidth={eyes.thickness} strokeLinecap="round" className="transition-all duration-700 ease-out" />
        </g>
        
        {/* Nose */}
        <path d="M 48 58 L 52 58 L 50 61 Z" fill="#fff" opacity="0.8" />
        
        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="transition-all duration-500 ease-in-out" />
        
        {/* Whiskers */}
        <g stroke="#1a1a1a" strokeWidth="0.5">
          <line x1="25" y1="55" x2="10" y2="52" />
          <line x1="25" y1="60" x2="8" y2="60" />
          <line x1="75" y1="55" x2="90" y2="52" />
          <line x1="75" y1="60" x2="92" y2="60" />
        </g>
      </svg>
      
      {/* Dynamic Glow */}
      <div className={`absolute inset-0 rounded-full blur-[80px] -z-10 transition-all duration-1000 ${
        mood === CatMood.ROASTING ? 'bg-white/30 scale-125' :
        mood === CatMood.LAUGHING ? 'bg-zinc-400/20' : 'bg-zinc-800/10'
      }`}></div>
    </div>
  );
};

export default CatAvatar;
