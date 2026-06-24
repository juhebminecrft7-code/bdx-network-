import React, { useState } from 'react';
import { CrateKey } from '../types';
import { Minus, Plus, ShoppingCart, HelpCircle } from 'lucide-react';

interface CrateKeyCardProps {
  key?: React.Key;
  crateKey: CrateKey;
  onAddToCart: (crateKey: CrateKey, qty: number) => void;
  onInstantBuy: (crateKey: CrateKey, qty: number) => void;
  minecraftUsername: string;
}

export default function CrateKeyCard({
  crateKey,
  onAddToCart,
  onInstantBuy,
  minecraftUsername
}: CrateKeyCardProps) {
  const [quantity, setQuantity] = useState(1);

  const colorMap: Record<string, {
    bg: string;
    border: string;
    badge: string;
    glow: string;
    text: string;
  }> = {
    emerald: {
      bg: 'bg-emerald-950/15 hover:bg-emerald-950/25',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      badge: 'bg-emerald-900/40 border-emerald-500/20 text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      text: 'text-emerald-400'
    },
    blue: {
      bg: 'bg-blue-950/15 hover:bg-blue-950/25',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      badge: 'bg-blue-900/40 border-blue-500/20 text-blue-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      text: 'text-blue-400'
    },
    purple: {
      bg: 'bg-purple-950/15 hover:bg-purple-950/25',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      badge: 'bg-purple-900/40 border-purple-500/20 text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      text: 'text-purple-400'
    },
    amber: {
      bg: 'bg-amber-950/15 hover:bg-amber-950/25',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      badge: 'bg-amber-900/40 border-amber-500/20 text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      text: 'text-amber-400'
    },
    rose: {
      bg: 'bg-rose-950/15 hover:bg-rose-950/25',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      badge: 'bg-rose-900/40 border-rose-500/20 text-rose-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]',
      text: 'text-rose-400'
    },
    red: {
      bg: 'bg-red-950/20 hover:bg-red-950/30',
      border: 'border-red-500/30 hover:border-red-500/50',
      badge: 'bg-red-900/40 border-red-500/20 text-red-400',
      glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]',
      text: 'text-red-400 font-bold'
    }
  };

  const style = colorMap[crateKey.color] || colorMap.blue;
  const isFree = crateKey.price === 0;

  const handleIncrement = () => setQuantity(prev => Math.min(prev + 1, 64));
  const handleDecrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleAddToCartClick = () => {
    onAddToCart(crateKey, quantity);
    setQuantity(1); // Reset counter on add
  };

  const handleInstantBuyClick = () => {
    onInstantBuy(crateKey, quantity);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111115] to-[#0b0b0d] p-6 transition-all duration-500 hover:-translate-y-1 ${
        style.border
      } ${style.glow}`}
      id={`crate-key-card-${crateKey.id}`}
    >
      <div>
        {/* Top bar with Icon representation */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="text-4xl bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 group-hover:scale-110 transition-transform duration-300">
              {crateKey.icon}
            </div>
            <div>
              <h4 className="font-black text-white text-base font-display uppercase tracking-tight flex items-center gap-1.5">
                {crateKey.name}
              </h4>
              <span className={`inline-block text-xxs px-2.5 py-0.5 rounded-full border mt-1 font-mono font-bold tracking-wider ${style.badge}`}>
                {isFree ? 'FREE IN-GAME' : 'CRATE KEY'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 mt-4 leading-relaxed min-h-[48px]">
          {crateKey.description}
        </p>

        {/* Price display */}
        <div className="mt-4 pt-4 border-t border-zinc-850 flex justify-between items-baseline">
          <span className="text-zinc-500 text-xxs font-mono uppercase tracking-widest">Unit Price</span>
          <span className="text-xl font-black text-white font-mono tracking-tight">
            {isFree ? (
              <span className="text-emerald-400 text-sm font-sans font-bold">{crateKey.priceText}</span>
            ) : (
              `৳${crateKey.price}`
            )}
          </span>
        </div>
      </div>

      {/* Selector & Actions */}
      <div className="mt-6 pt-4 border-t border-zinc-850 space-y-3">
        {isFree ? (
          <div className="text-center py-2.5 bg-zinc-950/50 border border-zinc-900 rounded-xl">
            <a
              href="https://minecraft-mp.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center justify-center gap-1.5"
            >
              🚀 Click to Vote on Servers
            </a>
          </div>
        ) : (
          <>
            {/* Quantity adjustment row */}
            <div className="flex items-center justify-between bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900">
              <span className="text-xxs text-zinc-500 font-mono pl-2 uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-1 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-850 hover:border-zinc-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-white font-mono w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-1 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-850 hover:border-zinc-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Buying Action Button pair */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="w-full bg-[#16161c] hover:bg-[#1d1d26] text-zinc-300 text-xs font-semibold py-2.5 px-2.5 rounded-lg border border-white/5 hover:border-white/10 flex items-center justify-center gap-1.5 active:scale-98 transition-all duration-200"
                id={`key-add-cart-${crateKey.id}`}
              >
                <ShoppingCart className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400" />
                Add
              </button>
              <button
                type="button"
                onClick={handleInstantBuyClick}
                className={`w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 font-black text-xs py-2.5 px-2.5 rounded-lg active:scale-98 transition-all duration-200 shadow-sm hover:brightness-110`}
                id={`key-buy-now-${crateKey.id}`}
              >
                Buy Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
