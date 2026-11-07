import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SearchBar from '../components/ui/SearchBar';
import CategoryCard from '../components/cards/CategoryCard';
import WorkerCard from '../components/cards/WorkerCard';
import { useBooking } from '../context/BookingContext';
import { faqsData } from '../utils/faqData';
import { motion } from 'framer-motion';
import {
  FiUserCheck,
  FiDollarSign,
  FiAward,
  FiArrowRight,
  FiSmartphone,
} from 'react-icons/fi';
import { BsGooglePlay, BsApple, BsLightningChargeFill, BsShieldCheck } from 'react-icons/bs';

const LandingPage = () => {
  const { categories, workers } = useBooking();
  const featuredWorkers = workers.slice(0, 3);
    const verifiedWorkers = workers.filter((worker) => worker.isVerified).length;

  return (
    <MainLayout>
      {/* HERO SECTION */}
      <section className="position-relative py-5 overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--primary-subtle) 0%, var(--bg-body) 100%)' }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <span className="badge-custom badge-primary mb-3">
                  <BsShieldCheck size={15} /> 100% Police & Govt ID Verified Local Workers
                </span>

                <h1 className="display-4 fw-extrabold mb-3 text-main" style={{ letterSpacing: '-1px' }}>
                  Find Verified <span style={{ color: 'var(--primary-color)' }}>Local Workers</span> Near You
                </h1>

                <p className="lead text-muted mb-4" style={{ fontSize: '1.15rem' }}>
                  Book trusted electricians, plumbers, carpenters, mechanics and other skilled professionals in your community with transparent estimates.
                </p>

                <div className="d-flex flex-wrap gap-3 mb-4">
                  <Link to="/workers" className="btn btn-primary-custom px-4 py-3 text-lg">
                    Find Workers <FiArrowRight size={18} />
                  </Link>
                  <Link to="/register?role=worker" className="btn btn-secondary-custom px-4 py-3 text-lg">
                    Become a Worker
                  </Link>
                </div>

                <div className="d-flex align-items-center gap-4 pt-3 border-top text-muted small">
                  <div>
                    <strong className="d-block fs-5 text-main">{verifiedWorkers}</strong>
                    <span>Verified Pros</span>
                  </div>
                  <div className="border-start ps-4">
                    <strong className="d-block fs-5 text-main">—</strong>
                    <span>Satisfaction Rate</span>
                  </div>
                  <div className="border-start ps-4">
                    <strong className="d-block fs-5 text-main">{new Set(workers.map((worker) => worker.district).filter(Boolean)).size}</strong>
                    <span>Local Coverage</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* HERO VECTOR ILLUSTRATION */}
            <div className="col-lg-6">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                <div className="position-relative text-center">
                  <svg viewBox="0 0 500 400" className="w-100 h-auto" style={{ maxHeight: '420px', filter: 'drop-shadow(0 20px 30px rgba(37,99,235,0.15))' }}>
                    <defs>
                      <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="40" width="460" height="320" rx="24" fill="var(--bg-surface)" stroke="var(--border-color)" strokeWidth="2" />
                    {/* Worker vector graphics representation */}
                    <circle cx="150" cy="160" r="45" fill="url(#heroGrad)" opacity="0.85" />
                    <rect x="120" y="220" width="60" height="90" rx="12" fill="#2563eb" />
                    <circle cx="350" cy="160" r="45" fill="#f59e0b" opacity="0.85" />
                    <rect x="320" y="220" width="60" height="90" rx="12" fill="#f59e0b" />
                    {/* Central house / service icon */}
                    <path d="M 250 110 L 190 170 L 210 170 L 210 240 L 290 240 L 290 170 L 310 170 Z" fill="var(--primary-color)" />
                    {/* Floating Trust Pills */}
                    <rect x="50" y="70" width="130" height="36" rx="18" fill="var(--bg-surface)" stroke="#10b981" strokeWidth="2" />
                    <text x="115" y="93" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">✓ Police Verified</text>
                    <rect x="320" y="70" width="130" height="36" rx="18" fill="var(--bg-surface)" stroke="#2563eb" strokeWidth="2" />
                    <text x="385" y="93" textAnchor="middle" fill="#2563eb" fontSize="12" fontWeight="bold">★ 4.9 Star Rating</text>
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating Search Bar */}
          <div className="mt-5">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Explore Services</span>
              <h2 className="fw-bold m-0 text-main">Popular Service Categories</h2>
            </div>
            <Link to="/services" className="btn btn-outline-custom mt-3 mt-md-0">
              View All Services <FiArrowRight />
            </Link>
          </div>

          <div className="row g-4">
            {categories.slice(0, 8).map((category) => (
              <div key={category.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED WORKERS */}
      <section className="py-5 bg-body-secondary">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Top Rated Professionals</span>
              <h2 className="fw-bold m-0 text-main">Featured Local Workers Near You</h2>
            </div>
            <Link to="/workers" className="btn btn-outline-custom mt-3 mt-md-0">
              Browse All Workers <FiArrowRight />
            </Link>
          </div>

          <div className="row g-4">
            {featuredWorkers.map((worker) => (
              <div key={worker.id} className="col-12 col-md-4">
                <WorkerCard worker={worker} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5">
        <div className="container text-center">
          <span className="text-primary fw-bold text-uppercase small tracking-wider">Simple Process</span>
          <h2 className="fw-bold mb-5 text-main">How SkillConnect Works</h2>

          <div className="row g-4">
            {[
              { step: '01', title: 'Search & Select', desc: 'Browse verified electricians, plumbers, or carpenters in your panchayat/ward.' },
              { step: '02', title: 'Schedule & Request', desc: 'Choose your preferred date, time slot, and describe your requirement.' },
              { step: '03', title: 'Approve Estimate', desc: 'Worker inspects and provides a transparent digital estimate for your approval.' },
              { step: '04', title: 'Pay Safely & Review', desc: 'Pay hassle-free after work completion and leave a community rating.' }
            ].map((item, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-3">
                <div className="card-custom p-4 h-100">
                  <span className="fs-1 fw-extrabold text-primary opacity-50 d-block mb-2">{item.step}</span>
                  <h5 className="fw-bold mb-2 text-main">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SKILLCONNECT */}
      <section className="py-5 bg-body-secondary">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Trust & Safety</span>
              <h2 className="fw-bold mb-4 text-main">Why Communities Choose SkillConnect</h2>

              <div className="d-flex flex-column gap-4">
                {[
                  { icon: BsShieldCheck, title: 'Compulsory 5-Stage Background Verification', desc: 'Every worker passes Aadhaar/Govt ID verification, police criminal record checks, and skill assessment.' },
                  { icon: FiDollarSign, title: '100% Upfront Digital Estimates', desc: 'No surprise costs! Review labor and materials cost breakdown before authorizing any job.' },
                  { icon: FiAward, title: 'Transparent Estimate Policy', desc: 'If work is not completed to standards, we provide a free re-inspection or 100% refund.' },
                  { icon: FiUserCheck, title: 'Support Local Worker Livelihoods', desc: 'Directly connect with independent neighborhood tradesmen without third-party agency cuts.' }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="d-flex gap-3">
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem',
                          flexShrink: 0
                        }}
                      >
                        <Icon />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 text-main">{feature.title}</h6>
                        <p className="text-muted small m-0">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card-custom p-5 text-center shadow-lg border border-2 border-primary">
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                  }}
                >
                  <BsLightningChargeFill />
                </div>
                <h3 className="fw-bold mb-3 text-main">Are You a Skilled Local Worker?</h3>
                <p className="text-muted mb-4">
                  Join thousands of verified electricians, mechanics, and carpenters earning steady daily income in their local districts.
                </p>
                <Link to="/register?role=worker" className="btn btn-primary-custom btn-lg w-100 py-3">
                  Register as a Verified Worker <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD APP SECTION */}
      <section className="py-5 text-white" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-white text-primary fw-bold mb-3 px-3 py-2 rounded-pill">
                <FiSmartphone className="me-1" /> Mobile Experience
              </span>
              <h2 className="display-6 fw-bold mb-3">Use SkillConnect on the Web</h2>
              <p className="lead mb-0 text-white-50">
                Use the web application to find verified workers, request a booking, review itemized estimates, and track service status.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/workers" className="btn btn-light text-primary btn-lg px-4 py-3 fw-bold">Find Workers <FiArrowRight /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Got Questions?</span>
            <h2 className="fw-bold text-main">Frequently Asked Questions</h2>
          </div>

          <div className="accordion d-flex flex-column gap-3" id="faqAccordion">
            {faqsData.map((faq, idx) => (
              <div key={idx} className="card-custom border p-3 rounded-3">
                <h6 className="fw-bold mb-2 text-main">{faq.q}</h6>
                <p className="text-muted small m-0">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
