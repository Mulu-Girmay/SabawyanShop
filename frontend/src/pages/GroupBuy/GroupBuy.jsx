import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import GroupBuyCard from "../../components/groupbuy/GroupBuyCard/GroupBuyCard";
import { groupBuyService } from "../../services/groupbuy.service";

const TABS = ["active", "fulfilled", "expired"];

const GroupBuy = () => {
  const [groupBuys, setGroupBuys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchGroupBuys();
  }, [activeTab, page]);

  const fetchGroupBuys = async () => {
    try {
      setLoading(true);
      const res = await groupBuyService.getAll({ status: activeTab, page, limit: 12 });
      setGroupBuys(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = groupBuys.filter((g) =>
    g.product?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary-500 to-secondary-500 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            🤝 Group Buys
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 max-w-xl mx-auto mb-6"
          >
            Join others to unlock exclusive discounts. The more people join, the more everyone saves!
          </motion.p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search group buys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-5 py-4 text-sm font-medium capitalize border-b-2 transition ${activeTab === tab ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-64 shadow-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-semibold">No {activeTab} group buys</p>
            <p className="text-sm mt-1">Check back later or start one yourself!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((gb) => (
              <GroupBuyCard key={gb._id} groupBuy={gb} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40">Previous</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / 12)}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 12)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupBuy;
