import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { customerService } from '../services/customerService';
import BookingCard from '../components/cards/BookingCard';
import StatCard from '../components/cards/StatCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiCalendar, FiClock, FiCheckCircle, FiHeart, FiSearch, FiPlus, FiStar } from 'react-icons/fi';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { bookings } = useBooking();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const data = await customerService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        // Fallback to Context bookings & workers
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerData();
  }, []);

  const upcomingBookings = bookings.filter((b) => b.status === 'Accepted' || b.status === 'Pending' || b.status === 'Estimate Submitted' || b.status === 'Estimate Approved');
  const completedBookings = bookings.filter((b) => b.status === 'Completed');
 const favoriteWorkers = (dashboardData?.favorite_workers || []).slice(0, 3);
  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name || 'Customer'}!`}
      subtitle="Manage your home service requests, estimates, and favorite local workers."
    >
      {/* Top Stat Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Total Bookings"
            value={dashboardData ? dashboardData.total_bookings : bookings.length}
            icon={FiCalendar}
            color="#2563eb"
            subtitle="All time requests"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Active / Scheduled"
            value={dashboardData ? dashboardData.active_bookings_count : upcomingBookings.length}
            icon={FiClock}
            color="#f59e0b"
            subtitle="Awaiting completion"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Completed Services"
            value={dashboardData ? dashboardData.completed_bookings_count : completedBookings.length}
            icon={FiCheckCircle}
            color="#10b981"
            subtitle="Satisfied jobs"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Saved Favorites"
            value={favoriteWorkers.length}
            icon={FiHeart}
            color="#ec4899"
            subtitle="Recommended local pros"
          />
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="card-custom p-4 mb-4 bg-primary-subtle border-0">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold mb-1 text-main">Need Urgent Electrical or Plumbing Help?</h5>
            <p className="text-muted small m-0">Find verified technicians available today in {user?.district || 'your area'}.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/workers?category=electrician" className="btn btn-sm btn-primary-custom">
              <FiPlus /> Book Electrician
            </Link>
            <Link to="/workers?category=plumber" className="btn btn-sm btn-secondary-custom">
              <FiSearch /> Browse All
            </Link>
          </div>
        </div>
      </div>

      {/* Active & Upcoming Bookings Section */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold m-0 text-main">Active & Upcoming Service Requests</h5>
          <Link to="/bookings" className="small fw-semibold text-primary">
            View All History →
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          upcomingBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
            />
          ))
        ) : (
          <div className="card-custom p-4 text-center text-muted">
            <p className="m-0">No active bookings right now. Looking for assistance?</p>
            <Link to="/workers" className="btn btn-sm btn-primary-custom mt-2">
              Find a Worker
            </Link>
          </div>
        )}
      </div>

      {/* Favorite Workers Quick Re-book */}
      <div>
        <h5 className="fw-bold mb-3 text-main">Your Favorite Local Workers</h5>
        <div className="row g-3">
          {favoriteWorkers.map((w) => (
            <div key={w.id} className="col-12 col-md-4">
              <div className="card-custom p-3 d-flex align-items-center gap-3">
                {w.avatar || w.profile_photo ? (
                  <img
                    src={w.avatar || w.profile_photo}
                    alt={w.name || w.full_name || 'Worker'}
                    className="rounded-circle object-fit-cover border border-2 border-primary"
                    style={{ width: '52px', height: '52px' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                    aria-label="Worker avatar placeholder"
                    style={{ width: '52px', height: '52px' }}
                  >
                    {(w.name || w.full_name || 'W').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-grow-1 overflow-hidden">
                  <h6 className="fw-bold m-0 text-truncate text-main">{w.name || w.full_name}</h6>
                  <span className="small text-muted d-block">{w.category || w.category_name}</span>
                  <div className="d-flex align-items-center gap-1 small text-warning">
                    <FiStar className="fill-warning" /> {w.rating ?? w.average_rating ?? 0}
                  </div>
                </div>
                <Link to={`/book/${w.id}`} className="btn btn-sm btn-outline-custom p-2">
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
