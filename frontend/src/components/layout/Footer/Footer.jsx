import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🛍️</span>
              </div>
              <span className="text-2xl font-bold text-white">
                Sabawyan
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Shop smarter. Save bigger. Build communities. Join millions of smart shoppers discovering exclusive deals through our innovative community buying platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors font-medium"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors font-medium">
                  Blog & News
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-white transition-colors font-medium"
                >
                  Join Our Team
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="hover:text-white transition-colors font-medium"
                >
                  Press Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/help" className="hover:text-white transition-colors font-medium">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors font-medium"
                >
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors font-medium"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Follow Us</h3>
            <div className="flex space-x-4 mb-8">
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                📘
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                𝕏
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                📷
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                ▶️
              </a>
            </div>
            <p className="text-sm text-gray-400 mb-3 font-medium">
              Subscribe for deals & updates
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-lg bg-gray-800 text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
              <button className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-600 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-12 text-center text-sm text-gray-400">
          <p>© {currentYear} Sabawyan. All rights reserved. Built with ❤️ for smart shoppers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
