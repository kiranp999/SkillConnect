import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useBooking } from '../context/BookingContext';
import { FiSearch, FiCheck, FiArrowRight } from 'react-icons/fi';

const ServicesPage = () => {
  const { categories, loading } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = useMemo(() => categories.filter((cat) => `${cat.title} ${cat.description}`.toLowerCase().includes(searchTerm.toLowerCase())), [categories, searchTerm]);

  return <MainLayout><section className="py-5 text-center bg-primary-subtle border-bottom"><div className="container py-lg-3"><span className="badge-custom badge-primary mb-2">Verified Local Services</span><h1 className="fw-extrabold display-5 text-main">Our Essential Worker Services</h1><p className="lead text-muted mx-auto" style={{ maxWidth: 650 }}>Browse the service categories currently available on SkillConnect.</p><div className="mt-4 mx-auto" style={{ maxWidth: 540 }}><div className="input-group shadow-sm"><span className="input-group-text bg-surface border-end-0 text-muted"><FiSearch size={20} /></span><input className="form-control form-control-custom border-start-0 ps-0" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div></div></section><section className="py-5"><div className="container">{loading && categories.length === 0 ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : <div className="row g-4">{filtered.map((category) => <div key={category.id} className="col-12 col-md-6 col-lg-4"><div className="card-custom p-4 h-100 d-flex flex-column justify-content-between"><div><div className="rounded-4 mb-3 overflow-hidden" style={{ height: 160 }}><img src={category.image} alt={category.title} className="w-100 h-100 object-fit-cover" /></div><h4 className="fw-bold mb-2 text-main">{category.title}</h4><p className="text-muted small">{category.description}</p><div className="d-flex flex-wrap gap-1 mb-3">{category.popularServices.map((service) => <span key={service} className="badge bg-body-secondary text-main small"><FiCheck className="text-success me-1" />{service}</span>)}</div></div><div className="pt-3 border-top d-flex align-items-center justify-content-between"><div><span className="text-muted small d-block">Reference pricing</span><span className="fw-extrabold text-primary fs-6">{category.avgPrice}</span></div><Link to={`/workers?category=${category.id}`} className="btn btn-primary-custom px-3 py-2">Find Workers <FiArrowRight /></Link></div></div></div>)}</div>}</div></section></MainLayout>;
};
export default ServicesPage;
