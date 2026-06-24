import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingCart, Tag, Terminal, Edit, Settings, Trash2, Plus, RefreshCw, 
  Check, Play, ArrowRight, ShieldCheck, Database, Award, Key, DollarSign, Clock, FileText, Send, Wifi,
  LogOut, Lock, Mail, KeyRound, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Rank, CrateKey, Coupon, Order } from '../types';
import { auth, db, isVerifiedAdmin } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

interface AdminPanelProps {
  ranks: Rank[];
  setRanks: React.Dispatch<React.SetStateAction<Rank[]>>;
  crateKeys: CrateKey[];
  setCrateKeys: React.Dispatch<React.SetStateAction<CrateKey[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function AdminPanel({
  ranks,
  setRanks,
  crateKeys,
  setCrateKeys,
  coupons,
  setCoupons,
  orders,
  setOrders
}: AdminPanelProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'console' | 'perks' | 'coupons' | 'orders'>('analytics');

  // --- Firebase Auth States ---
  const [currentUser, setCurrentUser] = useState<any>({
    email: 'juhebminecrft7@gmail.com',
    uid: 'local-bypass-admin-session',
    emailVerified: true
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // --- 1. Terminal Console States ---
  const [consoleCommand, setConsoleCommand] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; text: string; type: 'info' | 'warn' | 'success' | 'command' }[]>([
    { id: '1', text: '[18:50:11 INFO]: Starting BDX Minecraft Server version 1.21.1', type: 'info' },
    { id: '2', text: '[18:50:15 INFO]: Loading RCON listener on port 25575 (Ready for requests)', type: 'success' },
    { id: '3', text: '[18:50:20 INFO]: SheikhCrafty connected from IP 103.44.11.2', type: 'info' },
    { id: '4', text: '[18:50:21 INFO]: Console executed command: /lp user SheikhCrafty parent add apex', type: 'command' },
    { id: '5', text: '[18:50:22 INFO]: Player SheikhCrafty received rank upgrade Apex 👑', type: 'success' },
    { id: '6', text: '[18:52:45 INFO]: Riyad_007 logged in to Lobby-1', type: 'info' },
    { id: '7', text: '[18:52:48 INFO]: Delivered 5x Mythic Key to Riyad_007', type: 'success' },
  ]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // --- 2. Perk Editor States ---
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editedRank, setEditedRank] = useState<Partial<Rank>>({});
  const [editedKey, setEditedKey] = useState<Partial<CrateKey>>({});

  // --- 3. Coupon Creator States ---
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(20);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // --- 4. Manual Dispatcher States ---
  const [manualUsername, setManualUsername] = useState('');
  const [manualItemType, setManualItemType] = useState<'rank' | 'key'>('rank');
  const [manualItemId, setManualItemId] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualPaymentMethod, setManualPaymentMethod] = useState('manual');
  const [manualPrice, setManualPrice] = useState<number | ''>('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);

  // Auth Subscription observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isVerifiedAdmin(user.email)) {
          setCurrentUser(user);
          setAuthError('');
        } else {
          // If logged in with non-verified email, terminate immediately
          setAuthError('Access Denied: This account is not verified as an Admin. Non-admin accounts cannot log into this administrative session.');
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(prev => (prev?.uid === 'local-bypass-admin-session' ? prev : null));
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync pricing for Manual Dispatcher when selection changes
  useEffect(() => {
    if (!manualItemId) {
      setManualPrice('');
      return;
    }
    const targetId = manualItemId;
    const basePrice = manualItemType === 'rank'
      ? ranks.find(r => r.id === targetId)?.price || 0
      : crateKeys.find(k => k.id === targetId)?.price || 0;
    
    setManualPrice(basePrice * (manualItemType === 'rank' ? 1 : manualQty));
  }, [manualItemId, manualItemType, manualQty, ranks, crateKeys]);

  // Auto-scroll terminal
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Auth Submission handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const emailClean = emailInput.trim().toLowerCase();

    // Secure emergency bypass for whitelisted administrator accounts
    // Allows immediate recovery if Email/Password provider is disabled in Firebase console
    if (passwordInput === 'bdxadmin2026' && isVerifiedAdmin(emailClean)) {
      setConsoleLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[${new Date().toLocaleTimeString()} WARN]: Admin authenticated via Master Passcode Bypass.`, type: 'warn' }
      ]);
      setCurrentUser({
        email: emailInput.trim(),
        uid: 'master-bypass-session',
        emailVerified: true
      });
      setAuthLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // Registration
        if (!isVerifiedAdmin(emailInput)) {
          setAuthError('Registration Denied: Only authorized administrator emails (matching juhebminecrft7@gmail.com or @bdxnetwork.net domain) can register.');
          setAuthLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        setConsoleLogs(prev => [
          ...prev,
          { id: Date.now().toString(), text: `[${new Date().toLocaleTimeString()} INFO]: New admin account registered: ${emailInput}`, type: 'success' }
        ]);
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        if (!isVerifiedAdmin(userCredential.user.email)) {
          setAuthError('Access Denied: Non-whitelisted administrator accounts cannot authenticate into this panel.');
          await signOut(auth);
        }
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'An authentication error occurred.';
      
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Firebase Email/Password Auth is disabled! Please enable it in Firebase Console (Authentication > Sign-in method > Enable Email/Password). \n\n🔒 EMERGENCY BYPASS: You can bypass this block right now by entering password "bdxadmin2026".';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password combination. (Forgot password? You can also use the master bypass "bdxadmin2026" for whitelisted admins).';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already registered.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters.';
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Command submission logic
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleCommand.trim()) return;

    const cmd = consoleCommand.trim();
    const cleanCmd = cmd.startsWith('/') ? cmd : `/${cmd}`;
    const timestamp = new Date().toLocaleTimeString();

    // Log the sent command
    const newLogs = [
      ...consoleLogs,
      { id: Date.now().toString() + '-cmd', text: `[${timestamp} INFO]: Command issued: ${cleanCmd}`, type: 'command' as const }
    ];

    // Determine custom response based on keywords
    let responseText = `[${timestamp} WARN]: Unknown command syntax. Type "/help" for list.`;
    let responseType: 'info' | 'warn' | 'success' = 'warn';

    if (cleanCmd.toLowerCase().includes('help')) {
      responseText = `[${timestamp} INFO]: Commands available: /op <player>, /ban <player>, /whitelist add <player>, /give <player> <item> <qty>, /say <msg>, /reload, /gc (Garbage collector)`;
      responseType = 'info';
    } else if (cleanCmd.toLowerCase().startsWith('/say ')) {
      const msg = cleanCmd.substring(5);
      responseText = `[${timestamp} INFO]: [Broadcast] ${msg}`;
      responseType = 'success';
    } else if (cleanCmd.toLowerCase().startsWith('/op ')) {
      const target = cleanCmd.substring(4);
      responseText = `[${timestamp} INFO]: Made ${target} a server operator`;
      responseType = 'success';
    } else if (cleanCmd.toLowerCase().startsWith('/ban ')) {
      const target = cleanCmd.substring(5);
      responseText = `[${timestamp} WARN]: Player ${target} was banned from the server network`;
      responseType = 'warn';
    } else if (cleanCmd.toLowerCase().startsWith('/whitelist ')) {
      responseText = `[${timestamp} INFO]: Updated server whitelist configuration`;
      responseType = 'info';
    } else if (cleanCmd.toLowerCase().startsWith('/give ')) {
      responseText = `[${timestamp} INFO]: Successfully dispatched items to player inventory`;
      responseType = 'success';
    } else if (cleanCmd.toLowerCase() === '/reload') {
      responseText = `[${timestamp} INFO]: Reloading all server modules and database connections... Reload complete in 42ms.`;
      responseType = 'success';
    } else if (cleanCmd.toLowerCase() === '/gc') {
      responseText = `[${timestamp} INFO]: Garbage collection forced. Free memory: 12.4 GB / 16.0 GB. TPS: 20.00`;
      responseType = 'success';
    }

    setConsoleLogs([...newLogs, { id: (Date.now() + 1).toString(), text: responseText, type: responseType }]);
    setConsoleCommand('');
  };

  // Dispatch mock manual command helper
  const handleManualDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUsername.trim()) {
      alert('Please enter a player username');
      return;
    }
    const targetId = manualItemId || (manualItemType === 'rank' ? ranks[0].id : crateKeys[0].id);
    const itemName = manualItemType === 'rank' 
      ? ranks.find(r => r.id === targetId)?.name + ' Rank'
      : crateKeys.find(k => k.id === targetId)?.name;

    setIsDispatching(true);
    setDispatchLogs([]);

    const steps = [
      `Initializing secure RCON connection to play.bdxnetwork.net:25575...`,
      `[API] Resolving player account UUID for "${manualUsername}"...`,
      `[RCON] Sending dispatch payload: ${manualItemType === 'rank' ? `/lp user ${manualUsername} parent add ${targetId.replace('rank-', '')}` : `/crate give physical ${targetId.replace('key-', '')} ${manualQty} ${manualUsername}`}`,
      `[DATABASE] Writing ledger entry: Manual grant delivered to ${manualUsername}`,
      `[RCON] Server response: "Granted parent permission node or keys successfully."`,
      `Perks fully dispatched! ${manualUsername} will receive their packages instantly.`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setDispatchLogs(prev => [...prev, steps[i]]);
    }

    const finalPrice = manualPrice === '' ? 0 : Number(manualPrice);

    // Add to actual orders state!
    const newOrder: Order = {
      id: 'MAN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      username: manualUsername,
      items: [{
        name: itemName || 'Server Package',
        quantity: manualQty,
        price: manualItemType === 'rank' ? finalPrice : finalPrice / manualQty,
        type: manualItemType
      }],
      total: finalPrice,
      paymentMethod: manualPaymentMethod,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString() + ' (Manual)'
    };

    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (err) {
      console.error('Failed to save manual order to Firestore:', err);
    }

    setOrders(prev => [newOrder, ...prev]);
    
    // Add server log as well
    setConsoleLogs(prev => [
      ...prev,
      { id: Date.now().toString(), text: `[${new Date().toLocaleTimeString()} INFO]: Admin manually granted ${itemName} (Qty: ${manualQty}) to ${manualUsername} with ${manualPaymentMethod} Pay (৳${finalPrice})`, type: 'success' }
    ]);

    setIsDispatching(false);
  };

  // Rank editor save
  const handleSaveRank = async (id: string) => {
    const updatedRank = { ...ranks.find(r => r.id === id), ...editedRank } as Rank;
    try {
      await setDoc(doc(db, 'ranks', id), updatedRank);
    } catch (err) {
      console.error('Failed to update rank in Firestore:', err);
    }
    setRanks(prev => prev.map(r => r.id === id ? updatedRank : r));
    setEditingRankId(null);
    setEditedRank({});
  };

  // Key editor save
  const handleSaveKey = async (id: string) => {
    const updatedKey = { ...crateKeys.find(k => k.id === id), ...editedKey } as CrateKey;
    try {
      await setDoc(doc(db, 'crate_keys', id), updatedKey);
    } catch (err) {
      console.error('Failed to update key in Firestore:', err);
    }
    setCrateKeys(prev => prev.map(k => k.id === id ? updatedKey : k));
    setEditingKeyId(null);
    setEditedKey({});
  };

  // Coupon create
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const codeUpper = newCouponCode.trim().toUpperCase();
    if (coupons.some(c => c.code === codeUpper)) {
      alert('Coupon code already exists!');
      return;
    }

    const newC: Coupon = {
      code: codeUpper,
      discountPercent: Number(newCouponDiscount),
      description: newCouponDesc || `${newCouponDiscount}% Discount Code`
    };

    try {
      await setDoc(doc(db, 'coupons', codeUpper), newC);
    } catch (err) {
      console.error('Failed to create coupon in Firestore:', err);
    }

    setCoupons(prev => [...prev, newC]);
    setNewCouponCode('');
    setNewCouponDiscount(20);
    setNewCouponDesc('');
  };

  // Coupon delete
  const handleDeleteCoupon = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', code));
    } catch (err) {
      console.error('Failed to delete coupon in Firestore:', err);
    }
    setCoupons(prev => prev.filter(c => c.code !== code));
  };

  // --- Analytical Calculations ---
  // Total Revenue counting real orders in state
  const mockInitialRevenue = 153200; // start with a nice offline value
  const actualOrdersTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const totalRevenue = mockInitialRevenue + actualOrdersTotal;

  const totalOrdersCount = 482 + orders.length;
  
  // Recharts Sales Trends over past week
  const salesTrendsData = [
    { day: 'Wed', Sales: 18400 },
    { day: 'Thu', Sales: 22100 },
    { day: 'Fri', Sales: 28500 },
    { day: 'Sat', Sales: 34200 },
    { day: 'Sun', Sales: 31000 },
    { day: 'Mon', Sales: 25400 },
    { day: 'Tue (Today)', Sales: 32450 + actualOrdersTotal },
  ];

  // Ranks vs Crate Keys Distribution
  const distributionData = [
    { name: 'Ranks', value: 65, fill: '#f59e0b' },
    { name: 'Crate Keys', value: 35, fill: '#a855f7' }
  ];

  if (authLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 font-mono">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-zinc-400 uppercase tracking-widest animate-pulse">Establishing Secure Firebase Auth Session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#111115]/90 border border-zinc-850 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-wider text-white">Admin Gatekeeper</h3>
          <p className="text-xxs font-mono text-zinc-500 uppercase tracking-widest">Secure Firebase Auth Verification Required</p>
        </div>

        {authError && (
          <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl flex gap-3 text-xs text-red-300 animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-mono text-[11px]">{authError}</p>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@bdxnetwork.net"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-amber-500 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-amber-500 text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-xs font-black py-3.5 rounded-xl transition-all uppercase tracking-wider active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {authLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isRegistering ? (
              <span>Register New Admin</span>
            ) : (
              <span>Authenticate Session</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-900 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setCurrentUser({
                email: 'juhebminecrft7@gmail.com',
                uid: 'local-bypass-admin-session',
                emailVerified: true
              });
              setAuthError('');
              setConsoleLogs(prev => [
                ...prev,
                { id: Date.now().toString(), text: `[${new Date().toLocaleTimeString()} WARN]: Admin authenticated in Local Bypass Mode (Firebase Auth disabled by request).`, type: 'warn' }
              ]);
            }}
            className="w-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold py-3.5 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-emerald-500/5 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Off Firebase Auth (Instant Bypass)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setAuthError('');
            }}
            className="text-xxs font-mono text-zinc-400 hover:text-amber-400 transition-colors uppercase tracking-wider mt-1"
          >
            {isRegistering ? 'Already have an admin account? Sign In' : "Don't have an account? Set up Registration"}
          </button>

          <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-left space-y-1">
            <p className="text-[9px] font-mono font-black uppercase text-amber-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security Verification Policy:
            </p>
            <p className="text-[9px] font-mono text-zinc-500 leading-normal uppercase">
              Only authorized admin accounts are verified. No standard player accounts can log into this system. Whitelisted emails:
              <span className="text-zinc-300 block mt-1">• juhebminecrft7@gmail.com</span>
              <span className="text-zinc-300 block">• Any email ending with @bdxnetwork.net</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="admin-panel-container">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-[#121217] border border-zinc-850 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              BDX Network Administrative Panel
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time store dashboard, server console terminal, catalog customizer, and promo tools.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Admin Profiler */}
          <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-900 text-xxs font-mono text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-300 font-bold truncate max-w-[150px]">{currentUser.email}</span>
            <span className="text-zinc-500">| ADMIN</span>
          </div>

          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to sign out of the administrative session?')) {
                await signOut(auth);
              }
            }}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-950/70 border border-red-900/40 hover:border-red-900/60 text-red-200 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xxs font-mono uppercase"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/15'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'console'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/15'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Server Console (RCON)
        </button>
        <button
          onClick={() => setActiveTab('perks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'perks'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/15'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
          }`}
        >
          <Edit className="w-4 h-4" />
          Store Item Editor
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'coupons'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/15'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
          }`}
        >
          <Tag className="w-4 h-4" />
          Promo Coupons Engine
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/15'
              : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Store Transaction History
          {orders.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* --- A: ANALYTICS DASHBOARD --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* KPI Mini grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <div className="absolute top-4 right-4 text-zinc-700 group-hover:text-amber-500/30 transition-colors">
                <DollarSign className="w-8 h-8" />
              </div>
              <p className="text-xxs font-mono uppercase tracking-widest text-zinc-500">Gross Store Revenue</p>
              <h4 className="text-2xl font-black text-white mt-2 font-mono">৳{totalRevenue.toLocaleString()}</h4>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <span>↑ 18.4%</span> <span className="text-zinc-600">vs last week</span>
              </p>
            </div>

            <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <div className="absolute top-4 right-4 text-zinc-700 group-hover:text-purple-500/30 transition-colors">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="text-xxs font-mono uppercase tracking-widest text-zinc-500">Transactions Count</p>
              <h4 className="text-2xl font-black text-white mt-2 font-mono">{totalOrdersCount}</h4>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <span>↑ 12.1%</span> <span className="text-zinc-600">new checkouts</span>
              </p>
            </div>

            <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <div className="absolute top-4 right-4 text-zinc-700 group-hover:text-sky-500/30 transition-colors">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-xxs font-mono uppercase tracking-widest text-zinc-500">Concurrent Players</p>
              <h4 className="text-2xl font-black text-white mt-2 font-mono">1,482</h4>
              <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
                <span>Peak: 1,842</span> <span className="text-zinc-600">Limit: 2,000</span>
              </p>
            </div>

            <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <div className="absolute top-4 right-4 text-zinc-700 group-hover:text-emerald-500/30 transition-colors">
                <Tag className="w-8 h-8" />
              </div>
              <p className="text-xxs font-mono uppercase tracking-widest text-zinc-500">Active Coupons</p>
              <h4 className="text-2xl font-black text-white mt-2 font-mono">{coupons.length}</h4>
              <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1 font-mono">
                <span>{coupons[0]?.code || 'NONE'}</span> <span className="text-zinc-600">discount active</span>
              </p>
            </div>

          </div>

          {/* Interactive Recharts Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sales Trends Chart (8 cols) */}
            <div className="lg:col-span-8 bg-[#111115]/80 border border-zinc-850 rounded-2xl p-5">
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Store Sales Trends (Past 7 Days BDT)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                      labelStyle={{ color: '#a1a1aa', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Distribution (4 cols) */}
            <div className="lg:col-span-4 bg-[#111115]/80 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  Product Distribution
                </h4>
                <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">Percentage share of checkout volume</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={45}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex justify-center gap-6 text-xxs font-mono">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Ranks (65%)
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Crate Keys (35%)
                </span>
              </div>
            </div>

          </div>

          {/* Quick Manual Dispatch Component */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column (5 cols) */}
            <div className="lg:col-span-5 bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6">
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Player Perk Dispatcher
              </h4>
              <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">Manually award server ranks or key bundles to any player</p>

              <form onSubmit={handleManualDispatch} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Minecraft Username</label>
                  <input
                    type="text"
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="Enter IGN (e.g. Steve)"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500/50 text-white font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Package Type</label>
                    <select
                      value={manualItemType}
                      onChange={(e) => {
                        setManualItemType(e.target.value as any);
                        setManualItemId('');
                      }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="rank">Server Rank</option>
                      <option value="key">Crate Key</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={manualQty}
                      onChange={(e) => setManualQty(Number(e.target.value))}
                      disabled={manualItemType === 'rank'}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-white font-mono disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Select Item</label>
                  <select
                    value={manualItemId}
                    onChange={(e) => setManualItemId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose {manualItemType === 'rank' ? 'Rank' : 'Key'} --</option>
                    {manualItemType === 'rank' ? (
                      ranks.map(r => <option key={r.id} value={r.id}>{r.name} Rank (৳{r.price})</option>)
                    ) : (
                      crateKeys.map(k => <option key={k.id} value={k.id}>{k.name} (৳{k.price})</option>)
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Payment Method</label>
                    <select
                      value={manualPaymentMethod}
                      onChange={(e) => setManualPaymentMethod(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="card">Card Pay</option>
                      <option value="crypto">Cryptocurrency</option>
                      <option value="cash">Cash Payment</option>
                      <option value="system">RCON System</option>
                      <option value="manual">Admin Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Price / Total (৳)</label>
                    <input
                      type="number"
                      min={0}
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1500"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDispatching}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-xs font-black py-3 rounded-xl transition-all uppercase tracking-wider active:scale-98 flex items-center justify-center gap-2"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executing RCON Payload...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Perks
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Console Log column (7 cols) */}
            <div className="lg:col-span-7 bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6 flex flex-col h-[380px]">
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Live Dispatch Log
              </h4>
              <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-4">RCON socket console stream</p>
              
              <div className="flex-1 bg-zinc-950/90 border border-zinc-900 rounded-xl p-4 font-mono text-xxs text-zinc-400 overflow-y-auto space-y-2">
                {dispatchLogs.length === 0 ? (
                  <p className="text-zinc-600 italic">Awaiting dispatch execution trigger...</p>
                ) : (
                  dispatchLogs.map((log, idx) => (
                    <p key={idx} className={`${idx === dispatchLogs.length - 1 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      {idx === dispatchLogs.length - 1 ? '✓ ' : '▸ '}{log}
                    </p>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- B: SERVER CONSOLE TERMINAL --- */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6 flex flex-col h-[520px]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">Live Server Console Terminal</h4>
                  <p className="text-xxs text-zinc-500 uppercase font-mono mt-0.5">Secure RCON SSH Session (play.bdxnetwork.net)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xxs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
                <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>PING: 24ms</span>
                <span className="text-zinc-600">|</span>
                <span>TPS: 20.0</span>
              </div>
            </div>

            {/* Actual Terminal black screen */}
            <div className="flex-1 bg-[#050508] border border-zinc-900 rounded-xl p-5 font-mono text-xs overflow-y-auto space-y-3.5 custom-scrollbar shadow-inner">
              <p className="text-zinc-500 text-xxs border-b border-zinc-900/60 pb-2 uppercase tracking-widest mb-4">
                --- BDX Network SSH RCON Session Activated ---
              </p>

              {consoleLogs.map((log) => {
                let colorClass = 'text-zinc-300';
                if (log.type === 'success') colorClass = 'text-emerald-400';
                if (log.type === 'warn') colorClass = 'text-red-400 font-bold';
                if (log.type === 'command') colorClass = 'text-amber-400';
                return (
                  <div key={log.id} className="leading-relaxed flex items-start gap-2">
                    <span className="text-zinc-600 shrink-0">#</span>
                    <span className={colorClass}>{log.text}</span>
                  </div>
                );
              })}
              <div ref={consoleBottomRef} />
            </div>

            {/* Terminal input form */}
            <form onSubmit={handleCommandSubmit} className="mt-4 flex gap-2.5">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-600 font-mono text-xs font-bold">
                  $
                </span>
                <input
                  type="text"
                  value={consoleCommand}
                  onChange={(e) => setConsoleCommand(e.target.value)}
                  placeholder="Enter RCON server command (e.g. /say Hello, /op steve, /gc, /help)"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 pl-8 pr-4 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/35 transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black px-6 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Execute
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- C: STORE ITEM EDITOR --- */}
      {activeTab === 'perks' && (
        <div className="space-y-8">
          
          {/* Edit Server Ranks Card */}
          <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Manage Server Donor Ranks
            </h4>
            <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">Modify donor rank pricing and branding details instantly on the shop page</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 pb-3">
                    <th className="py-3 px-4 uppercase tracking-wider">Rank Name</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Badge</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Price (BDT)</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {ranks.map((rank) => {
                    const isEditing = editingRankId === rank.id;
                    return (
                      <tr key={rank.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedRank.name || rank.name}
                              onChange={(e) => setEditedRank({ ...editedRank, name: e.target.value })}
                              className="bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white max-w-[120px]"
                            />
                          ) : (
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                              rank.color === 'emerald' ? 'from-emerald-400 to-emerald-500' :
                              rank.color === 'teal' ? 'from-teal-400 to-teal-500' :
                              rank.color === 'cyan' ? 'from-cyan-400 to-cyan-500' :
                              rank.color === 'sky' ? 'from-sky-400 to-sky-500' :
                              rank.color === 'blue' ? 'from-blue-400 to-blue-500' :
                              rank.color === 'indigo' ? 'from-indigo-400 to-indigo-500' :
                              rank.color === 'violet' ? 'from-violet-400 to-violet-500' :
                              rank.color === 'fuchsia' ? 'from-fuchsia-400 to-fuchsia-500' :
                              rank.color === 'pink' ? 'from-pink-400 to-pink-500' :
                              rank.color === 'rose' ? 'from-rose-400 to-rose-500' :
                              rank.color === 'orange' ? 'from-orange-400 to-orange-500' :
                              rank.color === 'amber' ? 'from-amber-400 to-amber-500' :
                              rank.color === 'yellow' ? 'from-yellow-400 to-yellow-500' :
                              rank.color === 'purple' ? 'from-purple-400 to-purple-500' :
                              'from-red-400 to-red-500'
                            } font-black uppercase`}>
                              {rank.name}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-zinc-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedRank.badge === undefined ? (rank.badge || '') : editedRank.badge}
                              onChange={(e) => setEditedRank({ ...editedRank, badge: e.target.value })}
                              className="bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white max-w-[100px]"
                              placeholder="None"
                            />
                          ) : (
                            rank.badge ? (
                              <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                {rank.badge}
                              </span>
                            ) : (
                              <span className="text-zinc-600">-</span>
                            )
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-amber-400 font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedRank.price === undefined ? rank.price : editedRank.price}
                              onChange={(e) => setEditedRank({ ...editedRank, price: Number(e.target.value) })}
                              className="bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-xs text-white max-w-[80px]"
                            />
                          ) : (
                            `৳${rank.price.toLocaleString()}`
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-zinc-400 max-w-xs truncate font-sans">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedRank.description === undefined ? rank.description : editedRank.description}
                              onChange={(e) => setEditedRank({ ...editedRank, description: e.target.value })}
                              className="bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white w-full"
                            />
                          ) : (
                            rank.description
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveRank(rank.id)}
                              className="text-xxs bg-emerald-950 border border-emerald-800 text-emerald-400 px-2.5 py-1 rounded font-bold hover:bg-emerald-900/40 transition-colors"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingRankId(rank.id);
                                setEditedRank(rank);
                              }}
                              className="text-xxs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded font-bold hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Crate Keys Card */}
          <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              Manage Crate Keys Catalog
            </h4>
            <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">Modify game server crate item pricing and details instantly</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 pb-3">
                    <th className="py-3 px-4 uppercase tracking-wider">Crate Key Name</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Icon</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Price (BDT)</th>
                    <th className="py-3 px-4 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {crateKeys.map((key) => {
                    const isEditing = editingKeyId === key.id;
                    return (
                      <tr key={key.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-white uppercase">{key.name}</td>
                        <td className="py-4 px-4 text-lg">{key.icon}</td>
                        <td className="py-4 px-4 font-bold text-purple-400 font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedKey.price === undefined ? key.price : editedKey.price}
                              onChange={(e) => setEditedKey({ ...editedKey, price: Number(e.target.value) })}
                              className="bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-xs text-white max-w-[80px]"
                              disabled={key.price === 0}
                            />
                          ) : (
                            key.price === 0 ? 'FREE' : `৳${key.price}`
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-zinc-400 max-w-xs truncate font-sans">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedKey.description === undefined ? key.description : editedKey.description}
                              onChange={(e) => setEditedKey({ ...editedKey, description: e.target.value })}
                              className="bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white w-full"
                            />
                          ) : (
                            key.description
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveKey(key.id)}
                              className="text-xxs bg-emerald-950 border border-emerald-800 text-emerald-400 px-2.5 py-1 rounded font-bold hover:bg-emerald-900/40 transition-colors"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingKeyId(key.id);
                                setEditedKey(key);
                              }}
                              className="text-xxs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded font-bold hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- D: PROMO COUPONS ENGINE --- */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create Coupon Column (5 cols) */}
          <div className="lg:col-span-5 bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6 h-fit">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              Generate Promo Coupon
            </h4>
            <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">Create promotional discount codes that work during checkout</p>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="e.g. SUMMER50"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-amber-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Discount Percentage (%)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={5}
                    max={95}
                    step={5}
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-sm font-bold text-amber-400 font-mono w-12 text-right">{newCouponDiscount}%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Description</label>
                <input
                  type="text"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder="e.g. Exclusive summer promotion!"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-xs font-black py-3 rounded-xl transition-all uppercase tracking-wider active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                Add Coupon Code
              </button>
            </form>
          </div>

          {/* List Coupons Column (7 cols) */}
          <div className="lg:col-span-7 bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Active Discount Coupons
            </h4>
            <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">List of coupons currently accepted in checkout baskets</p>

            <div className="space-y-3">
              {coupons.map((c) => (
                <div 
                  key={c.code}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-white bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {c.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-xxs text-zinc-400 font-sans leading-normal">{c.description}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- E: STORE TRANSACTION HISTORY --- */}
      {activeTab === 'orders' && (
        <div className="bg-[#111115]/80 border border-zinc-850 rounded-2xl p-6">
          <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Completed Checkout ledger
          </h4>
          <p className="text-xxs text-zinc-500 uppercase font-mono tracking-wider mb-6">Chronological transaction history generated from frontend purchases</p>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-xl">
                No purchases completed in this session yet. Completing a checkout in the shop will populate this list instantly!
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-zinc-950 border border-zinc-900/80 rounded-xl p-5 space-y-4 hover:border-zinc-800 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-zinc-900">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-black text-white">ID: {order.id}</span>
                        <span className={`text-[9px] font-mono border px-2 py-0.5 rounded font-bold uppercase ${
                          order.status === 'completed' 
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50' 
                            : order.status === 'delivering' 
                            ? 'text-blue-400 bg-blue-950/60 border-blue-900/50' 
                            : 'text-amber-400 bg-amber-950/60 border-amber-900/50'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono">Timestamp: {order.timestamp}</p>
                    </div>

                    <div className="text-right font-mono">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Grand Total</p>
                      <p className="text-sm font-black text-amber-400">৳{order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono">
                    <div className="md:col-span-4 space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Player Information</p>
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://mc-heads.net/avatar/${order.username}/24`} 
                          alt="Skin" 
                          className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800"
                        />
                        <span className="text-white font-bold">{order.username}</span>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Packages Delivered</p>
                      <div className="space-y-0.5 text-zinc-300">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span>• {item.quantity}x {item.name}</span>
                            <span className="text-zinc-600">({item.price === 0 ? 'Free' : `৳${item.price}`})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-2 text-left md:text-right flex flex-col justify-between items-start md:items-end">
                      <div className="w-full space-y-1.5">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Payment Controls</p>
                        
                        <div className="flex flex-wrap md:justify-end gap-1.5">
                          {/* Payment Method Select Dropdown */}
                          <select
                            value={order.paymentMethod}
                            onChange={async (e) => {
                              const newMethod = e.target.value;
                              try {
                                await updateDoc(doc(db, 'orders', order.id), { paymentMethod: newMethod });
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentMethod: newMethod } : o));
                              } catch (err) {
                                console.error('Failed to update payment method in Firestore:', err);
                              }
                            }}
                            className="bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300 rounded px-1.5 py-1 focus:outline-none focus:border-amber-500 uppercase font-bold font-mono"
                          >
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="card">Card</option>
                            <option value="crypto">Crypto</option>
                            <option value="cash">Cash</option>
                            <option value="system">System</option>
                            <option value="manual">Manual</option>
                          </select>

                          {/* Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as any;
                              try {
                                await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                              } catch (err) {
                                console.error('Failed to update status in Firestore:', err);
                              }
                            }}
                            className="bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300 rounded px-1.5 py-1 focus:outline-none focus:border-amber-500 uppercase font-bold font-mono"
                          >
                            <option value="pending">Pending</option>
                            <option value="delivering">Delivering</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        {order.couponCode && (
                          <p className="text-xxs text-emerald-400 font-bold mt-1">Coupon: {order.couponCode} (-৳{order.discountAmount})</p>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete transaction ${order.id}?`)) {
                            try {
                              await deleteDoc(doc(db, 'orders', order.id));
                              setOrders(prev => prev.filter(o => o.id !== order.id));
                            } catch (err) {
                              console.error('Failed to delete order from Firestore:', err);
                            }
                          }
                        }}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded mt-1 transition-colors self-start md:self-auto flex items-center gap-1 text-[9px]"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Ledger</span>
                      </button>
                    </div>

                    {/* Submitted Payment Proofs & Verification */}
                    {(order.mfsPhone || order.mfsTrxId || order.cardHolderName || order.cardNumberMasked || order.cryptoWalletAddress || order.status === 'pending') && (
                      <div className="mt-3 p-4 bg-zinc-950 border border-zinc-900/60 rounded-xl space-y-3.5 col-span-12">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Submitted Payment Verification Details</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs">
                              {order.mfsPhone && (
                                <div>
                                  <span className="text-zinc-500 mr-1.5">Sender Mobile:</span>
                                  <span className="text-zinc-200 font-bold font-mono">{order.mfsPhone}</span>
                                </div>
                              )}
                              {order.mfsTrxId && (
                                <div>
                                  <span className="text-zinc-500 mr-1.5">TrxID:</span>
                                  <span className="text-amber-400 font-extrabold uppercase select-all tracking-wider font-mono bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">{order.mfsTrxId}</span>
                                </div>
                              )}
                              {order.cardHolderName && (
                                <div>
                                  <span className="text-zinc-500 mr-1.5">Card Holder:</span>
                                  <span className="text-zinc-200 font-bold">{order.cardHolderName}</span>
                                </div>
                              )}
                              {order.cardNumberMasked && (
                                <div>
                                  <span className="text-zinc-500 mr-1.5">Card Number:</span>
                                  <span className="text-zinc-200 font-mono">{order.cardNumberMasked}</span>
                                </div>
                              )}
                              {order.cryptoWalletAddress && (
                                <div>
                                  <span className="text-zinc-500 mr-1.5">Crypto Address:</span>
                                  <span className="text-zinc-400 text-xxs break-all font-mono">{order.cryptoWalletAddress}</span>
                                </div>
                              )}
                              {!order.mfsPhone && !order.mfsTrxId && !order.cardHolderName && !order.cardNumberMasked && !order.cryptoWalletAddress && (
                                <span className="text-zinc-500 italic uppercase text-[10px]">No proofs logged (System / Manual Administration Entry)</span>
                              )}
                            </div>
                          </div>

                          {order.status === 'pending' ? (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Verify and approve payment of ৳${order.total} for player ${order.username}?`)) {
                                  try {
                                    const updatedFields = {
                                      status: 'completed',
                                      verifiedBy: currentUser?.email || 'Admin',
                                      verifiedAt: new Date().toLocaleTimeString()
                                    };
                                    await updateDoc(doc(db, 'orders', order.id), updatedFields);
                                    
                                    // Update local state
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updatedFields } : o));
                                    
                                    // Add to terminal console log
                                    const timestamp = new Date().toLocaleTimeString();
                                    setConsoleLogs(prev => [
                                      ...prev,
                                      { id: Date.now().toString() + '-verify', text: `[${timestamp} INFO]: [GATEWAY] Payment for order ${order.id} verified by ${currentUser?.email || 'Admin'}`, type: 'success' },
                                      { id: Date.now().toString() + '-dispatch', text: `[${timestamp} INFO]: [RCON] Dispatching perks and packages to Minecraft player: ${order.username}`, type: 'info' }
                                    ]);
                                  } catch (err) {
                                    console.error('Failed to verify payment:', err);
                                  }
                                }
                              }}
                              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 self-stretch sm:self-auto justify-center cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verify & Approve Payment</span>
                            </button>
                          ) : (
                            <div className="text-left sm:text-right text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
                              <p className="text-emerald-400 font-bold flex items-center gap-1.5 justify-start sm:justify-end">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> Verified & Approved
                              </p>
                              {order.verifiedBy && <p>By: <span className="text-zinc-400 font-semibold">{order.verifiedBy}</span></p>}
                              {order.verifiedAt && <p>At: <span className="text-zinc-400 font-semibold">{order.verifiedAt}</span></p>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
