import React from 'react';
import { Rank } from '../types';
import { Check, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

interface RankCardProps {
  key?: React.Key;
  rank: Rank;
  onAddToCart: (rank: Rank) => void;
  onInstantBuy: (rank: Rank) => void;
  minecraftUsername: string;
}

export default function RankCard({
  rank,
  onAddToCart,
  onInstantBuy,
  minecraftUsername
}: RankCardProps) {
  // Map color names to concrete Tailwind classes
  const colorMap: Record<string, {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
    headerBg: string;
  }> = {
    emerald: {
      bg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-900/40 border-emerald-500/20 text-emerald-400',
      badgeText: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      headerBg: 'from-emerald-500/10 to-transparent'
    },
    teal: {
      bg: 'bg-teal-950/20 hover:bg-teal-950/30',
      border: 'border-teal-500/30 hover:border-teal-500/50',
      text: 'text-teal-400',
      badgeBg: 'bg-teal-900/40 border-teal-500/20 text-teal-400',
      badgeText: 'text-teal-400',
      glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]',
      headerBg: 'from-teal-500/10 to-transparent'
    },
    cyan: {
      bg: 'bg-cyan-950/20 hover:bg-cyan-950/30',
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      text: 'text-cyan-400',
      badgeBg: 'bg-cyan-900/40 border-cyan-500/20 text-cyan-400',
      badgeText: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      headerBg: 'from-cyan-500/10 to-transparent'
    },
    sky: {
      bg: 'bg-sky-950/20 hover:bg-sky-950/30',
      border: 'border-sky-500/30 hover:border-sky-500/50',
      text: 'text-sky-400',
      badgeBg: 'bg-sky-900/40 border-sky-500/20 text-sky-400',
      badgeText: 'text-sky-400',
      glow: 'shadow-[0_0_15px_rgba(14,165,233,0.15)]',
      headerBg: 'from-sky-500/10 to-transparent'
    },
    blue: {
      bg: 'bg-blue-950/20 hover:bg-blue-950/30',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      text: 'text-blue-400',
      badgeBg: 'bg-blue-900/40 border-blue-500/20 text-blue-400',
      badgeText: 'text-blue-400',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      headerBg: 'from-blue-500/10 to-transparent'
    },
    indigo: {
      bg: 'bg-indigo-950/20 hover:bg-indigo-950/30',
      border: 'border-indigo-500/30 hover:border-indigo-500/50',
      text: 'text-indigo-400',
      badgeBg: 'bg-indigo-900/40 border-indigo-500/20 text-indigo-400',
      badgeText: 'text-indigo-400',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
      headerBg: 'from-indigo-500/10 to-transparent'
    },
    violet: {
      bg: 'bg-violet-950/20 hover:bg-violet-950/30',
      border: 'border-violet-500/30 hover:border-violet-500/50',
      text: 'text-violet-400',
      badgeBg: 'bg-violet-900/40 border-violet-500/20 text-violet-400',
      badgeText: 'text-violet-400',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
      headerBg: 'from-violet-500/15 to-transparent'
    },
    fuchsia: {
      bg: 'bg-fuchsia-950/20 hover:bg-fuchsia-950/30',
      border: 'border-fuchsia-500/30 hover:border-fuchsia-500/50',
      text: 'text-fuchsia-400',
      badgeBg: 'bg-fuchsia-900/40 border-fuchsia-500/20 text-fuchsia-400',
      badgeText: 'text-fuchsia-400',
      glow: 'shadow-[0_0_20px_rgba(217,70,239,0.2)]',
      headerBg: 'from-fuchsia-500/15 to-transparent'
    },
    pink: {
      bg: 'bg-pink-950/20 hover:bg-pink-950/30',
      border: 'border-pink-500/30 hover:border-pink-500/50',
      text: 'text-pink-400',
      badgeBg: 'bg-pink-900/40 border-pink-500/20 text-pink-400',
      badgeText: 'text-pink-400',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
      headerBg: 'from-pink-500/15 to-transparent'
    },
    rose: {
      bg: 'bg-rose-950/25 hover:bg-rose-950/35',
      border: 'border-rose-500/40 hover:border-rose-500/60',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-900/40 border-rose-500/20 text-rose-400',
      badgeText: 'text-rose-400',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      headerBg: 'from-rose-500/20 to-transparent'
    },
    orange: {
      bg: 'bg-orange-950/25 hover:bg-orange-950/35',
      border: 'border-orange-500/40 hover:border-orange-500/60',
      text: 'text-orange-400',
      badgeBg: 'bg-orange-900/40 border-orange-500/20 text-orange-400',
      badgeText: 'text-orange-400',
      glow: 'shadow-[0_0_25px_rgba(249,115,22,0.25)]',
      headerBg: 'from-orange-500/20 to-transparent'
    },
    amber: {
      bg: 'bg-amber-950/25 hover:bg-amber-950/35',
      border: 'border-amber-500/40 hover:border-amber-500/60',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-900/40 border-amber-500/20 text-amber-400',
      badgeText: 'text-amber-400',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      headerBg: 'from-amber-500/20 to-transparent'
    },
    yellow: {
      bg: 'bg-yellow-950/25 hover:bg-yellow-950/35',
      border: 'border-yellow-500/40 hover:border-yellow-500/60',
      text: 'text-yellow-400',
      badgeBg: 'bg-yellow-900/40 border-yellow-500/20 text-yellow-400',
      badgeText: 'text-yellow-400',
      glow: 'shadow-[0_0_25px_rgba(234,179,8,0.3)]',
      headerBg: 'from-yellow-500/20 to-transparent'
    },
    purple: {
      bg: 'bg-purple-950/30 hover:bg-purple-950/40',
      border: 'border-purple-500/50 hover:border-purple-500/70',
      text: 'text-purple-400',
      badgeBg: 'bg-purple-900/50 border-purple-500/20 text-purple-400',
      badgeText: 'text-purple-400',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.35)]',
      headerBg: 'from-purple-500/25 to-transparent'
    },
    red: {
      bg: 'bg-red-950/40 hover:bg-red-950/50',
      border: 'border-red-500/60 hover:border-red-500/85',
      text: 'text-red-400',
      badgeBg: 'bg-red-900/60 border-red-500/30 text-red-400',
      badgeText: 'text-red-400',
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.45)]',
      headerBg: 'from-red-500/30 to-transparent'
    }
  };

  const currentStyle = colorMap[rank.color] || colorMap.indigo;
  const isPremium = ['Mythic', 'Celestial', 'Divine', 'Immortal', 'Omega', 'Apex 👑'].some(n => rank.name.includes(n));

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111115] to-[#0b0b0d] p-6 transition-all duration-500 hover:-translate-y-1.5 group ${
        currentStyle.border
      } ${isPremium ? currentStyle.glow : 'shadow-xl shadow-black/60 hover:shadow-black/90'}`}
      id={`rank-card-${rank.id}`}
    >
      {/* Visual Header Decoration */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${currentStyle.headerBg} pointer-events-none`} />

      <div>
        {/* Badges / Tier indicators */}
        <div className="flex items-center justify-between mb-4">
          {rank.badge ? (
            <span className={`inline-flex items-center gap-1 text-2xs font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${currentStyle.badgeBg}`}>
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              {rank.badge}
            </span>
          ) : isPremium ? (
            <span className="inline-flex items-center gap-1 text-2xs font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border bg-zinc-900 border-zinc-800 text-amber-400">
              <Trophy className="w-2.5 h-2.5" />
              Elite perk
            </span>
          ) : (
            <span className="text-xxs text-zinc-500 font-mono tracking-wider">LIFETIME ACCESS</span>
          )}

          {isPremium && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </div>

        {/* Title & Price */}
        <div className="mb-4">
          <h3 className={`text-2xl font-black tracking-tight flex items-center gap-2 font-display uppercase ${currentStyle.text}`}>
            {rank.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 min-h-[32px] line-clamp-2 leading-relaxed">{rank.description}</p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono tracking-tight">৳{rank.price.toLocaleString()}</span>
            <span className="text-zinc-500 text-xxs uppercase font-bold tracking-widest font-mono">ONE-TIME</span>
          </div>
        </div>

        {/* Powers & Perks list */}
        <div className="mt-6 space-y-2.5 border-t border-zinc-850 pt-4">
          <p className="text-xxs font-mono uppercase tracking-widest text-zinc-500">Main Powers</p>
          <ul className="space-y-2.5">
            {rank.powers.map((power, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className={`p-0.5 rounded bg-zinc-900/80 mt-0.5 flex-shrink-0 border border-white/5 ${currentStyle.text}`}>
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium leading-normal">{power}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-4 border-t border-zinc-850/80 space-y-2.5">
        {!minecraftUsername && (
          <p className="text-[10px] text-zinc-500 text-center font-mono flex items-center justify-center gap-1 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Enter username to purchase
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onAddToCart(rank)}
            className="w-full bg-[#16161c] hover:bg-[#1d1d26] text-zinc-300 border border-white/5 hover:border-white/10 text-xs font-semibold py-2.5 px-3 rounded-lg transition-all active:scale-98"
            id={`add-to-cart-${rank.id}`}
          >
            Add to Cart
          </button>
          
          <button
            onClick={() => onInstantBuy(rank)}
            className={`w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 font-black text-xs py-2.5 px-3 rounded-lg transition-all active:scale-98 shadow-md shadow-amber-500/10 hover:brightness-110`}
            id={`instant-buy-${rank.id}`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
