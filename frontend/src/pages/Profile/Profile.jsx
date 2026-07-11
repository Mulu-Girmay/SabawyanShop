import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilSquareIcon,
  PhotoIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  HeartIcon,
  CheckBadgeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  StarIcon,
  ArrowRightIcon,
  CameraIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

/* ── mock orders ─────────────────────────────────────────── */
const MOCK_ORDERS = [
  { id: "ORD-001", date: new Date(2026, 5, 15), status: "Delivered",  total: 129.99, items: 3, img: "https://placehold.co/48x48?text=P1" },
  { id: "ORD-002", date: new Date(2026, 5, 28), status: "Processing", total:  64.50, items: 1, img: "https://placehold.co/48x48?text=P2" },
  { id: "ORD-003", date: new Date(2026, 6,  5), status: "Shipped",    total: 219.00, items: 4, img: "https://placehold.co/48x48?text=P3" },
  { id: "ORD-004", date: new Date(2026, 4, 20), status: "Delivered",  total:  45.00, items: 2, img: "https://placehold.co/48x48?text=P4" },
];

const STATUS_STYLE = {
  Delivered:  "bg-green-50  text-green-600  border-green-100",
  Processing: "bg-amber-50  text-amber-600  border-amber-100",
  Shipped:    "bg-blue-50   text-blue-600   border-blue-100",
  Cancelled:  "bg-red-50    text-red-500    border-red-100",
};

/* ── mock wishlist ───────────────────────────────────────── */
const MOCK_WISHLIST = [
  { id: "w1", title: "Wireless Headphones Pro", price: 89.99,  img: "https://placehold.co/160x160?text=WH",  rating: 4.5, reviews: 234 },
  { id: "w2", title: "Leather Crossbody Bag",   price: 55.00,  img: "https://placehold.co/160x160?text=LB",  rating: 4.2, reviews: 87  },
  { id: "w3", title: "Smart Watch Series 9",    price: 299.00, img: "https://placehold.co/160x160?text=SW",  rating: 4.8, reviews: 512 },
  { id: "w4", title: "Scented Candle Set",      price: 32.50,  img: "https://placehold.co/160x160?text=SC",  rating: 4.6, reviews: 143 },
];

/* ── tab config ──────────────────────────────────────────── */
const TABS = [
  { id: "orders",   label: "My Orders",    icon: ShoppingBagIcon },
  { id: "wishlist", label: "Wishlist",      icon: HeartIcon       },
  { id: "posts",    label: "Posts",         icon: ChatBubbleLeftIcon },
  { id: "groupbuys",label: "Group Buys",   icon: UserGroupIcon   },
];

