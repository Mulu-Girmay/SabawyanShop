import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const LINKS = {
  Company: [
    { label: "About Us",    href: "/about"   },
    { label: "Careers",     href: "/careers" },
    { label: "Press",       href: "/press"   },
    { label: "Blog",        href: "/blog"    },
    { label: "Affiliates",  href: "/affiliates" },
  ],
  Shop: [
    { label: "All Products",  href: "/products"        },
    { label: "Group Buys",    href: "/group-buy"        },
    { label: "Flash Sales",   href: "/products?sort=discount" },
    { label: "New Arrivals",  href: "/products?sort=-createdAt" },
    { label: "Top Rated",     href: "/products?sort=-rating" },
  ],
  Support: [
    { label: "Help Center",    href: "/help"    },
    { label: "Contact Us",     href: "/contact" },
    { label: "Track Order",    href: "/orders"  },
    { label: "Returns",        href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms",          href: "/terms"   },
  ],
};

const SOCIAL = [
  { label: "Facebook",  emoji: "📘", href: "#" },
  { label: "Twitter",   emoji: "🐦", href: "#" },
  { label: "Instagram", emoji: "📷", href: "#" },
  { label: "YouTube",   emoji: "▶️", href: "#" },
  { label: "TikTok",    emoji: "🎵", href: "#" },
];

const PAYMENT_ICONS = ["💳 Visa", "💳 Mastercard", "🅿️ PayPal", "🍎 Apple Pay", "🅶 Google Pay"];

const Footer = () => {
  const [email, setEmail]     = useState("");
  const [subMsg, setSubMsg]   = useState("");
  const year                  = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes("@")) { setSubMsg("Enter a valid email."); return; }
    setSubMsg("Thanks for subscribing! 🎉");
    setEmail("");
    setTimeout(() => setSubMsg(""), 4000);
  };

  return (
    <footer className="bg-gray-950 text-gray-400">

      {/* ── Top newsletter strip ──────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Stay in the loop 📬</h3>
              <p className="text-white/75 text-sm mt-0.5">Get the best deals and group buy alerts delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm"
              />
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-600 hover:bg-gray-50 transition shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
          {subMsg && <p className="mt-3 text-sm text-white/90 font-medium">{subMsg}</p>}
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand col */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <ShoppingBagIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                CollabCart
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Shop together, save together. Discover amazing deals through the power of community buying.
            </p>
            {/* contact */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-primary-400 shrink-0" />
                <a href="mailto:hello@collabcart.com" className="hover:text-white transition">hello@collabcart.com</a>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-primary-400 shrink-0" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
                <span>123 Commerce St,<br />San Francisco, CA 94103</span>
              </li>
            </ul>
            {/* socials */}
            <div className="flex gap-2 flex-wrap">
              {SOCIAL.map(({ label, emoji, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-base transition"
                >
                  {emoji}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-bold text-white mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm hover:text-white hover:translate-x-0.5 inline-block transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App download col */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-bold text-white mb-4">Get the App</h4>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
              >
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-xs text-gray-500">Download on the</p>
                  <p className="text-sm font-semibold text-white">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
              >
                <span className="text-2xl">▶️</span>
                <div>
                  <p className="text-xs text-gray-500">Get it on</p>
                  <p className="text-sm font-semibold text-white">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {year} CollabCart, Inc. All rights reserved.</p>

          {/* payment icons */}
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_ICONS.map((icon) => (
              <span
                key={icon}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-500"
              >
                {icon}
              </span>
            ))}
          </div>

          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms"   className="hover:text-white transition">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
