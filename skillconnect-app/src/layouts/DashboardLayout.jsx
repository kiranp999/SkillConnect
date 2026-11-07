import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children, title = 'Dashboard', subtitle }) => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-body)' }}>
      <Navbar />
      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container">
          <div className="row g-4">
            {/* Sidebar Column */}
            <div className="col-lg-3 d-none d-lg-block">
              <Sidebar />
            </div>

            {/* Dashboard Main Content Area */}
            <div className="col-lg-9 col-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h3 className="fw-bold mb-1 text-main">{title}</h3>
                    {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
                  </div>
                </div>
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
