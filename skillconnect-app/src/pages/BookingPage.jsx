import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { workerService } from '../services/workerService';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import {
  FiCalendar,
  FiMapPin,
  FiArrowRight
} from 'react-icons/fi';

import { BsShieldCheck } from 'react-icons/bs';

const BookingPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addBooking } = useBooking();
  const { showToast } = useToast();

  // =========================================================
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURN
  // =========================================================

  const [worker, setWorker] = useState(null);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [workerError, setWorkerError] = useState('');

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // LOAD WORKER
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadWorker = async () => {
      setLoadingWorker(true);
      setWorkerError('');

      try {
        const data = await workerService.getWorkerDetail(workerId);

        if (!cancelled) {
          setWorker(data);

          // Use customer's saved address if available
          if (user?.address) {
            setAddress(user.address);
          }
        }
      } catch (err) {
        console.error('Unable to load worker:', err);

        if (!cancelled) {
          setWorkerError(
            err?.response?.status === 404
              ? 'Worker not found.'
              : err?.message || 'Unable to load worker.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingWorker(false);
        }
      }
    };

    if (workerId) {
      loadWorker();
    }

    return () => {
      cancelled = true;
    };
  }, [workerId, user?.address]);

  // =========================================================
  // TIME SLOTS
  // =========================================================

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!date || !timeSlot || !address.trim()) {
      showToast(
        'Please specify date, time slot, and address.',
        'error'
      );
      return;
    }

    if (!worker) {
      showToast(
        'Worker information is not available.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdBooking = await addBooking({
        workerId: worker.id,
        date,
        timeSlot,
        address: address.trim(),
        specialInstructions: specialInstructions.trim(),
        customerName: user?.name || 'Customer',
        customerPhone: user?.phone || ''
      });

      showToast(
        `Booking request #${createdBooking.id} submitted successfully!`,
        'success'
      );

      // Open estimate/booking details page
      navigate(`/booking/${createdBooking.id}/estimate`);

    } catch (error) {
      console.error('Booking submission failed:', error);

      showToast(
        error?.response?.data?.error ||
          error?.message ||
          'Unable to create booking. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only customer accounts can create service bookings.
  if (user && user.role !== 'customer') {
    return (
      <MainLayout>
        <div className="container py-5 text-center" style={{ minHeight: '500px' }}>
          <h4 className="fw-bold">Booking is for customers only</h4>
          <p className="text-muted mt-2">
            Worker accounts manage incoming service requests and do not need to book other workers.
          </p>
          <button className="btn btn-primary-custom mt-3" onClick={() => navigate(user.role === 'worker' ? '/dashboard/worker' : '/')}>
            {user.role === 'worker' ? 'Go to Worker Dashboard' : 'Go Home'}
          </button>
        </div>
      </MainLayout>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingWorker) {
    return (
      <MainLayout>
        <div
          className="container py-5 text-center"
          style={{ minHeight: '500px' }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading worker...
          </p>
        </div>
      </MainLayout>
    );
  }

  // =========================================================
  // WORKER NOT FOUND
  // =========================================================

  if (!worker) {
    return (
      <MainLayout>
        <div
          className="container py-5 text-center"
          style={{ minHeight: '500px' }}
        >
          <h5>Worker Not Found</h5>

          <p className="text-muted">
            {workerError || 'Unable to load worker information.'}
          </p>

          <button
            onClick={() => navigate('/workers')}
            className="btn btn-primary-custom mt-3"
          >
            Select Worker
          </button>
        </div>
      </MainLayout>
    );
  }

  // =========================================================
  // BOOKING PAGE
  // =========================================================

  return (
    <MainLayout>

      <section className="py-5">

        <div
          className="container"
          style={{ maxWidth: '900px' }}
        >

          {/* PAGE HEADER */}
          <div className="text-center mb-4">

            <span className="badge-custom badge-primary mb-2">
              Step 1 of 2
            </span>

            <h2 className="fw-extrabold text-main">
              Schedule Worker Appointment
            </h2>

            <p className="text-muted small">
              Select your preferred date, time slot, and service address.
            </p>

          </div>


          <div className="row g-4">

            {/* =================================================
                WORKER SUMMARY
            ================================================= */}

            <div className="col-md-4">

              <div
                className="card-custom p-4 sticky-top"
                style={{ top: '90px' }}
              >

                <div className="text-center pb-3 border-bottom mb-3">

                  <img
                    src={
                      worker.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={worker.name}
                    width="74"
                    height="74"
                    className="rounded-circle mb-2 object-fit-cover border border-2 border-primary"
                    style={{
                      width: '74px',
                      height: '74px'
                    }}
                  />

                  <h6 className="fw-bold mb-0 text-main">
                    {worker.name}
                  </h6>

                  <span className="badge-custom badge-primary mt-1">
                    {worker.category || 'General'}
                  </span>

                  <div className="text-success small fw-semibold mt-1">
                    <BsShieldCheck className="me-1" />
                    Verified Specialist
                  </div>

                </div>


                <div className="d-flex flex-column gap-3 small">
                  <div className="d-flex justify-content-between"><span className="text-muted">Rating:</span><strong className="text-warning">★ {worker.rating ?? 0}</strong></div>
                  <div className="d-flex justify-content-between"><span className="text-muted">District:</span><strong className="text-main">{worker.district || 'Not specified'}</strong></div>
                  <div className="bg-body-secondary p-3 rounded-3">
                    <strong className="text-main d-block mb-1">Estimate policy</strong>
                    <span className="text-muted">The worker inspects the job first and then submits an itemized estimate for your approval. No estimate is created when you book.</span>
                  </div>
                </div>

                </div>

              </div>

            {/* =================================================
                BOOKING FORM
            ================================================= */}

            <div className="col-md-8">

              <form
                onSubmit={handleSubmitBooking}
                className="card-custom p-4 p-md-5"
              >

                <h5 className="fw-bold mb-3 text-main">
                  Service Appointment Details
                </h5>


                {/* DATE */}

                <div className="mb-4">

                  <label className="form-label small fw-bold text-main">
                    Select Service Date *
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-body-secondary border-end-0 text-muted">
                      <FiCalendar />
                    </span>

                    <input
                      type="date"
                      className="form-control form-control-custom border-start-0 ps-0"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toLocaleDateString('en-CA')}
                      required
                    />

                  </div>

                </div>


                {/* TIME SLOT */}

                <div className="mb-4">

                  <label className="form-label small fw-bold text-main">
                    Select Time Slot *
                  </label>

                  <div className="row g-2">

                    {timeSlots.map((slot) => (

                      <div
                        key={slot}
                        className="col-6 col-sm-4"
                      >

                        <button
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`btn btn-sm w-100 py-2.5 fw-semibold ${
                            timeSlot === slot
                              ? 'btn-primary'
                              : 'btn-outline-secondary'
                          }`}
                        >
                          {slot}
                        </button>

                      </div>

                    ))}

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="mb-4">

                  <div className="d-flex justify-content-between align-items-center mb-1">

                    <label className="form-label small fw-bold text-main mb-0">
                      Service Address *
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'GPS auto-detection will be available in a future version.',
                          'info'
                        )
                      }
                      className="btn btn-sm text-primary p-0 fw-semibold"
                    >
                      <FiMapPin className="me-1" />
                      Use My GPS Location
                    </button>

                  </div>


                  <textarea
                    rows={3}
                    className="form-control form-control-custom"
                    placeholder="Enter street name, house number, ward/colony..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />

                </div>


                {/* SPECIAL INSTRUCTIONS */}

                <div className="mb-4">

                  <label className="form-label small fw-bold text-main">
                    Special Instructions / Problem Description
                  </label>

                  <textarea
                    rows={3}
                    className="form-control form-control-custom"
                    placeholder="e.g., Living room fan speed regulator is loose, also check main MCB tripping issue..."
                    value={specialInstructions}
                    onChange={(e) =>
                      setSpecialInstructions(e.target.value)
                    }
                  />

                </div>


                {/* SUBMIT */}

                <div className="pt-3 border-top">

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary-custom btn-lg w-100 py-3 justify-content-center"
                  >

                    {isSubmitting ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />

                        Creating Booking...
                      </>

                    ) : (

                      <>
                        Confirm Booking Request
                        <FiArrowRight className="ms-2" />
                      </>

                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </section>

    </MainLayout>
  );
};

export default BookingPage;