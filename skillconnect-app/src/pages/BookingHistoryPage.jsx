import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import BookingCard from '../components/cards/BookingCard';
import { FiCalendar } from 'react-icons/fi';

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const { bookings, cancelBooking } = useBooking();

  const [filterStatus, setFilterStatus] = useState('All');

  const role = user?.role || 'customer';

  // --------------------------------------------------
  // ROLE PERMISSIONS
  // --------------------------------------------------

  // Only customers can review completed services.
  const canReview = role === 'customer';

  // Only customers can cancel their own bookings.
  const canCancel = role === 'customer';

  // --------------------------------------------------
  // FILTER BOOKINGS
  // --------------------------------------------------

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'All') {
      return true;
    }

    return (
      booking.status?.toLowerCase() ===
      filterStatus.toLowerCase()
    );
  });

  // --------------------------------------------------
  // CANCEL BOOKING
  // --------------------------------------------------

  const handleCancelBooking = async (booking) => {
    if (!canCancel) {
      return;
    }

    if (!booking?.dbId) {
      console.error('Booking database ID is missing.');
      return;
    }

    try {
      await cancelBooking(booking.dbId);
    } catch (error) {
      console.error('Unable to cancel booking:', error);
    }
  };

  // --------------------------------------------------
  // STATUS FILTERS
  // --------------------------------------------------

  const statusFilters = [
    'All',
    'Pending',
    'Accepted',
    'Estimate Submitted',
    'Estimate Rejected',
    'Estimate Approved',
    'Completed',
    'Cancelled'
  ];

  return (
    <MainLayout>
      <section className="py-5">
        <div
          className="container"
          style={{ maxWidth: '960px' }}
        >

          {/* ================================
              PAGE HEADER
          ================================= */}

          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">

            <div>
              <h2 className="fw-extrabold text-main m-0">
                Booking History
              </h2>

              <span className="text-muted small">
                View all your past and upcoming local service appointments
              </span>
            </div>

            {/* ================================
                STATUS FILTERS
            ================================= */}

            <div className="d-flex flex-wrap p-1 bg-body-secondary rounded-3 gap-1">

              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`btn btn-sm fw-bold px-3 py-1 rounded-3 ${
                    filterStatus === status
                      ? 'btn-primary shadow-sm'
                      : 'text-muted'
                  }`}
                >
                  {status}
                </button>
              ))}

            </div>
          </div>

          {/* ================================
              BOOKING LIST
          ================================= */}

          {filteredBookings.length > 0 ? (

            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.dbId || booking.id}
                booking={booking}

                /*
                 * CUSTOMER ONLY
                 */
                canReview={canReview}

                /*
                 * CUSTOMER ONLY
                 */
                canCancel={canCancel}

                /*
                 * Cancellation handler
                 */
                onCancel={() =>
                  handleCancelBooking(booking)
                }
              />
            ))

          ) : (

            /* ================================
               EMPTY STATE
            ================================= */

            <div className="card-custom p-5 text-center text-muted">

              <FiCalendar
                size={42}
                className="mb-2 text-primary opacity-50"
              />

              <h5>
                No bookings found for "{filterStatus}" status.
              </h5>

            </div>

          )}

        </div>
      </section>
    </MainLayout>
  );
};

export default BookingHistoryPage;