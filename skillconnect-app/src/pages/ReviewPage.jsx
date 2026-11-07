import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import {
  FiStar,
  FiCheck,
  FiSend,
  FiArrowLeft
} from 'react-icons/fi';

const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    bookings,
    addReview,
    loading
  } = useBooking();

  const { showToast } = useToast();

  // Find the booking using the public booking code.
  const booking = bookings.find(
    (item) => String(item.id) === String(id)
  );

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const tags = [
    'Punctual',
    'Clean Work',
    'Polite',
    'Reasonable Price',
    'Expert Diagnosis',
    'Highly Recommended'
  ];

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" />
          <p className="text-muted mt-3">
            Loading booking...
          </p>
        </div>
      </MainLayout>
    );
  }

  // Booking not found
  if (!booking) {
    return (
      <MainLayout>
        <div className="container py-5 text-center">
          <h5>Booking Not Found</h5>

          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary-custom mt-3"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  // Only completed bookings can be reviewed
  if (booking.status !== 'Completed') {
    return (
      <MainLayout>
        <div className="container py-5 text-center">
          <h5>Review unavailable</h5>

          <p className="text-muted">
            You can review this worker only after the service is completed.
          </p>

          <button
            onClick={() => navigate('/bookings')}
            className="btn btn-primary-custom"
          >
            Back to Bookings
          </button>
        </div>
      </MainLayout>
    );
  }

  // Toggle review highlight
  const toggleTag = (tag) => {
    setSelectedTags((previousTags) => {
      if (previousTags.includes(tag)) {
        return previousTags.filter(
          (selectedTag) => selectedTag !== tag
        );
      }

      return [...previousTags, tag];
    });
  };

  // Submit review
  const submit = async (event) => {
    event.preventDefault();

    // Rating validation
    if (rating === 0) {
      showToast(
        'Please select a rating before submitting.',
        'error'
      );
      return;
    }

    // Comment validation
    if (!comment.trim()) {
      showToast(
        'Please enter a comment.',
        'error'
      );
      return;
    }

    setSubmitting(true);

    try {
      const finalComment =
        selectedTags.length > 0
          ? `${selectedTags.join(', ')} - ${comment.trim()}`
          : comment.trim();

      await addReview({
        bookingDbId: booking.dbId,
        rating,
        comment: finalComment
      });

      showToast(
        'Review submitted successfully.',
        'success'
      );

      navigate('/bookings');
    } catch (error) {
      showToast(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          'Unable to submit review.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-5">
        <div
          className="container"
          style={{ maxWidth: '680px' }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline-secondary mb-4"
            type="button"
          >
            <FiArrowLeft className="me-1" />
            Back
          </button>

          <div className="card-custom p-4 p-md-5 text-center">

            {/* Page heading */}
            <h3 className="fw-extrabold text-main mb-1">
              Rate Your Service
            </h3>

            <p className="text-muted small mb-4">
              Share your completed service experience with the community.
            </p>

            {/* Worker information */}
            <div className="p-3 bg-primary-subtle rounded-4 d-inline-flex align-items-center gap-3 mb-4 text-start">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '56px',
                  height: '56px'
                }}
              >
                {(booking.workerName || 'W')
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h6 className="fw-bold mb-0 text-main">
                  {booking.workerName || 'Worker'}
                </h6>

                <span className="badge-custom badge-primary mt-1">
                  {booking.workerCategory || 'Service Worker'}
                </span>
              </div>
            </div>

            <form onSubmit={submit}>

              {/* Rating */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-main d-block mb-2">
                  Overall rating
                </label>

                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating =
                      hoverRating || rating;

                    const isActive =
                      star <= activeRating;

                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() =>
                          setHoverRating(star)
                        }
                        onMouseLeave={() =>
                          setHoverRating(0)
                        }
                        onClick={() =>
                          setRating(star)
                        }
                        className="btn border-0 p-1 bg-transparent"
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <FiStar
                          size={36}
                          style={{
                            color: isActive
                              ? '#f59e0b'
                              : '#cbd5e1',
                            fill: isActive
                              ? '#f59e0b'
                              : 'transparent'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-warning fw-bold mt-2">
                  {rating === 0
                    ? 'Select a rating'
                    : `${rating} / 5`}
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-main d-block mb-2">
                  Highlights
                </label>

                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {tags.map((tag) => {
                    const selected =
                      selectedTags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`btn btn-sm rounded-pill px-3 ${
                          selected
                            ? 'btn-primary'
                            : 'btn-outline-secondary'
                        }`}
                      >
                        {selected && (
                          <FiCheck className="me-1" />
                        )}

                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label
                  htmlFor="review-comment"
                  className="form-label small fw-bold text-main"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  rows={4}
                  className="form-control form-control-custom"
                  placeholder="Describe the quality of work..."
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  maxLength={1000}
                  required
                />

                <div className="text-end small text-muted mt-1">
                  {comment.length}/1000
                </div>
              </div>

              {/* Submit */}
<button
  type="submit"
  disabled={submitting}
  className="btn btn-primary-custom w-100 py-3 justify-content-center"
  style={{
    opacity:
      !rating || !comment.trim() || submitting
        ? 0.55
        : 1,
    cursor:
      !rating || !comment.trim() || submitting
        ? 'not-allowed'
        : 'pointer'
  }}
>
  {submitting ? (
    'Submitting...'
  ) : (
    <>
      Submit Review
      <FiSend
        size={18}
        className="ms-2"
      />
    </>
  )}
</button>

            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ReviewPage;