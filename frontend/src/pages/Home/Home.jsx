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
  { icon: "📱", name: "Electronics", color: "bg-blue-50",   text: "text-blue-600"   },
  { icon: "👗", name: "Fashion",     color: "bg-pink-50",   text: "text-pink-600"   },
  { icon: "🏠", name: "Home",        color: "bg-amber-50",  text: "text-amber-600"  },
  { icon: "💄", name: "Beauty",      color: "bg-rose-50",   text: "text-rose-600"   },
  { icon: "📚", name: "Books",       color: "bg-green-50",  text: "text-green-600"  },
  { icon: "⚽", name: "Sports",      color: "bg-cyan-50",   text: "text-cyan-600"   },
  { icon: "🧸", name: "Toys",        color: "bg-purple-50", text: "text-purple-600" },
  { icon: "🚗", name: "Automotive",  color: "bg-orange-50", text: "text-orange-600" },
];

const TRUST = [
  { icon: TruckIcon,       title: "Free Shipping",  desc: "On orders over $100"    },
  { icon: ArrowPathIcon,   title: "Easy Returns",   desc: "30-day return policy"    },
  { icon: ShieldCheckIcon, title: "Secure Payment", desc: "256-bit SSL encrypted"   },
  { icon: TagIcon,         title: "Best Price",     desc: "Guaranteed lowest prices"},
];

const HERO_SLIDES = [
  {
    badge: "🔥 New Season Sale",
    headline: "Shop Together,\nSave Together",
    sub: "Unlock exclusive group discounts and discover amazing deals curated by your community.",
    cta: "Shop Now",
    ctaLink: "/products",
    bg: "from-primary-600 via-primary-500 to-secondary-500",
    accent: "text-yellow-300",
    stat1: { value: "2M+", label: "Shoppers" },
    stat2: { value: "50K+", label: "Group Buys" },
    stat3: { value: "4.8★", label: "Avg Rating" },
  },
  {
    badge: "🤝 Group Buying",
    headline: "More People,\nBetter Deals",
    sub: "Join a group buy and save up to 40% on your favourite products instantly.",
    cta: "Browse Group Buys",
    ctaLink: "/group-buy",
    bg: "from-secondary-600 via-secondary-500 to-primary-500",
    accent: "text-green-300",
    stat1: { value: "40%", label: "Max Savings" },
    stat2: { value: "10K+", label: "Active Deals" },
    stat3: { value: "Fast", label: "Delivery" },
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
      {emoji && <span className="mr-2">{emoji}</span>}{title}
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
  const [heroIdx, setHeroIdx]               = useState(0);
  const [trendingProducts, setTrending]     = useState([]);
  const [groupBuys, setGroupBuys]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const { h, m, s }                         = useCountdown(8);
  const slide                               = HERO_SLIDES[heroIdx];

  /* auto-advance hero */
  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

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
      <section className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} py-20 md:py-28`}>
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* left copy */}
            <motion.div
              key={heroIdx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-7"
            >
              <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                {slide.badge}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight whitespace-pre-line">
                {slide.headline.split("\n")[0]}{"\n"}
                <span className={slide.accent}>{slide.headline.split("\n")[1]}</span>
              </h1>

              <p className="text-lg text-white/85 max-w-lg leading-relaxed">{slide.sub}</p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to={slide.ctaLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-primary-600 shadow hover:bg-gray-50 transition"
                >
                  {slide.cta} <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/group-buy"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Join Group Buy
                </Link>
              </div>

              {/* stats */}
              <div className="flex gap-8 pt-2">
                {[slide.stat1, slide.stat2, slide.stat3].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* right floating cards */}
            <motion.div
              key={`cards-${heroIdx}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { emoji: "🛍️", title: "Flash Sale",    sub: "Up to 60% off",        bg: "bg-white/15" },
                { emoji: "🤝", title: "Group Buy",     sub: "12 members joined",    bg: "bg-white/10" },
                { emoji: "⭐", title: "Top Rated",     sub: "4.9★ from 200+ reviews",bg: "bg-white/15" },
                { emoji: "💬", title: "Live Chat",     sub: "Talk to sellers",       bg: "bg-white/10" },
              ].map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className={`${c.bg} backdrop-blur-sm rounded-2xl p-5 text-white`}
                >
                  <p className="text-3xl mb-2">{c.emoji}</p>
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-white/70 mt-0.5">{c.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* slide dots */}
          <div className="flex justify-center gap-2 mt-10">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`h-2 rounded-full transition-all ${i === heroIdx ? "w-8 bg-white" : "w-2 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
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
      <section className="py-12">
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
                <span className={`text-xs font-semibold ${cat.text}`}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALE ────────────────────────────────────── */}
      <section className="py-2 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* header with countdown */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5">
                <FireIcon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Flash Sale</span>
              </div>
              <p className="text-sm text-gray-500">Ends in:</p>
              <div className="flex items-center gap-1">
                {[h, m, s].map((unit, i) => (
                  <React.Fragment key={i}>
                    <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-900 text-white text-sm font-bold tabular-nums">
                      {unit}
                    </span>
                    {i < 2 && <span className="text-gray-600 font-bold">:</span>}
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
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
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
      <section className="py-2 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-5">
            <Link
              to="/group-buy"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 flex flex-col justify-end min-h-48"
            >
              <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Group Buying</span>
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                Save up to 40%<br />with your community
              </h3>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:gap-3 transition-all">
                Start a Group Buy <ArrowRightIcon className="h-4 w-4" />
              </div>
            </Link>
            <Link
              to="/products?category=Electronics"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-500 to-secondary-700 p-8 flex flex-col justify-end min-h-48"
            >
              <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">New Arrivals</span>
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                Latest Electronics<br />Just Dropped
              </h3>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:gap-3 transition-all">
                Shop Now <ArrowRightIcon className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-2 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <SectionHeader title="Featured Products" emoji="⚡" href="/products" />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Trending Group Buys" emoji="🤝" href="/group-buy" />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : groupBuys.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupBuys.map((gb) => <GroupBuyCard key={gb._id} groupBuy={gb} />)}
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
            <h2 className="text-3xl font-extrabold text-gray-900">Why CollabCart?</h2>
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
                color: "bg-secondary-100 text-secondary-600",
                title: "Real-time Chat",
                desc: "Connect directly with sellers, ask questions and get instant answers before you buy.",
              },
              {
                icon: SparklesIcon,
                color: "bg-green-100 text-green-600",
                title: "Community Driven",
                desc: "Discover trending products through your network and see what your friends are buying.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-8 shadow-sm text-center"
              >
                <div className={`mx-auto mb-5 h-16 w-16 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">What Shoppers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah K.",    avatar: "SK", review: "Saved $200 on electronics through a group buy. CollabCart changed how I shop!", stars: 5 },
              { name: "Marcus T.",  avatar: "MT", review: "The community feed is brilliant. Found products I never would have discovered alone.", stars: 5 },
              { name: "Priya M.",   avatar: "PM", review: "Fast shipping, easy returns, and the chat feature makes everything transparent.", stars: 4 },
            ].map(({ name, avatar, review, stars }) => (
              <div key={name} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{review}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold">
                    {avatar}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to save more together?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
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
