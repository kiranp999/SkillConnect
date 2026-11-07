import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FiHome, FiSearch, FiAlertTriangle } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <MainLayout>
      <section className="py-5 text-center my-md-5">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card-custom p-5 shadow-lg border-0">
            <div className="mb-4">
              <span className="display-1 fw-extrabold text-primary d-block">404</span>
              <span className="badge-custom badge-warning fs-6">
                <FiAlertTriangle className="me-1" /> Page Not Found
              </span>
            </div>

            <h3 className="fw-bold mb-3 text-main">Oops! You've wandered off the grid.</h3>
            <p className="text-muted mb-4">
              The page or worker profile you are looking for might have been moved or doesn't exist in our district directory.
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/" className="btn btn-primary-custom px-4 py-2.5">
                <FiHome /> Back to Home
              </Link>
              <Link to="/workers" className="btn btn-secondary-custom px-4 py-2.5">
                <FiSearch /> Search Workers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default NotFoundPage;
