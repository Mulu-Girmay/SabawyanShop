import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { socialService } from "../../services/social.service";
import PostCard from "../../components/feed/PostCard/PostCard";
import CreatePost from "../../components/feed/CreatePost/CreatePost";
import Button from "../../components/common/Button/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/common/Modal/Modal";

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("following");

  const tabs = [
    { id: "following", label: "Following" },
    { id: "trending", label: "Trending" },
    { id: "discover", label: "Discover" },
  ];

  const fetchFeed = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        const response = await socialService.getFeed({
          page: currentPage,
          limit: 10,
          type: activeTab,
        });

        if (reset) {
          setPosts(response.data);
        } else {
          setPosts((prev) => [...prev, ...response.data]);
        }

        setHasMore(response.pagination.page < response.pagination.pages);
        setPage(currentPage + 1);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    },
    [page, activeTab],
  );

  useEffect(() => {
    fetchFeed(true);
  }, [activeTab]);

  const handleCreatePost = async (postData) => {
    try {
      const response = await socialService.createPost(postData);
      setPosts((prev) => [response.data, ...prev]);
      setIsCreatePostOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await socialService.likePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: response.data.isLiked,
                likes: response.data.likesCount,
              }
            : post,
        ),
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await socialService.commentOnPost(postId, content);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...post.comments, response.data],
                commentsCount: post.comments.length + 1,
              }
            : post,
        ),
      );
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📱 Community Feed</h1>
        {user && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreatePostOpen(true)}
            icon={<PlusIcon className="h-5 w-5" />}
          >
            Create Post
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
              ${
                activeTab === tab.id
                  ? "bg-white text-primary-500 shadow-sm"
                  : "text-gray-600 hover:bg-white/50"
              }
            `}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-64"></div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts to show</p>
            <p className="text-sm text-gray-400 mt-1">
              Follow some users to see their posts
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))
        )}

        {hasMore && !loading && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={() => fetchFeed()}>
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        title="Create Post"
        size="lg"
      >
        <CreatePost
          onSubmit={handleCreatePost}
          onCancel={() => setIsCreatePostOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Feed;
