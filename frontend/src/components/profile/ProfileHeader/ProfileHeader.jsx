import React from "react";
import { PencilSquareIcon, PhotoIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Button from "../../common/Button/Button";

/**
 * ProfileHeader – displays cover photo, avatar, name, stats, and action buttons.
 *
 * Props:
 *   user          – the profile owner's user object
 *   isOwnProfile  – boolean, show edit controls when true
 *   onEditProfile – callback fired when "Edit Profile" is clicked
 *   onFollow      – callback fired when "Follow" is clicked
 *   isFollowing   – boolean, whether the current user already follows this profile
 */
const ProfileHeader = ({
  user,
  isOwnProfile = false,
  onEditProfile,
  onFollow,
  isFollowing = false,
}) => {
  if (!user) return null;

  return (
    <div>
      {/* Cover photo */}
      <div className="relative h-52 bg-gradient-to-r from-primary-400 to-secondary-500">
        {isOwnProfile && (
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-white/80 bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full transition">
            <PhotoIcon className="h-4 w-4" />
            Change Cover
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar + action button row */}
        <div className="relative -mt-16 mb-4 flex items-end justify-between">
          <div className="relative">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&size=128&background=6C63FF&color=fff`
              }
              alt={user.fullName}
              className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            />
            {isOwnProfile && (
              <button
                onClick={onEditProfile}
                className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-primary-500 flex items-center justify-center shadow text-white hover:bg-primary-600 transition"
              >
                <PencilSquareIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="mb-1">
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "primary"}
                size="sm"
                onClick={onFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        {/* Name, username, bio */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-gray-400 text-sm">@{user.username}</p>
          {user.bio && (
            <p className="text-gray-600 mt-2 text-sm max-w-lg">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {user.followers?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {user.following?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Following</p>
            </div>
            {user.isSeller && (
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {user.sellerProfile?.totalSales || 0}
                </p>
                <p className="text-xs text-gray-400">Sales</p>
              </div>
            )}
          </div>

          {/* Seller badge */}
          {user.isSeller && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full">
              <ShoppingBagIcon className="h-3.5 w-3.5" />
              {user.sellerProfile?.storeName || "Verified Seller"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
