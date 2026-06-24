export interface Rank {
  id: string;
  name: string;
  price: number; // in BDT (৳)
  powers: string[];
  color: string; // Tailwind text/border/bg color classes
  glowColor: string; // shadow color for premium ranks
  badge?: string;
  description: string;
}

export interface CrateKey {
  id: string;
  name: string;
  price: number; // in BDT (৳) or special string for free ones
  priceText?: string;
  description: string;
  color: string;
  icon: string;
}

export interface CartItem {
  id: string; // can be rank or key id
  type: 'rank' | 'key';
  name: string;
  price: number;
  quantity: number;
  color: string;
  icon?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

export interface ServerStats {
  ip: string;
  onlinePlayers: number;
  maxPlayers: number;
  version: string;
}

export interface Order {
  id: string;
  username: string;
  items: { name: string; quantity: number; price: number; type: 'rank' | 'key' }[];
  total: number;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod: string;
  status: 'pending' | 'delivering' | 'completed';
  timestamp: string;
  // Verification metadata
  mfsPhone?: string;
  mfsTrxId?: string;
  cardHolderName?: string;
  cardNumberMasked?: string;
  cryptoWalletAddress?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface LuckyWheelSlice {
  id: string;
  name: string;
  color: string;
  weight: number;
  prizeType: 'rank' | 'key' | 'coupon' | 'credits' | 'unlucky';
  prizeValue: string;
}

export interface LuckyWheelSpin {
  id: string;
  username: string;
  sliceId: string;
  prizeName: string;
  prizeType: 'rank' | 'key' | 'coupon' | 'credits' | 'unlucky';
  prizeValue: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'claimed';
  verifiedBy?: string;
  verifiedAt?: string;
}

