import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

import { adminService } from '../services/adminService';
import { workerService } from '../services/workerService';

import StatCard from '../components/cards/StatCard';
import MiniChart from '../components/ui/MiniChart';
import { useToast } from '../context/ToastContext';

import {
  FiUsers,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiCalendar,
  FiLayers,
  FiActivity,
  FiArrowRight,
  FiRefreshCw,
  FiUserCheck,
  FiAlertCircle
} from 'react-icons/fi';

import { BsShieldCheck } from 'react-icons/bs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [adminData, setAdminData] = useState(null);
  const [pendingWorkersList, setPendingWorkersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // --------------------------------------------------
  // LOAD ADMIN DASHBOARD DATA
  // --------------------------------------------------

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const data = await adminService.getDashboardData();

      setAdminData(data || {});
      setPendingWorkersList(
        Array.isArray(data?.pending_workers_list)
          ? data.pending_workers_list
          : Array.isArray(data?.pending_workers_data)
            ? data.pending_workers_data
            : []
      );
    } catch (err) {
      console.error('Admin dashboard error:', err);

      showToast(
        err.response?.data?.error ||
          'Unable to load admin dashboard.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // --------------------------------------------------
  // WORKER APPROVAL
  // --------------------------------------------------

  const handleApprove = async (id, name) => {
    setActionId(id);

    try {
      await workerService.verifyWorker(id);

      setPendingWorkersList((prev) =>
        prev.filter((worker) => worker.id !== id)
      );

      showToast(
        `${name} has been verified and approved.`,
        'success'
      );

      // Refresh dashboard statistics
      await loadDashboard();
    } catch (err) {
      console.error('Worker approval error:', err);

      showToast(
        err.response?.data?.error ||
          `Unable to verify ${name}.`,
        'error'
      );
    } finally {
      setActionId(null);
    }
  };

  // --------------------------------------------------
  // WORKER REJECTION
  // --------------------------------------------------

  const handleReject = async (id, name) => {
    setActionId(id);

    try {
      await workerService.rejectWorker(id);

      setPendingWorkersList((prev) =>
        prev.filter((worker) => worker.id !== id)
      );

      showToast(
        `${name}'s application was rejected.`,
        'error'
      );

      // Refresh dashboard statistics
      await loadDashboard();
    } catch (err) {
      console.error('Worker rejection error:', err);

      showToast(
        err.response?.data?.error ||
          'Unable to reject worker application.',
        'error'
      );
    } finally {
      setActionId(null);
    }
  };

  // --------------------------------------------------
  // NORMALIZE BOOKING STATUS
  // --------------------------------------------------

  const normalizeStatusKey = (key) => {
    return String(key || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  };

  // --------------------------------------------------
  // BOOKING STATUS COUNTS
  // --------------------------------------------------

  const bookingStats = useMemo(() => {
    const source =
      adminData?.booking_status_counts ||
      adminData?.booking_stats ||
      adminData?.booking_status ||
      {};

    const normalized = {};

    Object.entries(source).forEach(([key, value]) => {
      normalized[normalizeStatusKey(key)] = Number(value) || 0;
    });

    const getCount = (...keys) => {
      for (const key of keys) {
        const normalizedKey = normalizeStatusKey(key);

        if (normalized[normalizedKey] !== undefined) {
          return normalized[normalizedKey];
        }
      }

      return 0;
    };

    return [
      {
        label: 'Pending',
        value: getCount('pending')
      },
      {
        label: 'Accepted',
        value: getCount('accepted')
      },
      {
        label: 'Estimate Submitted',
        value: getCount(
          'estimate submitted',
          'estimate_submitted',
          'estimate'
        )
      },
      {
        label: 'Estimate Rejected',
        value: getCount(
          'estimate rejected',
          'estimate_rejected'
        )
      },
      {
        label: 'Estimate Approved',
        value: getCount(
          'estimate approved',
          'estimate_approved'
        )
      },
      {
        label: 'Completed',
        value: getCount('completed')
      },
      {
        label: 'Cancelled',
        value: getCount(
          'cancelled',
          'canceled'
        )
      }
    ];
  }, [adminData]);

  // --------------------------------------------------
  // TOTAL BOOKING COUNT
  // --------------------------------------------------

  const calculatedBookingTotal = useMemo(() => {
    return bookingStats.reduce(
      (total, item) => total + Number(item.value || 0),
      0
    );
  }, [bookingStats]);

  // --------------------------------------------------
  // QUICK ACTIONS
  // --------------------------------------------------

  const quickActions = [
    {
      label: 'Review Workers',
      description: `${pendingWorkersList.length} waiting for verification`,
      icon: FiUserCheck,
      tone: 'warning',
      onClick: () => {
        document
          .getElementById('verification')
          ?.scrollIntoView({
            behavior: 'smooth'
          });
      }
    },

    {
      label: 'View Bookings',
      description: 'Review platform bookings',
      icon: FiCalendar,
      tone: 'primary',
      onClick: () => navigate('/bookings')
    },

    {
      label: 'System Settings',
      description: 'Account and platform settings',
      icon: FiLayers,
      tone: 'secondary',
      onClick: () => navigate('/settings')
    }
  ];

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <DashboardLayout
      title="Admin Control Center"
      subtitle="Manage verification, bookings, users and platform activity from one place."
    >
      {/* ==================================================
          ADMIN CONTROL BANNER
      ================================================== */}

      <section
        className="mb-4 rounded-4 overflow-hidden position-relative"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e3a8a 58%, #2563eb 100%)',
          color: '#fff',
          boxShadow:
            '0 18px 45px rgba(15, 23, 42, 0.16)'
        }}
      >
        <div className="p-4 p-md-5 position-relative">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
            <div>
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3"
                style={{
                  background: 'rgba(255,255,255,.12)'
                }}
              >
                <FiShield size={15} />

                <span className="small fw-semibold">
                  ADMINISTRATOR MODE
                </span>
              </div>

              <h2 className="fw-extrabold mb-2">
                SkillConnect Platform Control
              </h2>

              <p
                className="mb-0"
                style={{
                  color: 'rgba(255,255,255,.78)',
                  maxWidth: 650
                }}
              >
                Verify workers, monitor bookings, moderate
                platform activity and keep the community
                marketplace healthy.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-light fw-semibold px-4 py-2 rounded-3"
              onClick={loadDashboard}
              disabled={loading}
            >
              <FiRefreshCw
                className={`me-2 ${loading ? 'spin' : ''}`}
              />

              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          HIGH LEVEL METRICS
      ================================================== */}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Customers"
            value={adminData?.total_customers ?? 0}
            icon={FiUsers}
            color="#2563eb"
            subtitle="Registered accounts"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Workers"
            value={adminData?.total_workers ?? 0}
            icon={FiUsers}
            color="#0d9488"
            subtitle="Worker accounts"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Verification"
            value={pendingWorkersList.length}
            icon={FiClock}
            color="#f59e0b"
            subtitle="Needs admin action"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Bookings"
            value={
              adminData?.total_bookings ??
              calculatedBookingTotal
            }
            icon={FiFileText}
            color="#7c3aed"
            subtitle="All platform bookings"
          />
        </div>
      </div>

      {/* ==================================================
          QUICK ACTIONS
      ================================================== */}

      <section className="mb-4">
        <div className="d-flex align-items-end justify-content-between mb-3">
          <div>
            <div className="text-uppercase small fw-bold text-primary mb-1">
              Administration
            </div>

            <h5 className="fw-bold mb-0 text-main">
              Quick Actions
            </h5>
          </div>

          <span className="small text-muted">
            Common tasks
          </span>
        </div>

        <div className="row g-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <div
                className="col-12 col-sm-6 col-xl-4"
                key={action.label}
              >
                <button
                  type="button"
                  onClick={action.onClick}
                  className="w-100 text-start border-0 bg-transparent p-0"
                >
                  <div className="card-custom p-3 h-100 admin-action-card">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div
                        className={`admin-action-icon ${action.tone}`}
                      >
                        <Icon size={20} />
                      </div>

                      <FiArrowRight className="text-muted" />
                    </div>

                    <div className="mt-3 fw-bold text-main">
                      {action.label}
                    </div>

                    <div className="small text-muted mt-1">
                      {action.description}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          WORKER VERIFICATION
      ================================================== */}

      <section
        className="card-custom p-4 mb-4"
        id="verification"
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="admin-section-icon warning">
              <BsShieldCheck size={21} />
            </div>

            <div>
              <h5 className="fw-bold mb-1 text-main">
                Worker Verification Queue
              </h5>

              <p className="small text-muted mb-0">
                Review submitted identity and trade documents
                before approval.
              </p>
            </div>
          </div>

          <span className="badge-custom badge-warning px-3 py-2">
            {pendingWorkersList.length} Pending
          </span>
        </div>

        {pendingWorkersList.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-main">
              <thead className="small text-muted">
                <tr>
                  <th>Applicant</th>
                  <th>Trade</th>
                  <th>Location / Details</th>
                  <th>Verification Proofs</th>
                  <th className="text-end">Decision</th>
                </tr>
              </thead>

              <tbody>
                {pendingWorkersList.map((worker) => {
                  const name =
                    worker.full_name ||
                    worker.name ||
                    'Worker';

                  const busy =
                    actionId === worker.id;

                  return (
                    <tr key={worker.id}>
                      <td>
                        <div className="fw-bold">
                          {name}
                        </div>

                        <div className="small text-muted">
                          {worker.phone ||
                            worker.email ||
                            'Contact unavailable'}
                        </div>
                      </td>

                      <td>
                        <span className="badge-custom badge-primary">
                          {worker.category_name ||
                            worker.category ||
                            'General'}
                        </span>
                      </td>

                      <td>
                        <div>{worker.district || 'District not provided'}{worker.state ? `, ${worker.state}` : ''}</div>
                        <div className="small text-muted">
                          {[worker.ward, worker.panchayat, worker.pincode].filter(Boolean).join(' • ') || 'Ward / panchayat not provided'}
                        </div>
                        <div className="small mt-1">Experience: {worker.experience || 'Not provided'}</div>
                        <div className="small">Rate: {worker.hourly_rate != null ? `₹${worker.hourly_rate}/hour` : 'Not provided'}</div>
                        {worker.address && <div className="small text-muted mt-1">Address: {worker.address}</div>}
                        {worker.skills?.length > 0 && <div className="small mt-1">Skills: {worker.skills.join(', ')}</div>}
                        {worker.about && <div className="small text-muted mt-1">About: {worker.about}</div>}
                      </td>

                      <td>
                        <div className="d-flex flex-wrap gap-2 small">
                          {worker.government_id ? (
                            <a
                              href={worker.government_id}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary"
                            >
                              Govt ID
                            </a>
                          ) : (
                            <span className="text-danger">Government ID not uploaded</span>
                          )}

                          {worker.trade_certificate ? (
                            <a
                              href={worker.trade_certificate}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary"
                            >
                              Trade Cert
                            </a>
                          ) : (
                            <span className="text-danger">Trade certificate not uploaded</span>
                          )}

                          {worker.experience_certificate ? (
                            <a
                              href={worker.experience_certificate}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary"
                            >
                              Experience Certificate
                            </a>
                          ) : (
                            <span className="text-muted">No experience proof</span>
                          )}
                        </div>
                      </td>

                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                worker.id,
                                name
                              )
                            }
                            className="btn btn-sm btn-success"
                            disabled={busy}
                          >
                            <FiCheckCircle
                              className="me-1"
                              size={14}
                            />

                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleReject(
                                worker.id,
                                name
                              )
                            }
                            className="btn btn-sm btn-outline-danger"
                            disabled={busy}
                          >
                            <FiXCircle
                              className="me-1"
                              size={14}
                            />

                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="p-4 rounded-3 text-center"
            style={{
              background: 'var(--bg-body)'
            }}
          >
            <FiCheckCircle
              className="text-success mb-2"
              size={28}
            />

            <div className="fw-semibold text-main">
              Verification queue is clear
            </div>

            <div className="small text-muted">
              There are no worker applications waiting for
              review.
            </div>
          </div>
        )}
      </section>

      {/* ==================================================
          ANALYTICS + BOOKING STATUS
      ================================================== */}

      <div className="row g-4 mb-4">
        {/* PLATFORM ACTIVITY */}

        <div className="col-xl-7">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-1 text-main">
                  Platform Activity
                </h5>

                <span className="small text-muted">
                  Booking volume over recent periods
                </span>
              </div>

              <FiActivity
                className="text-primary"
                size={21}
              />
            </div>

            <MiniChart
              data={
                Array.isArray(
                  adminData?.booking_volume_trend
                )
                  ? adminData.booking_volume_trend
                  : [0, 0, 0, 0, 0, 0, 0]
              }
              color="#2563eb"
              height={150}
            />
          </div>
        </div>

        {/* BOOKING STATUS */}

        <div className="col-xl-5">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-1 text-main">
                  Booking Status
                </h5>

                <span className="small text-muted">
                  Current operational snapshot
                </span>
              </div>

              <FiFileText
                className="text-primary"
                size={21}
              />
            </div>

            <div className="d-flex flex-column gap-2">
              {bookingStats.map((item) => (
                <div
                  key={item.label}
                  className="d-flex justify-content-between align-items-center p-2 rounded-3"
                  style={{
                    background: 'var(--bg-body)'
                  }}
                >
                  <span className="small text-muted">
                    {item.label}
                  </span>

                  <strong className="text-main">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECONDARY METRICS
      ================================================== */}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard
            title="Verified Workers"
            value={adminData?.verified_workers ?? 0}
            icon={BsShieldCheck}
            color="#10b981"
          />
        </div>

        <div className="col-md-4">
          <StatCard
            title="Platform Revenue"
            value={`₹${Number(
              adminData?.total_revenue || 0
            ).toFixed(2)}`}
            icon={FiDollarSign}
            color="#059669"
          />
        </div>

        <div className="col-md-4">
          <StatCard
            title="Attention Items"
            value={pendingWorkersList.length}
            icon={FiAlertCircle}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* ==================================================
          RECENT PLATFORM ACTIVITY
      ================================================== */}

      <section className="card-custom p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-1 text-main">
              Recent Platform Activity
            </h5>

            <span className="small text-muted">
              Administrative audit events and system activity
            </span>
          </div>

          <FiActivity className="text-muted" />
        </div>

        <div className="d-flex flex-column gap-2">
          {Array.isArray(adminData?.audit_log) &&
          adminData.audit_log.length > 0 ? (
            adminData.audit_log.map((log, index) => (
              <div
                key={index}
                className="p-3 rounded-3 d-flex flex-column flex-md-row justify-content-between gap-2"
                style={{
                  background: 'var(--bg-body)'
                }}
              >
                <span className="small text-main">
                  <strong>{log.title}:</strong>{' '}
                  {log.desc}
                </span>

                <span className="small text-muted">
                  {log.time}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-muted small py-3">
              No recent activity to display.
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          PAGE STYLES
      ================================================== */}

      <style>{`
        .admin-action-card {
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;

          border: 1px solid transparent;
        }

        .admin-action-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 28px rgba(15, 23, 42, 0.08);
          border-color:
            rgba(37, 99, 235, 0.16);
        }

        .admin-action-icon,
        .admin-section-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .admin-action-icon.primary,
        .admin-section-icon.primary {
          background: rgba(37, 99, 235, 0.11);
          color: #2563eb;
        }

        .admin-action-icon.warning,
        .admin-section-icon.warning {
          background: rgba(245, 158, 11, 0.13);
          color: #d97706;
        }

        .admin-action-icon.success,
        .admin-section-icon.success {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .admin-action-icon.secondary,
        .admin-section-icon.secondary {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
        }

        .spin {
          animation: adminSpin 1s linear infinite;
        }

        @keyframes adminSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminDashboard;