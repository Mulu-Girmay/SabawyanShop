import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  FunnelIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import { productService } from "../../services/product.service";

/* ── constants ───────────────────────────────────────────── */
const CATEGORIES = [
  "Electronics","Fashion","Home & Garden","Beauty",
  "Books","Sports","Toys","Automotive",
];
const SORT_OPTIONS = [
  { label: "Newest First",        value: "-createdAt"  },
  { label: "Price: Low → High",   value: "price"       },
  { label: "Price: High → Low",   value: "-price"      },
  { label: "Most Popular",        value: "-viewCount"  },
  { label: "Top Rated",           value: "-rating"     },
  { label: "Most Reviewed",       value: "-reviewCount"},
];
const PRICE_RANGES = [
  { label: "Under $25",    min: 0,   max: 25  },
  { label: "$25 – $50",    min: 25,  max: 50  },
  { label: "$50 – $100",   min: 50,  max: 100 },
  { label: "$100 – $200",  min: 100, max: 200 },
  { label: "Over $200",    min: 200, max: ""  },
];
const RATINGS = [4, 3, 2, 1];
const PER_PAGE = 16;

/* ── helpers ─────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="bg-gray-200 h-52" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded mt-3" />
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-sm flex gap-4 p-4">
    <div className="bg-gray-200 h-28 w-28 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-3" />
    </div>
  </div>
);

/* ── list-view product row ───────────────────────────────── */
const ProductRow = ({ product }) => {
  const price    = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;
  const img = product.images?.[0] || "https://placehold.co/120x120?text=Product";

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex gap-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
    >
      <div className="h-28 w-28 shrink-0 rounded-xl overflow-hidden bg-gray-50">
        <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-primary-500 font-medium capitalize mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 truncate text-sm leading-snug">{product.title}</h3>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            i < Math.floor(product.rating || 0)
              ? <StarSolid key={i} className="h-3.5 w-3.5 text-yellow-400" />
              : <StarIcon  key={i} className="h-3.5 w-3.5 text-gray-200"  />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between shrink-0">
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">${price?.toFixed(2)}</p>
          {discount && (
            <>
              <p className="text-xs text-gray-400 line-through">${product.price?.toFixed(2)}</p>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{discount}%</span>
            </>
          )}
        </div>
        <button className="text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition">
          View →
        </button>
      </div>
    </Link>
  );
};

/* ── active filter pill ──────────────────────────────────── */
const Pill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-xs font-medium text-primary-600">
    {label}
    <button onClick={onRemove} className="hover:text-primary-800 transition">
      <XMarkIcon className="h-3 w-3" />
    </button>
  </span>
);

