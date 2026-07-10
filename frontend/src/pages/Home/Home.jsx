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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  🔥 50K+ Active Shoppers
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Shop Together, <br />
                <span className="text-yellow-300">Save Together</span>
              </motion.h1>

              <motion.p
                className="text-lg text-white/90 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join millions of shoppers discovering amazing deals through
                community buying. Start saving today!
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Start Shopping
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </motion.div>

              <motion.div
                className="flex gap-8 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div>
                  <p className="text-2xl font-bold text-white">2M+</p>
                  <p className="text-sm text-white/80">Shoppers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">50K+</p>
                  <p className="text-sm text-white/80">Group Buys</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4.8★</p>
                  <p className="text-sm text-white/80">Average Rating</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-white/20 to-white/5 blur-2xl"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white">
                      <div className="flex items-center space-x-3">
                        <ShoppingBagIcon className="h-8 w-8" />
                        <div>
                          <p className="font-semibold">Group Buy</p>
                          <p className="text-sm text-white/80">Save 25%</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white">
                      <div className="flex items-center space-x-3">
                        <UsersIcon className="h-8 w-8" />
                        <div>
                          <p className="font-semibold">12 Members</p>
                          <p className="text-sm text-white/80">
                            Joining together
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white">
                      <div className="flex items-center space-x-3">
                        <StarIcon className="h-8 w-8 text-yellow-300" />
                        <div>
                          <p className="font-semibold">4.9★ Rating</p>
                          <p className="text-sm text-white/80">
                            From 200+ reviews
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white">
                      <div className="flex items-center space-x-3">
                        <ChatBubbleLeftIcon className="h-8 w-8" />
                        <div>
                          <p className="font-semibold">Real-time Chat</p>
                          <p className="text-sm text-white/80">
                            Talk to sellers
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <Link
              to="/products"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="group flex flex-col items-center rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-500">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Group Buys */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              🔥 Trending Group Buys
            </h2>
            <Link
              to="/group-buy"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View All →
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
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              ⚡ Featured Products
            </h2>
            <Link
              to="/products"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View All →
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
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              📱 Community Feed
            </h2>
            <Link
              to="/feed"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              View All →
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
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why CollabCart?
            </h2>
            <p className="mt-2 text-gray-600">
              The smarter way to shop with your community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <UserGroupIcon className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Group Buying</h3>
              <p className="text-gray-600">
                Team up with others to unlock exclusive discounts and save more
                together.
              </p>
            </Card>
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                <ChatBubbleLeftIcon className="h-8 w-8 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-gray-600">
                Connect directly with sellers, ask questions, and get instant
                responses.
              </p>
            </Card>
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <SparklesIcon className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Discover products through your network and see what your friends
                are buying.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
