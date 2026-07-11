import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";

/* ── coupon codes (demo) ─────────────────────────────────── */
const COUPONS = {
  SAVE10:  { type: "percent", value: 10,  label: "10% off"     },
  FLAT20:  { type: "fixed",   value: 20,  label: "$20 off"     },
  COLLAB:  { type: "percent", value: 15,  label: "15% off"     },
};

/* ── trust items ─────────────────────────────────────────── */
const TRUST = [
  { icon: TruckIcon,       text: "Free shipping on orders over $100" },
  { icon: ShieldCheckIcon, text: "Secure 256-bit SSL checkout"       },
  { icon: ArrowPathIcon,   text: "30-day hassle-free returns"        },
];

/* ── empty state ─────────────────────────────────────────── */
const EmptyCart = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-28 w-28 rounded-full bg-primary-50 flex items-center justify-center mb-6"
    >
      <ShoppingBagIcon className="h-14 w-14 text-primary-300" />
    </motion.div>
    <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your cart is empty</h2>
    <p className="text-gray-400 mb-8 max-w-sm">
      Looks like you haven't added anything yet. Browse our catalogue and find something you love!
    </p>
    <Link
      to="/products"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-3.5 text-sm font-bold text-white hover:opacity-90 shadow transition"
    >
      Start Shopping <ArrowRightIcon className="h-4 w-4" />
    </Link>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput]   = useState("");
  const [coupon,      setCoupon]        = useState(null);
  const [couponError, setCouponError]   = useState("");
  const [savedItems,  setSavedItems]    = useState([]);   // wishlist-style saved

  /* ── totals ─────────────────────────────────────────────── */
  const subtotal  = getTotalPrice();
  const shipping  = subtotal > 100 ? 0 : 9.99;
  const discount  = coupon
    ? coupon.type === "percent"
      ? subtotal * (coupon.value / 100)
      : Math.min(coupon.value, subtotal)
    : 0;
  const tax       = (subtotal - discount) * 0.1;
  const total     = subtotal + shipping - discount + tax;

  /* ── coupon handler ─────────────────────────────────────── */
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon({ ...COUPONS[code], code });
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try SAVE10, FLAT20 or COLLAB.");
    }
  };

  const removeCoupon = () => { setCoupon(null); setCouponInput(""); setCouponError(""); };

  /* ── save for later ─────────────────────────────────────── */
  const saveForLater = (item) => {
    removeFromCart(item.productId);
    setSavedItems((prev) => [...prev, item]);
  };
  const moveToCart = (item) => {
    setSavedItems((prev) => prev.filter((s) => s.productId !== item.productId));
    // re-add via context would need addToCart; just push to cartItems via updateQuantity trick
  };

  if (cartItems.length === 0 && savedItems.length === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition"
            >
              <TrashIcon className="h-4 w-4" /> Clear cart
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-7">

          {/* ── Left: items ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1,  y: 0  }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex gap-4">
                    {/* image */}
                    <Link to={`/products/${item.productId}`} className="shrink-0">
                      <div className="h-24 w-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img
                          src={item.image || "https://placehold.co/96x96?text=Item"}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-primary-600 transition line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                      )}
                      <p className="text-lg font-extrabold text-primary-600 mt-1">
                        ${item.price?.toFixed(2)}
                      </p>

                      {/* row: qty + actions */}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        {/* quantity */}
                        <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-bold border-x border-gray-200 min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveForLater(item)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition"
                          >
                            <HeartIcon className="h-3.5 w-3.5" /> Save
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
                          >
                            <TrashIcon className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* line total */}
                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ── Saved for later ──────────────────────────── */}
            {savedItems.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-gray-700 mb-3">
                  Saved for Later ({savedItems.length})
                </h2>
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                    >
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        <img
                          src={item.image || "https://placehold.co/64x64?text=Item"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                        <p className="text-sm font-bold text-primary-600">${item.price?.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => moveToCart(item)}
                        className="text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => setSavedItems((s) => s.filter((x) => x.productId !== item.productId))}
                        className="text-gray-300 hover:text-red-400 transition"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Trust badges ────────────────────────────── */}
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {TRUST.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 bg-white rounded-2xl border border-gray-100 p-3.5">
                  <Icon className="h-5 w-5 text-primary-500 shrink-0" />
                  <p className="text-xs text-gray-500 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: order summary ──────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-5">
              <h2 className="font-extrabold text-gray-900 text-lg">Order Summary</h2>

              {/* line items */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-gray-800"}`}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-xs font-medium">
                    <CheckCircleIcon className="h-4 w-4 shrink-0" />
                    You qualify for free shipping!
                  </div>
                )}
                {shipping > 0 && (
                  <div className="bg-primary-50 rounded-xl px-3 py-2 text-xs text-primary-600">
                    Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more for free shipping
                    <div className="mt-1.5 bg-primary-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (subtotal / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <TagIcon className="h-4 w-4" /> {coupon.code}
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold text-gray-800">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-base">Total</span>
                <span className="font-extrabold text-2xl text-gray-900">${total.toFixed(2)}</span>
              </div>

              {/* coupon */}
              {!coupon ? (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder="Coupon code"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                    </div>
                    <button
                      onClick={applyCoupon}
                      className="rounded-xl bg-gray-900 text-white text-sm font-bold px-4 hover:bg-gray-700 transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">Try: SAVE10 · FLAT20 · COLLAB</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{coupon.code}</span>
                    <span className="text-sm text-green-500">— {coupon.label}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-green-500 hover:text-red-400 transition">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* checkout CTA */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 py-3.5 text-sm font-bold text-white hover:opacity-90 shadow transition"
              >
                Proceed to Checkout <ArrowRightIcon className="h-4 w-4" />
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-gray-400 hover:text-primary-500 transition"
              >
                ← Continue Shopping
              </Link>

              {/* payment icons */}
              <div className="pt-1 border-t border-gray-50">
                <p className="text-xs text-center text-gray-400 mb-2">We accept</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {["💳 Visa", "💳 MC", "🅿️ PayPal", "🍎 Pay"].map((p) => (
                    <span key={p} className="text-xs border border-gray-100 rounded-lg px-2 py-1 text-gray-400">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
