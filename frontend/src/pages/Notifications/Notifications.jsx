import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BellIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NOTIFICATION_ICONS = {
  order: "📦",
  message: "💬",
  group_buy: "🤝",
  like: "❤️",
  comment: "💬",
  follow: "👤",
  system: "🔔",
};

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BellIcon className="h-7 w-7 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium transition"
            >
              <CheckIcon className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition ${filter === f ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-20 shadow-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BellIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <p className="font-semibold text-gray-500">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => (
              <motion.div
                key={notif._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-white rounded-2xl shadow-sm border transition ${!notif.isRead ? "border-primary-100 bg-primary-50/30" : "border-gray-100"}`}
              >
                <div className="flex items-start gap-4 p-4">
                  <span className="text-2xl shrink-0 mt-0.5">
                    {NOTIFICATION_ICONS[notif.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : "just now"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-100 transition"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
