import React from 'react';

const MiniChart = ({ data = [20, 35, 25, 45, 60, 55, 80], height = 140, color = '#2563eb' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 300;
      const y = height - ((val - min) / (max - min || 1)) * (height - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-100 position-relative">
      <svg viewBox={`0 0 300 ${height}`} className="w-100 overflow-visible" style={{ height: `${height}px` }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} 300,${height}`}
          fill="url(#chartGrad)"
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

export default MiniChart;
