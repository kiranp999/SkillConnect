import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { workerService } from '../services/workerService';
import { reviewService } from '../services/reviewService';
import ReviewCard from '../components/cards/ReviewCard';

import {
  FiStar,
  FiMapPin,
  FiCheckCircle,
  FiBriefcase,
  FiCalendar,
  FiAward
} from 'react-icons/fi';

import { BsShieldCheck } from 'react-icons/bs';

const WorkerProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [workerReviews, setWorkerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadWorker = async () => {
      setLoading(true);
      setError('');

      try {
        /*
         * Load the worker first.
         * The profile does not need to wait for reviews.
         */
        const workerData = await workerService.getWorkerDetail(id);

        if (!cancelled) {
          setWorker(workerData);
          setLoading(false);
        }

        /*
         * Load reviews separately.
         * If reviews fail, the worker profile still works.
         */
        try {
          setReviewsLoading(true);

          const reviews = await reviewService.getWorkerReviews(id);

          if (!cancelled) {
            setWorkerReviews(Array.isArray(reviews) ? reviews : []);
          }
        } catch (reviewError) {
          console.warn('Unable to load worker reviews:', reviewError);

          if (!cancelled) {
            setWorkerReviews([]);
          }
        } finally {
          if (!cancelled) {
            setReviewsLoading(false);
          }
        }
      } catch (err) {
        console.error('Unable to load worker profile:', err);

        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError('Worker profile not found.');
          } else {
            setError(
              err?.message || 'Unable to load worker profile.'
            );
          }

          setWorker(null);
          setLoading(false);
        }
      }
    };

    loadWorker();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <MainLayout>
        <div
          className="container py-5 text-center"
          style={{ minHeight: '500px' }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading worker profile"
          />

          <p className="text-muted mt-3">
            Loading worker profile...
          </p>
        </div>
      </MainLayout>
    );
  }

  /*
   * Error / worker not found
   */
  if (!worker) {
    return (
      <MainLayout>
        <div
          className="container py-5 text-center"
          style={{ minHeight: '500px' }}
        >
          <h5>
            {error || 'Worker Profile Not Found'}
          </h5>

          <Link
            to="/workers"
            className="btn btn-primary-custom mt-3"
          >
            Search Workers
          </Link>
        </div>
      </MainLayout>
    );
  }

  /*
   * Safe fallback values.
   * Prevents the page from crashing if the backend
   * doesn't provide one of these fields.
   */
  const skills = Array.isArray(worker.skills)
    ? worker.skills
    : [];

  const certifications = Array.isArray(worker.certifications)
    ? worker.certifications
    : [];

  const workerBanner =
    worker.banner ||
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80';

  const workerAvatar =
    worker.avatar ||
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80';

  return (
    <MainLayout>

      {/* =========================================================
          TOP HERO BANNER
      ========================================================= */}
      <section className="position-relative">

        <div
          style={{
            height: '240px',
            minHeight: '240px',
            overflow: 'hidden'
          }}
        >
          <img
            src={workerBanner}
            alt={`${worker.name} profile banner`}
            className="w-100 h-100 object-fit-cover"
            width="1200"
            height="240"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div
          className="container position-relative"
          style={{ marginTop: '-80px' }}
        >
          <div className="card-custom p-4 shadow-lg border-0">

            <div className="row g-4 align-items-center">

              {/* Worker Avatar */}
              <div className="col-auto">

                <img
                  src={workerAvatar}
                  alt={`${worker.name} profile`}
                  className="rounded-circle border border-4 border-white shadow object-fit-cover"
                  width="120"
                  height="120"
                  loading="eager"
                  decoding="async"
                  style={{
                    width: '120px',
                    height: '120px'
                  }}
                />

              </div>

              {/* Worker Information */}
              <div className="col">

                <div className="d-flex flex-wrap align-items-center gap-2">

                  <h2 className="fw-extrabold m-0 text-main">
                    {worker.name}
                  </h2>

                  {worker.isVerified && (
                    <span className="badge-custom badge-success">
                      <BsShieldCheck className="me-1" />
                      Verified Master Technician
                    </span>
                  )}

                  {worker.isAvailable ? (
                    <span className="badge-custom badge-primary">
                      ✓ Available Today
                    </span>
                  ) : (
                    <span className="badge-custom badge-warning">
                      Currently Occupied
                    </span>
                  )}

                </div>

                <div className="text-primary fw-bold fs-5 mt-1">
                  {worker.category || 'Service Professional'}
                </div>

                <div className="text-muted small mt-1">
                  <FiMapPin className="me-1 text-danger" />
                  {worker.location || 'Location not specified'}
                  {worker.district
                    ? `, ${worker.district}`
                    : ''}
                </div>

              </div>

              {/* Rate + Booking */}
              <div className="col-lg-auto text-lg-end">

                <div className="mb-2">

                  <span className="text-muted small d-block">
                    Reference Hourly Rate
                  </span>

                  <span className="display-6 fw-extrabold text-primary">
                    ₹{worker.hourlyRate ?? 0}

                    <small className="fs-6 text-muted">
                      /hr
                    </small>
                  </span>

                </div>

                {user?.role === 'customer' ? (
                  <Link
                    to={`/book/${worker.id}`}
                    className={`btn btn-primary-custom btn-lg px-4 py-2.5 ${!worker.isAvailable ? 'disabled' : ''}`}
                    aria-disabled={!worker.isAvailable}
                    onClick={(event) => { if (!worker.isAvailable) event.preventDefault(); }}
                  >
                    <FiCalendar className="me-1" />
                    {worker.isAvailable ? 'Book Service Now' : 'Currently Unavailable'}
                  </Link>
                ) : (
                  <div className="text-muted small mt-2">
                    {!user
                      ? 'Sign in as a customer to book this service.'
                      : user.role === 'worker'
                        ? 'Worker accounts cannot book services. Use your worker dashboard to manage service requests.'
                        : 'Service bookings are available to customer accounts.'}
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          PROFILE MAIN CONTENT
      ========================================================= */}
      <section className="py-5">

        <div className="container">

          <div className="row g-4">

            {/* =====================================================
                LEFT DETAIL COLUMN
            ===================================================== */}
            <div className="col-lg-8">

              {/* About */}
              <div className="card-custom p-4 mb-4">

                <h5 className="fw-bold mb-3 text-main">
                  About Professional
                </h5>

                <p className="text-muted leading-relaxed mb-0">
                  {worker.about ||
                    'This professional has not added an introduction yet.'}
                </p>

              </div>


              {/* Skills */}
              <div className="card-custom p-4 mb-4">

                <h5 className="fw-bold mb-3 text-main">
                  Skills & Expertise
                </h5>

                {skills.length > 0 ? (

                  <div className="d-flex flex-wrap gap-2">

                    {skills.map((skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="badge-custom badge-primary fs-6 py-2 px-3"
                      >
                        <FiCheckCircle className="me-1" />
                        {skill}
                      </span>

                    ))}

                  </div>

                ) : (

                  <p className="text-muted small mb-0">
                    No skills have been added yet.
                  </p>

                )}

              </div>


              {/* Certifications */}
              <div className="card-custom p-4 mb-4">

                <h5 className="fw-bold mb-3 text-main">
                  Government ID & License Audit
                </h5>

                {certifications.length > 0 ? (

                  <div className="d-flex flex-column gap-2">

                    {certifications.map((cert, index) => (

                      <div
                        key={`${cert}-${index}`}
                        className="p-3 rounded-3 bg-body-secondary d-flex align-items-center gap-3"
                      >

                        <FiAward
                          size={24}
                          className="text-warning flex-shrink-0"
                        />

                        <div>

                          <div className="fw-bold text-main">
                            {cert}
                          </div>

                          <span className="text-success small fw-semibold">
                            ✓ Audited & Verified by SkillConnect Safety Team
                          </span>

                        </div>

                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="text-muted small mb-0">
                    No certification information available.
                  </p>

                )}

              </div>


              {/* =================================================
                  CLIENT REVIEWS
              ================================================= */}
              <div className="card-custom p-4">

                <div className="d-flex align-items-center justify-content-between mb-4">

                  <h5 className="fw-bold m-0 text-main">

                    Client Ratings & Reviews
                    {reviewsLoading ? '' : ` (${worker.reviewsCount ?? workerReviews.length})`}

                  </h5>

                  <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-5">

                    <FiStar className="fill-warning" />

                    {worker.rating ?? 0} / 5.0

                  </div>

                </div>


                {reviewsLoading ? (

                  <div className="text-center py-3">

                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    />

                    <span className="text-muted small ms-2">
                      Loading reviews...
                    </span>

                  </div>

                ) : workerReviews.length > 0 ? (

                  <div className="d-flex flex-column gap-3">

                    {workerReviews.map((review) => (

                      <ReviewCard
                        key={review.id}
                        review={review}
                      />

                    ))}

                  </div>

                ) : (

                  <p className="text-muted small m-0">
                    No client reviews submitted yet for this worker.
                  </p>

                )}

              </div>

            </div>


            {/* =====================================================
                RIGHT SUMMARY CARD
            ===================================================== */}
            <div className="col-lg-4">

              <div
                className="card-custom p-4 sticky-top"
                style={{
                  top: '90px',
                  minHeight: '300px'
                }}
              >

                <h6 className="fw-bold mb-3 text-main">
                  Worker Overview Stats
                </h6>

                <div className="d-flex flex-column gap-3 mb-4">

                  {/* Experience */}
                  <div className="d-flex justify-content-between pb-2 border-bottom">

                    <span className="text-muted small">
                      <FiBriefcase className="me-1" />
                      Experience
                    </span>

                    <strong className="text-main">
                      {worker.experience || 'Not specified'}
                    </strong>

                  </div>


                  {/* Jobs Completed */}
                  <div className="d-flex justify-content-between pb-2 border-bottom">

                    <span className="text-muted small">
                      <FiCheckCircle className="me-1" />
                      Jobs Completed
                    </span>

                    <strong className="text-success">
                      {worker.completedJobs ?? 0}+ Jobs
                    </strong>

                  </div>


                  {/* Verification */}
                  <div className="d-flex justify-content-between pb-2 border-bottom">

                    <span className="text-muted small">
                      <BsShieldCheck className="me-1" />
                      Aadhaar Verification
                    </span>

                    <span className="text-success fw-bold">
                      ✓ Verified
                    </span>

                  </div>


                  {/* Rating */}
                  <div className="d-flex justify-content-between">

                    <span className="text-muted small">
                      <FiStar className="me-1" />
                      Community Rating
                    </span>

                    <strong className="text-warning">
                      {worker.rating ?? 0} / 5.0
                    </strong>

                  </div>

                </div>


                {/* Booking is available only to customer accounts */}
                {user?.role === 'customer' ? (
                  <Link
                    to={`/book/${worker.id}`}
                    className={`btn btn-primary-custom w-100 py-3 justify-content-center ${!worker.isAvailable ? 'disabled' : ''}`}
                    aria-disabled={!worker.isAvailable}
                    onClick={(event) => { if (!worker.isAvailable) event.preventDefault(); }}
                  >
                    <FiCalendar className="me-1" />
                    {worker.isAvailable ? 'Proceed to Booking' : 'Currently Unavailable'}
                  </Link>
                ) : (
                  <div className="text-muted small text-center">
                    {user?.role === 'worker'
                      ? 'Worker accounts cannot book services.'
                      : user?.role === 'admin'
                        ? 'Bookings are available to customer accounts.'
                        : 'Sign in as a customer to book this service.'}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

    </MainLayout>
  );
};

export default WorkerProfilePage;