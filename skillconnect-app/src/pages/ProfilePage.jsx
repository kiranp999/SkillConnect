import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateUserProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [ward, setWard] = useState(user?.ward || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ name, email, phone, address, ward, district });
      showToast('Profile information updated successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to update profile.', 'error');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) return showToast('New password must contain at least 6 characters.', 'error');
    setSaving(true);
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(''); setNewPass('');
      showToast('Password updated successfully.', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || error.message || 'Unable to change password.', 'error');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="My Profile Settings" subtitle="Update your personal details and account security.">
      <div className="card-custom p-4 p-md-5 mb-4">
        <div className="d-flex align-items-center gap-4 pb-4 border-bottom mb-4">
          <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 84, height: 84, fontSize: '2rem' }}>{user?.name?.charAt(0) || 'U'}</div>
          <div><h4 className="fw-bold m-0 text-main">{user?.name}</h4><span className="badge-custom badge-primary text-capitalize mt-1">{user?.role} Account</span><div className="text-muted small mt-1">{user?.email}</div></div>
        </div>
        <form onSubmit={handleUpdateInfo}>
          <h5 className="fw-bold mb-3 text-main">Personal Information</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-6"><label className="form-label small fw-bold text-main">Full Name</label><input className="form-control form-control-custom" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="col-md-6"><label className="form-label small fw-bold text-main">Email Address</label><input type="email" className="form-control form-control-custom" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="col-md-6"><label className="form-label small fw-bold text-main">Phone Number</label><input className="form-control form-control-custom" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label small fw-bold text-main">District</label><input className="form-control form-control-custom" value={district} onChange={(e) => setDistrict(e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label small fw-bold text-main">Ward</label><input className="form-control form-control-custom" value={ward} onChange={(e) => setWard(e.target.value)} /></div>
            <div className="col-12"><label className="form-label small fw-bold text-main">Address</label><input className="form-control form-control-custom" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          </div>
          <button disabled={saving} className="btn btn-primary-custom px-4">Save Profile Changes</button>
        </form>
      </div>

      <div className="card-custom p-4 p-md-5"><h5 className="fw-bold mb-3 text-main">Security & Password</h5><form onSubmit={handleChangePassword}><div className="row g-3 mb-3"><div className="col-md-6"><label className="form-label small fw-bold text-main">Current Password</label><input type="password" className="form-control form-control-custom" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} required /></div><div className="col-md-6"><label className="form-label small fw-bold text-main">New Password</label><input type="password" minLength={6} className="form-control form-control-custom" value={newPass} onChange={(e) => setNewPass(e.target.value)} required /></div></div><button disabled={saving} className="btn btn-secondary-custom">Update Security Password</button></form></div>
    </DashboardLayout>
  );
};

export default ProfilePage;
