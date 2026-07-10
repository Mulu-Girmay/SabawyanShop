import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartIcon, ChatBubbleLeftIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";

const PostCard = ({ post, onLike }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    onLike?.(post._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Author header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
          <img
            src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.fullName}`}
            alt={post.author?.fullName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-100"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{post.author?.fullName}</p>
            <p className="text-xs text-gray-400">
              @{post.author?.username} ·{" "}
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                : "recently"}
            </p>
          </div>
        </Link>
        {post.author?.isSeller && (
          <span className="text-xs bg-primary-50 text-primary-600 font-medium px-2 py-0.5 rounded-full">
            Seller
          </span>
        )}
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Post images */}
      {post.images?.length > 0 && (
        <div className="px-4 pb-3">
          <div className={`grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {post.images.slice(0, 4).map((img, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {i === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{post.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked product */}
      {post.product && (
        <div className="mx-4 mb-3">
          <Link
            to={`/products/${post.product._id}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-primary-50 transition"
          >
            <img
              src={post.product.images?.[0]}
              alt={post.product.title}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{post.product.title}</p>
              <p className="text-sm text-primary-600 font-semibold">${post.product.price?.toFixed(2)}</p>
            </div>
            <ShoppingBagIcon className="h-4 w-4 text-primary-400 shrink-0" />
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          {liked
            ? <HeartSolid className="h-5 w-5 text-red-500" />
            : <HeartIcon className="h-5 w-5" />
          }
          <span className={liked ? "text-red-500 font-medium" : ""}>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors">
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
