import api from "./api";

export const groupBuyService = {
  create: async (data) => {
    const response = await api.post("/group-buy", data);
    return response.data;
  },

  join: async (groupId, quantity = 1) => {
    const response = await api.post(`/group-buy/${groupId}/join`, { quantity });
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get("/group-buy", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/group-buy/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/group-buy/${id}/cancel`);
    return response.data;
  },

  getMyGroupBuys: async () => {
    const response = await api.get("/group-buy/my/group-buys");
    return response.data;
  },
};
