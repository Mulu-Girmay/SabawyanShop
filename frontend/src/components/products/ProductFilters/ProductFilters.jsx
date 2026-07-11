import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Beauty",
  "Books",
  "Sports",
  "Toys",
  "Automotive",
];

const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Most Popular", value: "-viewCount" },
  { label: "Top Rated", value: "-rating" },
];

/**
 * ProductFilters – collapsible filter panel for the products listing page.
 *
 * Props:
 *   filters   – current filter values { category, minPrice, maxPrice, sort, isGroupBuyable }
 *   onChange  – callback(key, value) to update a single filter
 *   onClear   – callback to reset all filters
 */
const ProductFilters = ({ filters, onChange, onClear }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 border-t border-gray-100"
    >
      <div className="flex flex-wrap gap-4 items-end">
        {/* Sort */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Sort By
          </label>
          <select
            value={filters.sort}
            onChange={(e) => onChange("sort", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange("category", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Min Price ($)
          </label>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
            placeholder="0"
            className="border border-gray-200 rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Max Price ($)
          </label>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            placeholder="999"
            className="border border-gray-200 rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Group Buy toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.isGroupBuyable || false}
            onChange={(e) => onChange("isGroupBuyable", e.target.checked)}
            className="accent-primary-500 h-4 w-4 rounded"
          />
          Group Buy Only
        </label>

        {/* Clear */}
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition"
        >
          <XMarkIcon className="h-4 w-4" />
          Clear
        </button>
      </div>
    </motion.div>
  );
};

export default ProductFilters;
