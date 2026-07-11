import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import { productService } from "../../services/product.service";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Beauty", "Books", "Sports", "Toys", "Automotive"];
const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Most Popular", value: "-viewCount" },
  { label: "Top Rated", value: "-rating" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: "",
    maxPrice: "",
    sort: "-createdAt",
    isGroupBuyable: false,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 16, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await productService.getAll(params);
      setProducts(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "", minPrice: "", maxPrice: "", sort: "-createdAt", isGroupBuyable: false });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-50 to-gray-50 border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Explore Our Collections</h1>
            <p className="text-gray-600 mt-2">Find exactly what you are looking for</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm font-medium"
              />
            </div>
            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border-2 text-sm font-bold transition ${showFilters ? "bg-primary-500 border-primary-500 text-white" : "border-gray-200 text-gray-700 hover:border-primary-400"}`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t-2 border-gray-200"
            >
              <div className="flex flex-wrap gap-4 items-end">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Price range */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    placeholder="0"
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 w-24 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    placeholder="999"
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 w-24 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
                {/* Group Buyable */}
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-primary-600 transition">
                  <input
                    type="checkbox"
                    checked={filters.isGroupBuyable}
                    onChange={(e) => updateFilter("isGroupBuyable", e.target.checked)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  Group Deals Only
                </label>
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-red-500 transition">
                  <XMarkIcon className="h-4 w-4" /> Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-base font-semibold text-gray-600 mb-8">{total.toLocaleString()} products found</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-80 border-2 border-gray-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <MagnifyingGlassIcon className="mx-auto h-20 w-20 text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 16 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-lg border-2 border-gray-200 text-sm font-bold disabled:opacity-40 hover:border-primary-500 hover:text-primary-600 transition"
            >
              ← Previous
            </button>
            <span className="px-6 py-3 text-sm font-bold text-gray-600">Page {page} of {Math.ceil(total / 16)}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 16)}
              className="px-6 py-3 rounded-lg border-2 border-gray-200 text-sm font-bold disabled:opacity-40 hover:border-primary-500 hover:text-primary-600 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
