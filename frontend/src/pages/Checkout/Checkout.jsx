import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  CreditCardIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  MapPinIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";
import { orderService } from "../../services/order.service";
import toast from "react-hot-toast";

/* ── step config ─────────────────────────────────────────── */
const STEPS = [
  { id: 0, label: "Shipping",  icon: TruckIcon              },
  { id: 1, label: "Payment",   icon: CreditCardIcon         },
  { id: 2, label: "Review",    icon: ClipboardDocumentListIcon },
];

/* ── shipping field config ───────────────────────────────── */
const SHIPPING_FIELDS = [
  { key: "fullName",   label: "Full Name",       col: 2, type: "text"  },
  { key: "email",      label: "Email Address",   col: 2, type: "email" },
  { key: "address",    label: "Street Address",  col: 2, type: "text"  },
  { key: "city",       label: "City",            col: 1, type: "text"  },
  { key: "state",      label: "State / Region",  col: 1, type: "text"  },
  { key: "country",    label: "Country",         col: 1, type: "text"  },
  { key: "postalCode", label: "Postal Code",     col: 1, type: "text"  },
  { key: "phone",      label: "Phone Number",    col: 2, type: "tel"   },
];

/* ── input helper ────────────────────────────────────────── */
const Field = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition"
    />
  </div>
);

