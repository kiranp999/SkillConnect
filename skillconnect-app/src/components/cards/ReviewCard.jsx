import React from 'react';
import { FiStar } from 'react-icons/fi';
import { BsQuote } from 'react-icons/bs';

const ReviewCard = ({ review }) => {
  if (!review) return null;
  return (
    <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            {review.customerAvatar ? (
              <img
                src={review.customerAvatar}
                alt={review.customerName || 'Customer'}
                className="rounded-circle object-fit-cover"
                style={{ width: '48px', height: '48px' }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                aria-label="Customer avatar placeholder"
                style={{ width: '48px', height: '48px' }}
              >
                {(review.customerName || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h6 className="fw-bold mb-0 text-main">{review.customerName}</h6>
              <span className="text-muted small">{review.date}</span>
            </div>
          </div>
          <BsQuote size={28} className="text-primary opacity-25" />
        </div>

        <div className="d-flex align-items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              size={15}
              style={{
                color: i < Math.floor(review.rating) ? '#f59e0b' : '#cbd5e1',
                fill: i < Math.floor(review.rating) ? '#f59e0b' : 'transparent'
              }}
            />
          ))}
          <span className="fw-bold ms-1 text-main small">{review.rating}</span>
        </div>

        <p className="text-muted small mb-3 fst-italic">
          "{review.comment}"
        </p>
      </div>

      <div className="pt-2 border-top">
        <span className="badge-custom badge-primary small">
          Service: {review.service}
        </span>
      </div>
    </div>
  );
};

export default ReviewCard;
