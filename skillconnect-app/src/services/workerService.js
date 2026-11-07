import api from './api';
import { mapWorker } from '../utils/workerMapper';

export const workerService = {
  async getWorkers(params = {}) {
    const response = await api.get('/workers/', { params });
    const workers = response.data.results || response.data;
    return Array.isArray(workers) ? workers.map(mapWorker) : workers;
  },

  async getWorkerDetail(id) {
    const response = await api.get(`/workers/${id}/`);
    return mapWorker(response.data);
  },

  async toggleAvailability() {
    const response = await api.post('/workers/toggle_availability/');
    return response.data;
  },

  async getPendingWorkers() {
    const response = await api.get('/workers/pending/');
    return response.data;
  },

  async verifyWorker(id) {
    const response = await api.post(`/workers/${id}/verify/`);
    return response.data;
  },

  async rejectWorker(id) {
    const response = await api.post(`/workers/${id}/reject/`);
    return response.data;
  }
};
