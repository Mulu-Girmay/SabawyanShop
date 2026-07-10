import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  UserIcon,
  PencilSquareIcon,
  PhotoIcon,
  ShoppingBagIcon,
  UsersIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const TABS = ["posts", "products", "group-buys"];

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [loading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-52 bg-gradient-to-r from-primary-400 to-secondary-500">
        <button className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-white/80 bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full transition">
          <PhotoIcon className="h-4 w-4" />
          Change Cover
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar + Info */}
        <div className="relative -mt-16 mb-4 flex items-end justify-between">
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&size=128&background=6C63FF&color=fff`}
              alt={user.fullName}
              className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            />
            <button className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-primary-500 flex items-center justify-center shadow text-white hover:bg-primary-600 transition">
              <PencilSquareIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition mb-1">
            <PencilSquareIcon className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {/* Name + Bio */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-gray-400 text-sm">@{user.username}</p>
          {user.bio && <p className="text-gray-600 mt-2 text-sm max-w-lg">{user.bio}</p>}

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{user.followers?.length || 0}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{user.following?.length || 0}</p>
              <p className="text-xs text-gray-400">Following</p>
            </div>
            {user.isSeller && (
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{user.sellerProfile?.totalSales || 0}</p>
                <p className="text-xs text-gray-400">Sales</p>
              </div>
            )}
          </div>

          {/* Seller badge */}
          {user.isSeller && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full">
              <ShoppingBagIcon className="h-3.5 w-3.5" />
              {user.sellerProfile?.storeName || "Seller"}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition ${activeTab === tab ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-12">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-48 shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {activeTab === "posts" && <HeartIcon className="h-8 w-8 text-gray-300" />}
                {activeTab === "products" && <ShoppingBagIcon className="h-8 w-8 text-gray-300" />}
                {activeTab === "group-buys" && <UsersIcon className="h-8 w-8 text-gray-300" />}
              </div>
              <p className="font-medium text-gray-500">No {activeTab.replace("-", " ")} yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
