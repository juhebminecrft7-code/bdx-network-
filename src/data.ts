import { Rank, CrateKey, Coupon } from './types';

export const RANKS: Rank[] = [
  {
    id: 'rank-vip',
    name: 'VIP',
    price: 50,
    powers: ['/hat command', '/craft command', '1 Home setting limit'],
    color: 'emerald',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    badge: 'Starter',
    description: 'Perfect starter rank to stand out and craft on the go.'
  },
  {
    id: 'rank-vip-plus',
    name: 'VIP+',
    price: 100,
    powers: ['2 Home setting limit', '/feed command', '/hat & /craft commands'],
    color: 'teal',
    glowColor: 'rgba(20, 184, 166, 0.2)',
    badge: 'Popular',
    description: 'Keep your hunger filled automatically and set an extra home.'
  },
  {
    id: 'rank-mvp',
    name: 'MVP',
    price: 150,
    powers: ['3 Home setting limit', '/ec (Ender Chest) anywhere', 'All VIP+ commands'],
    color: 'cyan',
    glowColor: 'rgba(6, 182, 212, 0.2)',
    description: 'Access your ender chest from anywhere in the world.'
  },
  {
    id: 'rank-mvp-plus',
    name: 'MVP+',
    price: 250,
    powers: ['5 Home setting limit', 'Starter Kit access', '/ec & /feed commands'],
    color: 'sky',
    glowColor: 'rgba(14, 165, 233, 0.2)',
    badge: 'Best Value',
    description: 'Grab a high-quality starter gear kit and set up 5 homes.'
  },
  {
    id: 'rank-elite',
    name: 'Elite',
    price: 400,
    powers: ['7 Home setting limit', 'Colored chat text (&a, &b, etc.)', 'Starter Kit access'],
    color: 'blue',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    description: 'Speak in striking colors and show off your elite status.'
  },
  {
    id: 'rank-titan',
    name: 'Titan',
    price: 600,
    powers: ['10 Home setting limit', '/anvil portable command', 'Colored chat permissions'],
    color: 'indigo',
    glowColor: 'rgba(99, 102, 241, 0.2)',
    description: 'Repair and rename items on the fly with a portable anvil.'
  },
  {
    id: 'rank-overlord',
    name: 'Overlord',
    price: 850,
    powers: ['/repair command (no cost)', 'Custom particle trails', '10 Home limit'],
    color: 'violet',
    glowColor: 'rgba(139, 92, 246, 0.2)',
    description: 'Infinite item repair and gorgeous player particle trails.'
  },
  {
    id: 'rank-emperor',
    name: 'Emperor',
    price: 1200,
    powers: ['Custom join message', '/repair & /anvil commands', '12 Home limit'],
    color: 'fuchsia',
    glowColor: 'rgba(217, 70, 239, 0.2)',
    description: 'Announce your grand arrival to the whole server in style.'
  },
  {
    id: 'rank-supreme',
    name: 'Supreme',
    price: 1700,
    powers: ['/fly command at Spawn', 'Premium Kit access', 'Custom join message'],
    color: 'pink',
    glowColor: 'rgba(236, 72, 153, 0.2)',
    description: 'Glide effortlessly around spawn and receive a premium item kit.'
  },
  {
    id: 'rank-mythic',
    name: 'Mythic',
    price: 2500,
    powers: ['1x Mythic Key given per week', '/fly at spawn', 'Premium Kit access'],
    color: 'rose',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    badge: 'Epic perk',
    description: 'Receive a regular supply of highly coveted Mythic Keys.'
  },
  {
    id: 'rank-celestial',
    name: 'Celestial',
    price: 3500,
    powers: ['Access to pets & trails', 'Custom cosmetic menu', '1 Mythic Key/week'],
    color: 'orange',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    description: 'Unlock a massive library of companions, trails, and custom styles.'
  },
  {
    id: 'rank-divine',
    name: 'Divine',
    price: 5000,
    powers: ['/heal command (30s cooldown)', 'Exclusive [Divine] tag', 'Cosmetics bundle'],
    color: 'amber',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    badge: 'Staff favorite',
    description: 'Instantly heal yourself and flex your divine name tag.'
  },
  {
    id: 'rank-immortal',
    name: 'Immortal',
    price: 7000,
    powers: ['2x Mythic Keys given per week', '/heal & /fly anywhere', 'Exclusive immortal prefix'],
    color: 'yellow',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    description: 'Double your weekly legendary loot and rise as an undying legend.'
  },
  {
    id: 'rank-omega',
    name: 'Omega',
    price: 10000,
    powers: ['All lower donor perks', 'Special [Omega] prefix', '3x Mythic Keys/week'],
    color: 'purple',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'Extreme',
    description: 'Ultimate perk consolidation with an incredible custom chat prefix.'
  },
  {
    id: 'rank-apex',
    name: 'Apex 👑',
    price: 15000,
    powers: ['All perks from all ranks', '5x Apex Keys given per month', 'Unique [Apex] glow tag'],
    color: 'red',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    badge: 'Supreme King 👑',
    description: 'The absolute pinnacle of authority. Rule the server with five monthly Apex keys and a crown tag.'
  }
];

