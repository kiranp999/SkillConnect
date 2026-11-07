import React from 'react';
import { Link } from 'react-router-dom';
import { BsLightningChargeFill, BsApple, BsGooglePlay, BsShieldCheck } from 'react-icons/bs';
import { FiHeart, FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div className="row g-4 pb-5 border-bottom mb-4">
          {/* Brand Column */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 mb-3 text-decoration-none">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <BsLightningChargeFill size={20} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Skill<span style={{ color: 'var(--primary-color)' }}>Connect</span>
              </span>
            </Link>
            <p className="text-muted mb-4" style={{ fontSize: '0.95rem', maxWidth: '340px' }}>
              Connecting Communities with Trusted Local Professionals. verified electricians, plumbers, carpenters, mechanics & skilled labor at your doorstep.
            </p>
            <div className="d-flex align-items-center gap-2 text-success fw-semibold small">
              <BsShieldCheck size={18} /> 100% Police & Govt ID Verified Workers
            </div>
          </div>

          {/* Popular Services Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Services</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/services" className="text-muted text-decoration-none">Electrician Services</Link></li>
              <li><Link to="/services" className="text-muted text-decoration-none">Plumbing & Leakage</Link></li>
              <li><Link to="/services" className="text-muted text-decoration-none">Carpentry & Furniture</Link></li>
              <li><Link to="/services" className="text-muted text-decoration-none">AC Repair & Service</Link></li>
              <li><Link to="/services" className="text-muted text-decoration-none">Home Deep Clean</Link></li>
              <li><Link to="/services" className="text-muted text-decoration-none">Auto Mechanics</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Platform</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/about" className="text-muted text-decoration-none">About Us</Link></li>
              <li><Link to="/workers" className="text-muted text-decoration-none">Search Workers</Link></li>
              <li><Link to="/register" className="text-muted text-decoration-none">Become a Worker</Link></li>
              <li><Link to="/contact" className="text-muted text-decoration-none">Help & Support</Link></li>
              <li><Link to="/settings" className="text-muted text-decoration-none">Settings</Link></li>
            </ul>
          </div>

          {/* App & Newsletter Column */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Get SkillConnect App</h6>
            <p className="text-muted small mb-3">Book services faster and track live arrival of workers on mobile.</p>
            <div className="d-flex gap-2 mb-4">
              <a href="#playstore" className="btn btn-secondary-custom btn-sm px-3 py-2">
                <BsGooglePlay size={18} className="me-2 text-success" /> Play Store
              </a>
              <a href="#appstore" className="btn btn-secondary-custom btn-sm px-3 py-2">
                <BsApple size={18} className="me-2 text-dark" /> App Store
              </a>
            </div>

            <h6 className="fw-bold mb-2 small" style={{ color: 'var(--text-main)' }}>Community Newsletter</h6>
            <div className="input-group">
              <input
                type="email"
                className="form-control-custom"
                placeholder="Enter your email address"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button className="btn btn-primary-custom" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-muted small">
          <div>
            © {new Date().getFullYear()} <strong>SkillConnect Inc.</strong> All Rights Reserved. Built with <FiHeart className="text-danger mx-1" /> for local communities.
          </div>
          <div className="d-flex gap-3">
            <a href="#privacy" className="text-muted text-decoration-none">Privacy Policy</a>
            <a href="#terms" className="text-muted text-decoration-none">Terms of Service</a>
            <a href="#trust" className="text-muted text-decoration-none">Safety Guarantee</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
