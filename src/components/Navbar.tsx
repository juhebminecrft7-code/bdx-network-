import React, { useState } from 'react';
import { ShoppingBag, Copy, Check, Gamepad2, Sparkles, HelpCircle, Settings } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  username: string;
  setUsername: (username: string) => void;
}

export default function Navbar({
  cartCount,
  onCartClick,
  activeSection,
  setActiveSection,
  username,
  setUsername
}: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const serverIP = 'play.bdxnetwork.net';

  const copyIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-950/90 border-b border-zinc-800">
      {/* Top Utility Bar: Server Stats & Quick Copy */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 text-zinc-300 py-1.5 px-4 text-xs font-mono border-b border-emerald-800/20">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-emerald-400">1,482</strong> players online
            </span>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden md:inline text-zinc-400">Server Version: <strong className="text-zinc-200">1.20.x - 1.21.x</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Server IP:</span>
            <button
              onClick={copyIP}
              className="flex items-center gap-1.5 bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-700/30 text-emerald-300 hover:text-emerald-200 px-2 py-0.5 rounded transition-colors"
              title="Click to copy IP"
              id="copy-ip-btn"
            >
              <span>{serverIP}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('all')}>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg shadow-lg shadow-amber-500/10 border border-amber-400/30">
                <Gamepad2 className="w-6 h-6 text-zinc-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                  BDX NETWORK <span className="text-amber-400 font-mono text-sm bg-amber-950/60 px-1.5 py-0.5 border border-amber-500/30 rounded">STORE</span>
                </h1>
                <p className="text-xxs text-zinc-500 font-mono uppercase tracking-wider">Minecraft Network</p>
              </div>
            </div>

            {/* Mobile Cart Trigger */}
            <div className="md:hidden">
              <button
                onClick={onCartClick}
                className="relative p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all"
                aria-label="Shopping Cart"
                id="mobile-cart-btn"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xxs font-bold text-white ring-2 ring-zinc-950 animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Minecraft IGN Entry - Critical for MC Stores */}
          <div className="flex-1 max-w-sm md:mx-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img
                  src={`https://mc-heads.net/avatar/${username || 'steve'}/32`}
                  alt="Player Skin Head"
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded"
                />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="Enter Minecraft Username"
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500/50 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                id="username-input"
              />
              {username && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xxs text-amber-500 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Nav Categories & Desktop Cart */}
          <div className="flex items-center justify-between md:justify-end gap-4 border-t border-zinc-900 pt-3 md:pt-0 md:border-0">
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeSection === 'all'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
                id="nav-tab-all"
              >
                All Shop
              </button>
              <button
                onClick={() => setActiveSection('ranks')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeSection === 'ranks'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
                id="nav-tab-ranks"
              >
                Server Ranks
              </button>
              <button
                onClick={() => setActiveSection('keys')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeSection === 'keys'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
                id="nav-tab-keys"
              >
                Crate Keys
              </button>
              <button
                onClick={() => setActiveSection('faq')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeSection === 'faq'
                    ? 'bg-zinc-900 text-zinc-200 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
                id="nav-tab-faq"
              >
                FAQ / Help
              </button>
              <button
                onClick={() => setActiveSection('wheel')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 border border-amber-500/10 ${
                  activeSection === 'wheel'
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-400 font-black shadow-lg shadow-amber-500/5'
                    : 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/[0.04]'
                }`}
                id="nav-tab-wheel"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                Lucky Wheel
              </button>
              <button
                onClick={() => setActiveSection('admin')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 border border-amber-500/10 ${
                  activeSection === 'admin'
                    ? 'bg-gradient-to-r from-red-500/20 to-amber-500/20 border-amber-500/50 text-amber-400 font-black shadow-lg shadow-amber-500/5'
                    : 'text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/[0.04]'
                }`}
                id="nav-tab-admin"
              >
                <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                Admin Panel
              </button>
            </nav>

            <button
              onClick={onCartClick}
              className="hidden md:flex relative items-center gap-2 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white border border-zinc-800 px-4 py-2 rounded-lg text-sm transition-all shadow-lg"
              id="desktop-cart-btn"
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xxs font-bold text-white ring-2 ring-zinc-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
