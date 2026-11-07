import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiCalendar,
  FiClock,
  FiHeart,
  FiStar,
  FiUser,
  FiSettings,
  FiCheckSquare,
  FiTrendingUp,
  FiUsers,
  FiPieChart,
  FiFileText
} from 'react-icons/fi';
import { BsShieldCheck } from 'react-icons/bs';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const customerLinks = [
    { to: '/dashboard/customer', label: 'Overview', icon: FiGrid },
    { to: '/bookings', label: 'My Bookings', icon: FiCalendar },
    { to: '/search-workers', label: 'Find Workers', icon: FiUsers },
    { to: '/profile', label: 'My Profile', icon: FiUser },
    { to: '/settings', label: 'Account Settings', icon: FiSettings }
  ];

  const workerLinks = [
    { to: '/dashboard/worker', label: 'Worker Dashboard', icon: FiGrid },
    { to: '/bookings', label: 'Job Schedule', icon: FiCalendar },
    { to: '/profile', label: 'Worker Profile & Skills', icon: FiUser },
    { to: '/settings', label: 'Preferences & Payouts', icon: FiSettings }
  ];

const adminLinks = [
  { to: '/dashboard/admin', label: 'Admin Dashboard', icon: FiGrid },
  { to: '/dashboard/admin#verification', label: 'Worker Verification', icon: BsShieldCheck },
  { to: '/bookings', label: 'Platform Bookings', icon: FiCalendar },
  { to: '/settings', label: 'System Settings', icon: FiSettings }
];

  const links = role === 'worker' ? workerLinks : role === 'admin' ? adminLinks : customerLinks;

  return (
    <div className="card-custom p-3 h-100" style={{ minWidth: '240px' }}>
      <div className="p-3 mb-3 bg-primary-subtle rounded-3 text-center">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user?.name || 'User'}
            className="rounded-circle mb-2 border border-2 border-primary"
            style={{ width: '56px', height: '56px', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="rounded-circle mb-2 border border-2 border-primary bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold"
            aria-label="User avatar placeholder"
            style={{ width: '56px', height: '56px' }}
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <h6 className="fw-bold mb-0 text-main text-truncate">{user?.name}</h6>
        <span className="badge-custom badge-primary text-capitalize mt-1">{role} Portal</span>
      </div>

      <nav className="nav flex-column gap-1">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={idx}
              to={link.to}
              end={link.to.includes('dashboard')}
              className={({ isActive }) =>
                `nav-link p-2.5 rounded-3 d-flex align-items-center gap-3 fw-medium ${
                  isActive ? 'bg-primary text-white shadow-sm' : 'text-main hover-bg-secondary'
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
