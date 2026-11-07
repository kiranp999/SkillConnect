import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { categoryService } from '../services/categoryService';
import { workerService } from '../services/workerService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';

const BookingContext = createContext(null);

export const formatBooking = (apiBooking) => {
  if (!apiBooking) return null;
  const estimateAmount = apiBooking.estimate_amount == null ? 0 : Number(apiBooking.estimate_amount);
  return {
    id: apiBooking.booking_code || `SKC-${apiBooking.id}`,
    dbId: apiBooking.id,
    workerId: apiBooking.worker || apiBooking.worker_details?.id || '',
    workerName: apiBooking.worker_details?.full_name || 'Worker',
    workerCategory: apiBooking.worker_details?.category_name || 'General',
    workerAvatar: apiBooking.worker_details?.profile_photo || '',
    customerName: apiBooking.customer_details?.full_name || 'Customer',
    customerPhone: apiBooking.customer_details?.phone || '',
    address: apiBooking.address || '',
    date: apiBooking.service_date || '',
    timeSlot: apiBooking.service_time || '',
    status: apiBooking.booking_status || 'Pending',
    serviceDetails: apiBooking.notes || 'Service request',
    estimatedAmount: estimateAmount,
    estimateBreakdown: Array.isArray(apiBooking.estimate_breakdown) ? apiBooking.estimate_breakdown : [],
    timeline: Array.isArray(apiBooking.timeline) ? apiBooking.timeline : [],
    createdAt: apiBooking.created_at || null,
    updatedAt: apiBooking.updated_at || null
  };
};

const mapCategory = (cat) => ({
  id: cat.category_id || String(cat.id),
  title: cat.category_name || 'Service',
  icon: cat.icon || 'BsLightningChargeFill',
  color: cat.color || '#2563eb',
  count: `${cat.workers_count || 0} Workers`,
  avgPrice: cat.avg_price || 'Estimate after inspection',
  description: cat.description || 'Verified local service professionals.',
  image: cat.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  popularServices: Array.isArray(cat.popular_services) ? cat.popular_services : []
});

export const BookingProvider = ({ children }) => {
  const { user, authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));

  const loadCategories = useCallback(async () => {
    const response = await categoryService.getCategories();
    setCategories(response.map(mapCategory));
    return response;
  }, []);

  const loadWorkers = useCallback(async () => {
    const response = await workerService.getWorkers();
    setWorkers(Array.isArray(response) ? response : []);
    return response;
  }, []);

  const loadBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      return [];
    }
    setLoading(true);
    try {
      let response = [];
      if (user.role === 'customer') response = await bookingService.getMyBookings();
      else if (user.role === 'worker') response = await bookingService.getMyJobs();
      else if (user.role === 'admin') response = await bookingService.getAllBookings();
      const formatted = response.map(formatBooking).filter(Boolean);
      setBookings(formatted);
      return formatted;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    Promise.allSettled([loadCategories(), loadWorkers(), loadBookings()]);
  }, [authLoading, loadCategories, loadWorkers, loadBookings]);

  const replaceBooking = useCallback((apiBooking) => {
    const formatted = formatBooking(apiBooking?.booking || apiBooking);
    if (!formatted) throw new Error('Invalid booking response from server.');
    setBookings((prev) => {
      const exists = prev.some((item) => String(item.dbId) === String(formatted.dbId));
      return exists ? prev.map((item) => String(item.dbId) === String(formatted.dbId) ? formatted : item) : [formatted, ...prev];
    });
    return formatted;
  }, []);

  const addBooking = async (data) => {
    const response = await bookingService.createBooking({
      worker: Number(data.workerId),
      service_date: data.date,
      service_time: data.timeSlot,
      address: data.address,
      notes: data.specialInstructions || ''
    });
    return replaceBooking(response);
  };

  const refreshBooking = async (databaseId) => replaceBooking(await bookingService.getBookingDetail(databaseId));

  const acceptBooking = async (id) => replaceBooking(await bookingService.acceptBooking(id));
  const rejectBooking = async (id) => replaceBooking(await bookingService.rejectBooking(id));
  const submitEstimate = async (id, data) => replaceBooking(await bookingService.submitEstimate(id, data));
  const approveEstimate = async (id) => replaceBooking(await bookingService.approveEstimate(id));
  const rejectEstimate = async (id) => replaceBooking(await bookingService.rejectEstimate(id));
  const completeJob = async (id) => replaceBooking(await bookingService.completeJob(id));

  const cancelBooking = async (id) => replaceBooking(await bookingService.cancelBooking(id));

  const addReview = async (review) => {
    if (!review.bookingDbId) throw new Error('Booking ID is missing.');
    const created = await reviewService.submitReview({
      booking: review.bookingDbId,
      rating: review.rating,
      comment: review.comment
    });
    setReviews((prev) => [created, ...prev]);
    return created;
  };

  return (
    <BookingContext.Provider value={{
      categories, workers, bookings, reviews, loading,
      addBooking, loadBookings, refreshBooking,
      acceptBooking, rejectBooking, submitEstimate,
      approveEstimate, rejectEstimate, completeJob, cancelBooking,
      addReview
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
