import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ProductCard from "../ProductCard/ProductCard";

/**
 * ProductGrid – renders a responsive grid of ProductCards with skeleton and empty states.
 *
 * Props:
 *   products  – array of product objects
 *   loading   – boolean
 *   columns   – tailwind column count string, default "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
 */
const ProductGrid = ({
  products = [],
  loading = false,
  columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
}) => {
  if (loading) {
    return (
      <div className={`grid ${columns} gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-2xl h-72 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">
          No products found
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${columns} gap-6`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
