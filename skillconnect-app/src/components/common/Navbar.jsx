import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { FiBriefcase, FiUser, FiSettings, FiLogOut, FiCheckCircle, FiHome, FiInfo, FiGrid, FiUsers, FiPhoneCall, FiMenu, FiX } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardPath = !user
  ? '/'
  : user.role === 'worker'
    ? '/dashboard/worker'
    : user.role === 'admin'
      ? '/dashboard/admin'
      : '/dashboard/customer';
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff`;

  const signOut = () => {
    logout();
    setProfileOpen(false);
    navigate('/login', { replace: true });
  };

  const publicLinks = [
  ['/', FiHome, 'Home'],
  ['/services', FiGrid, 'Services'],
  ['/workers', FiUsers, 'Find Workers'],
  ['/about', FiInfo, 'About Us'],
  ['/contact', FiPhoneCall, 'Contact']
];

const adminLinks = [
  ['/dashboard/admin', FiBriefcase, 'Dashboard'],
  ['/about', FiInfo, 'About Us'],
  ['/contact', FiPhoneCall, 'Contact']
];

const links = user?.role === 'admin' ? adminLinks : publicLinks;

  return (
    <header className="sticky-top glass-panel" style={{ zIndex: 1050, borderBottom: '1px solid var(--border-color)' }}>
      <nav className="navbar navbar-expand-lg py-2 py-lg-3">
        <div className="container">
          <Link to={dashboardPath} className="navbar-brand d-flex align-items-center gap-2">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BsLightningChargeFill size={22} /></div>
            <div><span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>Skill<span style={{ color: 'var(--primary-color)' }}>Connect</span></span><span className="d-block text-muted" style={{ fontSize: '.65rem', fontWeight: 600, marginTop: '-4px' }}>COMMUNITY WORKERS</span></div>
          </Link>

          <div className="collapse navbar-collapse d-none d-lg-flex"><ul className="navbar-nav mx-auto gap-1 gap-xl-2">{links.map(([to, Icon, label]) => <li className="nav-item" key={to}><NavLink to={to} className={({ isActive }) => `nav-link px-3 py-2 fw-semibold rounded-3 ${isActive ? 'text-primary bg-primary-subtle' : 'text-main'}`}><Icon className="me-1" /> {label}</NavLink></li>)}</ul></div>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            <ThemeToggle />
            {user ? (
              <div className="position-relative d-none d-sm-block">
                <button onClick={() => setProfileOpen((value) => !value)} className="border-0 bg-transparent p-0" aria-label="Open account menu"><img src={avatar} alt={user.name} className="rounded-circle border border-2 border-primary" style={{ width: 42, height: 42, objectFit: 'cover' }} /></button>
                {profileOpen && <div className="position-absolute end-0 mt-2 p-2 rounded-4 card-custom shadow-lg" style={{ width: 230, zIndex: 1100, background: 'var(--bg-surface)' }}>
                  <div className="p-2 border-bottom mb-1"><div className="fw-bold text-truncate">{user.name}</div><div className="small text-muted text-truncate">{user.email}</div><span className="badge-custom badge-primary mt-1 text-capitalize">{user.role}</span></div>
                  <Link to={dashboardPath} onClick={() => setProfileOpen(false)} className="dropdown-item p-2 rounded d-flex gap-2 text-main"><FiBriefcase /> Dashboard</Link>
                  <Link to="/bookings" onClick={() => setProfileOpen(false)} className="dropdown-item p-2 rounded d-flex gap-2 text-main"><FiCheckCircle /> Bookings</Link>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="dropdown-item p-2 rounded d-flex gap-2 text-main"><FiUser /> Profile</Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)} className="dropdown-item p-2 rounded d-flex gap-2 text-main"><FiSettings /> Settings</Link>
                  <hr className="my-1" />
                  <button onClick={signOut} className="dropdown-item p-2 rounded d-flex gap-2 text-danger border-0 bg-transparent w-100"><FiLogOut /> Sign Out</button>
                </div>}
              </div>
            ) : <div className="d-flex align-items-center gap-2"><Link to="/login" className="btn btn-secondary-custom px-3 py-2">Sign In</Link><Link to="/register" className="btn btn-primary-custom px-3 py-2">Register</Link></div>}

            <button onClick={() => setMobileOpen((value) => !value)} className="btn d-lg-none p-2 border-0" aria-label="Toggle menu">{mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </div>
        </div>

        {mobileOpen && <div className="container d-lg-none mt-3 pt-3 border-top"><ul className="navbar-nav gap-2">{links.map(([to, Icon, label]) => <li className="nav-item" key={to}><Link to={to} onClick={() => setMobileOpen(false)} className="nav-link fw-semibold"><Icon className="me-2" />{label}</Link></li>)}{user && <li className="nav-item border-top pt-2"><Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="nav-link fw-semibold"><FiBriefcase className="me-2" />Dashboard</Link><button onClick={signOut} className="btn btn-link text-danger p-0"><FiLogOut className="me-2" />Sign Out</button></li>}</ul></div>}
      </nav>
    </header>
  );
};

export default Navbar;
