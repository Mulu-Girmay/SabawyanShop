import api from "./api";

export const socialService = {
  // Posts
  createPost: async (postData) => {
    const response = await api.post("/social/posts", postData);
    return response.data;
  },

  getFeed: async (params = {}) => {
    const response = await api.get("/social/feed", { params });
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/social/posts/${id}`);
    return response.data;
  },

  likePost: async (id) => {
    const response = await api.post(`/social/posts/${id}/like`);
    return response.data;
  },

  commentOnPost: async (id, content) => {
    const response = await api.post(`/social/posts/${id}/comments`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(
      `/social/posts/${postId}/comments/${commentId}`,
    );
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/social/posts/${id}`);
    return response.data;
  },

  // Follow
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get("/users/suggestions");
    return response.data;
  },
};
