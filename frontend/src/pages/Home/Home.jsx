import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  TagIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  FireIcon,
  ChevronRightIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import GroupBuyCard from "../../components/groupbuy/GroupBuyCard/GroupBuyCard";
import { productService } from "../../services/product.service";
import { groupBuyService } from "../../services/groupbuy.service";

/* ── Countdown hook ──────────────────────────────────────── */
function useCountdown(hours = 8) {
  const end = useRef(Date.now() + hours * 3600 * 1000);
  const [left, setLeft] = useState(end.current - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(end.current - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");
  return {
    h: pad(Math.floor((left / 3600000) % 24)),
    m: pad(Math.floor((left / 60000) % 60)),
    s: pad(Math.floor((left / 1000) % 60)),
  };
}

/* ── Static data ─────────────────────────────────────────── */
const CATEGORIES = [
  {
    icon: "📱",
    name: "Electronics",
    color: "bg-blue-50",
    text: "text-blue-600",
  },
  { icon: "👗", name: "Fashion", color: "bg-pink-50", text: "text-pink-600" },
  { icon: "🏠", name: "Home", color: "bg-amber-50", text: "text-amber-600" },
  { icon: "💄", name: "Beauty", color: "bg-rose-50", text: "text-rose-600" },
  { icon: "📚", name: "Books", color: "bg-green-50", text: "text-green-600" },
  { icon: "⚽", name: "Sports", color: "bg-cyan-50", text: "text-cyan-600" },
  { icon: "🧸", name: "Toys", color: "bg-purple-50", text: "text-purple-600" },
  {
    icon: "🚗",
    name: "Automotive",
    color: "bg-orange-50",
    text: "text-orange-600",
  },
];

const TRUST = [
  { icon: TruckIcon, title: "Free Shipping", desc: "On orders over $100" },
  { icon: ArrowPathIcon, title: "Easy Returns", desc: "30-day return policy" },
  {
    icon: ShieldCheckIcon,
    title: "Secure Payment",
    desc: "256-bit SSL encrypted",
  },
  { icon: TagIcon, title: "Best Price", desc: "Guaranteed lowest prices" },
];

const HERO_STATS = [
  {
    icon: UserGroupIcon,
    value: "2M+",
    label: "Members",
    sub: "Growing every day",
    ring: "bg-white/20",
  },
  {
    icon: TagIcon,
    value: "$50M+",
    label: "Saved Together",
    sub: "Through group buys",
    ring: "bg-teal-400/30",
  },
  {
    icon: StarIcon,
    value: "4.9/5",
    label: "Average Rating",
    sub: "From 100K+ reviews",
    ring: "bg-amber-400/30",
  },
];

/* ── Skeleton ────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="bg-gray-200 h-52 w-full" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded mt-3" />
    </div>
  </div>
);

/* ── Section header ──────────────────────────────────────── */
const SectionHeader = ({ title, emoji, href, hrefLabel = "View All" }) => (
  <div className="flex items-center justify-between mb-7">
    <h2 className="text-2xl font-bold text-gray-900">
      {emoji && <span className="mr-2">{emoji}</span>}
      {title}
    </h2>
    {href && (
      <Link
        to={href}
        className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition"
      >
        {hrefLabel}
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Home = () => {
  const [trendingProducts, setTrending] = useState([]);
  const [groupBuys, setGroupBuys] = useState([]);
  const [loading, setLoading] = useState(true);
  const { h, m, s } = useCountdown(8);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, gbRes] = await Promise.all([
          productService.getAll({ limit: 8, sort: "-viewCount" }),
          groupBuyService.getAll({ status: "active", limit: 4 }),
        ]);
        setTrending(prodRes.data || []);
        setGroupBuys(gbRes.data || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 py-16 md:py-24">
        {/* decorative blobs + dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-72 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* scattered accent shapes */}
        <SparklesIcon className="pointer-events-none absolute top-14 left-[52%] h-5 w-5 text-white/40" />
        <span className="pointer-events-none absolute top-24 left-[46%] h-2 w-2 rotate-45 bg-white/30" />
        <span className="pointer-events-none absolute bottom-24 right-[6%] h-3 w-3 rotate-45 border border-white/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* left copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-7"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow">
                🔥 <b className="font-extrabold">12,000</b> people joined group
                buys today
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08]">
                Shop Smarter.
                <br />
                Buy Together.
                <br />
                <span className="text-amber-300">Save More.</span>
              </h1>

              <p className="text-lg text-white/85 max-w-lg leading-relaxed">
                Join thousands of shoppers creating group purchases, chatting
                with sellers, and discovering deals together.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/group-buy"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary-600 shadow hover:bg-gray-50 transition"
                >
                  Start Group Shopping <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/feed"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <PlayIcon className="h-2.5 w-2.5 text-white" />
                  </span>
                  Explore Community
                </Link>
              </div>

              {/* stat chips */}
              <div className="flex flex-wrap gap-3 pt-2">
                {HERO_STATS.map(({ icon: Icon, value, label, sub, ring }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ring}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-lg font-extrabold text-white leading-none">
                        {value}
                      </p>
                      <p className="text-xs font-medium text-white/90 mt-1">
                        {label}
                      </p>
                      <p className="text-[11px] text-white/60">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* right device mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative hidden lg:block"
            >
              {/* main device card */}
              <div className="rounded-3xl bg-white shadow-2xl p-4 max-w-md ml-auto">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-primary-700">
                    🛍️ CollabCart
                  </span>
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-4xl">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      iPhone 16 Pro 256GB
                    </p>
                    <span className="inline-block mt-1 rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600">
                      Electronics
                    </span>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Group Buy Progress
                    </p>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 w-[84%] rounded-full bg-green-500" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      84 / 100 joined · 16 more needed
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400 line-through">
                      $999.00
                    </p>
                    <p className="text-xl font-extrabold text-primary-600">
                      $749.00
                    </p>
                  </div>
                  <span className="rounded-md bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-600">
                    You save $250!
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition"
                >
                  Join Group Buy
                </button>
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  ⏱ 2d 14h 32m left
                </p>
              </div>

              {/* floating "viewers" card */}
              {/* <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="absolute -top-6 right-0 z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-xl"
              >
                <div className="flex -space-x-2">
                  {["bg-primary-300", "bg-secondary-300", "bg-amber-300"].map(
                    (c, i) => (
                      <span
                        key={i}
                        className={`h-6 w-6 rounded-full ${c} ring-2 ring-white`}
                      />
                    ),
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">
                    56 people
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    are viewing this deal
                  </p>
                </div>
              </motion.div> */}

              {/* floating "joined" card */}
              {/* <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="absolute -bottom-6 -left-8 z-20 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 shadow-xl max-w-[220px]"
              >
                <span className="h-8 w-8 shrink-0 rounded-full bg-secondary-300 ring-2 ring-white" />
                <p className="text-xs text-gray-700 leading-snug">
                  <b className="text-gray-900">Emily</b> joined the MacBook Air
                  deal
                  <span className="block text-[10px] text-gray-400">
                    just now
                  </span>
                </p>
              </motion.div> */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Shop by Category" emoji="🗂️" href="/products" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className={`group flex flex-col items-center gap-2 rounded-2xl ${cat.color} p-4 transition hover:scale-105 hover:shadow-md`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className={`text-xs font-semibold ${cat.text}`}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALE ────────────────────────────────────── */}
      <section className="py-2 pb-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* header with countdown */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-primary-100  px-3 py-1.5">
                <FireIcon className="h-4 w-4 text-black" />
                <span className="text-sm font-bold text-black/300">
                  Flash Sale
                </span>
              </div>
              <p className="text-sm text-gray-500">Ends in:</p>
              <div className="flex items-center gap-1">
                {[h, m, s].map((unit, i) => (
                  <React.Fragment key={i}>
                    <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-700 text-white text-sm font-bold tabular-nums">
                      {unit}
                    </span>
                    {i < 2 && (
                      <span className="text-gray-600 font-bold">:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <Link
              to="/products?sort=discount"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View All <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER ──────────────────────────────────── */}
      <section className="py-2 pb-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-5">
            <Link
              to="/group-buy"
              className="group relative overflow-hidden rounded-3xl bg-white p-8 flex flex-col justify-end min-h-48"
            >
              <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
              <span className="text-xs font-bold uppercase tracking-widest text-black/70 mb-2">
                Group Buying
              </span>
              <h3 className="text-2xl font-extrabold text-black leading-tight">
                Save up to 40%
                <br />
                with your community
              </h3>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-black/90 group-hover:gap-3 transition-all">
                Start a Group Buy <ArrowRightIcon className="h-4 w-4" />
              </div>
            </Link>
            <Link
              to="/products?category=Electronics"
              className="group relative overflow-hidden rounded-3xl bg-white p-8 flex flex-col justify-end min-h-48"
            >
              <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
              <span className="text-xs font-bold uppercase tracking-widest text-black/70 mb-2">
                New Arrivals
              </span>
              <h3 className="text-2xl font-extrabold text-black leading-tight">
                Latest Electronics
                <br />
                Just Dropped
              </h3>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-black/90 group-hover:gap-3 transition-all">
                Shop Now <ArrowRightIcon className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-2 pb-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <SectionHeader
            title="Featured Products"
            emoji="⚡"
            href="/products"
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {trendingProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-8 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-100 transition"
            >
              View All Products <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING GROUP BUYS ───────────────────────────── */}
      <section className="py-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Trending Group Buys"
            emoji="🤝"
            href="/group-buy"
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : groupBuys.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupBuys.map((gb) => (
                <GroupBuyCard key={gb._id} groupBuy={gb} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-200 mb-3" />
              <p>No active group buys right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY COLLABCART ────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why CollabCart?
            </h2>
            <p className="mt-2 text-gray-500 max-w-xl mx-auto">
              The smarter way to shop — together
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserGroupIcon,
                color: "bg-primary-100 text-primary-600",
                title: "Group Buying Power",
                desc: "Team up with others to unlock exclusive bulk discounts unavailable to solo shoppers.",
              },
              {
                icon: ChatBubbleLeftIcon,
                color: "bg-primary-100 text-primary-600",
                title: "Real-time Chat",
                desc: "Connect directly with sellers, ask questions and get instant answers before you buy.",
              },
              {
                icon: SparklesIcon,
                color: "bg-primary-100 text-primary-600",
                title: "Community Driven",
                desc: "Discover trending products through your network and see what your friends are buying.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-8 shadow-sm text-center"
              >
                <div
                  className={`mx-auto mb-5 h-16 w-16 rounded-2xl flex items-center justify-center ${color}`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">
              What Shoppers Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah K.",
                avatar: "SK",
                review:
                  "Saved $200 on electronics through a group buy. CollabCart changed how I shop!",
                stars: 5,
              },
              {
                name: "Marcus T.",
                avatar: "MT",
                review:
                  "The community feed is brilliant. Found products I never would have discovered alone.",
                stars: 5,
              },
              {
                name: "Priya M.",
                avatar: "PM",
                review:
                  "Fast shipping, easy returns, and the chat feature makes everything transparent.",
                stars: 4,
              },
            ].map(({ name, avatar, review, stars }) => (
              <div
                key={name}
                className="rounded-2xl border border-gray-100 p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex mb-3 ">
                  {Array.from({ length: stars }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  "{review}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold">
                    {avatar}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
            Ready to save more together?
          </h2>
          <p className="text-black/80 mb-8 text-lg">
            Join over 2 million shoppers already saving with CollabCart.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary-600 shadow hover:bg-gray-50 transition"
            >
              Get Started Free <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
