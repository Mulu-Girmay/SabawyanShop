import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../common/Modal/Modal";
import { productService } from "../../../services/product.service";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useDebounce } from "../../../hooks/useDebounce";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchProducts(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const searchProducts = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        search: searchQuery,
        limit: 10,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product) => {
    navigate(`/products/${product._id}`);
    onClose();
    setQuery("");
    setResults([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products, sellers, group buys..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 text-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        </div>

        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500"></div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 max-h-96 overflow-y-auto">
            {results.map((product) => (
              <button
                key={product._id}
                className="flex w-full items-center space-x-4 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                onClick={() => handleSelect(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{product.title}</p>
                  <p className="text-sm text-gray-500">${product.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p className="text-lg">No results found</p>
            <p className="text-sm">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchModal;
