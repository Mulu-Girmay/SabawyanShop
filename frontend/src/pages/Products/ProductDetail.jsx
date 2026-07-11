import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  StarIcon as StarOutline,
  CheckBadgeIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import { productService } from "../../services/product.service";
import toast from "react-hot-toast";

/* ── star row helper ─────────────────────────────────────── */
const Stars = ({ rating = 0, size = "h-4 w-4" }) => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, i) =>
      i < Math.floor(rating)
        ? <StarSolid  key={i} className={`${size} text-yellow-400`} />
        : <StarOutline key={i} className={`${size} text-gray-200`}  />
    )}
  </div>
);

/* ── tab ids ─────────────────────────────────────────────── */
const TABS = ["Description", "Specifications", "Reviews"];

/* ── mock reviews ────────────────────────────────────────── */
const MOCK_REVIEWS = [
  { id: 1, user: "Alex M.",   avatar: "AM", stars: 5, date: "Jun 2026", text: "Absolutely love this product! Build quality is excellent and delivery was super fast."  },
  { id: 2, user: "Priya K.",  avatar: "PK", stars: 4, date: "May 2026", text: "Great value for money. Would have given 5 stars but packaging could be better."         },
  { id: 3, user: "Carlos B.", avatar: "CB", stars: 5, date: "Apr 2026", text: "Top notch. Exactly as described. Will definitely buy from this seller again."           },
];

