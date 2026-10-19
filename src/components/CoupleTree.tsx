import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Sparkles, Heart } from 'lucide-react';
import { TreeState } from '../types';

interface CoupleTreeProps {
  tree: TreeState;
  onWaterTree: () => void;
  accentColor: string;
}

export const CoupleTree: React.FC<CoupleTreeProps> = ({ tree, onWaterTree, accentColor }) => {
  const [isWatering, setIsWatering] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  const handleWaterClick = () => {
    setIsWatering(true);
    const newHeart = { id: Date.now(), x: Math.random() * 60 - 30 };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setIsWatering(false);
    }, 800);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1500);

    onWaterTree();
  };

  // Determine foliage size and blossoming based on points
  const progressRatio = Math.min(1, Math.max(0, tree.points / tree.maxPoints));

  return (
    <div className="relative rounded-3xl p-5 bg-[#151728]/90 border border-[#262a4d] shadow-lg overflow-hidden backdrop-blur-sm">
      {/* Background soft aura */}
      <div 
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            OUR TREE 🌱
          </span>
          <span className="text-[11px] font-medium text-purple-400 px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-800/40">
            Lvl {tree.level}
          </span>
        </div>

        <button
          onClick={handleWaterClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
          title="Water and nourish your couple tree!"
        >
          <Droplet className={`w-3.5 h-3.5 ${isWatering ? 'animate-bounce text-emerald-300' : ''}`} />
          <span>Nourish</span>
        </button>
      </div>

      {/* Tree Illustration Area */}
      <div className="relative flex flex-col items-center justify-center my-4 min-h-[170px]">
        {/* Floating Heart / Droplet Particle */}
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.6 }}
              animate={{ opacity: 0, y: -70, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute z-20 pointer-events-none text-pink-400 flex items-center gap-1 text-xs font-bold"
            >
              <Heart className="w-4 h-4 fill-pink-500 text-pink-400" />
              <span>+Love</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Tree SVG */}
        <motion.div
          animate={{ scale: isWatering ? [1, 1.05, 1] : [1, 1.015, 1] }}
          transition={{ duration: isWatering ? 0.4 : 4, repeat: isWatering ? 0 : Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center"
        >
          <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="foliageGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="foliageGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ground shadow/soil */}
            <ellipse cx="70" cy="142" rx="42" ry="7" fill="#1e293b" opacity="0.6" />
            <ellipse cx="70" cy="140" rx="36" ry="5" fill="#3f2316" />

            {/* Tree Trunk */}
            <path
              d="M65 140 C65 110, 62 105, 60 90 C66 92, 74 92, 80 90 C78 105, 75 110, 75 140 Z"
              fill="url(#trunkGrad)"
            />

            {/* Cute carved couple heart on trunk */}
            <path
              d="M68 122 C67 120 65 120 65 122 C65 124 70 128 70 128 C70 128 75 124 75 122 C75 120 73 120 72 122 C71 123 69 123 68 122 Z"
              fill="#fb7185"
              opacity="0.85"
            />

            {/* Lower foliage layer */}
            <ellipse cx="70" cy="92" rx="44" ry="26" fill="url(#foliageGrad1)" />
            {/* Mid foliage */}
            <ellipse cx="70" cy="74" rx="38" ry="24" fill="url(#foliageGrad2)" />
            {/* Top crown */}
            <ellipse cx="70" cy="54" rx="28" ry="20" fill="#4ade80" />

            {/* Blossoms / Fruits representing shared goals */}
            <circle cx="50" cy="85" r="4.5" fill="#f43f5e" filter="url(#glow)" />
            <circle cx="90" cy="82" r="4" fill="#fb7185" filter="url(#glow)" />
            <circle cx="72" cy="62" r="5" fill="#f43f5e" filter="url(#glow)" />
            <circle cx="58" cy="50" r="3.5" fill="#fb7185" />
            <circle cx="82" cy="52" r="4.2" fill="#fda4af" />
            <circle cx="70" cy="88" r="4" fill="#f43f5e" />

            {/* Subtle couple initials badge above */}
            <g transform="translate(62, 42)">
              <circle cx="8" cy="8" r="8" fill="#fda4af" opacity="0.3" />
              <path d="M8 4 C6 2 4 4 4 6 C4 9 8 11 8 11 C8 11 12 9 12 6 C12 4 10 2 8 4 Z" fill="#f43f5e" />
            </g>
          </svg>
        </motion.div>

        {/* Tree growth state subtitle as in screenshot 2 */}
        <p className="text-sm font-medium text-slate-300 mt-2 flex items-center gap-1.5">
          <span>{tree.stageName}</span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        </p>

        {/* Growth Bar */}
        <div className="w-full max-w-[240px] mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>Growth Progress</span>
            <span className="text-emerald-400 font-semibold">{tree.points}/{tree.maxPoints} pts</span>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-1.5">
            Complete couple tasks & milestones to nourish your tree together
          </p>
        </div>
      </div>
    </div>
  );
};
