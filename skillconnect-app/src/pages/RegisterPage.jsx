import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { categoryService } from '../services/categoryService';
import { FiUser, FiBriefcase, FiUploadCloud, FiCheckCircle, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const RegisterPage = () => {
  const { registerCustomer, registerWorker } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(searchParams.get('role') === 'worker' ? 'worker' : 'customer');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [panchayat, setPanchayat] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('1-3 Years');
  const [hourlyRate, setHourlyRate] = useState('500.00');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [govtIdFile, setGovtIdFile] = useState(null);
  const [tradeCertFile, setTradeCertFile] = useState(null);
  const [expCertFile, setExpCertFile] = useState(null);

  useEffect(() => {
    categoryService.getCategories().then((items) => {
      setCategories(Array.isArray(items) ? items : []);
      if (!category && items?.length) setCategory(items[0].category_id);
    }).catch(() => showToast('Unable to load service categories.', 'error'));
  }, []);

  const handleCompleteRegistration = async (event) => {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (role === 'customer') {
        await registerCustomer({ full_name: fullName.trim(), email: email.trim(), phone: phone.trim(), password, address, ward, panchayat, district, state, pincode });
        showToast('Customer registered successfully!', 'success');
        navigate('/dashboard/customer', { replace: true });
      } else {
        if (!category) throw new Error('Please select a service category.');
        if (!govtIdFile || !tradeCertFile) throw new Error('Government ID and trade certificate are required for worker verification.');
        const formData = new FormData();
        formData.append('full_name', fullName.trim());
        formData.append('email', email.trim());
        formData.append('phone', phone.trim());
        formData.append('password', password);
        formData.append('category_id', category);
        formData.append('experience', experience);
        formData.append('hourly_rate', hourlyRate);
        formData.append('address', address);
        formData.append('ward', ward);
        formData.append('panchayat', panchayat);
        formData.append('district', district);
        formData.append('state', state);
        formData.append('pincode', pincode);
        if (profilePhotoFile) formData.append('profile_photo', profilePhotoFile);
        formData.append('government_id', govtIdFile);
        formData.append('trade_certificate', tradeCertFile);
        if (expCertFile) formData.append('experience_certificate', expCertFile);

        await registerWorker(formData);
        showToast('Worker application submitted. Wait for admin verification before signing in.', 'success');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-5 my-md-3">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="card-custom p-4 p-md-5 shadow-lg border-0" style={{ borderRadius: '24px' }}>
            <div className="text-center mb-4">
              <span className="badge-custom badge-primary mb-2">Join SkillConnect Community</span>
              <h2 className="fw-extrabold text-main">Create Your Account</h2>
              <p className="text-muted small">{step === 1 ? 'Step 1: Choose how you want to use the platform' : `Step 2: Enter your ${role} registration details`}</p>
            </div>

            {step === 1 && (
              <div>
                <div className="row g-4 mb-4">
                  {[
                    ['customer', FiUser, 'I am a Customer', 'Find and book verified local service providers.'],
                    ['worker', FiBriefcase, 'I am a Skilled Worker', 'Offer services after administrator verification.']
                  ].map(([value, Icon, title, description]) => (
                    <div className="col-md-6" key={value}>
                      <button type="button" onClick={() => setRole(value)} className={`card-custom p-4 text-center w-100 cursor-pointer transition-all border ${role === value ? 'border-primary bg-primary-subtle shadow' : ''}`}>
                        <Icon size={34} className="text-primary mb-3" />
                        <h4 className="fw-bold mb-2 text-main">{title}</h4>
                        <p className="text-muted small m-0">{description}</p>
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn btn-primary-custom w-100 py-3 justify-content-center">
                  Continue as {role.toUpperCase()} <FiArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleCompleteRegistration}>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-sm btn-outline-secondary"><FiArrowLeft className="me-1" /> Back</button>
                  <span className="badge-custom badge-primary text-capitalize">{role} Onboarding</span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6"><label className="form-label small fw-bold text-main">Full Name *</label><input type="text" className="form-control form-control-custom" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-bold text-main">Email Address *</label><input type="email" className="form-control form-control-custom" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-bold text-main">Phone Number *</label><input type="tel" className="form-control form-control-custom" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-bold text-main">Account Password *</label><input type="password" minLength={6} className="form-control form-control-custom" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>

                  <div className="col-12"><label className="form-label small fw-bold text-main">Full Address</label><input className="form-control form-control-custom" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold text-main">Ward</label><input className="form-control form-control-custom" value={ward} onChange={(e) => setWard(e.target.value)} /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold text-main">Panchayat / Colony</label><input className="form-control form-control-custom" value={panchayat} onChange={(e) => setPanchayat(e.target.value)} /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold text-main">District</label><input className="form-control form-control-custom" value={district} onChange={(e) => setDistrict(e.target.value)} /></div>

                  {role === 'worker' && <>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Service Skill Category *</label><select className="form-select form-control-custom" value={category} onChange={(e) => setCategory(e.target.value)} required><option value="">Select category</option>{categories.map((cat) => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}</select></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Years of Experience</label><select className="form-select form-control-custom" value={experience} onChange={(e) => setExperience(e.target.value)}><option>1-3 Years</option><option>5 Years</option><option>8+ Years</option></select></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Reference Hourly Rate (₹)</label><input type="number" min="0" step="0.01" className="form-control form-control-custom" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Profile Photo</label><input type="file" accept="image/*" className="form-control form-control-custom" onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Government ID *</label><div className="border border-2 border-dashed p-3 rounded-3 text-center bg-body-secondary position-relative"><FiUploadCloud size={24} className="text-primary mb-1" /><div className="small fw-semibold text-main">{govtIdFile ? govtIdFile.name : 'Choose government ID'}</div><input type="file" required onChange={(e) => setGovtIdFile(e.target.files?.[0] || null)} className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" /></div></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Trade Certificate (ITI/Diploma) *</label><div className="border border-2 border-dashed p-3 rounded-3 text-center bg-body-secondary position-relative"><FiUploadCloud size={24} className="text-primary mb-1" /><div className="small fw-semibold text-main">{tradeCertFile ? tradeCertFile.name : 'Choose trade certificate'}</div><input type="file" required onChange={(e) => setTradeCertFile(e.target.files?.[0] || null)} className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" /></div></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-main">Experience Certificate</label><input type="file" className="form-control form-control-custom" onChange={(e) => setExpCertFile(e.target.files?.[0] || null)} /></div>
                  </>}
                </div>

                <div className="mt-4 pt-3 border-top"><button type="submit" disabled={isLoading} className="btn btn-primary-custom w-100 py-3 justify-content-center">{isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <><FiCheckCircle size={18} /> Complete {role.toUpperCase()} Registration</>}</button></div>
              </form>
            )}

            <div className="text-center pt-3 mt-3 border-top"><span className="text-muted small">Already have an account? </span><Link to="/login" className="fw-bold text-primary text-decoration-none">Sign In</Link></div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default RegisterPage;