export const CRATE_KEYS: CrateKey[] = [
  {
    id: 'key-vote',
    name: 'Vote Key',
    price: 0,
    priceText: '1 Vote',
    description: 'Earned by supporting our server on Minecraft server listing sites.',
    color: 'emerald',
    icon: '🗳️'
  },
  {
    id: 'key-rare',
    name: 'Rare Key',
    price: 30,
    description: 'Unlocks rare tools, small claim blocks, and mid-tier resource bundles.',
    color: 'blue',
    icon: '🔑'
  },
  {
    id: 'key-epic',
    name: 'Epic Key',
    price: 50,
    description: 'Unlocks enchanted tools, custom cosmetic hats, and currency boosts.',
    color: 'purple',
    icon: '🔮'
  },
  {
    id: 'key-legendary',
    name: 'Legendary Key',
    price: 100,
    description: 'Unlocks legendary netherite weapons, rare titles, and custom pets.',
    color: 'amber',
    icon: '💎'
  },
  {
    id: 'key-mythic',
    name: 'Mythic Key',
    price: 200,
    description: 'Contains mythic sets, massive money vouchers, and fly-time tokens.',
    color: 'rose',
    icon: '🌟'
  },
  {
    id: 'key-apex',
    name: 'Apex Key',
    price: 500,
    description: 'The absolute best rewards including rank upgrades, spawners, and infinite items.',
    color: 'red',
    icon: '👑'
  }
];

export const COUPONS: Coupon[] = [
  { code: 'BDX25', discountPercent: 25, description: 'Celebrate our new BDX Network store with 25% off!' },
  { code: 'MINECRAFT', discountPercent: 10, description: 'Standard 10% community discount.' },
  { code: 'BASHABASH', discountPercent: 15, description: 'Exclusive 15% discount code.' }
];

export const FAQS = [
  {
    q: 'How long does it take to receive my purchase?',
    a: 'Most purchases are processed instantly! In rare cases, it can take up to 10-15 minutes. Make sure you are logged onto the Minecraft server when buying to receive your rewards immediately.'
  },
  {
    q: 'Do ranks expire?',
    a: 'No! All donor ranks sold on our store are lifetime purchases. You will keep your benefits forever unless specified otherwise.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'For local players, we fully support bKash, Nagad, and Rocket mobile banking. We also accept international Credit/Debit Cards, PayPal, and Cryptocurrencies through our simulated gateway.'
  },
  {
    q: 'What if I entered the wrong Minecraft username?',
    a: 'If you made a typo, please contact our support team immediately on Discord with your order details and payment screenshot, and we will transfer the perks to your correct account.'
  },
  {
    q: 'Can I upgrade my rank later?',
    a: 'Yes! Our system supports rank upgrades. You only pay the price difference between your current rank and the new rank.'
  }
];

export const RECENT_PURCHASES = [
  { username: 'SheikhCrafty', item: 'Apex 👑 Rank', time: '2 mins ago', price: 15000 },
  { username: 'Riyad_007', item: '5x Mythic Key', time: '8 mins ago', price: 1000 },
  { username: 'Anik_X', item: 'Titan Rank', time: '15 mins ago', price: 600 },
  { username: 'TahsinZ', item: 'Legendary Key', time: '24 mins ago', price: 100 },
  { username: 'Limon_Playz', item: 'VIP+ Rank', time: '41 mins ago', price: 100 }
];
