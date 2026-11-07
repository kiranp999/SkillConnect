import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiCheckCircle, FiBriefcase, FiCalendar } from 'react-icons/fi';

const WorkerCard = ({ worker }) => {
  if (!worker) return null;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="card-custom h-100 p-4 d-flex flex-column justify-content-between position-relative"
    >
      {/* Top Banner & Status */}
      <div>
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="position-relative">
            {worker.avatar ? (
              <img
                src={worker.avatar}
                alt={worker.name || 'Worker'}
                className="rounded-circle object-fit-cover border border-2 border-primary"
                style={{ width: '68px', height: '68px' }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold border border-2 border-primary"
                aria-label="Worker avatar placeholder"
                style={{ width: '68px', height: '68px' }}
              >
                {(worker.name || 'W').charAt(0).toUpperCase()}
              </div>
            )}
            {worker.isAvailable ? (
              <span
                className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"
                title="Available Today"
                style={{ width: '14px', height: '14px' }}
              ></span>
            ) : (
              <span
                className="position-absolute bottom-0 end-0 p-1 bg-secondary border border-white rounded-circle"
                title="Currently Busy"
                style={{ width: '14px', height: '14px' }}
              ></span>
            )}
          </div>

          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex align-items-center gap-1">
              <h6 className="fw-bold m-0 text-truncate" style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {worker.name}
              </h6>
              {worker.isVerified && (
                <FiCheckCircle className="text-primary flex-shrink-0" title="Verified Worker" size={16} />
              )}
            </div>

            <span className="badge-custom badge-primary mt-1">{worker.category}</span>

            <div className="d-flex align-items-center gap-1 mt-1 small">
              <FiStar className="text-warning fill-warning" />
              <strong className="text-main">{worker.rating}</strong>
              <span className="text-muted">({worker.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        <p className="text-muted small line-clamp-2 mb-3" style={{ fontSize: '0.85rem' }}>
          {worker.about}
        </p>

        <div className="bg-body-secondary p-2.5 rounded-3 mb-3" style={{ fontSize: '0.82rem' }}>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted"><FiBriefcase className="me-1" /> Experience:</span>
            <strong className="text-main">{worker.experience}</strong>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted"><FiCheckCircle className="me-1" /> Jobs Done:</span>
            <strong className="text-success">{worker.completedJobs}+ Completed</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted"><FiMapPin className="me-1" /> District:</span>
            <span className="text-main fw-medium">{worker.district}</span>
          </div>
        </div>
      </div>

      {/* Bottom price and actions */}
      <div className="pt-3 border-top d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted small d-block">Reference Hourly Rate</span>
          <span className="fs-5 fw-extrabold text-primary">₹{worker.hourlyRate}<small className="fs-6 text-muted font-normal">/hr</small></span>
        </div>

        <div className="d-flex gap-2">
          <Link
            to={`/workers/${worker.id}`}
            className="btn btn-sm btn-secondary-custom px-3 py-2"
            style={{ fontSize: '0.85rem' }}
          >
            View Profile
          </Link>
          <Link
            to={`/book/${worker.id}`}
            className={`btn btn-sm btn-primary-custom px-3 py-2 ${!worker.isAvailable ? 'disabled' : ''}`}
            style={{ fontSize: '0.85rem' }}
            onClick={(event) => { if (!worker.isAvailable) event.preventDefault(); }}
          >
            <FiCalendar size={14} /> {worker.isAvailable ? 'Book' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkerCard;
