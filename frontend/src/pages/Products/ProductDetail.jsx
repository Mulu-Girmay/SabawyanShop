import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useCart } from "../../context/CartContext";
import { productService } from "../../services/product.service";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.data);
    } catch (err) {
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity}x ${product.title} to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 animate-pulse">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-2xl h-96" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
              <div className="h-6 bg-gray-200 rounded-xl w-1/2" />
              <div className="h-24 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Product Not Found</h2>
          <Link to="/products" className="mt-4 inline-block text-primary-500 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ["https://via.placeholder.com/600x500?text=Product"];
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-500">Products</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm aspect-square">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
              {discount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition ${i === selectedImage ? "border-primary-500" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-primary-500 font-medium capitalize mb-1">{product.category}</p>
              <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-500">{product.viewCount || 0} views</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${(product.discountPrice || product.price)?.toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-lg text-gray-400 line-through">${product.price?.toFixed(2)}</span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-medium ${product.quantity > 10 ? "text-green-600" : product.quantity > 0 ? "text-orange-500" : "text-red-500"}`}>
              {product.quantity > 10 ? "✓ In Stock" : product.quantity > 0 ? `⚠ Only ${product.quantity} left` : "✗ Out of Stock"}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-medium border-x border-gray-200">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={() => setWishlisted((v) => !v)}
                className="p-3 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition"
              >
                {wishlisted
                  ? <HeartSolid className="h-5 w-5 text-red-500" />
                  : <HeartIcon className="h-5 w-5 text-gray-400" />
                }
              </button>
              <button className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                <ShareIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Group Buy */}
            {product.isGroupBuyable && (
              <Link
                to={`/group-buy?product=${product._id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 hover:from-primary-100 transition"
              >
                <UsersIcon className="h-6 w-6 text-primary-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary-700">Start a Group Buy</p>
                  <p className="text-xs text-primary-500">Save up to {product.groupBuySettings?.discountPercentage || 10}% with friends</p>
                </div>
              </Link>
            )}

            {/* Seller */}
            {product.seller && (
              <Link
                to={`/profile/${product.seller.username}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
              >
                <img
                  src={product.seller.avatar || `https://ui-avatars.com/api/?name=${product.seller.fullName}`}
                  alt={product.seller.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.seller.fullName}</p>
                  <p className="text-xs text-gray-400">@{product.seller.username}</p>
                </div>
                <Link
                  to={`/chat?seller=${product.seller._id}`}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  Chat
                </Link>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["description", "specs", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition ${activeTab === tab ? "border-b-2 border-primary-500 text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "description" && (
              <p className="text-gray-600 leading-relaxed">{product.description || "No description available."}</p>
            )}
            {activeTab === "specs" && (
              <div className="space-y-2">
                {product.specifications?.length > 0 ? (
                  product.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-4 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm font-medium text-gray-700 w-32 shrink-0">{spec.key}</span>
                      <span className="text-sm text-gray-500">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No specifications available.</p>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
