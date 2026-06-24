import React, { useState } from 'react';
import { RANKS } from '../data';
import { HelpCircle, Check, X, ArrowRightLeft, Sparkles } from 'lucide-react';

export default function PerkExplorer() {
  const [rankAId, setRankAId] = useState('rank-vip');
  const [rankBId, setRankBId] = useState('rank-apex');

  const rankA = RANKS.find(r => r.id === rankAId) || RANKS[0];
  const rankB = RANKS.find(r => r.id === rankBId) || RANKS[14];

  // List of all conceivable server privileges to check
  const perkChecks = [
    { label: 'Set multiple homes', a: rankA.powers.join(', '), b: rankB.powers.join(', ') },
    { label: 'Portable Crafting Table', a: rankAId !== '', b: rankBId !== '' }, // VIP+ has /craft
    { label: '/hat Cosmetic command', a: rankAId !== '', b: rankBId !== '' },
    { label: '/feed (Keep hunger full)', a: rankA.powers.some(p => p.toLowerCase().includes('feed')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('feed')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: '/ec (Virtual Ender Chest)', a: rankA.powers.some(p => p.toLowerCase().includes('ec')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('ec')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Enchanted Starter Kit', a: rankA.powers.some(p => p.toLowerCase().includes('starter kit')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('starter kit')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Colored Chat (&a, &b, etc.)', a: rankA.powers.some(p => p.toLowerCase().includes('colored chat')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('colored chat')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Portable Anvil (/anvil)', a: rankA.powers.some(p => p.toLowerCase().includes('anvil')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('anvil')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Free Item Repair (/repair)', a: rankA.powers.some(p => p.toLowerCase().includes('repair')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('repair')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Custom Join Announcements', a: rankA.powers.some(p => p.toLowerCase().includes('join')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('join')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Fly Mode (/fly)', a: rankA.powers.some(p => p.toLowerCase().includes('fly')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('fly')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Weekly Free Mythic Keys', a: rankA.powers.some(p => p.toLowerCase().includes('mythic key')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('mythic key')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Pets, Cosmetics & Trails', a: rankA.powers.some(p => p.toLowerCase().includes('pets')) || rankA.powers.some(p => p.toLowerCase().includes('cosmetics')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('pets')) || rankB.powers.some(p => p.toLowerCase().includes('cosmetics')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Instant Healing Command (/heal)', a: rankA.powers.some(p => p.toLowerCase().includes('heal')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('heal')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) },
    { label: 'Apex monthly keys', a: rankA.powers.some(p => p.toLowerCase().includes('apex key')) || rankA.powers.some(p => p.toLowerCase().includes('all perks')), b: rankB.powers.some(p => p.toLowerCase().includes('apex key')) || rankB.powers.some(p => p.toLowerCase().includes('all perks')) }
  ];

  return (
    <div className="bg-zinc-950/40 rounded-2xl border border-zinc-850 p-6 space-y-6 shadow-xl max-w-4xl mx-auto" id="perk-explorer-container">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-500" />
            Interactive Rank Perk Explorer
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Select any two donor ranks side-by-side to evaluate their lifetime in-game features.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xxs bg-amber-950/50 text-amber-400 border border-amber-800/30 px-2.5 py-1 rounded-full font-mono uppercase">
          <Sparkles className="w-3 h-3" /> Compare Tiers
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="compare-rank-a" className="text-xxs font-mono uppercase text-zinc-500 block mb-1.5">First Rank</label>
          <select
            id="compare-rank-a"
            value={rankAId}
            onChange={(e) => setRankAId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            {RANKS.map(r => (
              <option key={r.id} value={r.id}>{r.name} — ৳{r.price}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="compare-rank-b" className="text-xxs font-mono uppercase text-zinc-500 block mb-1.5">Second Rank</label>
          <select
            id="compare-rank-b"
            value={rankBId}
            onChange={(e) => setRankBId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            {RANKS.map(r => (
              <option key={r.id} value={r.id}>{r.name} — ৳{r.price}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-850 overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-12 bg-zinc-950 p-3 text-xxs font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-850">
          <div className="col-span-6">Benefit Category</div>
          <div className="col-span-3 text-center truncate">{rankA.name}</div>
          <div className="col-span-3 text-center truncate">{rankB.name}</div>
        </div>

        {/* Pricing Row */}
        <div className="grid grid-cols-12 p-3 text-xs border-b border-zinc-900 bg-zinc-900/10">
          <div className="col-span-6 font-semibold text-zinc-300">Lifetime Store Price</div>
          <div className="col-span-3 text-center font-bold text-emerald-400 font-mono">৳{rankA.price}</div>
          <div className="col-span-3 text-center font-bold text-emerald-400 font-mono">৳{rankB.price}</div>
        </div>

        {/* Perks Loop */}
        <div className="divide-y divide-zinc-900">
          {perkChecks.map((perk, idx) => {
            // Evaluated values
            const hasA = perk.a;
            const hasB = perk.b;

            return (
              <div key={idx} className="grid grid-cols-12 p-3 text-xs hover:bg-zinc-900/20 transition-colors">
                <div className="col-span-6 text-zinc-400 font-medium flex items-center">{perk.label}</div>
                <div className="col-span-3 flex justify-center items-center">
                  {typeof hasA === 'string' ? (
                    <span className="text-3xs text-zinc-300 font-mono text-center truncate max-w-xs px-1" title={hasA}>
                      {hasA.split(', ').slice(0, 2).join(', ')}{hasA.split(', ').length > 2 ? '...' : ''}
                    </span>
                  ) : hasA ? (
                    <Check className="w-4 h-4 text-emerald-400 bg-emerald-950/50 p-0.5 rounded border border-emerald-900/30" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>
                <div className="col-span-3 flex justify-center items-center">
                  {typeof hasB === 'string' ? (
                    <span className="text-3xs text-zinc-300 font-mono text-center truncate max-w-xs px-1" title={hasB}>
                      {hasB.split(', ').slice(0, 2).join(', ')}{hasB.split(', ').length > 2 ? '...' : ''}
                    </span>
                  ) : hasB ? (
                    <Check className="w-4 h-4 text-emerald-400 bg-emerald-950/50 p-0.5 rounded border border-emerald-900/30" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] text-zinc-500 font-mono">
        💡 Upgrading from {rankA.name} to {rankB.name}? Pay only the ৳{Math.max(0, rankB.price - rankA.price)} price difference in-game!
      </div>

    </div>
  );
}