/* ══════════════════════════════════════════════════════════ */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [viewMode,    setViewMode]    = useState("grid");   // grid | list
  const [sidebarOpen, setSidebarOpen] = useState(false);    // mobile

  const [filters, setFilters] = useState({
    search:        searchParams.get("search")   || "",
    category:      searchParams.get("category") || "",
    minPrice:      "",
    maxPrice:      "",
    minRating:     "",
    sort:          "-createdAt",
    isGroupBuyable:false,
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  /* ── fetch ───────────────────────────────────────────── */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: PER_PAGE, ...filters };
      Object.keys(params).forEach((k) => (params[k] === "" || params[k] === false) && delete params[k]);
      const res = await productService.getAll(params);
      setProducts(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const update = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const applyPriceRange = ({ min, max }) => {
    setFilters((f) => ({ ...f, minPrice: String(min), maxPrice: String(max) }));
    setPage(1);
  };

  const clearAll = () => {
    setFilters({ search: "", category: "", minPrice: "", maxPrice: "", minRating: "", sort: "-createdAt", isGroupBuyable: false });
    setPage(1);
  };

  /* ── active filter pills data ─────────────────────────── */
  const activePills = [
    filters.search        && { label: `"${filters.search}"`,             key: "search"         },
    filters.category      && { label: filters.category,                   key: "category"       },
    (filters.minPrice || filters.maxPrice) && {
      label: filters.minPrice && filters.maxPrice
        ? `$${filters.minPrice}–$${filters.maxPrice}`
        : filters.minPrice ? `Min $${filters.minPrice}` : `Max $${filters.maxPrice}`,
      key: "price",
    },
    filters.minRating     && { label: `${filters.minRating}★ & above`,   key: "minRating"      },
    filters.isGroupBuyable && { label: "Group Buy",                        key: "isGroupBuyable" },
  ].filter(Boolean);

  /* ── sidebar inner ───────────────────────────────────── */
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => update("category", "")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${filters.category === "" ? "bg-primary-50 text-primary-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => update("category", c)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${filters.category === c ? "bg-primary-50 text-primary-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price range quick-picks */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Price Range</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => applyPriceRange(r)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                String(filters.minPrice) === String(r.min) && String(filters.maxPrice) === String(r.max)
                  ? "bg-primary-50 text-primary-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {/* manual inputs */}
        <div className="flex gap-2 mt-3">
          <input
            type="number" placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <input
            type="number" placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Min Rating</h3>
        <div className="space-y-1">
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() => update("minRating", filters.minRating === String(r) ? "" : String(r))}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition ${filters.minRating === String(r) ? "bg-primary-50 text-primary-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <div className="flex">
                {Array.from({ length: r }).map((_, i) => <StarSolid key={i} className="h-3.5 w-3.5 text-yellow-400" />)}
                {Array.from({ length: 5 - r }).map((_, i) => <StarIcon key={i} className="h-3.5 w-3.5 text-gray-200" />)}
              </div>
              <span>& above</span>
            </button>
          ))}
        </div>
      </div>

      {/* Group Buy toggle */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Deals</h3>
        <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition">
          <div
            onClick={() => update("isGroupBuyable", !filters.isGroupBuyable)}
            className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${filters.isGroupBuyable ? "bg-primary-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${filters.isGroupBuyable ? "translate-x-5" : ""}`} />
          </div>
          <span className="text-sm text-gray-700">Group Buy Only</span>
        </label>
      </div>

      {activePills.length > 0 && (
        <button onClick={clearAll} className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-medium text-red-500 hover:bg-red-100 transition">
          <XMarkIcon className="h-4 w-4" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {activePills.length > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5">{activePills.length}</span>
              )}
            </button>

            {/* search */}
            <div className="relative flex-1 max-w-xl">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products…"
                value={filters.search}
                onChange={(e) => update("search", e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition"
              />
              {filters.search && (
                <button onClick={() => update("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* sort */}
            <div className="relative hidden sm:block">
              <select
                value={filters.sort}
                onChange={(e) => update("sort", e.target.value)}
                className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 text-gray-700 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* view toggle */}
            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition ${viewMode === "grid" ? "bg-primary-500 text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition ${viewMode === "list" ? "bg-primary-500 text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* active pills */}
          {activePills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activePills.map(({ label, key }) => (
                <Pill
                  key={key}
                  label={label}
                  onRemove={() => {
                    if (key === "price") { update("minPrice", ""); update("maxPrice", ""); }
                    else update(key, key === "isGroupBuyable" ? false : "");
                  }}
                />
              ))}
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition px-1">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-7">

        {/* ── Desktop sidebar ─────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-32">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-sm">Filters</h2>
              {activePills.length > 0 && (
                <button onClick={clearAll} className="text-xs text-primary-500 hover:text-primary-700 font-medium">Reset</button>
              )}
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* ── Mobile sidebar drawer ───────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-72 bg-white z-50 lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition">
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-4"><SidebarContent /></div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Products ────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {loading ? "Loading…" : <><span className="font-semibold text-gray-800">{total.toLocaleString()}</span> products found</>}
            </p>
          </div>

          {loading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-1">No products found</h3>
              <p className="text-sm text-gray-400 mb-5">Try adjusting your filters or search term</p>
              <button onClick={clearAll} className="rounded-xl bg-primary-50 px-6 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-100 transition">
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {products.map((p) => (
                <motion.div key={p._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => <ProductRow key={p._id} product={p} />)}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
                const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`h-9 w-9 rounded-xl text-sm font-medium transition ${pg === page ? "bg-primary-500 text-white shadow" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
