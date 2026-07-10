import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UsersIcon, ClockIcon } from "@heroicons/react/24/outline";

const GroupBuyCard = ({ groupBuy }) => {
  const progress = ((groupBuy.currentQuantity / groupBuy.targetQuantity) * 100).toFixed(0);
  const spotsLeft = groupBuy.targetQuantity - groupBuy.currentQuantity;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <Link to={`/group-buy/${groupBuy._id}`}>
        {/* Image */}
        <div className="relative h-40 bg-gray-50 overflow-hidden">
          <img
            src={groupBuy.product?.images?.[0] || "https://via.placeholder.com/400x300?text=Group+Buy"}
            alt={groupBuy.product?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between text-white text-xs">
              <span className="flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5" />
                {groupBuy.members?.length || 0} joined
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {groupBuy.timeRemaining || "Ending soon"}
              </span>
            </div>
          </div>
          {/* Discount badge */}
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {groupBuy.discount || 10}% OFF
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-3">
            {groupBuy.product?.title}
          </h3>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progress}% filled</span>
              <span>{spotsLeft} spots left</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-primary-500" : "bg-orange-400"
                }`}
              />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                ${groupBuy.pricePerUnit?.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 line-through">
                ${groupBuy.originalPrice?.toFixed(2)}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              groupBuy.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
            }`}>
              {groupBuy.status}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GroupBuyCard;
