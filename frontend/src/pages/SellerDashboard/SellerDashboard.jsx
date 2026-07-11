import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  PlusCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../services/product.service";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({ seller: user?._id, limit: 20 });
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Revenue", value: `$${(user?.sellerProfile?.totalSales || 0) * 45}`, icon: CurrencyDollarIcon, color: "bg-green-100 text-green-600" },
    { label: "Total Orders", value: user?.sellerProfile?.totalSales || 0, icon: ShoppingBagIcon, color: "bg-blue-100 text-blue-600" },
    { label: "Products Listed", value: products.length, icon: ArrowTrendingUpIcon, color: "bg-purple-100 text-purple-600" },
    { label: "Avg. Rating", value: `${user?.sellerProfile?.rating?.toFixed(1) || "N/A"}⭐`, icon: StarIcon, color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user?.sellerProfile?.storeName || user?.fullName + "'s Store"}
            </p>
          </div>
          <Link
            to="/seller/products/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition shadow"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {["overview", "products", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition ${activeTab === tab ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Store info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Store Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Store Name</span>
                  <span className="font-medium text-gray-800">{user?.sellerProfile?.storeName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium capitalize ${user?.sellerProfile?.verificationStatus === "approved" ? "text-green-600" : "text-orange-500"}`}>
                    {user?.sellerProfile?.verificationStatus || "pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Response Time</span>
                  <span className="font-medium text-gray-800">{user?.sellerProfile?.responseTime || "< 1 hour"}</span>
                </div>
              </div>
              <Link to="/settings" className="mt-4 inline-block text-sm text-primary-500 hover:text-primary-600">
                Edit store settings →
              </Link>
            </div>

            {/* Recent products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Products</h3>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : products.slice(0, 4).length === 0 ? (
                <p className="text-sm text-gray-400">No products yet. <Link to="/seller/products/new" className="text-primary-500">Add your first!</Link></p>
              ) : (
                <div className="space-y-2">
                  {products.slice(0, 4).map((p) => (
                    <div key={p._id} className="flex items-center gap-3 py-2">
                      <img src={p.images?.[0] || "https://via.placeholder.com/40"} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">${p.price?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <EyeIcon className="h-3.5 w-3.5" />
                        {p.viewCount || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Product", "Price", "Stock", "Views", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No products yet</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || "https://via.placeholder.com/40"} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <span className="font-medium text-gray-800 truncate max-w-xs">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">${p.price?.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${p.quantity > 10 ? "text-green-600" : p.quantity > 0 ? "text-orange-500" : "text-red-500"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{p.viewCount || 0}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <p className="font-medium text-gray-500">No orders yet</p>
            <p className="text-sm mt-1">Orders will appear here when customers buy your products</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
