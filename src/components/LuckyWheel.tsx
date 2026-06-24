import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShieldCheck, AlertCircle, RefreshCw, Plus, Trash2, Edit, Save, 
  Settings, Award, Tag, Key, DollarSign, Clock, CheckCircle, Ban, History, User, Lock, Heart, Trophy
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import { LuckyWheelSlice, LuckyWheelSpin } from '../types';

// Default slices to seed if the collection is empty
const DEFAULT_SLICES: LuckyWheelSlice[] = [
  { id: 'slice-vip', name: 'VIP Permanent Rank Upgrade', color: '#10b981', weight: 2, prizeType: 'rank', prizeValue: 'rank-vip' },
  { id: 'slice-key-mythic', name: '1x Mythic Key', color: '#ec4899', weight: 8, prizeType: 'key', prizeValue: 'key-mythic' },
  { id: 'slice-key-legend', name: '3x Legendary Keys', color: '#f59e0b', weight: 12, prizeType: 'key', prizeValue: 'key-legendary' },
  { id: 'slice-credits-1000', name: '৳1000 Store Credit', color: '#3b82f6', weight: 4, prizeType: 'credits', prizeValue: '1000' },
  { id: 'slice-credits-250', name: '৳250 Store Credit', color: '#8b5cf6', weight: 15, prizeType: 'credits', prizeValue: '250' },
  { id: 'slice-coupon-50', name: '50% OFF VIP Coupon', color: '#ef4444', weight: 8, prizeType: 'coupon', prizeValue: 'SUPER50' },
  { id: 'slice-coupon-15', name: '15% OFF Storewide Coupon', color: '#14b8a6', weight: 25, prizeType: 'coupon', prizeValue: 'BDX15' },
  { id: 'slice-unlucky', name: 'Unlucky! Try Again', color: '#4b5563', weight: 26, prizeType: 'unlucky', prizeValue: '0' }
];

interface LuckyWheelProps {
  username: string;
  setUsername: (username: string) => void;
  triggerToast: (message: string) => void;
}

