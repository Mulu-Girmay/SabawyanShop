import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ShoppingBagIcon,
  UsersIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import GroupBuyCard from "../../components/groupbuy/GroupBuyCard/GroupBuyCard";
import PostCard from "../../components/feed/PostCard/PostCard";
import { productService } from "../../services/product.service";
import { groupBuyService } from "../../services/groupbuy.service";
import { socialService } from "../../services/social.service";

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [groupBuys, setGroupBuys] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [productsRes, groupBuysRes, feedRes] = await Promise.all([
        productService.getAll({ limit: 8, sort: "-viewCount" }),
        groupBuyService.getAll({ status: "active", limit: 4 }),
        socialService.getFeed({ limit: 3 }),
      ]);

      setTrendingProducts(productsRes.data);
      setGroupBuys(groupBuysRes.data);
      setFeedPosts(feedRes.data);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { icon: "📱", name: "Electronics" },
    { icon: "👗", name: "Fashion" },
    { icon: "🏠", name: "Home & Garden" },
    { icon: "💄", name: "Beauty" },
    { icon: "📚", name: "Books" },
    { icon: "⚽", name: "Sports" },
    { icon: "🧸", name: "Toys" },
    { icon: "🚗", name: "Automotive" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-gray-50 py-20 lg:py-32">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary-400 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-400 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700">
                  ✨ Shop Smarter, Save Bigger
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Discover <span className="text-primary-500">Premium</span> <br className="hidden sm:block" />
                Products Together
              </motion.h1>

              <motion.p
                className="text-lg text-gray-600 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join millions of smart shoppers discovering exclusive deals through community buying power. Save more, shop smarter.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-primary-500 text-white hover:bg-primary-600 px-8"
                >
                  Start Shopping
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8"
                >
                  View Catalog
                </Button>
              </motion.div>

              <motion.div
                className="flex gap-8 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div>
                  <p className="text-3xl font-bold text-gray-900">2M+</p>
                  <p className="text-sm text-gray-600">Active Shoppers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">50K+</p>
                  <p className="text-sm text-gray-600">Active Deals</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">4.8★</p>
                  <p className="text-sm text-gray-600">Trusted Rating</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-200/30 to-accent-200/30 blur-2xl"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <ShoppingBagIcon className="h-6 w-6 text-primary-500" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">Group Buy</p>
                      <p className="text-sm text-gray-600">Save up to 40%</p>
                    </div>
                    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-12 w-12 bg-accent-100 rounded-xl flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-accent-500" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">Community</p>
                      <p className="text-sm text-gray-600">Build together</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <StarIcon className="h-6 w-6 text-yellow-500" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">4.9 Rating</p>
                      <p className="text-sm text-gray-600">From 50K reviews</p>
                    </div>
                    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <ChatBubbleLeftIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">Live Chat</p>
                      <p className="text-sm text-gray-600">24/7 support</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Browse Categories
              </h2>
              <p className="text-gray-600 mt-2">Explore what millions are buying</p>
            </div>
            <Link
              to="/products"
              className="text-primary-500 hover:text-primary-600 font-bold text-lg"
            >
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="group flex flex-col items-center rounded-2xl bg-gray-50 p-4 border-2 border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <span className="text-4xl mb-3">{category.icon}</span>
                <span className="text-xs font-bold text-gray-700 text-center group-hover:text-primary-600">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Group Buys */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Trending Group Buys
              </h2>
              <p className="text-gray-600 mt-2">Limited time offers with massive savings</p>
            </div>
            <Link
              to="/group-buy"
              className="text-primary-500 hover:text-primary-600 font-bold text-lg"
            >
              See All →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupBuys.map((groupBuy) => (
                <GroupBuyCard key={groupBuy._id} groupBuy={groupBuy} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-gray-600 mt-2">Handpicked selections from top sellers</p>
            </div>
            <Link
              to="/products"
              className="text-primary-500 hover:text-primary-600 font-bold text-lg"
            >
              See All →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-72"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Social Feed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Community Feed
              </h2>
              <p className="text-gray-600 mt-2">See what shoppers are buying and loving</p>
            </div>
            <Link
              to="/feed"
              className="text-primary-500 hover:text-primary-600 font-bold text-lg"
            >
              See All →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-48"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {feedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Why Sabawyan?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The smarter way to shop with your community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all bg-gradient-to-br from-gray-50 to-white"
            >
              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                <UserGroupIcon className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Community Power</h3>
              <p className="text-gray-600 leading-relaxed">
                Team up with millions to unlock exclusive discounts. The more you buy together, the more you save.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all bg-gradient-to-br from-gray-50 to-white"
            >
              <div className="h-14 w-14 rounded-full bg-accent-100 flex items-center justify-center mb-6">
                <ChatBubbleLeftIcon className="h-7 w-7 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Direct Connection</h3>
              <p className="text-gray-600 leading-relaxed">
                Chat directly with sellers in real-time. Get answers instantly, build trust, and make informed purchases.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all bg-gradient-to-br from-gray-50 to-white"
            >
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <SparklesIcon className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Social Shopping</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover what friends are buying, share reviews, and be part of a thriving community of smart shoppers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
