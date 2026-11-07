import React from 'react';
import { FiCheck } from 'react-icons/fi';

const Timeline = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="position-relative py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between position-relative gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="d-flex flex-md-column align-items-center text-md-center gap-3 flex-1 position-relative">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step.done ? 'var(--success-color)' : 'var(--bg-surface-secondary)',
                color: step.done ? '#ffffff' : 'var(--text-muted)',
                border: `2px solid ${step.done ? 'var(--success-color)' : 'var(--border-color)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                zIndex: 2,
                boxShadow: step.done ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              {step.done ? <FiCheck size={20} /> : idx + 1}
            </div>

            <div>
              <h6 className={`mb-1 fw-bold ${step.done ? 'text-success' : 'text-main'}`} style={{ fontSize: '0.9rem' }}>
                {step.status}
              </h6>
              <span className="text-muted small d-block">{step.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
