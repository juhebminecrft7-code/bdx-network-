import React, { useState, useEffect } from 'react';
import { CartItem, Coupon } from '../types';
import { CheckCircle, CreditCard, ShieldCheck, Lock, AlertCircle, Sparkles, Receipt, X } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  coupon: Coupon | null;
  minecraftUsername: string;
  onClearCart: () => void;
  onCheckoutSuccess?: (details: {
    username: string;
    items: CartItem[];
    total: number;
    method: string;
    discountAmount: number;
    couponCode?: string;
    mfsPhone?: string;
    mfsTrxId?: string;
    cardHolderName?: string;
    cardNumberMasked?: string;
    cryptoWalletAddress?: string;
  }) => void;
}

type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'crypto';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  coupon,
  minecraftUsername,
  onClearCart,
  onCheckoutSuccess
}: CheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  
  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Processing states
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [processingStep, setProcessingStep] = useState(0);

  const processingSteps = [
    'Connecting to secure gateway...',
    'Validating transaction signature...',
    'Checking Minecraft server connection (play.bdxnetwork.net)...',
    `Searching database for player: ${minecraftUsername}...`,
    'Deploying rank perks and crate key packages...',
    'Generating lifetime receipt...'
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'processing') {
      if (processingStep < processingSteps.length) {
        timer = setTimeout(() => {
          setProcessingStep(prev => prev + 1);
        }, 1200);
      } else {
        setStatus('success');
        if (onCheckoutSuccess) {
          const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
          const disc = coupon ? Math.round(subtotal * (coupon.discountPercent / 100)) : 0;
          onCheckoutSuccess({
            username: minecraftUsername,
            items: cartItems,
            total: subtotal - disc,
            method: method,
            discountAmount: disc,
            couponCode: coupon?.code,
            mfsPhone: (method === 'bkash' || method === 'nagad' || method === 'rocket') ? phoneNumber : undefined,
            mfsTrxId: (method === 'bkash' || method === 'nagad' || method === 'rocket') ? trxId : undefined,
            cardHolderName: method === 'card' ? cardName : undefined,
            cardNumberMasked: method === 'card' ? `•••• •••• •••• ${cardNumber.replace(/\s/g, '').slice(-4)}` : undefined,
            cryptoWalletAddress: method === 'crypto' ? 'TYm2YmDHzU9NffS7B77hL6k2QvQ1hVb3uU' : undefined
          });
        }
      }
    }
    return () => clearTimeout(timer);
  }, [status, processingStep, onCheckoutSuccess, cartItems, coupon, method, minecraftUsername]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = coupon
    ? Math.round(subtotal * (coupon.discountPercent / 100))
    : 0;
  const total = subtotal - discountAmount;

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingStep(0);
    setStatus('processing');
  };

  const handleFinish = () => {
    onClearCart();
    onClose();
    setStatus('idle');
    setPhoneNumber('');
    setTrxId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
  };

  const isFormValid = () => {
    if (method === 'card') {
      return cardNumber.length >= 16 && cardExpiry.length >= 4 && cardCvv.length >= 3 && cardName.trim().length > 2;
    }
    if (method === 'crypto') {
      return true; // Auto-simulated
    }
    // Mobile banking (bKash, Nagad, Rocket)
    return phoneNumber.length >= 11 && trxId.trim().length >= 8;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={status === 'idle' ? onClose : undefined} />

      {/* Main Modal Box */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* State 1: Selection & Input form */}
        {status === 'idle' && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5.5 h-5.5 text-amber-500" />
                  Secure Checkout Portal
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Completing purchase for <strong className="text-zinc-200 font-mono">{minecraftUsername}</strong></p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                id="close-checkout-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <form onSubmit={handleSubmitPayment} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column (8 cols): Payment Options */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <span className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-3">Choose Payment Method</span>
                  
                  {/* Grid of Methods */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setMethod('bkash')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        method === 'bkash'
                          ? 'border-pink-500/50 bg-pink-950/10 text-pink-400 font-bold'
                          : 'border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400'
                      }`}
                      id="method-bkash"
                    >
                      <span className="text-xl mb-1">৳</span>
                      <span className="text-xs">bKash Mobile</span>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setMethod('nagad')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        method === 'nagad'
                          ? 'border-orange-500/50 bg-orange-950/10 text-orange-400 font-bold'
                          : 'border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400'
                      }`}
                      id="method-nagad"
                    >
                      <span className="text-xl mb-1">৳</span>
                      <span className="text-xs">Nagad Mobile</span>
                    </button>

                    {/* Rocket */}
                    <button
                      type="button"
                      onClick={() => setMethod('rocket')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        method === 'rocket'
                          ? 'border-indigo-500/50 bg-indigo-950/10 text-indigo-400 font-bold'
                          : 'border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400'
                      }`}
                      id="method-rocket"
                    >
                      <span className="text-xl mb-1">৳</span>
                      <span className="text-xs">Rocket Mobile</span>
                    </button>

                    {/* International Card */}
                    <button
                      type="button"
                      onClick={() => setMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        method === 'card'
                          ? 'border-amber-500/50 bg-amber-950/10 text-amber-400 font-bold'
                          : 'border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400'
                      }`}
                      id="method-card"
                    >
                      <CreditCard className="w-5 h-5 mb-1.5" />
                      <span className="text-xs">Card / PayPal</span>
                    </button>

                    {/* Crypto */}
                    <button
                      type="button"
                      onClick={() => setMethod('crypto')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 md:col-span-2 ${
                        method === 'crypto'
                          ? 'border-yellow-500/50 bg-yellow-950/10 text-yellow-400 font-bold'
                          : 'border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400'
                      }`}
                      id="method-crypto"
                    >
                      <span className="text-lg mb-1">🪙</span>
                      <span className="text-xs">Bitcoin / USDT</span>
                    </button>
                  </div>
                </div>

                {/* Sub-inputs based on payment type */}
                <div className="border-t border-zinc-900 pt-4">
                  {/* 1. Mobile Financial Services (bKash/Nagad/Rocket) */}
                  {(method === 'bkash' || method === 'nagad' || method === 'rocket') && (
                    <div className="space-y-4">
                      {/* Mobile instructions banner */}
                      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 text-xs text-zinc-400 space-y-2">
                        <p className="font-bold text-zinc-200 uppercase tracking-wide text-2xs font-mono">
                          Instructions for {method.toUpperCase()} Payment:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Send Cash Out / Send Money to Personal Number: <strong className="text-amber-400 font-mono">01601821182</strong></li>
                          <li>Enter exact amount: <strong className="text-white font-mono">৳{total.toLocaleString()}</strong></li>
                          <li>Reference note: <strong className="text-zinc-200 font-mono">{minecraftUsername}</strong></li>
                          <li>Fill your sending number and Transaction ID (TrxID) below.</li>
                        </ol>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
                            Sending Mobile Number (MFS)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 017XXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={11}
                            className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                            id="mfs-phone-input"
                          />
                        </div>

                        <div>
                          <label className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
                            Transaction ID (TrxID)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 9B8A7C6D5E"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                            className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-sm text-white uppercase focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono tracking-widest"
                            id="mfs-trxid-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Credit Card */}
                  {method === 'card' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ABDUR RAHMAN"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                          id="card-name-input"
                        />
                      </div>

                      <div>
                        <label className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ''))}
                          className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                          id="card-number-input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                            id="card-expiry-input"
                          />
                        </div>
                        <div>
                          <label className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                            CVV Code
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="***"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                            id="card-cvv-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Cryptocurrency */}
                  {method === 'crypto' && (
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-xs text-zinc-400 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <span className="font-semibold text-zinc-300">Crypto Address (USDT TRC20)</span>
                        <span className="text-[10px] bg-amber-950 border border-amber-800 text-amber-400 px-1.5 rounded font-mono font-bold">USDT</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850 font-mono select-all text-center text-xxs break-all text-zinc-200">
                        TYm2YmDHzU9NffS7B77hL6k2QvQ1hVb3uU
                      </div>
                      <p className="text-xxs text-zinc-500 leading-normal">
                        Verify your transaction amount: <strong className="text-zinc-300">${(total / 115).toFixed(2)} USD</strong> (converted automatically from ৳{total}). Payment is processed automatically upon receiving 1 blockchain confirmation.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): Summary of current Order */}
              <div className="md:col-span-5 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 h-fit space-y-4">
                <span className="text-xxs font-mono uppercase tracking-wider text-zinc-500 block pb-2 border-b border-zinc-900">Order Invoice Summary</span>
                
                {/* List items */}
                <div className="space-y-2 max-h-[140px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-zinc-200">{item.name}</span>
                        <span className="text-zinc-500 text-[10px] ml-1">x{item.quantity}</span>
                      </div>
                      <span className="font-mono text-zinc-300 font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Coupons / totals */}
                <div className="border-t border-zinc-900 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({coupon.discountPercent}%)</span>
                      <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-zinc-900 text-sm font-extrabold text-white">
                    <span>Amount Due</span>
                    <span className="text-lg font-mono text-amber-400">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 text-center leading-normal pt-2 font-mono flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-600" />
                  SSL Encrypted checkout portal
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="md:col-span-12 border-t border-zinc-900 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-lg border border-zinc-850 text-xs transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className="w-2/3 bg-gradient-to-r from-amber-500 to-amber-600 disabled:from-zinc-800 disabled:to-zinc-800 text-zinc-950 disabled:text-zinc-500 font-extrabold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                  id="checkout-confirm-btn"
                >
                  Pay ৳{total.toLocaleString()} Now
                </button>
              </div>

            </form>
          </>
        )}

        {/* State 2: Progress loader */}
        {status === 'processing' && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-6 flex-1 min-h-[400px]">
            {/* Spinning Indicator */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-amber-500 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <span className="text-xl">🛡️</span>
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h4 className="text-lg font-bold text-white">Processing Secure Payment</h4>
              <p className="text-xs text-zinc-400">Please do not refresh the page or click back.</p>
            </div>

            {/* Simulated server logs */}
            <div className="w-full max-w-md bg-zinc-900 rounded-xl p-4 border border-zinc-850 font-mono text-left text-xs text-zinc-400 min-h-[140px] space-y-1.5 shadow-inner">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2">Gate Synchronization Logs</p>
              {processingSteps.map((step, idx) => {
                if (idx < processingStep) {
                  return (
                    <p key={idx} className="text-emerald-400 flex items-center gap-1.5">
                      <span>✓</span> {step}
                    </p>
                  );
                } else if (idx === processingStep) {
                  return (
                    <p key={idx} className="text-amber-400 animate-pulse flex items-center gap-1.5">
                      <span>⚡</span> {step}
                    </p>
                  );
                } else {
                  return (
                    <p key={idx} className="text-zinc-600">
                      <span>○</span> {step}
                    </p>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* State 3: Purchase Success Receipt */}
        {status === 'success' && (
          <div className="p-8 text-center flex flex-col items-center justify-center flex-1 overflow-y-auto max-h-[85vh]">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-amber-500" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">Payment Details Submitted!</h4>
              <p className="text-xs text-zinc-400">Order is pending verification by BDX Network Administrators.</p>
            </div>

            {/* Receipt Box */}
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-xl p-5 text-left mt-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5" /> Secure Order Receipt
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-900/50 px-2 py-0.5 rounded font-extrabold animate-pulse">
                  PENDING VERIFY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                <span className="text-zinc-500">Minecraft Username:</span>
                <span className="text-right font-mono text-white font-semibold">{minecraftUsername}</span>

                <span className="text-zinc-500">Order Reference ID:</span>
                <span className="text-right font-mono text-zinc-300 uppercase">APX-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>

                <span className="text-zinc-500">Payment Gateway:</span>
                <span className="text-right font-mono text-zinc-300 capitalize">{method} Pay</span>

                <span className="text-zinc-500">Total BDT Paid:</span>
                <span className="text-right font-mono text-amber-400 font-extrabold">৳{total.toLocaleString()}</span>
              </div>

              {/* In game instructions */}
              <div className="bg-zinc-950 p-3 rounded border border-zinc-850 space-y-1.5">
                <p className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  How to activate inside Minecraft:
                </p>
                <p className="text-xxs text-zinc-400 leading-relaxed">
                  Log into the server <strong className="text-white">play.bdxnetwork.net</strong>. If you are already online, log out and reconnect. Run the activation check command below in your server chat:
                </p>
                <div className="flex items-center justify-between bg-zinc-900 p-1.5 rounded border border-zinc-800 mt-2 font-mono text-xxs">
                  <code className="text-amber-300 select-all font-bold">/claim {minecraftUsername}</code>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Type in chat</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-2.5 px-8 rounded-xl text-xs tracking-wider uppercase transition-colors"
              id="close-success-receipt-btn"
            >
              Continue Playing
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
