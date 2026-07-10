import api from "./api";

export const orderService = {
  create: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/orders/stats");
    return response.data;
  },
};
