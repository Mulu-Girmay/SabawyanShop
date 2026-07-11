import api from "./api";

export const userService = {
  getProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.put("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  searchUsers: async (query, params = {}) => {
    const response = await api.get("/users/search", {
      params: { query, ...params },
    });
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get("/users/suggestions");
    return response.data;
  },
};
