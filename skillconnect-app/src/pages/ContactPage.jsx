import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useToast } from '../context/ToastContext';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';

const ContactPage = () => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:support@skillconnect.org?subject=${encodeURIComponent(subject || 'SkillConnect Support Request')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    showToast('Your email client has been opened with the support message.', 'info');
  };

  return (
    <MainLayout>
      <section className="py-5 text-center bg-primary-subtle border-bottom">
        <div className="container py-lg-3">
          <span className="badge-custom badge-primary mb-2">24/7 Community Support</span>
          <h1 className="fw-extrabold display-5 text-main">Contact SkillConnect</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Have questions about worker verification, booking estimates, or partnership opportunities? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            {/* Left Contact Form */}
            <div className="col-lg-7">
              <form onSubmit={handleSubmit} className="card-custom p-4 p-md-5">
                <h4 className="fw-bold mb-4 text-main">Send Us a Message</h4>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-main">Your Full Name *</label>
                    <input type="text" className="form-control form-control-custom" placeholder="Kiran Patel" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-main">Your Email *</label>
                    <input type="email" className="form-control form-control-custom" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-main">Subject</label>
                  <input type="text" className="form-control form-control-custom" placeholder="e.g. Inquiry regarding ITI certified worker registration" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-main">Message *</label>
                  <textarea rows={5} className="form-control form-control-custom" placeholder="Type your query here..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary-custom px-4 py-3">
                  Send Message <FiSend className="ms-1" />
                </button>
              </form>
            </div>

            {/* Right Support Details & Map Embed */}
            <div className="col-lg-5">
              <div className="card-custom p-4 mb-4">
                <h5 className="fw-bold mb-4 text-main">Direct Channels</h5>

                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-3 bg-primary-subtle text-primary rounded-3">
                      <FiPhone size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold m-0 text-main">Toll-Free Community Helpline</h6>
                      <p className="text-muted small m-0">+91 (800) 456-7890 / +91 98989 12345</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-3 bg-primary-subtle text-primary rounded-3">
                      <FiMail size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold m-0 text-main">Official Support Email</h6>
                      <p className="text-muted small m-0">support@skillconnect.org / help@skillconnect.org</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-3 bg-primary-subtle text-primary rounded-3">
                      <FiMapPin size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold m-0 text-main">Headquarters Office</h6>
                      <p className="text-muted small m-0">SkillConnect Innovation Hub, Indiranagar 10th Main, Central Metro, Karnataka 560001</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Embed Placeholder */}
              <div className="card-custom p-3 overflow-hidden text-center bg-body-secondary">
                <svg viewBox="0 0 400 200" className="w-100 rounded-3">
                  <rect width="400" height="200" fill="var(--bg-surface-secondary)" />
                  <path d="M 50 100 Q 150 20 250 100 T 350 100" fill="none" stroke="#2563eb" strokeWidth="4" />
                  <circle cx="200" cy="100" r="10" fill="#ef4444" />
                  <text x="200" y="140" textAnchor="middle" fill="var(--text-main)" fontSize="14" fontWeight="bold">
                    📍 Central Metro HQ
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactPage;
