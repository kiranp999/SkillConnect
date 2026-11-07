import api from './api';

export const authService = {
  async registerCustomer(data) {
    const response = await api.post('/auth/register/customer/', data);
    return response.data;
  },

  async registerWorker(formData) {
    const response = await api.post('/auth/register/worker/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile/', data);
    return response.data;
  },

  async changePassword(data) {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
  },

  logout() {
    ['skillconnect_access_token', 'skillconnect_refresh_token', 'skillconnect_user'].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
};
