import api from './api';

export const customerService = {
  async getDashboardData() {
    const response = await api.get('/dashboard/customer/');
    return response.data;
  }
};
