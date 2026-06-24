import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RankCard from './components/RankCard';
import CrateKeyCard from './components/CrateKeyCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PerkExplorer from './components/PerkExplorer';
import AdminPanel from './components/AdminPanel';
import LuckyWheel from './components/LuckyWheel';
import { RANKS, CRATE_KEYS, FAQS, RECENT_PURCHASES, COUPONS } from './data';
import { Rank, CrateKey, CartItem, Coupon, Order } from './types';
import { Sparkles, HelpCircle, AlertCircle, ShoppingBag, ArrowRight, ShieldCheck, Tag, Gamepad2, Check, Layers, Star, Settings } from 'lucide-react';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

export default function App() {
  // 1. Dynamic States (Editable via Admin Panel)
  const [ranks, setRanks] = useState<Rank[]>(RANKS);
  const [crateKeys, setCrateKeys] = useState<CrateKey[]>(CRATE_KEYS);
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('apex_mc_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time Firestore synchronization with bootstrap seeds
  useEffect(() => {
    let unsubRanks = () => {};
    let unsubKeys = () => {};
    let unsubCoupons = () => {};
    let unsubOrders = () => {};

    try {
      // Sync Ranks
      const ranksRef = collection(db, 'ranks');
      unsubRanks = onSnapshot(ranksRef, (snapshot) => {
        if (snapshot.empty) {
          // Seed initial ranks
          RANKS.forEach(async (rank) => {
            try {
              await setDoc(doc(db, 'ranks', rank.id), rank);
            } catch (err) {
              console.error('Failed to seed rank:', rank.id, err);
            }
          });
        } else {
          const loadedRanks: Rank[] = [];
          snapshot.forEach((doc) => {
            loadedRanks.push(doc.data() as Rank);
          });
          // Preserve proper sorting rank orders by listing price
          loadedRanks.sort((a, b) => a.price - b.price);
          setRanks(loadedRanks);
        }
      }, (err) => {
        console.warn('Ranks subscription failed. Fallback to offline defaults.', err);
      });

      // Sync Crate Keys
      const keysRef = collection(db, 'crate_keys');
      unsubKeys = onSnapshot(keysRef, (snapshot) => {
        if (snapshot.empty) {
          // Seed initial crate keys
          CRATE_KEYS.forEach(async (key) => {
            try {
              await setDoc(doc(db, 'crate_keys', key.id), key);
            } catch (err) {
              console.error('Failed to seed key:', key.id, err);
            }
          });
        } else {
          const loadedKeys: CrateKey[] = [];
          snapshot.forEach((doc) => {
            loadedKeys.push(doc.data() as CrateKey);
          });
          loadedKeys.sort((a, b) => a.price - b.price);
          setCrateKeys(loadedKeys);
        }
      }, (err) => {
        console.warn('Keys subscription failed. Fallback to offline defaults.', err);
      });

      // Sync Coupons
      const couponsRef = collection(db, 'coupons');
      unsubCoupons = onSnapshot(couponsRef, (snapshot) => {
        if (snapshot.empty) {
          COUPONS.forEach(async (coupon) => {
            try {
              await setDoc(doc(db, 'coupons', coupon.code), coupon);
            } catch (err) {
              console.error('Failed to seed coupon:', coupon.code, err);
            }
          });
        } else {
          const loadedCoupons: Coupon[] = [];
          snapshot.forEach((doc) => {
            loadedCoupons.push(doc.data() as Coupon);
          });
          setCoupons(loadedCoupons);
        }
      }, (err) => {
        console.warn('Coupons subscription failed. Fallback to offline defaults.', err);
      });

      // Sync Orders
      const ordersRef = collection(db, 'orders');
      unsubOrders = onSnapshot(ordersRef, (snapshot) => {
        if (!snapshot.empty) {
          const loadedOrders: Order[] = [];
          snapshot.forEach((doc) => {
            loadedOrders.push(doc.data() as Order);
          });
          // Sort by id / timestamp descending
          loadedOrders.sort((a, b) => b.id.localeCompare(a.id));
          setOrders(loadedOrders);
        }
      }, (err) => {
        console.warn('Orders subscription failed. Fallback to offline defaults.', err);
      });

    } catch (e) {
      console.error('Firebase setup failed:', e);
    }

    return () => {
      unsubRanks();
      unsubKeys();
      unsubCoupons();
      unsubOrders();
    };
  }, []);

  // 2. Core Reactive States
  const [minecraftUsername, setMinecraftUsername] = useState<string>(() => {
    return localStorage.getItem('apex_mc_username') || '';
  });
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_mc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSection, setActiveSection] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCoupon, setCheckoutCoupon] = useState<Coupon | null>(null);

  // Search, filter and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'low' | 'high'>('default');

  // Interactive Perks state
  const [showPerkExplorer, setShowPerkExplorer] = useState(false);

  // Toast feedback states
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  // 2. Synced local storages
  useEffect(() => {
    localStorage.setItem('apex_mc_username', minecraftUsername);
  }, [minecraftUsername]);

  useEffect(() => {
    localStorage.setItem('apex_mc_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('apex_mc_orders', JSON.stringify(orders));
  }, [orders]);

  // Toast trigger
  const triggerToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // 3. Cart Action Handlers
  const handleAddRankToCart = (rank: Rank) => {
    setCartItems(prev => {
      // Check if rank already in cart
      const exists = prev.find(item => item.id === rank.id);
      if (exists) {
        triggerToast(`Already have ${rank.name} rank in cart!`);
        return prev;
      }
      
      // Remove any other Rank if present (since ranks do not stack, only 1 rank upgrade is needed usually)
      const filtered = prev.filter(item => item.type !== 'rank');
      if (filtered.length !== prev.length) {
        triggerToast(`Swapped previous rank for ${rank.name}!`);
      } else {
        triggerToast(`Added ${rank.name} Rank to cart!`);
      }

      return [...filtered, {
        id: rank.id,
        type: 'rank',
        name: `${rank.name} Rank`,
        price: rank.price,
        quantity: 1,
        color: rank.color
      }];
    });
  };

  const handleAddCrateKeyToCart = (crateKey: CrateKey, qty: number) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === crateKey.id);
      triggerToast(`Added ${qty}x ${crateKey.name} to cart!`);
      if (exists) {
        return prev.map(item =>
          item.id === crateKey.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, {
        id: crateKey.id,
        type: 'key',
        name: crateKey.name,
        price: crateKey.price,
        quantity: qty,
        color: crateKey.color,
        icon: crateKey.icon
      }];
    });
  };

  const handleInstantBuyRank = (rank: Rank) => {
    // Empty ranks from cart, add this rank, and trigger checkout modal directly
    setCartItems(prev => {
      const filtered = prev.filter(item => item.type !== 'rank');
      return [...filtered, {
        id: rank.id,
        type: 'rank',
        name: `${rank.name} Rank`,
        price: rank.price,
        quantity: 1,
        color: rank.color
      }];
    });
    setCheckoutCoupon(null);
    setIsCheckoutOpen(true);
  };

  const handleInstantBuyKey = (crateKey: CrateKey, qty: number) => {
    setCartItems(prev => {
      const filtered = prev.filter(item => item.id !== crateKey.id);
      return [...filtered, {
        id: crateKey.id,
        type: 'key',
        name: crateKey.name,
        price: crateKey.price,
        quantity: qty,
        color: crateKey.color,
        icon: crateKey.icon
      }];
    });
    setCheckoutCoupon(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        triggerToast(`Removed ${item.name} from cart.`);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleProceedToCheckout = (coupon: Coupon | null) => {
    if (!minecraftUsername) {
      triggerToast('Please enter your Minecraft Username first!');
      return;
    }
    setCheckoutCoupon(coupon);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // 4. Searching & Sorting computation
  const filteredRanks = ranks.filter(rank => {
    const matchesSearch = rank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rank.powers.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const sortedRanks = [...filteredRanks].sort((a, b) => {
    if (priceSort === 'low') return a.price - b.price;
    if (priceSort === 'high') return b.price - a.price;
    return 0; // Default rank power tier sorting (VIP to Apex)
  });

  const filteredKeys = crateKeys.filter(key => {
    return key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           key.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-radial-ambient text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      {/* 1. Header Navigation */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        activeSection={activeSection}
        setActiveSection={(sec) => {
          setActiveSection(sec);
          // Auto scroll to storefront
          const storeElement = document.getElementById('store-anchor');
          if (storeElement) {
            storeElement.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        username={minecraftUsername}
        setUsername={setMinecraftUsername}
      />

      {/* 2. Hero Header Showcase Section */}
      <section className="relative overflow-hidden bg-radial from-amber-500/[0.04] via-zinc-950 to-zinc-950 py-20 sm:py-28 border-b border-zinc-900/60">
        
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293704_1px,transparent_1px),linear-gradient(to_bottom,#1f293704_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Animated Promotion Banner */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 animate-pulse">
            <Tag className="w-3.5 h-3.5" />
            <span>Summer Sale: Use code <strong className="font-mono text-white">BDX25</strong> for <strong className="text-white">25% OFF</strong> all ranks!</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase font-sans">
            Power Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Minecraft Journey</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
            Unlock exclusive Commands, Lifetime Perks, and Premium Crate Keys instantly. Simply enter your game username, choose your items, and command the realms!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setActiveSection('ranks');
                document.getElementById('store-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-98"
            >
              Explore Donor Ranks
            </button>
            <button
              onClick={() => {
                setActiveSection('keys');
                document.getElementById('store-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all active:scale-98"
            >
              Crate Key Shop
            </button>
          </div>

          {/* Minecraft Username Quick Prompt warning if empty */}
          {!minecraftUsername && (
            <div className="mt-8 max-w-md mx-auto bg-zinc-900/60 p-3 rounded-xl border border-amber-500/20 text-xxs text-amber-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 animate-bounce" />
              <span>Please enter your Minecraft Username above before adding items to checkout!</span>
            </div>
          )}

        </div>
      </section>

      {/* 3. Live Broadcast Purchase Ticker */}
      <div className="bg-zinc-900/40 border-b border-zinc-900 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 text-xs">
          <span className="flex-shrink-0 text-xxs bg-emerald-950 text-emerald-400 border border-emerald-800/30 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
          </span>
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-8">
            {RECENT_PURCHASES.map((p, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 font-mono text-zinc-400">
                <span className="text-zinc-500 font-sans">•</span>
                <strong className="text-zinc-200">{p.username}</strong>
                <span className="text-zinc-500">bought</span>
                <span className="text-amber-400 font-sans font-bold">{p.item}</span>
                <span className="text-zinc-600">({p.time})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Main Store Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12" id="store-anchor">
        
        {/* Section header & search block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-zinc-900">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {activeSection === 'all' && 'ALL PRODUCTS'}
              {activeSection === 'ranks' && 'DONOR RANKS'}
              {activeSection === 'keys' && 'CRATE KEYS'}
              {activeSection === 'faq' && 'INFORMATION & SUPPORT'}
              {activeSection === 'wheel' && 'LUCKY SPIN WHEEL'}
              {activeSection === 'admin' && 'ADMIN PANEL CONTROLS'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
              {activeSection === 'all' && 'Browse the complete store package line-up'}
              {activeSection === 'ranks' && 'Lifetime Minecraft server perks'}
              {activeSection === 'keys' && 'Chances to win rare tools & rewards'}
              {activeSection === 'faq' && 'Frequently Asked Questions & server policies'}
              {activeSection === 'wheel' && 'Spin to win dynamic permanent ranks & crates'}
              {activeSection === 'admin' && 'Full backend servers and user orders ledger'}
            </p>
          </div>

          {/* Search, Filter & Comparison controllers */}
          {activeSection !== 'faq' && activeSection !== 'wheel' && activeSection !== 'admin' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Compare tool switch button */}
              <button
                onClick={() => setShowPerkExplorer(!showPerkExplorer)}
                className={`text-xs px-4 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all duration-300 ${
                  showPerkExplorer
                    ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/85 hover:bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
                }`}
                id="perk-explorer-toggle"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Rank Compare Tool</span>
              </button>

              {/* Search bar */}
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#111115]/80 hover:bg-[#111115] border border-zinc-850 rounded-xl text-xs px-3.5 py-2 w-48 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-white font-mono transition-all duration-200"
                id="catalog-search"
              />

              {/* Price Sort (Only relevant to ranks) */}
              {activeSection === 'ranks' && (
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  className="bg-[#111115]/80 hover:bg-[#111115] border border-zinc-850 rounded-xl text-xs px-3 py-2 text-zinc-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                  id="catalog-sort"
                >
                  <option value="default">Default Tier</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Display of Perk Explorer if toggled */}
        {showPerkExplorer && activeSection !== 'faq' && (
          <div className="mb-12">
            <PerkExplorer />
          </div>
        )}

        {/* Active Content Switch */}

        {/* A: All Shop Categories */}
        {activeSection === 'all' && (
          <div className="space-y-16">
            {/* Ranks showcase */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded" />
                  VIP Donor Ranks
                </h3>
                <button
                  onClick={() => setActiveSection('ranks')}
                  className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors"
                >
                  View All {RANKS.length} Ranks <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Show top 6 ranks for summary in All */}
                {sortedRanks.slice(0, 6).map((rank) => (
                  <RankCard
                    key={rank.id}
                    rank={rank}
                    onAddToCart={handleAddRankToCart}
                    onInstantBuy={handleInstantBuyRank}
                    minecraftUsername={minecraftUsername}
                  />
                ))}
              </div>
            </div>

            {/* Keys showcase */}
            <div className="pt-8 border-t border-zinc-900/60">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-purple-500 rounded" />
                  Crate Key store
                </h3>
                <button
                  onClick={() => setActiveSection('keys')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors"
                >
                  View All Crate Keys <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKeys.map((key) => (
                  <CrateKeyCard
                    key={key.id}
                    crateKey={key}
                    onAddToCart={handleAddCrateKeyToCart}
                    onInstantBuy={handleInstantBuyKey}
                    minecraftUsername={minecraftUsername}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* B: Dedicated Server Ranks Category */}
        {activeSection === 'ranks' && (
          <div>
            {sortedRanks.length === 0 ? (
              <div className="text-center py-24 text-zinc-500 font-mono text-sm">
                No Minecraft ranks match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRanks.map((rank) => (
                  <RankCard
                    key={rank.id}
                    rank={rank}
                    onAddToCart={handleAddRankToCart}
                    onInstantBuy={handleInstantBuyRank}
                    minecraftUsername={minecraftUsername}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* C: Dedicated Crate Keys Category */}
        {activeSection === 'keys' && (
          <div>
            {filteredKeys.length === 0 ? (
              <div className="text-center py-24 text-zinc-500 font-mono text-sm">
                No crate keys match your search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKeys.map((key) => (
                  <CrateKeyCard
                    key={key.id}
                    crateKey={key}
                    onAddToCart={handleAddCrateKeyToCart}
                    onInstantBuy={handleInstantBuyKey}
                    minecraftUsername={minecraftUsername}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* D: Information FAQ & Policy Center */}
        {activeSection === 'faq' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-4">
                <HelpCircle className="w-5.5 h-5.5 text-amber-500" />
                Frequently Asked Questions
              </h3>

              <div className="space-y-4 divide-y divide-zinc-900">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className={`${idx > 0 ? 'pt-4' : ''}`}>
                    <h4 className="text-sm font-extrabold text-white mb-2">{faq.q}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Server Guidelines / Refund Notices */}
            <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 space-y-4 text-xs text-zinc-400 leading-relaxed">
              <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                ⚠️ Store Disclaimer & Refund Policy
              </h4>
              <p>
                All purchases on this store are final. We maintain a strict <strong className="text-zinc-200">no refund policy</strong> on digital, consumable benefits. Chargebacks or unauthorized credit refunds will result in an immediate and automatic permanent IP ban from our Minecraft server and network stores.
              </p>
              <p>
                BDX Network is not affiliated with Mojang Studios or Microsoft. Mojang does not endorse or assume liability for items sold on this store. For direct purchase support, please contact our community administrators on our official Discord.
              </p>
            </div>
          </div>
        )}

        {/* E: Lucky Spin Wheel Section */}
        {activeSection === 'wheel' && (
          <LuckyWheel
            username={minecraftUsername}
            setUsername={setMinecraftUsername}
            triggerToast={triggerToast}
          />
        )}

        {/* F: Server Admin Panel Section */}
        {activeSection === 'admin' && (
          <AdminPanel
            ranks={ranks}
            setRanks={setRanks}
            crateKeys={crateKeys}
            setCrateKeys={setCrateKeys}
            coupons={coupons}
            setCoupons={setCoupons}
            orders={orders}
            setOrders={setOrders}
          />
        )}

      </main>

      {/* 5. Clean Footer */}
      <footer className="mt-auto bg-zinc-950 border-t border-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-amber-500 font-bold font-mono">
              BDX
            </div>
            <div>
              <p className="text-zinc-400 font-bold font-sans">BDX NETWORK STORE</p>
              <p className="text-[10px] mt-0.5 font-mono">© 2026 play.bdxnetwork.net. All rights reserved.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-end items-center text-zinc-400 font-medium">
            <button onClick={() => setActiveSection('all')} className="hover:text-amber-400 transition-colors cursor-pointer">Shop Catalog</button>
            <button onClick={() => setActiveSection('ranks')} className="hover:text-amber-400 transition-colors cursor-pointer">Server Ranks</button>
            <button onClick={() => setActiveSection('keys')} className="hover:text-amber-400 transition-colors cursor-pointer">Crate Keys</button>
            <button onClick={() => setActiveSection('faq')} className="hover:text-amber-400 transition-colors cursor-pointer">FAQ & Policies</button>
            <button
              onClick={() => {
                setActiveSection('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-amber-500 hover:text-amber-400 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-mono shadow-md"
              id="footer-admin-btn"
            >
              <Settings className="w-3.5 h-3.5 animate-spin-slow" />
              Admin Panel
            </button>
          </div>

        </div>
      </footer>

      {/* 6. Dynamic Slide-out Cart Sidebar drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        minecraftUsername={minecraftUsername}
        onUsernameChange={setMinecraftUsername}
        onCheckout={handleProceedToCheckout}
        coupons={coupons}
      />

      {/* 7. Dynamic Checkout payment portal modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        coupon={checkoutCoupon}
        minecraftUsername={minecraftUsername}
        onClearCart={handleClearCart}
        onCheckoutSuccess={(details) => {
          const newOrder: Order = {
            id: 'BDX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            username: details.username,
            items: details.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              type: item.type
            })),
            total: details.total,
            couponCode: details.couponCode || '',
            discountAmount: details.discountAmount || 0,
            paymentMethod: details.method,
            status: 'pending',
            timestamp: new Date().toLocaleTimeString(),
            mfsPhone: details.mfsPhone,
            mfsTrxId: details.mfsTrxId,
            cardHolderName: details.cardHolderName,
            cardNumberMasked: details.cardNumberMasked,
            cryptoWalletAddress: details.cryptoWalletAddress
          };
          // Save order to Firestore (remove undefined fields for Firestore)
          const orderDocRef = doc(db, 'orders', newOrder.id);
          const cleanedOrder = JSON.parse(JSON.stringify(newOrder));
          setDoc(orderDocRef, cleanedOrder)
            .then(() => {
              triggerToast('Order submitted! Awaiting Admin Verification.');
            })
            .catch(err => {
              console.error('Failed to save order to Firestore:', err);
            });
          setOrders(prev => [newOrder, ...prev]);
        }}
      />

      {/* 8. Micro-Toasts Floating feedback notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-zinc-900 text-zinc-100 border border-zinc-800 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-auto animate-slide-in"
          >
            <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
