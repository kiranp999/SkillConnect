import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/common/ThemeToggle';
import { FiLogOut } from 'react-icons/fi';

const getPreference = (key, fallback) => {
  const value = localStorage.getItem(key);
  return value === null ? fallback : value === 'true';
};

const SettingsPage = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(() => getPreference('skillconnect_email_alerts', true));
  const [smsAlerts, setSmsAlerts] = useState(() => getPreference('skillconnect_sms_alerts', true));

  useEffect(() => localStorage.setItem('skillconnect_email_alerts', String(emailAlerts)), [emailAlerts]);
  useEffect(() => localStorage.setItem('skillconnect_sms_alerts', String(smsAlerts)), [smsAlerts]);

  const toggle = (setter, label) => (event) => {
    setter(event.target.checked);
    showToast(`${label} ${event.target.checked ? 'enabled' : 'disabled'}.`, 'info');
  };

  return (
    <DashboardLayout title="Account Settings" subtitle="Configure appearance and notification preferences.">
      <div className="card-custom p-4 mb-4"><h5 className="fw-bold mb-3 text-main">Appearance</h5><div className="d-flex justify-content-between align-items-center"><div><strong className="text-main">Theme</strong><div className="small text-muted">Current theme: {theme}</div></div><ThemeToggle /></div></div>
      <div className="card-custom p-4 mb-4"><h5 className="fw-bold mb-3 text-main">Notification Preferences</h5><div className="d-flex flex-column gap-3"><label className="form-check form-switch d-flex justify-content-between p-0"><span className="fw-semibold text-main">Email notifications</span><input className="form-check-input" type="checkbox" checked={emailAlerts} onChange={toggle(setEmailAlerts, 'Email notifications')} /></label><label className="form-check form-switch d-flex justify-content-between p-0"><span className="fw-semibold text-main">SMS/WhatsApp notification preference</span><input className="form-check-input" type="checkbox" checked={smsAlerts} onChange={toggle(setSmsAlerts, 'SMS/WhatsApp notifications')} /></label></div><p className="small text-muted mt-3 mb-0">These preferences are stored locally in this browser. External email/SMS delivery is not connected to this deployment.</p></div>
      <div className="card-custom p-4 border-danger"><h5 className="fw-bold mb-2 text-danger">Sign Out</h5><p className="text-muted small">Clear this browser session and return to the login page.</p><button onClick={logout} className="btn btn-outline-danger px-4"><FiLogOut className="me-2" /> Log Out</button></div>
    </DashboardLayout>
  );
};

export default SettingsPage;
