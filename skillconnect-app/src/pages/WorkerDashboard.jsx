import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { workerService } from '../services/workerService';
import { adminService } from '../services/adminService';
import StatCard from '../components/cards/StatCard';
import MiniChart from '../components/ui/MiniChart';
import { FiCheckSquare, FiClock, FiStar, FiCheckCircle, FiXCircle, FiToggleLeft, FiToggleRight, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import { BsShieldCheck } from 'react-icons/bs';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { bookings, acceptBooking, rejectBooking, submitEstimate, completeJob } = useBooking();
  const { showToast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [workerData, setWorkerData] = useState(null);
  const [estimateFor, setEstimateFor] = useState(null);
  const [items, setItems] = useState([{ item: '', cost: '' }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminService.getWorkerDashboardData().then((data) => {
      setWorkerData(data);
      setIsAvailable(Boolean(data.is_available));
    }).catch((error) => showToast(error.response?.data?.error || 'Unable to load worker dashboard.', 'error'));
  }, []);

  const toggleAvailability = async () => {
    try {
      const response = await workerService.toggleAvailability();
      setIsAvailable(response.availability);
      showToast(response.availability ? 'You are now online.' : 'You are now offline.', 'info');
    } catch (error) {
      showToast(error.response?.data?.error || 'Unable to change availability.', 'error');
    }
  };

  const startEstimate = (booking) => {
    setEstimateFor(booking);
    setItems(booking.estimateBreakdown?.length ? booking.estimateBreakdown.map((x) => ({ item: x.item, cost: String(x.cost) })) : [{ item: '', cost: '' }]);
  };

  const updateItem = (index, key, value) => setItems((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const addItem = () => setItems((prev) => [...prev, { item: '', cost: '' }]);
  const removeItem = (index) => setItems((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));

  const submitWorkerEstimate = async (event) => {
    event.preventDefault();
    const cleaned = items.map((x) => ({ item: x.item.trim(), cost: Number(x.cost) })).filter((x) => x.item);
    if (!estimateFor || !cleaned.length || cleaned.some((x) => !Number.isFinite(x.cost) || x.cost < 0)) {
      showToast('Add at least one valid estimate item and cost.', 'error');
      return;
    }
    const total = cleaned.reduce((sum, x) => sum + x.cost, 0);
    setSubmitting(true);
    try {
      await submitEstimate(estimateFor.dbId, { estimate_amount: total.toFixed(2), estimate_breakdown: cleaned });
      showToast('Estimate submitted to the customer.', 'success');
      setEstimateFor(null);
    } catch (error) {
      showToast(error.response?.data?.errors?.estimate_amount?.[0] || error.response?.data?.error || error.message || 'Unable to submit estimate.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'Pending');
  const activeJobs = bookings.filter((b) => ['Accepted', 'Estimate Submitted', 'Estimate Rejected', 'Estimate Approved'].includes(b.status));

  return (
    <DashboardLayout title={`Worker Portal - ${workerData?.worker_name || user?.name || 'Worker'}`} subtitle="Manage requests, create itemized estimates, and complete approved services.">
      <div className="card-custom p-4 mb-4 bg-primary-subtle border-0 d-flex flex-column flex-md-row justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3"><span className="badge-custom badge-success p-2"><BsShieldCheck size={20} /> Verified Worker</span><span className="text-muted small">{workerData?.verification_status || 'Verified'}</span></div>
        <button onClick={toggleAvailability} className={`btn btn-sm d-flex align-items-center gap-2 fw-bold ${isAvailable ? 'btn-success' : 'btn-secondary'}`}>{isAvailable ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}{isAvailable ? 'ONLINE' : 'OFFLINE'}</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3"><StatCard title="Monthly Earnings" value={`₹${Number(workerData?.monthly_earnings || 0).toFixed(2)}`} icon={FiCheckSquare} color="#10b981" /></div>
        <div className="col-12 col-sm-6 col-md-3"><StatCard title="Jobs Completed" value={workerData?.completed_jobs_count ?? 0} icon={FiCheckSquare} color="#2563eb" /></div>
        <div className="col-12 col-sm-6 col-md-3"><StatCard title="Pending Requests" value={workerData?.pending_requests_count ?? pendingRequests.length} icon={FiClock} color="#f59e0b" /></div>
        <div className="col-12 col-sm-6 col-md-3"><StatCard title="Client Rating" value={`${Number(workerData?.average_rating || 0).toFixed(1)} / 5`} icon={FiStar} color="#f59e0b" subtitle={`${workerData?.reviews_count ?? 0} reviews`} /></div>
      </div>

      <div className="card-custom p-4 mb-4"><div className="d-flex justify-content-between mb-3"><div><h5 className="fw-bold mb-0 text-main">Weekly Earnings</h5><span className="text-muted small">Completed estimates from the last 7 days</span></div></div><MiniChart data={workerData?.earnings_chart_data || [0, 0, 0, 0, 0, 0, 0]} color="#10b981" height={150} /></div>

      <h5 className="fw-bold mb-3 text-main">Incoming Customer Requests</h5>
      {pendingRequests.length === 0 ? <div className="card-custom p-4 text-center text-muted mb-4">No pending job requests.</div> : pendingRequests.map((req) => (
        <div key={req.dbId} className="card-custom p-4 mb-3">
          <div className="d-flex justify-content-between gap-3"><div><span className="badge-custom badge-warning mb-1">New Request</span><h6 className="fw-bold text-main">{req.customerName}</h6><span className="text-muted small"><FiMapPin className="me-1" />{req.address}</span></div><div className="text-end small"><strong>{req.date}</strong><br />{req.timeSlot}</div></div>
          <p className="small text-muted bg-body-secondary p-2 rounded mt-3"><strong>Notes:</strong> {req.serviceDetails}</p>
          <div className="d-flex gap-2 justify-content-end"><button onClick={() => rejectBooking(req.dbId).then(() => showToast('Booking rejected.', 'info')).catch((e) => showToast(e.response?.data?.error || 'Unable to reject booking.', 'error'))} className="btn btn-sm btn-outline-danger"><FiXCircle className="me-1" /> Reject</button><button onClick={() => acceptBooking(req.dbId).then(() => showToast('Booking accepted. Inspect the job and prepare an estimate.', 'success')).catch((e) => showToast(e.response?.data?.error || 'Unable to accept booking.', 'error'))} className="btn btn-sm btn-success"><FiCheckCircle className="me-1" /> Accept</button></div>
        </div>
      ))}

      <h5 className="fw-bold mb-3 text-main">Active Jobs</h5>
      {activeJobs.length === 0 ? <div className="card-custom p-4 text-center text-muted">No active jobs.</div> : activeJobs.map((job) => (
        <div key={job.dbId} className="card-custom p-4 mb-3 border-start border-4 border-primary">
          <div className="d-flex justify-content-between"><div><h6 className="fw-bold text-main">{job.customerName} · #{job.id}</h6><p className="small text-muted mb-2">{job.serviceDetails}</p></div><span className="badge-custom badge-primary">{job.status}</span></div>
          {job.status === 'Accepted' || job.status === 'Estimate Rejected' ? <button onClick={() => startEstimate(job)} className="btn btn-sm btn-primary-custom"><FiPlus className="me-1" /> {job.status === 'Estimate Rejected' ? 'Revise Estimate' : 'Create Estimate'}</button> : null}
          {job.status === 'Estimate Submitted' && <div className="alert alert-warning small mt-3 mb-0">Estimate sent. Wait for customer approval.</div>}
          {job.status === 'Estimate Approved' && <button onClick={() => completeJob(job.dbId).then(() => showToast('Service marked completed.', 'success')).catch((e) => showToast(e.response?.data?.error || 'Unable to complete service.', 'error'))} className="btn btn-sm btn-success"><FiCheckCircle className="me-1" /> Mark Service Completed</button>}
        </div>
      ))}

      {estimateFor && <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,.45)' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><form onSubmit={submitWorkerEstimate}><div className="modal-header"><h5 className="modal-title">Estimate for #{estimateFor.id}</h5><button type="button" className="btn-close" onClick={() => setEstimateFor(null)} /></div><div className="modal-body">{items.map((row, index) => <div className="row g-2 mb-2" key={index}><div className="col-7"><input className="form-control" placeholder="Item / labor / material" value={row.item} onChange={(e) => updateItem(index, 'item', e.target.value)} required /></div><div className="col-4"><input className="form-control" type="number" min="0" step="0.01" placeholder="Cost ₹" value={row.cost} onChange={(e) => updateItem(index, 'cost', e.target.value)} required /></div><div className="col-1"><button type="button" className="btn btn-outline-danger" onClick={() => removeItem(index)}><FiTrash2 /></button></div></div>)}<button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>+ Add Item</button><div className="text-end mt-3 fs-5 fw-bold">Total: ₹{items.reduce((sum, x) => sum + (Number(x.cost) || 0), 0).toFixed(2)}</div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setEstimateFor(null)}>Cancel</button><button disabled={submitting} className="btn btn-primary-custom">{submitting ? 'Submitting...' : 'Submit Estimate'}</button></div></form></div></div></div>}
    </DashboardLayout>
  );
};

export default WorkerDashboard;
