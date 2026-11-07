import api from './api';

const unwrapList = (data) => Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);

export const bookingService = {
  async createBooking(data) {
    const response = await api.post('/bookings/', data);
    return response.data;
  },

  async getMyBookings() {
    return unwrapList((await api.get('/bookings/my_bookings/')).data);
  },

  async getMyJobs() {
    return unwrapList((await api.get('/bookings/my_jobs/')).data);
  },

  async getAllBookings() {
    return unwrapList((await api.get('/bookings/')).data);
  },

  async getBookingDetail(id) {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },

  async acceptBooking(id) {
    return (await api.post(`/bookings/${id}/accept/`)).data;
  },

  async rejectBooking(id) {
    return (await api.post(`/bookings/${id}/reject/`)).data;
  },

  async submitEstimate(id, estimateData) {
    return (await api.post(`/bookings/${id}/submit_estimate/`, estimateData)).data;
  },

  async approveEstimate(id) {
    return (await api.post(`/bookings/${id}/approve_estimate/`)).data;
  },

  async rejectEstimate(id) {
    return (await api.post(`/bookings/${id}/reject_estimate/`)).data;
  },

  async completeJob(id) {
    return (await api.post(`/bookings/${id}/complete/`)).data;
  },

  async cancelBooking(id) {
    return (await api.post(`/bookings/${id}/cancel/`)).data;
  }
};
