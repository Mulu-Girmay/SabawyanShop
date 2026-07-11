import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BellIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";

/* ── close on outside click ──────────────────────────────── */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, handler]);
}

const getTimeAgo = (date) => {
  if (!date) return "just now";
  const diff    = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 1)  return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  if (days    < 7)  return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationDropdown = () => {
  const { isAuthenticated }                               = useAuth();
  const { notifications, unreadCount, loading,
          markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const ref                 = useRef(null);

  useOutsideClick(ref, () => setIsOpen(false));

  /* Don't render the bell at all for unauthenticated users */
  if (!isAuthenticated) return null;

  const preview = (notifications || []).slice(0, 8);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`relative p-2 rounded-xl transition ${isOpen ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-primary-500 hover:text-primary-700 flex items-center gap-1 transition"
                >
                  <CheckIcon className="h-3.5 w-3.5" /> All read
                </button>
              )}
            </div>

            {/* list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
                </div>
              ) : preview.length === 0 ? (
                <div className="py-10 text-center">
                  <BellIcon className="mx-auto h-10 w-10 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                preview.map((notif) => (
                  <div
                    key={notif._id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer group ${!notif.read ? "bg-primary-50/50" : ""}`}
                    onClick={() => !notif.read && markAsRead(notif._id)}
                  >
                    {/* unread dot */}
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!notif.read ? "bg-primary-500" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      {notif.title && (
                        <p className="text-xs font-bold text-gray-900 truncate">{notif.title}</p>
                      )}
                      <p className={`text-xs leading-snug line-clamp-2 ${!notif.read ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{getTimeAgo(notif.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition shrink-0"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* footer */}
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs font-semibold text-primary-600 hover:text-primary-700 transition"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