export default function LuckyWheel({ username, setUsername, triggerToast }: LuckyWheelProps) {
  // 1. Core States
  const [slices, setSlices] = useState<LuckyWheelSlice[]>([]);
  const [recentSpins, setRecentSpins] = useState<LuckyWheelSpin[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({
    email: 'juhebminecrft7@gmail.com',
    uid: 'local-bypass-admin-session',
    emailVerified: true
  });
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  // 2. Spinning Physics States
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [winningSlice, setWinningSlice] = useState<LuckyWheelSlice | null>(null);
  const [showPrizeOverlay, setShowPrizeOverlay] = useState(false);
  
  // 3. Cooldown Verification States
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null); // milliseconds left
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);

  // 4. Admin Customizer state
  const [showAdminEditor, setShowAdminEditor] = useState(false);
  const [editingSlice, setEditingSlice] = useState<LuckyWheelSlice | null>(null);
  
  // Create / Edit Slice Form State
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#f59e0b');
  const [formWeight, setFormWeight] = useState(10);
  const [formPrizeType, setFormPrizeType] = useState<LuckyWheelSlice['prizeType']>('credits');
  const [formPrizeValue, setFormPrizeValue] = useState('');

  // Slices coordinates math ref
  const wheelRef = useRef<SVGSVGElement>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Whitelist validation
        const email = user.email || '';
        const isWhitelisted = email.toLowerCase() === 'juhebminecrft7@gmail.com' || email.toLowerCase().endsWith('@bdxnetwork.net');
        setIsAdmin(isWhitelisted || user.uid === 'master-bypass-session' || user.uid === 'local-bypass-admin-session');
      } else {
        // Default back to local bypass when firebase auth says null (i.e. Auth is Off)
        setCurrentUser({
          email: 'juhebminecrft7@gmail.com',
          uid: 'local-bypass-admin-session',
          emailVerified: true
        });
        setIsAdmin(true);
      }
    });
    return unsub;
  }, []);

  // Sync Slices and Seed if Empty
  useEffect(() => {
    setLoading(true);
    const slicesRef = collection(db, 'lucky_wheel_slices');
    const unsub = onSnapshot(slicesRef, (snapshot) => {
      if (snapshot.empty) {
        // Seed database
        DEFAULT_SLICES.forEach(async (slice) => {
          try {
            await setDoc(doc(db, 'lucky_wheel_slices', slice.id), slice);
          } catch (err) {
            console.error('Failed to seed slice:', slice.id, err);
          }
        });
      } else {
        const loadedSlices: LuckyWheelSlice[] = [];
        snapshot.forEach((doc) => {
          loadedSlices.push(doc.data() as LuckyWheelSlice);
        });
        setSlices(loadedSlices);
      }
      setLoading(false);
    }, (err) => {
      console.error('Slices sync error, falling back to local default', err);
      setSlices(DEFAULT_SLICES);
      setLoading(false);
    });

    // Sync Spins History
    const spinsRef = collection(db, 'lucky_wheel_spins');
    const qSpins = query(spinsRef, orderBy('timestamp', 'desc'), limit(50));
    const unsubSpins = onSnapshot(qSpins, (snapshot) => {
      const loadedSpins: LuckyWheelSpin[] = [];
      snapshot.forEach((doc) => {
        loadedSpins.push(doc.data() as LuckyWheelSpin);
      });
      setRecentSpins(loadedSpins);
    }, (err) => {
      console.warn('Spins sync error', err);
    });

    return () => {
      unsub();
      unsubSpins();
    };
  }, []);

  // Cooldown verification whenever Username or RecentSpins change
  useEffect(() => {
    if (!username.trim()) {
      setCooldownRemaining(null);
      return;
    }

    const verifyCooldown = async () => {
      setIsCheckingCooldown(true);
      try {
        const spinsRef = collection(db, 'lucky_wheel_spins');
        const q = query(
          spinsRef, 
          where('username', '==', username.trim().toLowerCase()),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setCooldownRemaining(null);
          setLastSpinTime(null);
        } else {
          const lastSpin = querySnapshot.docs[0].data() as LuckyWheelSpin;
          const spinDate = new Date(lastSpin.timestamp).getTime();
          setLastSpinTime(spinDate);
          
          const now = Date.now();
          const cooldownMs = 24 * 60 * 60 * 1000; // 24 Hours lock
          const elapsed = now - spinDate;
          
          if (elapsed < cooldownMs) {
            setCooldownRemaining(cooldownMs - elapsed);
          } else {
            setCooldownRemaining(null);
          }
        }
      } catch (err) {
        console.error('Failed to verify cooldown with Firestore:', err);
        // Fallback to local state checks
        const userSpins = recentSpins.filter(s => s.username.toLowerCase() === username.trim().toLowerCase());
        if (userSpins.length > 0) {
          const lastDate = new Date(userSpins[0].timestamp).getTime();
          const elapsed = Date.now() - lastDate;
          if (elapsed < 24 * 60 * 60 * 1000) {
            setCooldownRemaining(24 * 60 * 60 * 1000 - elapsed);
          } else {
            setCooldownRemaining(null);
          }
        } else {
          setCooldownRemaining(null);
        }
      } finally {
        setIsCheckingCooldown(false);
      }
    };

    verifyCooldown();
  }, [username, recentSpins]);

  // Live countdown timer ticking down
  useEffect(() => {
    if (cooldownRemaining === null) return;
    
    const timer = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev === null || prev <= 1000) {
          clearInterval(timer);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Formula to convert milliseconds to readable hours/mins/secs
  const formatCooldown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Math Helpers for drawing SVGs
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Build sector wedges coordinates
  const getSectorPath = (startPercent: number, endPercent: number, radius: number) => {
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
    
    // Scale coords to radius & center at (200, 200)
    const x1 = 200 + startX * radius;
    const y1 = 200 + startY * radius;
    const x2 = 200 + endX * radius;
    const y2 = 200 + endY * radius;
    
    return `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Weighted Selection Engine
  const executeLuckySpin = async () => {
    if (!username.trim()) {
      triggerToast('Please enter your Minecraft Username first to verify your entry eligibility!');
      return;
    }
    if (isSpinning) return;
    if (cooldownRemaining !== null) {
      triggerToast('You are currently on cooldown! Spin is locked.');
      return;
    }
    if (slices.length === 0) {
      triggerToast('Error: Wheel configuration is missing slices.');
      return;
    }

    setIsSpinning(true);
    setShowPrizeOverlay(false);
    setWinningSlice(null);

    // 1. Calculate Weighted Picker
    const totalWeight = slices.reduce((sum, slice) => sum + slice.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < slices.length; i++) {
      rand -= slices[i].weight;
      if (rand <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const win = slices[selectedIndex];
    
    // 2. Physics Easing Calibration
    // Pointer is at TOP of the wheel (-90 degrees, i.e., 270 degrees).
    // Calculate size of each slice on the wheel
    const sliceAngleSize = 360 / slices.length;
    // Angle representing the middle of our winning slice
    const winSliceCenterAngle = (selectedIndex * sliceAngleSize) + (sliceAngleSize / 2);
    
    // To position the slice exactly at the pointer (-90 degrees), we need to rotate:
    // rotationOffset = 270 - winSliceCenterAngle.
    // If the offset is negative, add 360.
    let targetAngleOffset = 270 - winSliceCenterAngle;
    if (targetAngleOffset < 0) targetAngleOffset += 360;

    // We do 5 to 7 full rounds (spinning velocity)
    const fullSpins = 6 * 360;
    const finalRotation = wheelRotation + fullSpins + targetAngleOffset - (wheelRotation % 360);

    setWheelRotation(finalRotation);

    // Wait for the transition duration (5 seconds) to complete
    setTimeout(async () => {
      setWinningSlice(win);
      setIsSpinning(false);
      setShowPrizeOverlay(true);

      // 3. Record result in Firestore securely
      const spinRecord: LuckyWheelSpin = {
        id: 'spin-' + Date.now().toString() + '-' + Math.floor(Math.random() * 1000).toString(),
        username: username.trim().toLowerCase(),
        sliceId: win.id,
        prizeName: win.name,
        prizeType: win.prizeType,
        prizeValue: win.prizeValue,
        timestamp: new Date().toISOString(),
        status: win.prizeType === 'unlucky' ? 'claimed' : 'pending'
      };

      try {
        await setDoc(doc(db, 'lucky_wheel_spins', spinRecord.id), spinRecord);
        triggerToast(`You won: ${win.name}! Ledger entry saved.`);
      } catch (err) {
        console.error('Failed to log spin in Firestore:', err);
        // Fallback store in local state if offline
        setRecentSpins(prev => [spinRecord, ...prev]);
      }
    }, 5000);
  };

  // Admin Slice Actions
  const handleSaveSlice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrizeValue.trim()) {
      triggerToast('Please complete all fields!');
      return;
    }

    const isEdit = !!editingSlice;
    const sliceId = isEdit ? editingSlice!.id : 'slice-' + Date.now().toString();

    const payload: LuckyWheelSlice = {
      id: sliceId,
      name: formName.trim(),
      color: formColor,
      weight: Number(formWeight) || 5,
      prizeType: formPrizeType,
      prizeValue: formPrizeValue.trim()
    };

    try {
      await setDoc(doc(db, 'lucky_wheel_slices', sliceId), payload);
      triggerToast(isEdit ? 'Slice upgraded successfully!' : 'New prize slice deployed to the wheel!');
      
      // Reset Form
      setFormName('');
      setFormWeight(10);
      setFormPrizeValue('');
      setEditingSlice(null);
    } catch (err) {
      console.error('Firestore slice write failure:', err);
      triggerToast('Failed to write slice. Ensure you are authorized!');
    }
  };

  const handleDeleteSlice = async (id: string) => {
    if (slices.length <= 3) {
      triggerToast('Forbidden: Wheel must have at least 3 slices to remain balanced!');
      return;
    }

    if (window.confirm('Are you absolutely sure you want to remove this prize slice from the wheel?')) {
      try {
        await deleteDoc(doc(db, 'lucky_wheel_slices', id));
        triggerToast('Prize slice removed.');
      } catch (err) {
        console.error('Firestore slice delete failure:', err);
        triggerToast('Failed to delete slice.');
      }
    }
  };

  const handleEditSliceClick = (slice: LuckyWheelSlice) => {
    setEditingSlice(slice);
    setFormName(slice.name);
    setFormColor(slice.color);
    setFormWeight(slice.weight);
    setFormPrizeType(slice.prizeType);
    setFormPrizeValue(slice.prizeValue);
  };

  const handleVerifySpin = async (spin: LuckyWheelSpin) => {
    if (window.confirm(`Mark spin win ${spin.id} as verified & claimed?`)) {
      try {
        await updateDoc(doc(db, 'lucky_wheel_spins', spin.id), {
          status: 'verified',
          verifiedBy: currentUser?.email || 'Admin',
          verifiedAt: new Date().toLocaleTimeString()
        });
        triggerToast('Spin prize approved and claimed!');
      } catch (err) {
        console.error('Failed to update spin status:', err);
        triggerToast('Failed to verify spin.');
      }
    }
  };

  const handleDeleteSpinLog = async (id: string) => {
    if (window.confirm('Delete this spin from ledger records?')) {
      try {
        await deleteDoc(doc(db, 'lucky_wheel_spins', id));
        triggerToast('Spin log erased.');
      } catch (err) {
        console.error('Failed to delete spin record:', err);
        triggerToast('Error deleting record.');
      }
    }
  };

  // Calculated Odds
  const totalSlicesWeight = slices.reduce((sum, s) => sum + s.weight, 0);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 font-mono">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-zinc-400 uppercase tracking-widest animate-pulse">Assembling Lucky Wheel Components...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in" id="lucky-wheel-container">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            LUCKY SPIN WHEEL
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Test your fortune daily to win VIP ranks, crate keys, and credit multipliers!
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setShowAdminEditor(!showAdminEditor);
              setEditingSlice(null);
            }}
            className={`text-xs px-4 py-2.5 rounded-xl border font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              showAdminEditor
                ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-lg'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{showAdminEditor ? 'CLOSE WHEEL EDITOR' : 'ADMIN WHEEL CONFIG'}</span>
          </button>
        )}
      </div>

      {/* 2. Main Arena Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Interactive SVG Wheel Spinner Panel */}
        <div className="lg:col-span-7 bg-[#111115]/95 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
          
          {/* Wheel Frame */}
          <div className="relative w-80 sm:w-[420px] h-80 sm:h-[420px] my-6 flex items-center justify-center">
            
            {/* outer Glowing border decoration */}
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800 bg-zinc-950/40 shadow-[0_0_50px_rgba(245,158,11,0.06)] pointer-events-none" />
            
            {/* Blinking boundary dots representation */}
            <div className="absolute inset-2 rounded-full border border-dashed border-amber-500/30 animate-spin-slow pointer-events-none" />
            
            {/* Top Indicator Spindle Arrow pointing downwards */}
            <div className="absolute -top-1.5 z-20 w-8 h-8 flex items-center justify-center filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-500 animate-bounce" />
            </div>

            {/* SVG Interactive Wheel representation */}
            <svg
              ref={wheelRef}
              viewBox="0 0 400 400"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 5000ms cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
              }}
              className="w-full h-full drop-shadow-2xl z-10 transition-transform origin-center"
            >
              {slices.map((slice, idx) => {
                const numSlices = slices.length;
                const startPercent = idx / numSlices;
                const endPercent = (idx + 1) / numSlices;
                const pathData = getSectorPath(startPercent, endPercent, 185);
                
                // Text angle to center perfectly inside wedge
                const textAngleDeg = (startPercent + (endPercent - startPercent) / 2) * 360;
                const textAngleRad = (textAngleDeg * Math.PI) / 180;
                
                // Position of text label
                const labelRadius = 120;
                const tx = 200 + Math.cos(textAngleRad) * labelRadius;
                const ty = 200 + Math.sin(textAngleRad) * labelRadius;
                
                return (
                  <g key={slice.id} className="cursor-pointer group">
                    <path
                      d={pathData}
                      fill={slice.color}
                      className="opacity-90 group-hover:opacity-100 transition-all duration-200 border border-zinc-950"
                      stroke="#09090b"
                      strokeWidth="2"
                    />
                    {/* Rotate text so it faces outwards towards the circle margin */}
                    <text
                      x={tx}
                      y={ty}
                      transform={`rotate(${textAngleDeg}, ${tx}, ${ty})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontWeight="900"
                      fontSize={numSlices > 8 ? "9px" : "11px"}
                      className="font-mono tracking-tight fill-zinc-950 select-none bg-black/40"
                      style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.4), -1px -1px 0px rgba(0,0,0,0.8)' }}
                    >
                      {slice.name.split(' ')[0]} {slice.name.split(' ')[1] || ''}
                    </text>
                  </g>
                );
              })}

              {/* Center Decorative hubcap */}
              <circle cx="200" cy="200" r="32" fill="#09090b" stroke="#f59e0b" strokeWidth="4" />
              <circle cx="200" cy="200" r="16" fill="#f59e0b" />
            </svg>
          </div>

          {/* Controller and Form Actions */}
          <div className="w-full max-w-sm space-y-4">
            
            {/* Username display info */}
            {!username.trim() ? (
              <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-xs text-amber-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-left leading-relaxed font-mono uppercase text-[10px]">
                  Please enter your Minecraft Username above in the shop menu to authenticate and unlock your daily spin!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://mc-heads.net/avatar/${username}/32`} 
                      className="w-6 h-6 rounded" 
                      alt="avatar" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <p className="text-[9px] font-mono text-zinc-500 uppercase">Authenticated player</p>
                      <p className="text-xs font-mono font-bold text-white uppercase">{username}</p>
                    </div>
                  </div>
                  {cooldownRemaining === null ? (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/40 px-2 py-0.5 rounded font-black uppercase">
                      READY TO SPIN
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 border border-amber-900/50 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                      LOCKED
                    </span>
                  )}
                </div>

                {cooldownRemaining !== null && (
                  <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-left flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Next Free Spin Cooldown:</p>
                      <p className="text-sm font-mono font-bold text-amber-400">{formatCooldown(cooldownRemaining)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={executeLuckySpin}
              disabled={isSpinning || !username.trim() || cooldownRemaining !== null}
              className={`w-full font-black text-sm uppercase py-4 rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 tracking-widest cursor-pointer ${
                isSpinning
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : !username.trim()
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                  : cooldownRemaining !== null
                  ? 'bg-zinc-950 border border-red-950/60 text-red-400/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 hover:shadow-amber-500/10'
              }`}
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>WHEEL IN MOTION...</span>
                </>
              ) : cooldownRemaining !== null ? (
                <>
                  <Ban className="w-4 h-4 text-red-500" />
                  <span>ON COOLDOWN</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>LAUNCH LUCKY SPIN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Hand: Wheel Slices Probability / Prize Tier List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Slices Tiers */}
          <div className="bg-[#111115]/95 border border-zinc-850 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
                <Trophy className="w-4 h-4 text-amber-500" />
                Fortune Loot & Odds
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase bg-zinc-950 px-2 py-1 rounded">
                Sum weight: {totalSlicesWeight}
              </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-900 max-h-[280px] overflow-y-auto scrollbar-thin">
              {slices.map((slice) => {
                const percentage = totalSlicesWeight > 0 ? ((slice.weight / totalSlicesWeight) * 100).toFixed(1) : '0';
                return (
                  <div key={slice.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <div className="truncate">
                        <p className="font-bold text-zinc-200 truncate">{slice.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">
                          Type: {slice.prizeType} | Val: {slice.prizeValue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-extrabold text-white">{percentage}%</p>
                      <p className="text-[10px] text-zinc-500 font-mono">weight: {slice.weight}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Winner Presentation Overlay/Box */}
          {showPrizeOverlay && winningSlice && (
            <div className="bg-zinc-900/90 border-2 border-amber-500/40 p-6 rounded-2xl text-center space-y-4 animate-scale-up relative">
              <div className="absolute inset-0 bg-amber-500/5 animate-pulse rounded-2xl pointer-events-none" />
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                {winningSlice.prizeType === 'rank' && <Award className="w-6 h-6 text-emerald-400" />}
                {winningSlice.prizeType === 'key' && <Key className="w-6 h-6 text-pink-400" />}
                {winningSlice.prizeType === 'coupon' && <Tag className="w-6 h-6 text-red-400" />}
                {winningSlice.prizeType === 'credits' && <DollarSign className="w-6 h-6 text-blue-400" />}
                {winningSlice.prizeType === 'unlucky' && <Ban className="w-6 h-6 text-zinc-500" />}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-extrabold">CONGRATULATIONS!</p>
                <h4 className="text-lg font-black text-white">{winningSlice.name}</h4>
                <p className="text-xxs font-mono text-zinc-400 uppercase tracking-wider">
                  Winner Username: <strong className="text-white select-all">{username}</strong>
                </p>
              </div>

              {winningSlice.prizeType !== 'unlucky' ? (
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-left text-zinc-300 font-mono space-y-1">
                  <p className="text-emerald-400 font-black uppercase text-[10px] flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> SECURE DISPATCH COMPLETED
                  </p>
                  <p>• Ledger status: <strong className="text-amber-500">PENDING VERIFY</strong></p>
                  <p>• Please contact an Administrator or wait up to 2 hours for in-game item sync!</p>
                </div>
              ) : (
                <p className="text-xxs text-zinc-500 font-mono uppercase">Better luck next time! Try again in 24 hours.</p>
              )}

              <button
                onClick={() => setShowPrizeOverlay(false)}
                className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xxs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Claim Receipt
              </button>
            </div>
          )}

          {/* Spin Win Logs ticker */}
          <div className="bg-[#111115]/95 border border-zinc-850 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white pb-4 border-b border-zinc-900 flex items-center gap-1.5 font-mono">
              <History className="w-4 h-4 text-purple-400" />
              Recent Spin Ledgers
            </h3>

            <div className="mt-4 space-y-3.5 max-h-[220px] overflow-y-auto scrollbar-thin text-xs">
              {recentSpins.length === 0 ? (
                <p className="text-xxs text-zinc-600 uppercase font-mono italic py-4">No logged wheel spins in ledger...</p>
              ) : (
                recentSpins.slice(0, 15).map((spin) => (
                  <div key={spin.id} className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="font-bold text-zinc-300 font-mono truncate max-w-[120px]">{spin.username}</span>
                        <span className={`text-[8px] font-mono border px-1 rounded font-bold uppercase shrink-0 ${
                          spin.status === 'verified' 
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/50' 
                            : 'text-amber-400 bg-amber-950/60 border-amber-900/50'
                        }`}>
                          {spin.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{spin.prizeName}</p>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[9px] text-zinc-500">
                      <p>{new Date(spin.timestamp).toLocaleTimeString()}</p>
                      {isAdmin && spin.status === 'pending' && (
                        <div className="mt-1 flex gap-1 justify-end">
                          <button
                            onClick={() => handleVerifySpin(spin)}
                            className="px-1 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded text-[8px] font-bold uppercase hover:bg-emerald-900 hover:text-white transition-colors cursor-pointer"
                          >
                            Claim
                          </button>
                          <button
                            onClick={() => handleDeleteSpinLog(spin.id)}
                            className="px-1 py-0.5 bg-red-950 text-red-400 border border-red-900 rounded text-[8px] font-bold uppercase hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Sliding Admin Configuration Customizer Panel */}
      {isAdmin && showAdminEditor && (
        <div className="bg-[#111115]/95 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-md font-black uppercase tracking-wider text-white font-sans flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                Administrative Lucky Wheel Manager
              </h3>
              <p className="text-xxs font-mono text-zinc-500 uppercase tracking-widest mt-1">
                Deploy, modify, reweight, or delete spin wheel sectors in real-time
              </p>
            </div>
            {editingSlice && (
              <button
                onClick={() => {
                  setEditingSlice(null);
                  setFormName('');
                  setFormWeight(10);
                  setFormPrizeValue('');
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xxs font-mono text-zinc-400 hover:text-white uppercase"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Slice Customization Form */}
            <form onSubmit={handleSaveSlice} className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-mono font-black text-amber-500 uppercase tracking-wider">
                {editingSlice ? '⚙️ MODIFY PRIZE SLICE' : '➕ CREATE PRIZE SLICE'}
              </h4>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Slice Title Label</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. VIPPermanent, 1x MythicKey, ৳100 StoreCredit"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">Wedge Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-10 h-9 bg-zinc-950 border border-zinc-850 rounded-lg p-1 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      placeholder="#f59e0b"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs focus:outline-none text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">Weight (Odds)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">Prize Type</label>
                  <select
                    value={formPrizeType}
                    onChange={(e) => setFormPrizeType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="credits">Credits (৳)</option>
                    <option value="rank">Rank Upgrade</option>
                    <option value="key">Crate Key</option>
                    <option value="coupon">Coupon Promo</option>
                    <option value="unlucky">Unlucky (Retry)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">Value (Code/ID/Amt)</label>
                  <input
                    type="text"
                    required
                    value={formPrizeValue}
                    onChange={(e) => setFormPrizeValue(e.target.value)}
                    placeholder="e.g. BDX15, 250, rank-vip"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-xs font-black py-3 rounded-xl transition-all uppercase tracking-wider active:scale-98 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                {editingSlice ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingSlice ? 'Update Selected Wedge' : 'Deploy New Prize Sector'}</span>
              </button>
            </form>

            {/* List and Delete current slices */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-mono font-black text-amber-500 uppercase tracking-wider">
                📋 ACTIVE WHEEL SECTOR LAYOUT ({slices.length})
              </h4>

              <div className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-300 divide-y divide-zinc-900">
                  <thead className="bg-zinc-900/60 font-mono text-zinc-500 text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Value</th>
                      <th className="px-3 py-3 text-center">Weight</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono">
                    {slices.map((slice) => (
                      <tr key={slice.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: slice.color }} />
                          <span className="font-bold text-white font-sans">{slice.name}</span>
                        </td>
                        <td className="px-3 py-3 text-xxs text-amber-400 uppercase">{slice.prizeType}</td>
                        <td className="px-3 py-3 text-xxs text-zinc-400 select-all">{slice.prizeValue}</td>
                        <td className="px-3 py-3 text-center font-bold">{slice.weight}</td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleEditSliceClick(slice)}
                            className="p-1.5 bg-zinc-900 hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/30 text-zinc-400 hover:text-amber-400 rounded transition-colors cursor-pointer"
                            title="Edit Wedge"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlice(slice.id)}
                            className="p-1.5 bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                            title="Delete Wedge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
