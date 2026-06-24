import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';
import { X, Trash2, Plus, Minus, Tag, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  minecraftUsername: string;
  onUsernameChange: (username: string) => void;
  onCheckout: (finalCoupon: Coupon | null) => void;
  coupons: Coupon[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  minecraftUsername,
  onUsernameChange,
  onCheckout,
  coupons
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  // Compute Subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Compute Coupon discount
  const discountAmount = activeCoupon
    ? Math.round(subtotal * (activeCoupon.discountPercent / 100))
    : 0;

  const total = subtotal - discountAmount;

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    
    if (!code) return;

    const found = coupons.find(c => c.code === code);
    if (found) {
      setActiveCoupon(found);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code!');
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col justify-between shadow-2xl h-full">
          
          {/* Cart Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              Your Shopping Cart
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              id="close-cart-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 space-y-6">
            
            {/* Minecraft Username Verification Card */}
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <label htmlFor="cart-username" className="text-xs font-bold text-zinc-300 block mb-1">
                    Minecraft Username (IGN)
                  </label>
                  <p className="text-[10px] text-zinc-500 leading-tight mb-2.5">
                    Items will be delivered to this username on the server.
                  </p>
                  <input
                    type="text"
                    id="cart-username"
                    value={minecraftUsername}
                    onChange={(e) => onUsernameChange(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="Enter Username"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-md py-1.5 px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                  />
                  {!minecraftUsername && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-400 font-medium text-[10px]">
                      <AlertCircle className="w-3 h-3" />
                      Username is required to proceed!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center mx-auto text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300">Your cart is empty</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                    Add ranks or crate keys from our shop catalog to populate your cart!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold py-2 px-4 rounded border border-zinc-850"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xxs font-mono uppercase tracking-wider text-zinc-500">
                  Cart Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                </p>
                <div className="divide-y divide-zinc-900 bg-zinc-900/30 rounded-xl border border-zinc-900 overflow-hidden">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4">
                      {/* Left: Thumbnail representer */}
                      <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-center text-xl flex-shrink-0">
                        {item.type === 'key' ? item.icon : '🛡️'}
                      </div>

                      {/* Right: details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">{item.name}</h4>
                            <span className="text-[10px] text-zinc-500 uppercase font-semibold font-mono tracking-wider">
                              {item.type === 'rank' ? 'Lifetime Rank' : 'Crate Keys'}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-white font-mono">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Adjusters & Delete */}
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-2.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-850">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
                              id={`cart-minus-${item.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs text-white font-bold font-mono min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
                              id={`cart-plus-${item.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-950 border border-transparent hover:border-zinc-850 transition-colors"
                            title="Remove item"
                            id={`cart-remove-${item.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="border-t border-zinc-800/80 bg-zinc-950 p-6 space-y-4">
              {/* Promo code form */}
              <form onSubmit={applyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                  id="coupon-input"
                />
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700/80 transition-colors"
                  id="apply-coupon-btn"
                >
                  Apply
                </button>
              </form>

              {couponError && <p className="text-xxs text-red-400 font-semibold font-mono">{couponError}</p>}

              {/* Active coupon banner */}
              {activeCoupon && (
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-extrabold text-emerald-400 font-mono tracking-wider">
                        {activeCoupon.code}
                      </span>
                      <p className="text-[10px] text-zinc-400 font-medium">{activeCoupon.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-zinc-500 hover:text-emerald-400 p-1"
                    id="remove-coupon-btn"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Price details breakdown */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">৳{subtotal.toLocaleString()}</span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-xs text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      Discount ({activeCoupon.discountPercent}%)
                    </span>
                    <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2.5 border-t border-zinc-900">
                  <span className="text-sm font-bold text-white">Grand Total</span>
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={() => onCheckout(activeCoupon)}
                disabled={!minecraftUsername}
                className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 disabled:from-zinc-800 disabled:to-zinc-800 text-zinc-950 disabled:text-zinc-500 font-extrabold py-3 rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                id="checkout-trigger-btn"
              >
                <span>Proceed to Checkout</span>
              </button>

              <div className="text-center">
                <p className="text-[9px] text-zinc-600 font-mono flex items-center justify-center gap-1">
                  🔒 Secure checkout • Simulated for demonstration
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
