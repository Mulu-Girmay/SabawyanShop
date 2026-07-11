import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  TagIcon,
  UserGroupIcon,
  NewspaperIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ShoppingBagIcon as ShoppingBagSolid } from "@heroicons/react/24/solid";
import NotificationDropdown from "./NotificationDropdown";
import SearchModal from "./SearchModal";

/* ── category mega-menu data ─────────────────────────────── */
const MEGA_CATEGORIES = [
  { icon: "📱", name: "Electronics",  href: "/products?category=Electronics"  },
  { icon: "👗", name: "Fashion",      href: "/products?category=Fashion"      },
  { icon: "🏠", name: "Home",         href: "/products?category=Home"         },
  { icon: "💄", name: "Beauty",       href: "/products?category=Beauty"       },
  { icon: "📚", name: "Books",        href: "/products?category=Books"        },
  { icon: "⚽", name: "Sports",       href: "/products?category=Sports"       },
  { icon: "🧸", name: "Toys",         href: "/products?category=Toys"         },
  { icon: "🚗", name: "Automotive",   href: "/products?category=Automotive"   },
];

const NAV_LINKS = [
  { label: "Products",   href: "/products",   icon: TagIcon        },
  { label: "Group Buys", href: "/group-buy",  icon: UserGroupIcon  },
  { label: "Feed",       href: "/feed",        icon: NewspaperIcon  },
];

/* ── tiny hook: close on outside click ──────────────────── */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, handler]);
}

/* ══════════════════════════════════════════════════════════ */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [megaOpen,     setMegaOpen]     = useState(false);
  const [userOpen,     setUserOpen]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);

  const megaRef = useRef(null);
  const userRef = useRef(null);

  useOutsideClick(megaRef, () => setMegaOpen(false));
  useOutsideClick(userRef, () => setUserOpen(false));

  /* close mobile on route change */
  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [location.pathname]);

  /* shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); setUserOpen(false); };
  const cartCount    = getTotalItems();
  const avatarLetter = user?.fullName?.charAt(0)?.toUpperCase() || "U";
  const isActive     = (href) => location.pathname === href;

  return (
    <>
      <nav className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* ── Logo ──────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-sm">
                <ShoppingBagSolid className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent hidden sm:block">
                CollabCart
              </span>
            </Link>

            {/* ── Categories dropdown (desktop) ─────────────── */}
            <div ref={megaRef} className="hidden md:block relative">
              <button
                onClick={() => setMegaOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${megaOpen ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <RectangleStackIcon className="h-4 w-4" />
                Categories
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid grid-cols-2 gap-1"
                  >
                    {MEGA_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.href}
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Search bar (desktop) ──────────────────────── */}
            <div className="hidden md:flex flex-1 max-w-lg">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 hover:border-primary-300 hover:bg-white transition"
              >
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                <span>Search products, sellers, group buys…</span>
                <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-400">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* ── Nav links (desktop) ───────────────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${isActive(href) ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* ── Right actions ─────────────────────────────── */}
            <div className="flex items-center gap-1 ml-auto">
              {/* mobile search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Chat */}
                  <Link
                    to="/chat"
                    className={`hidden sm:flex p-2 rounded-xl transition ${isActive("/chat") ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                  </Link>

                  {/* Notifications */}
                  <div className="hidden sm:block">
                    <NotificationDropdown />
                  </div>

                  {/* Cart */}
                  <Link to="/cart" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition">
                    <ShoppingBagIcon className="h-5 w-5" />
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white"
                      >
                        {cartCount > 99 ? "99+" : cartCount}
                      </motion.span>
                    )}
                  </Link>

                  {/* User dropdown */}
                  <div ref={userRef} className="relative ml-1">
                    <button
                      onClick={() => setUserOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-xl pl-1 pr-2 py-1 hover:bg-gray-100 transition"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-100" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                          {avatarLetter}
                        </div>
                      )}
                      <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-400 hidden sm:block transition-transform ${userOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {userOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                        >
                          {/* user info */}
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
                          </div>

                          {[
                            { icon: UserCircleIcon, label: "My Profile",  href: "/profile"         },
                            { icon: ShoppingBagIcon,label: "My Orders",   href: "/profile?tab=orders"},
                            { icon: SparklesIcon,   label: "Wishlist",    href: "/profile?tab=wishlist"},
                            ...(user?.isSeller ? [{ icon: RectangleStackIcon, label: "Seller Dashboard", href: "/seller/dashboard" }] : []),
                            { icon: Cog6ToothIcon,  label: "Settings",   href: "/settings"         },
                          ].map(({ icon: Icon, label, href }) => (
                            <Link
                              key={href}
                              to={href}
                              onClick={() => setUserOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                              <Icon className="h-4 w-4 text-gray-400" />
                              {label}
                            </Link>
                          ))}

                          <div className="border-t border-gray-50 mt-1">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition ml-1"
              >
                {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {/* search */}
                <button
                  onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 mb-3"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Search…
                </button>

                {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive(href) ? "bg-primary-50 text-primary-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                ))}

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider">Categories</p>
                  <div className="grid grid-cols-2 gap-1">
                    {MEGA_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.href}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <span>{cat.icon}</span> {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <Link to="/cart"   className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <ShoppingBagIcon className="h-4 w-4" /> Cart {cartCount > 0 && <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5">{cartCount}</span>}
                    </Link>
                    <Link to="/chat"   className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"><ChatBubbleLeftIcon className="h-4 w-4" /> Chat</Link>
                    <Link to="/notifications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"><BellIcon className="h-4 w-4" /> Notifications</Link>
                    <Link to="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"><UserCircleIcon className="h-4 w-4" /> Profile</Link>
                    <Link to="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"><Cog6ToothIcon className="h-4 w-4" /> Settings</Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition">
                      <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <Link to="/login"    className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Login</Link>
                    <Link to="/register" className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 py-3 text-center text-sm font-semibold text-white hover:opacity-90 transition">Sign Up Free</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
