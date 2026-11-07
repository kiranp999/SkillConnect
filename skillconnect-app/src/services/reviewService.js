import api from './api';

const mapReview = (review) => ({
  ...review,
  customerName: review.customer_name || 'Customer',
  customerAvatar: review.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer_name || 'Customer')}&background=2563eb&color=fff`,
  date: review.created_at ? new Date(review.created_at).toLocaleDateString() : '',
  service: review.booking?.worker_details?.category_name || 'Service'
});

export const reviewService = {
  async submitReview(reviewData) {
    return mapReview((await api.post('/reviews/', reviewData)).data);
  },

  async getWorkerReviews(workerId) {
    const data = (await api.get(`/reviews/worker/${workerId}/`)).data;
    const reviews = Array.isArray(data) ? data : (data.results || []);
    return reviews.map(mapReview);
  }
};
