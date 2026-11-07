import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = '#2563eb', change, subtitle }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-custom p-4 h-100 position-relative overflow-hidden"
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <span className="text-muted small fw-semibold text-uppercase tracking-wider">{title}</span>
          <h2 className="fw-extrabold m-0 mt-1" style={{ color: 'var(--text-main)', fontSize: '1.9rem' }}>
            {value}
          </h2>
        </div>
        {Icon && (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}
          >
            <Icon />
          </div>
        )}
      </div>

      <div className="d-flex align-items-center justify-content-between small">
        {change && (
          <span className={`fw-bold ${change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
            {change} <span className="text-muted fw-normal">vs last month</span>
          </span>
        )}
        {subtitle && <span className="text-muted">{subtitle}</span>}
      </div>
    </motion.div>
  );
};

export default StatCard;
