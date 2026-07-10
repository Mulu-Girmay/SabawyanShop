import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrashIcon, ShoppingBagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Discover amazing products and start shopping!</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
          >
            Browse Products <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Shopping Cart
            <span className="ml-2 text-sm text-gray-400 font-normal">({getTotalItems()} items)</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-600 transition"
          >
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
              >
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={item.image || "https://via.placeholder.com/80?text=Item"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
                  <p className="text-primary-600 font-bold mt-1">${item.price?.toFixed(2)}</p>
                </div>
                {/* Quantity */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    −
                  </button>
                  <span className="px-3 py-2 text-sm font-medium border-x border-gray-200">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-gray-300 hover:text-red-500 transition"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    🎉 You qualify for free shipping!
                  </p>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <Link
                to="/products"
                className="block text-center text-sm text-gray-400 hover:text-primary-500 mt-3 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
