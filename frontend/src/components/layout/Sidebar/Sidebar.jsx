import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  ShoppingBagIcon as ShoppingBagSolid,
  UsersIcon as UsersSolid,
  ChatBubbleLeftIcon as ChatSolid,
  BellIcon as BellSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";

const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: HomeIcon, ActiveIcon: HomeSolid },
  {
    to: "/products",
    label: "Products",
    Icon: ShoppingBagIcon,
    ActiveIcon: ShoppingBagSolid,
  },
  {
    to: "/group-buy",
    label: "Group Buys",
    Icon: UsersIcon,
    ActiveIcon: UsersSolid,
  },
  { to: "/feed", label: "Feed", Icon: TagIcon, ActiveIcon: TagIcon, auth: true },
  {
    to: "/chat",
    label: "Chat",
    Icon: ChatBubbleLeftIcon,
    ActiveIcon: ChatSolid,
    auth: true,
  },
  {
    to: "/notifications",
    label: "Notifications",
    Icon: BellIcon,
    ActiveIcon: BellSolid,
    auth: true,
  },
  {
    to: "/profile",
    label: "Profile",
    Icon: UserIcon,
    ActiveIcon: UserSolid,
    auth: true,
  },
  {
    to: "/settings",
    label: "Settings",
    Icon: Cog6ToothIcon,
    ActiveIcon: Cog6ToothIcon,
    auth: true,
  },
];

const SELLER_ITEMS = [
  {
    to: "/seller/dashboard",
    label: "Dashboard",
    Icon: ChartBarIcon,
    ActiveIcon: ChartBarIcon,
  },
];

/**
 * Sidebar – vertical navigation for desktop layouts.
 * Renders only the items the current user is allowed to see.
 */
const Sidebar = ({ collapsed = false }) => {
  const { isAuthenticated, user } = useAuth();
  const { getTotalItems } = useCart();
  const location = useLocation();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.auth || isAuthenticated
  );

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
          <ShoppingBagIcon className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            CollabCart
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {visibleItems.map(({ to, label, Icon, ActiveIcon }) => {
          const active = isActive(to);
          const Ic = active ? ActiveIcon : Icon;
          const isCart = to === "/cart";

          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? label : undefined}
            >
              <div className="relative shrink-0">
                <Ic className="h-5 w-5" />
                {isCart && getTotalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Seller section */}
        {isAuthenticated && user?.isSeller && (
          <>
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1">
                Seller
              </p>
            )}
            {SELLER_ITEMS.map(({ to, label, Icon, ActiveIcon }) => {
              const active = isActive(to);
              const Ic = active ? ActiveIcon : Icon;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={collapsed ? label : undefined}
                >
                  <Ic className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User avatar at bottom */}
      {isAuthenticated && user && (
        <div className="border-t border-gray-100 p-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl p-2 hover:bg-gray-50 transition"
          >
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&size=32`
              }
              alt={user.fullName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{user.username}
                </p>
              </div>
            )}
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
