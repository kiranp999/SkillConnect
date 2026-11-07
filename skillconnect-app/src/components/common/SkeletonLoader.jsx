import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  return (
    <div className="row g-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="col-12 col-md-6 col-lg-4">
          <div className="card-custom p-4 animate-pulse">
            <div className="d-flex gap-3 mb-3">
              <div className="rounded-circle bg-secondary-subtle" style={{ width: '60px', height: '60px' }}></div>
              <div className="flex-grow-1">
                <div className="bg-secondary-subtle rounded mb-2" style={{ height: '18px', width: '70%' }}></div>
                <div className="bg-secondary-subtle rounded" style={{ height: '14px', width: '40%' }}></div>
              </div>
            </div>
            <div className="bg-secondary-subtle rounded mb-2" style={{ height: '14px', width: '90%' }}></div>
            <div className="bg-secondary-subtle rounded mb-3" style={{ height: '14px', width: '60%' }}></div>
            <div className="d-flex justify-content-between pt-3 border-top">
              <div className="bg-secondary-subtle rounded" style={{ height: '24px', width: '30%' }}></div>
              <div className="bg-secondary-subtle rounded-pill" style={{ height: '30px', width: '35%' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
