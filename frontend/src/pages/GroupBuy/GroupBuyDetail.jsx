import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UsersIcon, ClockIcon, ArrowLeftIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { groupBuyService } from "../../services/groupbuy.service";
import toast from "react-hot-toast";

const GroupBuyDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [groupBuy, setGroupBuy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchGroupBuy();
  }, [id]);

  const fetchGroupBuy = async () => {
    try {
      setLoading(true);
      const res = await groupBuyService.getById(id);
      setGroupBuy(res.data);
    } catch (err) {
      toast.error("Group buy not found");
      navigate("/group-buy");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to join");
      return navigate("/login");
    }
    try {
      setJoining(true);
      await groupBuyService.join(id, { quantity });
      toast.success("Joined group buy! 🎉");
      fetchGroupBuy();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
          <div className="h-4 bg-gray-200 rounded-xl w-1/3" />
        </div>
      </div>
    );
  }

  if (!groupBuy) return null;

  const progress = ((groupBuy.currentQuantity / groupBuy.targetQuantity) * 100).toFixed(0);
  const spotsLeft = groupBuy.targetQuantity - groupBuy.currentQuantity;
  const hasJoined = groupBuy.hasJoined || groupBuy.members?.some((m) => m.user?._id === user?._id);
  const isCreator = groupBuy.creator?._id === user?._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/group-buy" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 mb-6 transition">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Group Buys
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Product */}
          <div className="md:col-span-2 space-y-6">
            {/* Product card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-56 bg-gray-100 overflow-hidden">
                <img
                  src={groupBuy.product?.images?.[0] || "https://via.placeholder.com/600x300?text=Product"}
                  alt={groupBuy.product?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{groupBuy.product?.title}</h1>
                    <p className="text-sm text-gray-400 mt-1">By {groupBuy.creator?.fullName}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${groupBuy.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {groupBuy.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{groupBuy.currentQuantity} of {groupBuy.targetQuantity} units filled ({progress}%)</span>
                    <span>{spotsLeft} spots left</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-primary-500" : "bg-orange-400"}`}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${groupBuy.pricePerUnit?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Group price</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-400 line-through">${groupBuy.originalPrice?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Original price</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{groupBuy.discount}% OFF</p>
                    <p className="text-xs text-gray-400">Savings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary-500" />
                Members ({groupBuy.members?.length || 0})
              </h2>
              <div className="flex flex-wrap gap-2">
                {groupBuy.members?.map((member) => (
                  <div key={member.user?._id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                    <img
                      src={member.user?.avatar || `https://ui-avatars.com/api/?name=${member.user?.fullName}&size=24`}
                      alt={member.user?.fullName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-600">{member.user?.fullName}</span>
                    <span className="text-xs text-gray-400">×{member.quantity}</span>
                  </div>
                ))}
                {spotsLeft > 0 && Array.from({ length: Math.min(spotsLeft, 5) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 w-9 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <span className="text-gray-300 text-sm">+</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Action panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <ClockIcon className="h-4 w-4" />
                <span>{groupBuy.timeRemaining || "Ending soon"} remaining</span>
              </div>

              {hasJoined ? (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="font-semibold text-green-600">You've joined!</p>
                  <p className="text-xs text-gray-400 mt-1">We'll notify you when it's fulfilled</p>
                </div>
              ) : isCreator ? (
                <div className="text-center text-sm text-gray-500 py-4">
                  <p>You created this group buy</p>
                </div>
              ) : groupBuy.status !== "active" ? (
                <div className="text-center text-sm text-gray-500 py-4">
                  <p>This group buy is {groupBuy.status}</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">-</button>
                      <span className="flex-1 text-center py-2 text-sm font-medium border-x border-gray-200">{quantity}</span>
                      <button onClick={() => setQuantity((q) => Math.min(spotsLeft, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">+</button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">${(groupBuy.pricePerUnit * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs mt-1">
                      <span>vs original</span>
                      <span className="line-through">${(groupBuy.originalPrice * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={joining || spotsLeft === 0}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {joining ? "Joining..." : "Join Group Buy"}
                  </button>
                </>
              )}
            </div>

            <Link
              to={`/products/${groupBuy.product?._id}`}
              className="block text-center text-sm text-primary-500 hover:text-primary-600 py-2"
            >
              View product page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupBuyDetail;
