
import React from 'react';
import { CatMood } from '../types';

interface CatAvatarProps {
  mood: CatMood;
}

const CatAvatar: React.FC<CatAvatarProps> = ({ mood }) => {
  const getEyeStyles = () => {
    switch (mood) {
      case CatMood.ROASTING:
        return {
          left: "M 35 45 Q 40 40 45 45",
          right: "M 55 45 Q 60 40 65 45",
          thickness: "3.5"
        };
      case CatMood.LAUGHING:
        return {
          left: "M 35 48 Q 40 43 45 48",
          right: "M 55 48 Q 60 43 65 48",
          thickness: "3"
        };
      case CatMood.DISGUSTED:
        return {
          left: "M 34 44 L 46 48",
          right: "M 54 48 L 66 44",
          thickness: "3.5"
        };
      case CatMood.BORED:
        return {
          left: "M 35 46 L 45 46",
          right: "M 55 46 L 65 46",
          thickness: "2.5"
        };
      default:
        return {
          left: "M 35 45 Q 40 42 45 45",
          right: "M 55 45 Q 60 42 65 45",
          thickness: "3"
        };
    }
  };

  const mouthPath = mood === CatMood.ROASTING ? "M 42 68 Q 50 72 58 68" 
                   : mood === CatMood.LAUGHING ? "M 40 66 Q 50 78 60 66"
                   : mood === CatMood.DISGUSTED ? "M 42 72 Q 50 68 58 72"
                   : "M 44 68 Q 50 69 56 68";

  const eyes = getEyeStyles();

  return (
    <div className="relative w-40 h-40 md:w-64 md:h-64 animate-float group transition-transform duration-700">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,255,255,0.08)]">
        {/* Ears - Sleek geometric */}
        <path d="M 18 35 L 35 12 L 42 38 Z" fill="#0c0c0e" stroke="#222" strokeWidth="1" />
        <path d="M 82 35 L 65 12 L 58 38 Z" fill="#0c0c0e" stroke="#222" strokeWidth="1" />
        
        {/* Face Shape - Deep matte black */}
        <circle cx="50" cy="50" r="41" fill="#050505" stroke="#1a1a1a" strokeWidth="1" />
        
        {/* Eyes - Glowing White */}
        <path d={eyes.left} fill="none" stroke="#ffffff" strokeWidth={eyes.thickness} strokeLinecap="round" className="transition-all duration-500 ease-in-out" />
        <path d={eyes.right} fill="none" stroke="#ffffff" strokeWidth={eyes.thickness} strokeLinecap="round" className="transition-all duration-500 ease-in-out" />
        
        {/* Simple Nose */}
        <path d="M 49 58 L 51 58 L 50 60 Z" fill="#fff" opacity="0.9" />
        
        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" className="transition-all duration-500 ease-in-out" />
        
        {/* Whiskers - Minimalist */}
        <g stroke="#222" strokeWidth="0.4">
          <line x1="28" y1="56" x2="15" y2="54" />
          <line x1="28" y1="60" x2="14" y2="60" />
          <line x1="72" y1="56" x2="85" y2="54" />
          <line x1="72" y1="60" x2="86" y2="60" />
        </g>
      </svg>
      
      {/* Background Glow */}
      <div className={`absolute inset-4 rounded-full blur-[60px] opacity-20 -z-10 transition-all duration-1000 ${
        mood === CatMood.ROASTING ? 'bg-white scale-125 opacity-30' :
        mood === CatMood.LAUGHING ? 'bg-zinc-400' : 'bg-zinc-800'
      }`}></div>
    </div>
  );
};

export default CatAvatar;
