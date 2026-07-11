import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { StarIcon, ShoppingCartIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useCart } from "../../../context/CartContext";
import { useState } from "react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success("Added to cart!");
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-primary-200 hover:shadow-xl transition-all"
    >
      <Link to={`/products/${product._id}`}>
        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img
            src={product.images?.[0] || "https://via.placeholder.com/400x300?text=Product"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              Save {discount}%
            </span>
          )}
          {product.isGroupBuyable && (
            <span className="absolute top-3 right-3 bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              Group Deal
            </span>
          )}
          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted((v) => !v); }}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            {wishlisted
              ? <HeartSolid className="h-5 w-5 text-red-500" />
              : <HeartIcon className="h-5 w-5 text-gray-400" />
            }
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wide">{product.category}</p>
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-2">({product.reviewCount || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-gray-900">
              ${(product.discountPrice || product.price)?.toFixed(2)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.price?.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-5 pb-5">
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 font-bold text-sm transition-colors shadow-md hover:shadow-lg"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