/* ── stat card ───────────────────────────────────────────── */
const Stat = ({ value, label, sub }) => (
  <div className="text-center">
    <p className="text-xl font-extrabold text-gray-900">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-primary-500 font-medium">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user }                       = useAuth();
  const { username }                   = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab]       = useState(searchParams.get("tab") || "orders");
  const [following, setFollowing]       = useState(false);
  const [wishlist,  setWishlist]        = useState(MOCK_WISHLIST);

  /* sync tab with URL param */
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && TABS.find((x) => x.id === t)) setActiveTab(t);
  }, [searchParams]);

  const switchTab = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  const isOwnProfile = !username || username === user?.username;
  const profileUser  = user; /* for other-user view you'd fetch here */

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <p>Loading profile…</p>
      </div>
    );
  }

  const joinedDate = profileUser.createdAt
    ? formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })
    : "recently";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Cover ─────────────────────────────────────────── */}
      <div className="relative h-52 md:h-64 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        {isOwnProfile && (
          <button className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-xl bg-black/25 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/40 transition backdrop-blur-sm">
            <PhotoIcon className="h-3.5 w-3.5" /> Change Cover
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Avatar + actions row ──────────────────────── */}
        <div className="relative -mt-16 mb-5 flex items-end justify-between">
          {/* avatar */}
          <div className="relative">
            <img
              src={profileUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.fullName)}&size=128&background=6C63FF&color=fff`}
              alt={profileUser.fullName}
              className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            />
            {isOwnProfile && (
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center shadow-md text-white hover:bg-primary-600 transition">
                <CameraIcon className="h-4 w-4" />
              </button>
            )}
            {profileUser.isSeller && (
              <CheckBadgeIcon className="absolute -top-1 -right-1 h-7 w-7 text-primary-500 bg-white rounded-full p-0.5 shadow" />
            )}
          </div>

          {/* action buttons */}
          <div className="flex items-center gap-2 mb-1">
            {isOwnProfile ? (
              <>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit Profile
                </Link>
                {profileUser.isSeller && (
                  <Link
                    to="/seller/dashboard"
                    className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 shadow-sm transition"
                  >
                    <ShoppingBagIcon className="h-4 w-4" /> Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setFollowing((v) => !v)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${following ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50" : "bg-primary-500 text-white hover:bg-primary-600"}`}
                >
                  <UserPlusIcon className="h-4 w-4" />
                  {following ? "Following" : "Follow"}
                </button>
                <Link
                  to={`/chat?user=${profileUser._id}`}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" /> Message
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Name + bio ────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900">{profileUser.fullName}</h1>
            {profileUser.isSeller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-600">
                <CheckBadgeIcon className="h-3.5 w-3.5" />
                {profileUser.sellerProfile?.storeName || "Verified Seller"}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">@{profileUser.username}</p>

          {profileUser.bio && (
            <p className="text-sm text-gray-600 mt-2 max-w-xl leading-relaxed">{profileUser.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
            {profileUser.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" /> {profileUser.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarDaysIcon className="h-3.5 w-3.5" /> Joined {joinedDate}
            </span>
            {profileUser.isSeller && profileUser.sellerProfile?.rating && (
              <span className="flex items-center gap-1">
                <StarSolid className="h-3.5 w-3.5 text-yellow-400" />
                {profileUser.sellerProfile.rating.toFixed(1)} seller rating
              </span>
            )}
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 mb-6 flex flex-wrap gap-6 justify-around">
          <Stat value={profileUser.followers?.length || 0}   label="Followers"  />
          <div className="w-px bg-gray-100 self-stretch hidden sm:block" />
          <Stat value={profileUser.following?.length || 0}   label="Following"  />
          <div className="w-px bg-gray-100 self-stretch hidden sm:block" />
          <Stat value={MOCK_ORDERS.length}                    label="Orders"     />
          <div className="w-px bg-gray-100 self-stretch hidden sm:block" />
          <Stat value={wishlist.length}                       label="Wishlist"   />
          {profileUser.isSeller && (
            <>
              <div className="w-px bg-gray-100 self-stretch hidden sm:block" />
              <Stat value={profileUser.sellerProfile?.totalSales || 0} label="Sales" sub="as seller" />
            </>
          )}
        </div>

        {/* ── Tabs ──────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────── */}
        <div className="pb-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0  }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >

              {/* Orders tab */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  {MOCK_ORDERS.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
                    >
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        <img src={order.img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{order.id}</p>
                          <span className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full ${STATUS_STYLE[order.status] || STATUS_STYLE.Processing}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.items} item{order.items !== 1 ? "s" : ""} ·{" "}
                          {order.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-extrabold text-gray-900">${order.total.toFixed(2)}</p>
                        <button className="text-xs text-primary-500 hover:underline mt-1 font-medium flex items-center gap-0.5 ml-auto">
                          Details <ArrowRightIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Wishlist tab */}
              {activeTab === "wishlist" && (
                wishlist.length === 0 ? (
                  <EmptyTabState icon={HeartIcon} message="Your wishlist is empty" sub="Save items you love for later" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    {wishlist.map((item) => (
                      <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <div className="relative h-40 bg-gray-50 overflow-hidden">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <button
                            onClick={() => setWishlist((w) => w.filter((x) => x.id !== item.id))}
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-red-400 hover:bg-red-50 transition shadow-sm"
                          >
                            <HeartIcon className="h-4 w-4 fill-red-400" />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <StarSolid className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-500">{item.rating} ({item.reviews})</span>
                          </div>
                          <p className="text-sm font-extrabold text-primary-600 mt-1">${item.price.toFixed(2)}</p>
                          <button className="mt-2 w-full rounded-xl bg-primary-50 text-primary-600 text-xs font-bold py-1.5 hover:bg-primary-100 transition">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Posts & Group Buys: empty state */}
              {(activeTab === "posts" || activeTab === "groupbuys") && (
                <EmptyTabState
                  icon={activeTab === "posts" ? ChatBubbleLeftIcon : UserGroupIcon}
                  message={`No ${activeTab === "posts" ? "posts" : "group buys"} yet`}
                  sub={activeTab === "posts" ? "Share your shopping finds with the community" : "Start or join group buys to save more"}
                  cta={activeTab === "posts" ? { label: "Go to Feed", href: "/feed" } : { label: "Browse Group Buys", href: "/group-buy" }}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ── reusable empty state ────────────────────────────────── */
const EmptyTabState = ({ icon: Icon, message, sub, cta }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-gray-300" />
    </div>
    <p className="font-semibold text-gray-600 mb-1">{message}</p>
    {sub && <p className="text-sm text-gray-400 mb-5">{sub}</p>}
    {cta && (
      <Link
        to={cta.href}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-100 transition"
      >
        {cta.label} <ArrowRightIcon className="h-4 w-4" />
      </Link>
    )}
  </div>
);

export default Profile;
