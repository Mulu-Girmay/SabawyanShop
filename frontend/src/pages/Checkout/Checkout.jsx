import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircleIcon, CreditCardIcon, TruckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";
import { orderService } from "../../services/order.service";
import toast from "react-hot-toast";

const STEPS = ["Shipping", "Payment", "Review"];

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
  });

  const [payment, setPayment] = useState({ method: "card", cardNumber: "", expiry: "", cvv: "" });

  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);
      const items = cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        sellerId: i.sellerId,
      }));
      await orderService.create({
        items,
        shippingAddress: shipping,
        paymentMethod: payment.method,
      });
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full mx-4 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-8">Thank you for your order. You'll receive a confirmation email shortly.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 text-sm font-medium ${i <= step ? "text-primary-600" : "text-gray-400"}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? "bg-primary-500 text-white" : i === step ? "bg-primary-100 text-primary-600 ring-2 ring-primary-500" : "bg-gray-100 text-gray-400"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-12 ${i < step ? "bg-primary-500" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step content */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              {/* Step 0: Shipping */}
              {step === 0 && (
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-6">
                    <TruckIcon className="h-5 w-5 text-primary-500" /> Shipping Address
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Full Name", col: 2 },
                      { key: "address", label: "Street Address", col: 2 },
                      { key: "city", label: "City", col: 1 },
                      { key: "state", label: "State", col: 1 },
                      { key: "country", label: "Country", col: 1 },
                      { key: "postalCode", label: "Postal Code", col: 1 },
                      { key: "phone", label: "Phone Number", col: 2 },
                    ].map(({ key, label, col }) => (
                      <div key={key} className={col === 2 ? "col-span-2" : "col-span-1"}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                        <input
                          type="text"
                          value={shipping[key]}
                          onChange={(e) => setShipping((s) => ({ ...s, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-6">
                    <CreditCardIcon className="h-5 w-5 text-primary-500" /> Payment Method
                  </h2>
                  <div className="flex gap-3 mb-6">
                    {["card", "paypal", "cod"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayment((p) => ({ ...p, method: m }))}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition ${payment.method === m ? "border-primary-500 bg-primary-50 text-primary-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                      >
                        {m === "cod" ? "Cash on Delivery" : m === "paypal" ? "PayPal" : "Credit Card"}
                      </button>
                    ))}
                  </div>
                  {payment.method === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={payment.cardNumber}
                          onChange={(e) => setPayment((p) => ({ ...p, cardNumber: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={payment.expiry}
                            onChange={(e) => setPayment((p) => ({ ...p, expiry: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={payment.cvv}
                            onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)} className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">← Back</button>
                    <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition">Review Order →</button>
                  </div>
                </div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-6">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-primary-500" /> Review Order
                  </h2>
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 py-2 border-b border-gray-50">
                        <img src={item.image || "https://via.placeholder.com/48"} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">← Back</button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {placing ? "Placing Order..." : "Place Order 🎉"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order summary sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
