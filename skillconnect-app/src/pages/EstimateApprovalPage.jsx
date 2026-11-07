import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Timeline from '../components/ui/Timeline';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { getStatusBadgeClass } from '../utils/helpers';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const EstimateApprovalPage = () => {
  const { id } = useParams();
  const { bookings, loading, approveEstimate, rejectEstimate, cancelBooking } = useBooking();
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const booking = useMemo(() => bookings.find((item) => String(item.id) === String(id)), [bookings, id]);

  if (loading) return <MainLayout><div className="container py-5 text-center"><div className="spinner-border text-primary" /><p className="text-muted mt-3">Loading booking...</p></div></MainLayout>;
  if (!booking) return <MainLayout><div className="container py-5 text-center"><h5>Booking Not Found</h5><Link to="/bookings" className="btn btn-primary-custom mt-3">Back to Bookings</Link></div></MainLayout>;

  const hasEstimate = Number(booking.estimatedAmount) > 0 && booking.estimateBreakdown.length > 0;
  const status = booking.status;
  const waiting = ['Pending', 'Accepted', 'Estimate Rejected'].includes(status) && !hasEstimate;
  const canApprove = status === 'Estimate Submitted' && hasEstimate;

  const runAction = async (action, successMessage) => {
    setActionLoading(true);
    try {
      await action();
      showToast(successMessage, 'success');
    } catch (error) {
      showToast(error.response?.data?.error || error.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-5">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="d-flex align-items-center justify-content-between mb-4 gap-2">
            <Link to="/bookings" className="btn btn-sm btn-outline-secondary"><FiArrowLeft className="me-1" /> Back to Bookings</Link>
            <span className={`badge-custom ${getStatusBadgeClass(status)}`}>Status: {status}</span>
          </div>

          <div className="card-custom p-4 mb-4">
            <h6 className="fw-bold mb-3 text-main">Service Status Timeline</h6>
            <Timeline steps={booking.timeline} />
          </div>

          <div className="row g-4">
            <div className="col-md-7">
              <div className="card-custom p-4 p-md-5">
                <h5 className="fw-bold text-main mb-1">{hasEstimate ? 'Itemized Service Estimate' : 'Service Estimate'}</h5>
                <p className="text-muted small mb-4">Booking #{booking.id}</p>

                {waiting && (
                  <div className="alert alert-info d-flex gap-2 align-items-start"><FiInfo className="mt-1" /><div><strong>Waiting for Worker Estimate</strong><div className="small mt-1">The worker must inspect your requirement and submit an itemized estimate. No amount is charged or assumed at booking time.</div></div></div>
                )}

                {hasEstimate && (
                  <>
                    <div className="table-responsive">
                      <table className="table align-middle"><thead><tr><th>Item</th><th className="text-end">Cost</th></tr></thead><tbody>{booking.estimateBreakdown.map((item, index) => <tr key={`${item.item}-${index}`}><td>{item.item}</td><td className="text-end">₹{Number(item.cost).toFixed(2)}</td></tr>)}</tbody><tfoot><tr><th>Total Estimate</th><th className="text-end fs-5 text-success">₹{Number(booking.estimatedAmount).toFixed(2)}</th></tr></tfoot></table>
                    </div>
                    {status === 'Estimate Submitted' && <div className="alert alert-warning small">Review the itemized estimate before approving. You can reject it and ask the worker to revise it.</div>}
                    {status === 'Estimate Approved' && <div className="alert alert-success"><FiCheckCircle className="me-1" /> Estimate approved. The worker can now complete the service.</div>}
                  </>
                )}

                {status === 'Estimate Rejected' && <div className="alert alert-secondary">The previous estimate was rejected. The worker can submit a revised estimate.</div>}

                {canApprove && <div className="d-flex gap-2 mt-4"><button disabled={actionLoading} onClick={() => runAction(() => approveEstimate(booking.dbId), 'Estimate approved successfully.')} className="btn btn-success flex-fill"><FiCheckCircle className="me-1" /> Approve Estimate</button><button disabled={actionLoading} onClick={() => runAction(() => rejectEstimate(booking.dbId), 'Estimate rejected. The worker can revise it.')} className="btn btn-outline-danger flex-fill"><FiXCircle className="me-1" /> Reject Estimate</button></div>}
              </div>
            </div>

            <div className="col-md-5">
              <div className="card-custom p-4 mb-4">
                <h6 className="fw-bold text-main mb-3">Booking Details</h6>
                <div className="small d-flex flex-column gap-3"><div><FiCalendar className="me-2 text-primary" /><strong>Date:</strong> {booking.date}</div><div><FiClock className="me-2 text-primary" /><strong>Time:</strong> {booking.timeSlot}</div><div><FiMapPin className="me-2 text-primary" /><strong>Address:</strong> {booking.address}</div></div>
              </div>
              {['Pending', 'Accepted', 'Estimate Submitted', 'Estimate Rejected', 'Estimate Approved'].includes(status) && <button disabled={actionLoading} onClick={() => runAction(() => cancelBooking(booking.dbId), 'Booking cancelled.')} className="btn btn-outline-danger w-100">Cancel Booking</button>}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default EstimateApprovalPage;