/* ── progress bar ────────────────────────────────────────── */
const StepBar = ({ current }) => (
  <div className="flex items-center justify-center mb-8">
    {STEPS.map((step, i) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
              i < current  ? "border-primary-500 bg-primary-500 text-white"
              : i === current ? "border-primary-500 bg-primary-50 text-primary-600 ring-4 ring-primary-100"
              :                  "border-gray-200 bg-white text-gray-400"
            }`}
          >
            {i < current ? <CheckCircleIcon className="h-5 w-5" /> : i + 1}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${i <= current ? "text-primary-600" : "text-gray-400"}`}>
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-0.5 w-16 sm:w-24 mx-1 transition-all ${i < current ? "bg-primary-500" : "bg-gray-200"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ── order placed success ────────────────────────────────── */
const OrderSuccess = ({ orderId, onHome }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
      >
        <CheckCircleIcon className="h-11 w-11 text-green-500" />
      </motion.div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h2>
      <p className="text-gray-500 text-sm mb-1">
        Thank you for your order. We'll send a confirmation email shortly.
      </p>
      {orderId && (
        <p className="text-xs text-gray-400 mb-6">
          Order ID: <span className="font-mono font-semibold text-gray-600">{orderId}</span>
        </p>
      )}
      <div className="flex flex-col gap-3">
        <button
          onClick={onHome}
          className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 py-3 text-sm font-bold text-white hover:opacity-90 transition"
        >
          Back to Home
        </button>
        <Link
          to="/profile?tab=orders"
          className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          View My Orders
        </Link>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [step,        setStep]       = useState(0);
  const [placing,     setPlacing]    = useState(false);
  const [orderId,     setOrderId]    = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: "", email: "", address: "", city: "",
    state: "", country: "", postalCode: "", phone: "",
  });

  const [payment, setPayment] = useState({
    method: "card", cardNumber: "", cardName: "", expiry: "", cvv: "",
  });

  /* ── totals ─────────────────────────────────────────────── */
  const subtotal     = getTotalPrice();
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax          = subtotal * 0.1;
  const total        = subtotal + shippingCost + tax;

  /* ── validation ─────────────────────────────────────────── */
  const validateShipping = () => {
    const required = ["fullName", "email", "address", "city", "country", "postalCode"];
    return required.every((k) => shipping[k].trim() !== "");
  };

  /* ── place order ─────────────────────────────────────────── */
  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);
      const items = cartItems.map((i) => ({
        productId: i.productId, quantity: i.quantity, sellerId: i.sellerId,
      }));
      const res = await orderService.create({
        items,
        shippingAddress: shipping,
        paymentMethod: payment.method,
      });
      setOrderId(res?.data?._id || res?.data?.orderId || null);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ── guards ─────────────────────────────────────────────── */
  if (orderPlaced) {
    return <OrderSuccess orderId={orderId} onHome={() => navigate("/")} />;
  }
  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  /* ── order summary sidebar (shared) ─────────────────────── */
  const Summary = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 sticky top-24">
      <h3 className="font-extrabold text-gray-900">Order Summary</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
              <img src={item.image || "https://placehold.co/48"} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-xs font-bold text-gray-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className={shippingCost === 0 ? "text-green-600 font-semibold" : ""}>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-gray-500"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-extrabold text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 justify-center pt-1">
        <LockClosedIcon className="h-3.5 w-3.5" /> Secured by SSL encryption
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* header */}
        <div className="flex items-center gap-4 mb-7">
          <Link to="/cart" className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
            <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
        </div>

        {/* progress */}
        <StepBar current={step} />

        <div className="grid lg:grid-cols-3 gap-7">

          {/* ── Step content ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7"
              >

                {/* ── Step 0: Shipping ─────────────────── */}
                {step === 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center">
                        <MapPinIcon className="h-5 w-5 text-primary-500" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {SHIPPING_FIELDS.map(({ key, label, col, type }) => (
                        <div key={key} className={col === 2 ? "col-span-2" : "col-span-1"}>
                          <Field
                            label={label}
                            type={type}
                            value={shipping[key]}
                            onChange={(e) => setShipping((s) => ({ ...s, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>

                    {/* delivery note */}
                    <div className="mt-5 flex items-start gap-3 bg-blue-50 rounded-xl p-3.5">
                      <TruckIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-600">
                        Standard delivery: 3–5 business days. Express options available at checkout.
                        Orders over $100 ship <strong>free</strong>.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!validateShipping()) { toast.error("Please fill in all required fields."); return; }
                        setStep(1);
                      }}
                      className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-7 py-3 text-sm font-bold text-white hover:opacity-90 transition shadow"
                    >
                      Continue to Payment <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* ── Step 1: Payment ──────────────────── */}
                {step === 1 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center">
                        <CreditCardIcon className="h-5 w-5 text-primary-500" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                    </div>

                    {/* method selector */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { id: "card",   label: "Credit Card",      emoji: "💳" },
                        { id: "paypal", label: "PayPal",            emoji: "🅿️" },
                        { id: "cod",    label: "Cash on Delivery",  emoji: "💵" },
                      ].map(({ id, label, emoji }) => (
                        <button
                          key={id}
                          onClick={() => setPayment((p) => ({ ...p, method: id }))}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition ${
                            payment.method === id
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-2xl">{emoji}</span>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* card form */}
                    {payment.method === "card" && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-5 text-white mb-5">
                          <p className="text-xs opacity-70 mb-4">Credit / Debit Card</p>
                          <p className="font-mono text-lg tracking-widest">
                            {payment.cardNumber.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim() || "•••• •••• •••• ••••"}
                          </p>
                          <div className="flex justify-between mt-3 text-sm">
                            <span>{payment.cardName || "CARD HOLDER"}</span>
                            <span>{payment.expiry || "MM/YY"}</span>
                          </div>
                        </div>
                        <Field label="Cardholder Name" value={payment.cardName} onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value }))} placeholder="John Doe" />
                        <Field label="Card Number" value={payment.cardNumber} onChange={(e) => setPayment((p) => ({ ...p, cardNumber: e.target.value.replace(/\D/g,"").slice(0,16) }))} placeholder="1234 5678 9012 3456" />
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Expiry Date" value={payment.expiry} onChange={(e) => setPayment((p) => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY" />
                          <Field label="CVV" value={payment.cvv} onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.slice(0,4) }))} placeholder="•••" />
                        </div>
                      </div>
                    )}

                    {payment.method === "paypal" && (
                      <div className="text-center py-8 bg-blue-50 rounded-2xl">
                        <p className="text-4xl mb-3">🅿️</p>
                        <p className="text-sm font-semibold text-gray-700">You'll be redirected to PayPal to complete payment.</p>
                      </div>
                    )}

                    {payment.method === "cod" && (
                      <div className="text-center py-8 bg-amber-50 rounded-2xl">
                        <p className="text-4xl mb-3">💵</p>
                        <p className="text-sm font-semibold text-gray-700">Pay with cash when your order is delivered.</p>
                        <p className="text-xs text-gray-400 mt-1">Available for orders under $500.</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setStep(0)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                      >
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-7 py-2.5 text-sm font-bold text-white hover:opacity-90 transition shadow"
                      >
                        Review Order <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Review ───────────────────── */}
                {step === 2 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-primary-500" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Review Your Order</h2>
                    </div>

                    {/* shipping summary */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping To</p>
                        <button onClick={() => setStep(0)} className="text-xs text-primary-500 hover:underline font-medium">Edit</button>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{shipping.fullName}</p>
                      <p className="text-sm text-gray-500">{shipping.address}, {shipping.city}, {shipping.state} {shipping.postalCode}</p>
                      <p className="text-sm text-gray-500">{shipping.country} · {shipping.phone}</p>
                    </div>

                    {/* payment summary */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Payment</p>
                        <button onClick={() => setStep(1)} className="text-xs text-primary-500 hover:underline font-medium">Edit</button>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 capitalize">
                        {payment.method === "card" ? `Card ending in ${payment.cardNumber.slice(-4) || "••••"}` : payment.method === "paypal" ? "PayPal" : "Cash on Delivery"}
                      </p>
                    </div>

                    {/* items */}
                    <div className="space-y-3 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                          <img src={item.image || "https://placehold.co/48"} alt={item.title} className="h-12 w-12 rounded-xl object-cover border border-gray-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* security note */}
                    <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3.5 mb-5">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500 shrink-0" />
                      <p className="text-xs text-green-700">Your payment is protected by 256-bit SSL encryption.</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                      >
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={placing}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 py-3 text-sm font-bold text-white hover:opacity-90 shadow transition disabled:opacity-60"
                      >
                        {placing ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Placing Order…
                          </>
                        ) : (
                          <>Place Order 🎉 · ${total.toFixed(2)}</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Summary sidebar ──────────────────────────── */}
          <div className="lg:col-span-1">
            <Summary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
