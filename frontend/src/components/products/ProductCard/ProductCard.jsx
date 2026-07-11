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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <Link to={`/products/${product._id}`}>
        {/* Image */}
        <div className="relative h-48 bg-gray-50 overflow-hidden">
          <img
            src={product.images?.[0] || "https://via.placeholder.com/400x300?text=Product"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isGroupBuyable && (
            <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Group Buy
            </span>
          )}
          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted((v) => !v); }}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform"
          >
            {wishlisted
              ? <HeartSolid className="h-4 w-4 text-red-500" />
              : <HeartIcon className="h-4 w-4 text-gray-400" />
            }
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-primary-500 font-medium mb-1 capitalize">{product.category}</p>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
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
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white font-medium text-sm transition-colors"
        >
          <ShoppingCartIcon className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
