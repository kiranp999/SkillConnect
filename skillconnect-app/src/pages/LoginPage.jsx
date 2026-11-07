import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const userObj = await login(email, password, role, rememberMe);
      setIsLoading(false);
      showToast(`Welcome back! Logged in as ${role.toUpperCase()}.`, 'success');

      if (userObj.role === 'worker') navigate('/dashboard/worker');
      else if (userObj.role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/customer');
    } catch (err) {
      setIsLoading(false);
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    }
  };

  return (
    <MainLayout>
      <section className="py-5 my-md-4">
        <div className="container">
          <div className="card-custom overflow-hidden shadow-lg border-0" style={{ borderRadius: '24px' }}>
            <div className="row g-0">
              {/* Left Branding Side */}
              <div
                className="col-lg-6 p-5 d-none d-lg-flex flex-column justify-content-between text-white position-relative"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <BsLightningChargeFill size={22} className="text-white" />
                    </div>
                    <span className="fs-3 fw-bold">SkillConnect</span>
                  </div>

                  <h2 className="display-6 fw-extrabold mb-3">Connecting Communities with Trusted Pros</h2>
                  <p className="text-white-50 lead mb-4">
                    Access verified electricians, plumbers, mechanics and carpenters with transparent upfront pricing.
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 p-4 rounded-4 backdrop-blur">
                  <div className="d-flex align-items-center gap-2 text-warning fw-bold mb-2">
                    <FiShield size={20} /> 100% Police & Identity Verified
                  </div>
                  <p className="small text-white-50 m-0">
                    Over 45,000+ bookings completed with 99.2% community satisfaction rate across 34 districts.
                  </p>
                </div>
              </div>

              {/* Right Form Side */}
              <div className="col-lg-6 p-4 p-md-5 bg-surface">
                <div className="text-center text-lg-start mb-4">
                  <h3 className="fw-bold mb-1 text-main">Welcome Back</h3>
                  <p className="text-muted small">Sign in to manage your bookings and service requests.</p>
                </div>

                {/* Role Switcher Selector Tabs */}
                <div className="d-flex p-1 bg-body-secondary rounded-3 mb-4">
                  {['customer', 'worker', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`btn btn-sm flex-fill fw-bold py-2 text-capitalize ${
                        role === r ? 'btn-primary shadow-sm' : 'text-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-main">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-body-secondary border-end-0 text-muted">
                        <FiMail />
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-custom border-start-0 ps-0"
                        placeholder={
                          role === 'worker'
                            ? 'rajesh.electrician@skillconnect.org'
                            : role === 'admin'
                            ? 'admin@skillconnect.org'
                            : 'kiran.patel@example.com'
                        }
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold text-main mb-0">Password</label>
                      <button type="button" onClick={() => showToast('Password reset email delivery is not configured yet. Please contact the administrator.', 'info')} className="btn btn-link p-0 small text-primary text-decoration-none">Forgot Password?</button>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-body-secondary border-end-0 text-muted">
                        <FiLock />
                      </span>
                      <input
                        type="password"
                        className="form-control form-control-custom border-start-0 ps-0"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-check mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberCheck"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label small text-muted" htmlFor="rememberCheck">
                      Remember me on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary-custom w-100 py-3 mb-3 justify-content-center"
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    ) : (
                      <>
                        Sign In as {role.toUpperCase()} <FiArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="small text-muted text-center mb-3">
                    Use the email and password you registered with. Worker accounts require admin verification before login.
                  </div>
                </form>

                <div className="text-center pt-3 border-top">
                  <span className="text-muted small">Don't have an account? </span>
                  <Link to="/register" className="fw-bold text-primary text-decoration-none">
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LoginPage;
