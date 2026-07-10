import api from "./api";

export const chatService = {
  sendMessage: async (messageData) => {
    const response = await api.post("/chat/messages", messageData);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  getMessages: async (userId, params = {}) => {
    const response = await api.get(`/chat/messages/${userId}`, { params });
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/chat/messages/${messageId}/read`);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/chat/unread");
    return response.data;
  },
};
