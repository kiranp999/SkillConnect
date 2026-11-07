import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { useBooking } from '../context/BookingContext';
import { FiTarget, FiEye, FiUsers, FiCheckCircle, FiFileText } from 'react-icons/fi';

const AboutPage = () => {
  const { workers } = useBooking();
  const verifiedWorkers = workers.filter((worker) => worker.isVerified).length;
  const districtsCovered = new Set(workers.map((worker) => worker.district).filter(Boolean)).size;
  const verificationSteps = [
    { title: '1. Identity Check', desc: 'Aadhaar, Voter ID, & Address verification' },
    { title: '2. Police Audit', desc: 'Criminal background history screening' },
    { title: '3. Trade Certification', desc: 'Skill certificates & apprenticeship review' },
    { title: '4. Field Assessment', desc: 'Practical test evaluation by senior engineers' },
    { title: '5. Community Rating', desc: 'Ongoing quality monitoring via customer feedback' }
  ];


  return (
    <MainLayout>
      {/* Header Banner */}
      <section className="py-5 text-center bg-primary-subtle border-bottom">
        <div className="container py-lg-4">
          <span className="badge-custom badge-primary mb-2">Empowering Local Tradesmen</span>
          <h1 className="fw-extrabold display-5 text-main">About SkillConnect</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Bridging the gap between skilled essential workers and local households through technology, transparency, and trust.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card-custom p-4 h-100 border-start border-4 border-primary">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 bg-primary-subtle text-primary rounded-3">
                    <FiTarget size={28} />
                  </div>
                  <h3 className="fw-bold m-0 text-main">Our Mission</h3>
                </div>
                <p className="text-muted leading-relaxed mb-0">
                  To democratize access to dignified daily employment for essential skilled workers across every district and panchayat, while guaranteeing safe, reliable, and transparent home services to families.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card-custom p-4 h-100 border-start border-4 border-success">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 bg-success-light text-success rounded-3">
                    <FiEye size={28} />
                  </div>
                  <h3 className="fw-bold m-0 text-main">Our Vision</h3>
                </div>
                <p className="text-muted leading-relaxed mb-0">
                  To become South Asia’s most trusted community service network where every local electrician, plumber, and carpenter has financial stability, certified reputation, and healthcare safety nets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Flow */}
      <section className="py-5 bg-body-secondary">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Safety Standard</span>
            <h2 className="fw-bold text-main">Worker 5-Stage Verification Process</h2>
          </div>

          <div className="row g-3">
            {verificationSteps.map((step, idx) => (
              <div key={idx} className="col-12 col-md">
                <div className="card-custom p-3 h-100 text-center">
                  <div className="fw-bold text-primary mb-2" style={{ fontSize: '1.2rem' }}>{step.title}</div>
                  <p className="text-muted small m-0">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-extrabold">—</h2>
              <span className="text-white-50 fw-semibold">Satisfied Households</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-extrabold">{verifiedWorkers}</h2>
              <span className="text-white-50 fw-semibold">Verified Professionals</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-extrabold">—</h2>
              <span className="text-white-50 fw-semibold">Services Completed</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-extrabold">{districtsCovered}</h2>
              <span className="text-white-50 fw-semibold">Local Panchayats</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Technology */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small tracking-wider">Platform Status</span>
            <h2 className="fw-bold text-main">Built Around Trust and Transparent Estimates</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4"><div className="card-custom p-4 text-center h-100"><FiUsers size={32} className="text-primary mb-3" /><h5 className="fw-bold text-main">{verifiedWorkers}</h5><p className="text-muted small mb-0">Verified workers currently visible</p></div></div>
            <div className="col-md-4"><div className="card-custom p-4 text-center h-100"><FiCheckCircle size={32} className="text-success mb-3" /><h5 className="fw-bold text-main">{districtsCovered}</h5><p className="text-muted small mb-0">Districts represented by visible workers</p></div></div>
            <div className="col-md-4"><div className="card-custom p-4 text-center h-100"><FiFileText size={32} className="text-primary mb-3" /><h5 className="fw-bold text-main">Estimate-first</h5><p className="text-muted small mb-0">Workers submit itemized estimates after inspection</p></div></div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutPage;
