import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiFileText,
  FiStar,
  FiXCircle
} from 'react-icons/fi';

const BookingCard = ({
  booking,
  canReview = false,
  canCancel = false,
  onCancel
}) => {
  const [cancelLoading, setCancelLoading] = useState(false);

  if (!booking) {
    return null;
  }

  // --------------------------------------------------
  // BOOKING DATA
  // --------------------------------------------------

  const {
    id,
    dbId,
    workerName,
    workerCategory,
    workerAvatar,
    date,
    timeSlot,
    address,
    status,
    serviceDetails,
    estimatedAmount,
    estimateBreakdown
  } = booking;

  // --------------------------------------------------
  // STATUS HELPERS
  // --------------------------------------------------

  const statusClass = {
    Pending: 'badge-warning',
    Accepted: 'badge-primary',
    'Estimate Submitted': 'badge-primary',
    'Estimate Rejected': 'badge-danger',
    'Estimate Approved': 'badge-success',
    Completed: 'badge-success',
    Cancelled: 'badge-danger'
  };

  const badgeClass =
    statusClass[status] || 'badge-primary';

  // --------------------------------------------------
  // ESTIMATE
  // --------------------------------------------------

  const hasEstimate =
    Number(estimatedAmount) > 0 ||
    (Array.isArray(estimateBreakdown) &&
      estimateBreakdown.length > 0);

  // --------------------------------------------------
  // CANCEL ELIGIBILITY
  // --------------------------------------------------

  const cancellableStatuses = [
    'Pending',
    'Accepted',
    'Estimate Submitted',
    'Estimate Rejected',
    'Estimate Approved'
  ];

  const canCancelThisBooking =
    canCancel &&
    cancellableStatuses.includes(status);

  // --------------------------------------------------
  // CANCEL BOOKING
  // --------------------------------------------------

  const handleCancel = async () => {
    if (!canCancelThisBooking || cancelLoading) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);

      if (onCancel) {
        await onCancel(booking);
      }
    } catch (error) {
      console.error(
        'Failed to cancel booking:',
        error
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // --------------------------------------------------
  // WORKER AVATAR
  // --------------------------------------------------

  const workerInitial =
    workerName?.charAt(0)?.toUpperCase() || 'W';

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="card-custom p-4 mb-4">

      {/* ============================================
          TOP SECTION
      ============================================= */}

      <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

        {/* Worker information */}

        <div className="d-flex align-items-center gap-3">

          {workerAvatar ? (

            <img
              src={workerAvatar}
              alt={workerName || 'Worker'}
              className="rounded-circle border border-2 border-primary"
              style={{
                width: '52px',
                height: '52px',
                objectFit: 'cover'
              }}
            />

          ) : (

            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: '52px',
                height: '52px'
              }}
            >
              {workerInitial}
            </div>

          )}

          <div>

            <div className="d-flex align-items-center gap-2 flex-wrap">

              <span className="fw-bold text-main">
                #{id}
              </span>

              <span
                className={`badge-custom ${badgeClass}`}
              >
                {status}
              </span>

            </div>

            <h6 className="fw-bold text-main mb-0 mt-1">
              {workerName || 'Worker'}
            </h6>

            <span className="small text-primary">
              {workerCategory || 'Service Professional'}
            </span>

          </div>
        </div>

        {/* Estimate */}

        <div className="text-md-end">

          <div className="small text-muted">
            {status === 'Estimate Submitted'
              ? 'Submitted Estimate'
              : 'Approved/Submitted Estimate'}
          </div>

          {hasEstimate ? (

            <div className="fw-bold fs-5 text-success">
              ₹{Number(estimatedAmount || 0).toFixed(2)}
            </div>

          ) : (

            <div className="small text-muted">
              Awaiting estimate
            </div>

          )}

        </div>

      </div>

      <hr />

      {/* ============================================
          BOOKING INFORMATION
      ============================================= */}

      <div className="row g-3 small">

        <div className="col-12 col-md-4">

          <div className="d-flex align-items-center gap-2">

            <FiCalendar
              className="text-primary"
              size={16}
            />

            <span>
              <strong>Date:</strong>{' '}
              {date || 'Not specified'}
            </span>

          </div>

        </div>

        <div className="col-12 col-md-4">

          <div className="d-flex align-items-center gap-2">

            <FiClock
              className="text-primary"
              size={16}
            />

            <span>
              <strong>Time:</strong>{' '}
              {timeSlot || 'Not specified'}
            </span>

          </div>

        </div>

        <div className="col-12 col-md-4">

          <div className="d-flex align-items-center gap-2">

            <FiMapPin
              className="text-primary"
              size={16}
            />

            <span>
              <strong>Location:</strong>{' '}
              {address || 'Not specified'}
            </span>

          </div>

        </div>

      </div>

      {/* ============================================
          SERVICE DETAILS
      ============================================= */}

      {serviceDetails && (

        <div className="mt-3 p-2 rounded-2 bg-body-secondary small">

          <strong>
            Service Details:
          </strong>{' '}

          {serviceDetails}

        </div>

      )}

      {/* ============================================
          ACTION BUTTONS
      ============================================= */}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4">

        {/* LEFT SIDE */}

        <div>

          <Link
            to={`/booking/${id}/estimate`}
            className="btn btn-outline-primary"
          >
            <FiFileText className="me-1" />
            View Status & Estimate
          </Link>

        </div>

        {/* RIGHT SIDE */}

        <div className="d-flex flex-wrap gap-2">

          {/* ========================================
              CUSTOMER ONLY - LEAVE REVIEW
          ========================================= */}

          {canReview && status === 'Completed' && (

            <Link
              to={`/booking/${id}/review`}
              className="btn btn-warning fw-semibold"
            >
              <FiStar className="me-1" />
              Leave Review
            </Link>

          )}

          {/* ========================================
              CUSTOMER ONLY - CANCEL
          ========================================= */}

          {canCancelThisBooking && (

            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelLoading}
              className="btn btn-outline-danger"
            >

              <FiXCircle className="me-1" />

              {cancelLoading
                ? 'Cancelling...'
                : 'Cancel Booking'}

            </button>

          )}

        </div>

      </div>

    </div>
  );
};

export default BookingCard;