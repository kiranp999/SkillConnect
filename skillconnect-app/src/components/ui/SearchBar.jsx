import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiGrid, FiArrowRight } from 'react-icons/fi';
import { categoryService } from '../../services/categoryService';

const SearchBar = ({ initialCategory = '', initialQuery = '', initialLocation = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [categories, setCategories] = useState([]);

  useEffect(() => { categoryService.getCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => setCategories([])); }, []);
  useEffect(() => { setQuery(initialQuery); setCategory(initialCategory); setLocation(initialLocation); }, [initialQuery, initialCategory, initialLocation]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    if (location.trim()) params.set('location', location.trim());
    navigate(`/workers${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return <form onSubmit={handleSearch} className="glass-panel p-2 p-md-3 rounded-4 shadow-lg border border-2 border-primary-subtle" style={{ maxWidth: 920, margin: '0 auto' }}><div className="row g-2 align-items-center"><div className="col-12 col-md-4"><div className="input-group"><span className="input-group-text bg-transparent border-0 text-primary ps-3"><FiSearch size={20} /></span><input className="form-control bg-transparent border-0 text-main shadow-none" placeholder="Search electrician, plumber..." value={query} onChange={(e) => setQuery(e.target.value)} /></div></div><div className="col-12 col-md-4"><div className="input-group"><span className="input-group-text bg-transparent border-0 text-primary ps-3"><FiGrid size={20} /></span><select className="form-select bg-transparent border-0 text-main shadow-none" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All Categories</option>{categories.map((cat) => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}</select></div></div><div className="col-12 col-md-4"><div className="d-flex align-items-center gap-2"><div className="input-group flex-grow-1"><span className="input-group-text bg-transparent border-0 text-primary ps-3"><FiMapPin size={20} /></span><input className="form-control bg-transparent border-0 text-main shadow-none" placeholder="District or Ward..." value={location} onChange={(e) => setLocation(e.target.value)} /></div><button type="submit" className="btn btn-primary-custom px-4 py-2 rounded-3"><span className="d-none d-sm-inline">Find</span><FiArrowRight size={18} /></button></div></div></div></form>;
};
export default SearchBar;
