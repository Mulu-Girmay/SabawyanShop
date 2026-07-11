import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable progress bar for group buys.
 * Props:
 *   current  – number of units already committed
 *   target   – total units needed to fulfil the group buy
 *   showLabels – whether to render the text labels (default true)
 */
const GroupByProgress = ({ current = 0, target = 1, showLabels = true }) => {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  const spotsLeft = Math.max(target - current, 0);

  const barColor =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-primary-500" : "bg-orange-400";

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{pct}% filled</span>
          <span>{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
        </div>
      )}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
};

export default GroupByProgress;
