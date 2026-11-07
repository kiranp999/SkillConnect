import api from './api';

export const adminService = {
  async getDashboardData() {
    const response = await api.get('/dashboard/admin/');
    return response.data;
  },

  async getWorkerDashboardData() {
    const response = await api.get('/dashboard/worker/');
    return response.data;
  }
};