/* ══════════════════════════════════════════════════════════ */
const ProductDetail = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { addToCart }   = useCart();

  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [imgIdx,      setImgIdx]      = useState(0);
  const [qty,         setQty]         = useState(1);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [activeTab,   setActiveTab]   = useState("Description");
  const [zoomed,      setZoomed]      = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.data);
      /* fetch related */
      if (res.data?.category) {
        const rel = await productService.getAll({ category: res.data.category, limit: 4 });
        setRelated((rel.data || []).filter((p) => p._id !== id));
      }
    } catch {
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${qty}× ${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/checkout");
  };

  /* ── loading skeleton ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-3xl aspect-square" />
            <div className="space-y-4 py-2">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-1/2 mt-4" />
              <div className="h-20 bg-gray-200 rounded mt-4" />
              <div className="h-12 bg-gray-200 rounded mt-6" />
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
          <Link to="/products" className="mt-4 inline-block text-primary-500 hover:underline">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const images  = product.images?.length ? product.images : ["https://placehold.co/600x500?text=Product"];
  const price   = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;
  const stockStatus =
    product.quantity > 10 ? { label: "In Stock", cls: "text-green-600 bg-green-50" }
    : product.quantity > 0  ? { label: `Only ${product.quantity} left`, cls: "text-orange-500 bg-orange-50" }
    :                          { label: "Out of Stock",  cls: "text-red-500 bg-red-50" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-7 flex-wrap">
          {[["Home", "/"], ["Products", "/products"], [product.category, `/products?category=${product.category}`]].map(([label, href], i, arr) => (
            <React.Fragment key={href}>
              <Link to={href} className="hover:text-primary-500 transition">{label}</Link>
              {i < arr.length - 1 && <ChevronRightIcon className="h-3 w-3" />}
            </React.Fragment>
          ))}
          <ChevronRightIcon className="h-3 w-3" />
          <span className="text-gray-600 font-medium truncate max-w-[160px]">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-14">

          {/* ── Image gallery ───────────────────────────────── */}
          <div className="space-y-3">
            <div
              className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 aspect-square cursor-zoom-in"
              onClick={() => setZoomed(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={product.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain p-6"
                />
              </AnimatePresence>

              {discount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  -{discount}%
                </span>
              )}
              {product.isGroupBuyable && (
                <span className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  <UsersIcon className="h-3 w-3" /> Group Buy
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>

            {/* thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition ${i === imgIdx ? "border-primary-500 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ─────────────────────────────────── */}
          <div className="space-y-5">
            {/* category + title */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-500">{product.category}</span>
              <h1 className="mt-1.5 text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">{product.title}</h1>
            </div>

            {/* rating row */}
            <div className="flex flex-wrap items-center gap-3">
              <Stars rating={product.rating} />
              <span className="text-sm font-semibold text-gray-700">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.reviewCount || 0} reviews)</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-400">{product.viewCount || 0} views</span>
              {product.quantity > 0 && (
                <>
                  <span className="text-gray-200">|</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockStatus.cls}`}>
                    {stockStatus.label}
                  </span>
                </>
              )}
            </div>

            {/* price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-gray-900">${price?.toFixed(2)}</span>
              {product.discountPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.price?.toFixed(2)}</span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* short description */}
            {product.description && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{product.description}</p>
            )}

            <hr className="border-gray-100" />

            {/* quantity selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-gray-50 transition text-gray-600"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold border-x border-gray-200 py-2.5">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity || 99, q + 1))}
                  className="p-2.5 hover:bg-gray-50 transition text-gray-600"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">{product.quantity} available</span>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-primary-500 bg-primary-50 py-3 text-sm font-bold text-primary-600 hover:bg-primary-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 py-3 text-sm font-bold text-white hover:opacity-90 shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={() => setWishlisted((v) => !v)}
                className={`p-3 rounded-xl border-2 transition ${wishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-400"}`}
              >
                {wishlisted ? <HeartSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
              </button>
              <button className="p-3 rounded-xl border-2 border-gray-200 text-gray-400 hover:bg-gray-50 transition">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>

            {/* group buy promo */}
            {product.isGroupBuyable && (
              <Link
                to={`/group-buy?product=${product._id}`}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-4 hover:from-primary-100 transition group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
                  <UsersIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary-700">Start or Join a Group Buy</p>
                  <p className="text-xs text-primary-500 mt-0.5">
                    Save up to {product.groupBuySettings?.discountPercentage || 10}% when buying together
                  </p>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {/* trust row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: TruckIcon,       label: "Free Delivery",  sub: "Orders over $100" },
                { icon: ArrowPathIcon,   label: "Easy Returns",   sub: "30-day policy"    },
                { icon: ShieldCheckIcon, label: "Secure",         sub: "SSL encrypted"    },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-3 gap-1">
                  <Icon className="h-5 w-5 text-primary-500" />
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* seller card */}
            {product.seller && (
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                <img
                  src={product.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.fullName)}&background=6C63FF&color=fff`}
                  alt={product.seller.fullName}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-primary-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.seller.fullName}</p>
                    <CheckBadgeIcon className="h-4 w-4 text-primary-500 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400">@{product.seller.username}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/profile/${product.seller.username}`}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Profile
                  </Link>
                  <Link
                    to={`/chat?seller=${product.seller._id}`}
                    className="rounded-xl bg-primary-50 border border-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition flex items-center gap-1"
                  >
                    <ChatBubbleLeftIcon className="h-3.5 w-3.5" /> Chat
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-14">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-7 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${activeTab === tab ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "Description" && (
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {product.description || "No description available for this product."}
                  </p>
                )}

                {activeTab === "Specifications" && (
                  product.specifications?.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {product.specifications.map((spec, i) => (
                        <div key={i} className="flex gap-6 py-3">
                          <span className="w-36 shrink-0 text-sm font-semibold text-gray-700">{spec.key}</span>
                          <span className="text-sm text-gray-500">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No specifications available.</p>
                  )
                )}

                {activeTab === "Reviews" && (
                  <div className="space-y-5">
                    {/* rating summary */}
                    <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-2xl mb-6">
                      <div className="text-center">
                        <p className="text-5xl font-extrabold text-gray-900">{(product.rating || 4.6).toFixed(1)}</p>
                        <Stars rating={product.rating || 4.6} size="h-5 w-5" />
                        <p className="text-xs text-gray-400 mt-1">{product.reviewCount || MOCK_REVIEWS.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map((star) => {
                          const pct = star === 5 ? 65 : star === 4 ? 22 : star === 3 ? 8 : star === 2 ? 3 : 2;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-4 text-right text-gray-500">{star}</span>
                              <StarSolid className="h-3 w-3 text-yellow-400 shrink-0" />
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-gray-400 w-7 text-right">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {MOCK_REVIEWS.map((r) => (
                      <div key={r.id} className="flex gap-4 pb-5 border-b border-gray-50 last:border-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {r.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900">{r.user}</p>
                            <Stars rating={r.stars} size="h-3.5 w-3.5" />
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Related products ──────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────── */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={images[imgIdx]}
              alt={product.title}
              className="max-h-full max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
