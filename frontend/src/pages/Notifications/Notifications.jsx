import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ShoppingBagIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  HeartIcon,
  UserIcon,
  InformationCircleIcon,
  FunnelIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

/* ── type meta ───────────────────────────────────────────── */
const TYPE_META = {
  order:     { icon: ShoppingBagIcon,      color: "bg-blue-100   text-blue-600",    label: "Order"      },
  message:   { icon: ChatBubbleLeftIcon,   color: "bg-purple-100 text-purple-600",  label: "Message"    },
  group_buy: { icon: UserGroupIcon,        color: "bg-primary-100 text-primary-600",label: "Group Buy"  },
  like:      { icon: HeartIcon,            color: "bg-red-100    text-red-500",     label: "Like"       },
  comment:   { icon: ChatBubbleLeftIcon,   color: "bg-pink-100   text-pink-600",    label: "Comment"    },
  follow:    { icon: UserIcon,             color: "bg-green-100  text-green-600",   label: "Follow"     },
  system:    { icon: InformationCircleIcon,"color": "bg-gray-100  text-gray-500",   label: "System"     },
};

const ALL_CATEGORIES = ["all", "order", "message", "group_buy", "like", "follow", "system"];

/* ── empty state ─────────────────────────────────────────── */
const EmptyState = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
      <BellIcon className="h-10 w-10 text-gray-300" />
    </div>
    <h3 className="font-bold text-gray-600 text-lg mb-1">
      {filtered ? "No notifications here" : "You're all caught up!"}
    </h3>
    <p className="text-sm text-gray-400 max-w-xs">
      {filtered ? "Try a different filter to see more." : "New notifications will appear here when there's activity."}
    </p>
  </div>
);

/* ── skeleton ────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse flex gap-4 bg-white rounded-2xl p-5 border border-gray-100">
    <div className="h-11 w-11 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Notifications = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
  } = useNotifications();

  const [filter,   setFilter]   = useState("all");   // all | unread | category
  const [category, setCategory] = useState("all");

  /* ── derive lists ────────────────────────────────────────── */
  let list = [...(notifications || [])];
  if (filter === "unread")          list = list.filter((n) => !n.read);
  if (category !== "all")           list = list.filter((n) => n.type === category);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  /* ── group by day ────────────────────────────────────────── */
  const groups = list.reduce((acc, notif) => {
    const d     = notif.createdAt ? new Date(notif.createdAt) : new Date();
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let key = d.toDateString() === today.toDateString()
      ? "Today"
      : d.toDateString() === yesterday.toDateString()
      ? "Yesterday"
      : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(notif);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100 transition"
            >
              <CheckCircleIcon className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {/* ── Filter bar ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-5">
          {/* read / unread toggle */}
          <div className="flex gap-2 mb-3">
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${filter === f ? "bg-primary-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {f}
                {f === "unread" && unreadCount > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${filter === f ? "bg-white/20 text-white" : "bg-primary-100 text-primary-600"}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ALL_CATEGORIES.map((cat) => {
              const meta = cat !== "all" ? TYPE_META[cat] : null;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition shrink-0 ${
                    category === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {meta?.icon && <meta.icon className="h-3 w-3" />}
                  {cat.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notification list ───────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <EmptyState filtered={filter !== "all" || category !== "all"} />
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                {/* day label */}
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">{day}</p>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map((notif) => {
                      const meta = TYPE_META[notif.type] || TYPE_META.system;
                      const Icon = meta.icon;
                      return (
                        <motion.div
                          key={notif._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`relative bg-white rounded-2xl border shadow-sm transition ${
                            !notif.read
                              ? "border-primary-100 shadow-primary-50"
                              : "border-gray-100"
                          }`}
                        >
                          {/* unread dot */}
                          {!notif.read && (
                            <span className="absolute top-4 left-3 h-2 w-2 rounded-full bg-primary-500" />
                          )}

                          <div className="flex items-start gap-4 p-4 pl-7">
                            {/* type icon */}
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                                  {meta.label}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {notif.createdAt
                                    ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                                    : "just now"}
                                </span>
                              </div>
                              {/* optional action link */}
                              {notif.link && (
                                <Link
                                  to={notif.link}
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition"
                                >
                                  View details <ArrowRightIcon className="h-3 w-3" />
                                </Link>
                              )}
                            </div>

                            {/* actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.read && (
                                <button
                                  onClick={() => markAsRead(notif._id)}
                                  title="Mark as read"
                                  className="h-8 w-8 rounded-xl flex items-center justify-center text-primary-500 hover:bg-primary-50 transition"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif._id)}
                                title="Delete"
                                className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
