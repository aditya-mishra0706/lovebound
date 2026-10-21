import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TreeState } from '../types';
import { getTreeSpeciesInfo } from '../utils/storage';

interface CoupleTreeProps {
  tree: TreeState;
  accentColor: string;
}

export const CoupleTree: React.FC<CoupleTreeProps> = ({ tree, accentColor }) => {
  const speciesInfo = getTreeSpeciesInfo(tree.level);
  const isWithered = !!tree.isWithered;

  // Tree scale grows with every single level
  // Level 1: 0.85, Level 2: 0.88, Level 5: 0.97, Level 10: 1.12, Level 20+: 1.35
  const baseScale = Math.min(1.4, 0.82 + tree.level * 0.028);
  const progressRatio = Math.min(1, Math.max(0, tree.points / (tree.maxPoints || 80)));

  // Determine tree tier (changes every 5 levels)
  // Lvl 1-4: Tier 1 (Sprout Bonsai)
  // Lvl 5-9: Tier 2 (Enchanted Sakura)
  // Lvl 10-14: Tier 3 (Golden Willow)
  // Lvl 15-19: Tier 4 (Celestial Wisteria)
  // Lvl 20+: Tier 5 (Cosmic Heart Tree)
  const tierNumber = Math.min(5, Math.floor((tree.level - 1) / 5) + 1);

  return (
    <div className="relative rounded-3xl p-5 theme-card border theme-border overflow-hidden transition-all duration-300">
      {/* Background ambient glow based on species tier */}
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: isWithered
            ? '#78350f'
            : tierNumber === 1
            ? '#10b981'
            : tierNumber === 2
            ? '#f43f5e'
            : tierNumber === 3
            ? '#f59e0b'
            : tierNumber === 4
            ? '#8b5cf6'
            : '#ec4899',
        }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider theme-text-muted uppercase">
            COUPLE LOVE TREE
          </span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              isWithered
                ? 'bg-amber-950/40 text-amber-400 border-amber-600/40'
                : 'bg-purple-950/40 text-purple-300 border-purple-800/40'
            }`}
          >
            Lvl {tree.level}
          </span>
        </div>

        {/* Species Tier Badge */}
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            tierNumber === 1
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40'
              : tierNumber === 2
              ? 'bg-pink-950/40 text-pink-300 border-pink-700/40'
              : tierNumber === 3
              ? 'bg-amber-950/40 text-amber-300 border-amber-700/40'
              : tierNumber === 4
              ? 'bg-purple-950/40 text-purple-300 border-purple-700/40'
              : 'bg-rose-950/40 text-rose-300 border-rose-700/40 animate-pulse'
          }`}
        >
          {speciesInfo.tier}
        </span>
      </div>

      {/* Withered Notice if missed a task yesterday */}
      {isWithered && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Tree Withered (-2 Lvl):</strong> A task was missed yesterday. Complete today's tasks together to revive it!
          </span>
        </motion.div>
      )}

      {/* Tree Visual Canvas */}
      <div className="relative flex flex-col items-center justify-center my-2 min-h-[190px]">
        <motion.div
          animate={{
            scale: isWithered ? baseScale * 0.95 : [baseScale, baseScale * 1.02, baseScale],
            rotate: isWithered ? [0, -1, 1, 0] : [0, 0.5, -0.5, 0],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center origin-bottom"
        >
          <svg
            width="170"
            height="180"
            viewBox="0 0 170 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            <defs>
              {/* Common Trunk */}
              <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isWithered ? '#52341d' : '#78350f'} />
                <stop offset="100%" stopColor={isWithered ? '#382314' : '#451a03'} />
              </linearGradient>

              {/* Tier 1: Bonsai Emerald */}
              <linearGradient id="bonsaiFoliage" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isWithered ? '#71717a' : '#34d399'} />
                <stop offset="100%" stopColor={isWithered ? '#52525b' : '#059669'} />
              </linearGradient>

              {/* Tier 2: Sakura Pink */}
              <linearGradient id="sakuraFoliage" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isWithered ? '#78716c' : '#f472b6'} />
                <stop offset="100%" stopColor={isWithered ? '#57534e' : '#db2777'} />
              </linearGradient>

              {/* Tier 3: Golden Sun Willow */}
              <linearGradient id="goldenFoliage" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isWithered ? '#78716c' : '#fde047'} />
                <stop offset="100%" stopColor={isWithered ? '#57534e' : '#d97706'} />
              </linearGradient>

              {/* Tier 4: Celestial Wisteria */}
              <linearGradient id="wisteriaFoliage" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isWithered ? '#71717a' : '#c084fc'} />
                <stop offset="100%" stopColor={isWithered ? '#52525b' : '#7c3aed'} />
              </linearGradient>

              {/* Tier 5: Cosmic Heart Tree */}
              <linearGradient id="cosmicFoliage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isWithered ? '#71717a' : '#fb7185'} />
                <stop offset="50%" stopColor={isWithered ? '#52525b' : '#f43f5e'} />
                <stop offset="100%" stopColor={isWithered ? '#3f3f46' : '#9333ea'} />
              </linearGradient>
            </defs>

            {/* Soil / Planter Base */}
            <ellipse cx="85" cy="170" rx="46" ry="8" fill="#1e293b" opacity="0.6" />
            <ellipse cx="85" cy="168" rx="40" ry="6" fill="#3f2316" />

            {/* Tree Trunk with Level Marks */}
            <path
              d="M78 168 C80 135, 74 125, 72 105 C80 108, 90 108, 98 105 C96 125, 90 135, 92 168 Z"
              fill="url(#trunkGrad)"
            />

            {/* Heart Carving on Trunk */}
            <path
              d="M82 145 C80 142 77 142 77 145 C77 148 85 153 85 153 C85 153 93 148 93 145 C93 142 90 142 88 145 C87 146 83 146 82 145 Z"
              fill={isWithered ? '#71717a' : '#fb7185'}
              opacity="0.9"
            />

            {/* --- SPECIES SPECIFIC RENDERING (Changes every 5 levels) --- */}
            {tierNumber === 1 && (
              /* Tier 1: Bonsai Sprout */
              <g>
                <ellipse cx="85" cy="108" rx="42" ry="24" fill="url(#bonsaiFoliage)" />
                <ellipse cx="85" cy="88" rx="35" ry="20" fill="url(#bonsaiFoliage)" />
                <ellipse cx="85" cy="70" rx="26" ry="16" fill="url(#bonsaiFoliage)" />
                <circle cx="68" cy="100" r="3.5" fill="#f43f5e" />
                <circle cx="102" cy="98" r="3.5" fill="#f43f5e" />
                <circle cx="85" cy="78" r="4" fill="#fb7185" />
              </g>
            )}

            {tierNumber === 2 && (
              /* Tier 2: Enchanted Sakura */
              <g>
                <ellipse cx="85" cy="105" rx="52" ry="28" fill="url(#sakuraFoliage)" />
                <ellipse cx="85" cy="82" rx="44" ry="25" fill="url(#sakuraFoliage)" />
                <ellipse cx="85" cy="62" rx="32" ry="20" fill="#f472b6" />
                {/* Fluttering Cherry Blossom Petals */}
                <circle cx="60" cy="95" r="4.5" fill="#fff" opacity="0.9" />
                <circle cx="110" cy="90" r="4.5" fill="#fff" opacity="0.9" />
                <circle cx="75" cy="72" r="5" fill="#fbcfe8" />
                <circle cx="95" cy="74" r="5" fill="#fbcfe8" />
                <circle cx="85" cy="52" r="4" fill="#fff" />
              </g>
            )}

            {tierNumber === 3 && (
              /* Tier 3: Golden Sun Willow */
              <g>
                <ellipse cx="85" cy="100" rx="56" ry="28" fill="url(#goldenFoliage)" />
                <ellipse cx="85" cy="78" rx="46" ry="24" fill="url(#goldenFoliage)" />
                <ellipse cx="85" cy="58" rx="34" ry="18" fill="#fde047" />
                {/* Weeping Willow Tendrils */}
                <path d="M50 105 Q45 130 52 145" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M65 110 Q60 135 68 150" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <path d="M120 105 Q125 130 118 145" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M105 110 Q110 135 102 150" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <circle cx="85" cy="68" r="4.5" fill="#fff" />
              </g>
            )}

            {tierNumber === 4 && (
              /* Tier 4: Celestial Twilight Wisteria */
              <g>
                <ellipse cx="85" cy="96" rx="58" ry="28" fill="url(#wisteriaFoliage)" />
                <ellipse cx="85" cy="74" rx="48" ry="24" fill="url(#wisteriaFoliage)" />
                <ellipse cx="85" cy="54" rx="36" ry="18" fill="#e9d5ff" />
                {/* Hanging Wisteria Clusters */}
                <ellipse cx="55" cy="120" rx="6" ry="14" fill="#c084fc" />
                <ellipse cx="70" cy="125" rx="7" ry="16" fill="#a855f7" />
                <ellipse cx="100" cy="125" rx="7" ry="16" fill="#a855f7" />
                <ellipse cx="115" cy="120" rx="6" ry="14" fill="#c084fc" />
                <circle cx="85" cy="65" r="5" fill="#fff" opacity="0.95" />
              </g>
            )}

            {tierNumber === 5 && (
              /* Tier 5: Cosmic Heart Tree of Life */
              <g>
                {/* Outer Celestial Ring */}
                <ellipse cx="85" cy="85" rx="70" ry="22" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                {/* Heart Shaped Canopy */}
                <path
                  d="M85 45 C70 15, 30 25, 45 75 C55 110, 85 130, 85 130 C85 130, 115 110, 125 75 C140 25, 100 15, 85 45 Z"
                  fill="url(#cosmicFoliage)"
                />
                <circle cx="85" cy="70" r="10" fill="#fff" opacity="0.8" />
                <path
                  d="M85 64 C82 60 77 60 77 64 C77 69 85 75 85 75 C85 75 93 69 93 64 C93 60 88 60 85 64 Z"
                  fill="#f43f5e"
                />
              </g>
            )}
          </svg>
        </motion.div>

        {/* Tree Name & Species Display */}
        <div className="text-center mt-2">
          <h4 className="text-sm font-extrabold theme-text flex items-center justify-center gap-1.5">
            <span>{speciesInfo.species}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </h4>
          <p className="text-[11px] theme-text-muted mt-0.5">
            Every 5 levels transforms into a rarer species • Grows with each level
          </p>
        </div>

        {/* Growth Bar (Grows as partners complete tasks) */}
        <div className="w-full max-w-[260px] mt-3">
          <div className="flex justify-between text-[11px] theme-text-muted font-semibold mb-1">
            <span>Task Growth Progress</span>
            <span className="text-emerald-500 font-bold">
              {tree.points}/{tree.maxPoints || 80} pts
            </span>
          </div>

          <div className="h-2 w-full theme-card-subtle rounded-full overflow-hidden p-0.5 border theme-border">
            <motion.div
              className={`h-full rounded-full ${
                isWithered
                  ? 'bg-amber-600'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-pink-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <p className="text-[10px] text-center theme-text-muted mt-1.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Points awarded automatically when you or your partner complete tasks</span>
          </p>
        </div>
      </div>
    </div>
  );
};
