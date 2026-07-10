import api from "./api";

export const productService = {
  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  uploadImages: async (id, images) => {
    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));

    const response = await api.post(`/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getBySeller: async (sellerId, params = {}) => {
    const response = await api.get(`/products/seller/${sellerId}`, { params });
    return response.data;
  },

  search: async (query, params = {}) => {
    const response = await api.get("/products/search", {
      params: { query, ...params },
    });
    return response.data;
  },
};
