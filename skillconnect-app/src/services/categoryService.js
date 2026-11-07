import api from './api';

export const categoryService = {
  async getCategories() {
    const response = await api.get('/categories/');
    return response.data.results || response.data;
  },

  async getCategoryDetail(id) {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  }
};
