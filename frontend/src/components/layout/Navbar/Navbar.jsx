import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "../../common/Button/Button";
import SearchModal from "./SearchModal";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                CollabCart
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products, sellers, group buys..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  onClick={() => setIsSearchOpen(true)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/products"
                className="text-gray-600 hover:text-primary-500 transition-colors"
              >
                Products
              </Link>
              <Link
                to="/group-buy"
                className="text-gray-600 hover:text-primary-500 transition-colors"
              >
                Group Buys
              </Link>
              <Link
                to="/feed"
                className="text-gray-600 hover:text-primary-500 transition-colors"
              >
                Feed
              </Link>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/chat"
                    className="relative p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ChatBubbleLeftIcon className="h-6 w-6" />
                  </Link>

                  <NotificationDropdown />

                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>

                  <div className="relative group">
                    <button className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                        {user?.fullName?.charAt(0) || "U"}
                      </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                      {user?.isSeller && (
                        <Link
                          to="/seller/dashboard"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>

              <Link
                to="/products"
                className="block py-2 text-gray-600 hover:text-primary-500"
              >
                Products
              </Link>
              <Link
                to="/group-buy"
                className="block py-2 text-gray-600 hover:text-primary-500"
              >
                Group Buys
              </Link>
              <Link
                to="/feed"
                className="block py-2 text-gray-600 hover:text-primary-500"
              >
                Feed
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/chat"
                    className="block py-2 text-gray-600 hover:text-primary-500"
                  >
                    Chat
                  </Link>
                  <Link
                    to="/cart"
                    className="block py-2 text-gray-600 hover:text-primary-500"
                  >
                    Cart
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-600 hover:text-primary-500"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-error"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate("/register")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
