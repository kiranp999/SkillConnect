import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { categoryService } from '../services/categoryService';
import { workerService } from '../services/workerService';
import WorkerCard from '../components/cards/WorkerCard';
import SearchBar from '../components/ui/SearchBar';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';

const SearchWorkersPage = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';
  const urlQuery = searchParams.get('q') || '';
  const urlLocation = searchParams.get('location') || '';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedDistrict, setSelectedDistrict] = useState(urlLocation);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSelectedDistrict(urlLocation);
  }, [urlCategory, urlLocation]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [workerResult, categoryResult] = await Promise.all([
          workerService.getWorkers(),
          categoryService.getCategories()
        ]);
        if (!cancelled) {
          setWorkers(Array.isArray(workerResult) ? workerResult : []);
          setCategories(Array.isArray(categoryResult) ? categoryResult : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || err?.message || 'Unable to load workers from the server.');
          setWorkers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const filteredWorkers = useMemo(() => {
    const query = urlQuery.trim().toLowerCase();

    return workers
      .filter((w) => {
        if (selectedCategory) {
          const categoryId = String(w.categoryId || '').toLowerCase();
          const categoryName = String(w.category || '').toLowerCase();
          if (categoryId !== selectedCategory.toLowerCase() && categoryName !== selectedCategory.toLowerCase()) return false;
        }
        if (selectedDistrict) {
          const district = String(w.district || '').toLowerCase();
          const location = String(w.location || '').toLowerCase();
          if (!district.includes(selectedDistrict.toLowerCase()) && !location.includes(selectedDistrict.toLowerCase())) return false;
        }
        if (query) {
          const searchable = [w.name, w.category, w.about, w.district, w.location, ...(w.skills || [])].join(' ').toLowerCase();
          if (!searchable.includes(query)) return false;
        }
        if (availableOnly && !w.isAvailable) return false;
        if (minRating > 0 && Number(w.rating) < minRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
        if (sortBy === 'jobs') return Number(b.completedJobs) - Number(a.completedJobs);
        if (sortBy === 'price_asc') return Number(a.hourlyRate) - Number(b.hourlyRate);
        if (sortBy === 'price_desc') return Number(b.hourlyRate) - Number(a.hourlyRate);
        return 0;
      });
  }, [workers, selectedCategory, selectedDistrict, urlQuery, availableOnly, minRating, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedDistrict('');
    setAvailableOnly(false);
    setMinRating(0);
    setSortBy('rating');
  };

  return (
    <MainLayout>
      <section className="py-4 bg-primary-subtle border-bottom">
        <div className="container">
          <h1 className="fw-extrabold h3 text-main mb-3">Search & Book Verified Local Workers</h1>
          <SearchBar initialCategory={selectedCategory} initialQuery={urlQuery} initialLocation={selectedDistrict} />
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <div className="card-custom p-4 sticky-top" style={{ top: '90px' }}>
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                  <h6 className="fw-bold m-0 text-main d-flex align-items-center gap-2"><FiFilter /> Filter Workers</h6>
                  <button onClick={resetFilters} className="btn btn-sm text-primary p-0 fw-semibold"><FiRefreshCw size={12} className="me-1" /> Reset</button>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-main">Service Category</label>
                  <select className="form-select form-control-custom" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-main">District / Region</label>
                  <input className="form-control form-control-custom" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} placeholder="Enter district" />
                </div>

                <div className="form-check form-switch mb-4">
                  <input className="form-check-input" type="checkbox" id="availableOnlyToggle" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                  <label className="form-check-label small fw-semibold text-main" htmlFor="availableOnlyToggle">Available Today Only</label>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-main">Minimum Rating</label>
                  <div className="d-flex flex-column gap-2">
                    {[{ label: 'All Ratings', val: 0 }, { label: '4.8★ & Above', val: 4.8 }, { label: '4.5★ & Above', val: 4.5 }].map((opt) => (
                      <div key={opt.val} className="form-check">
                        <input className="form-check-input" type="radio" name="ratingFilter" id={`rat_${opt.val}`} checked={minRating === opt.val} onChange={() => setMinRating(opt.val)} />
                        <label className="form-check-label small text-main" htmlFor={`rat_${opt.val}`}>{opt.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-2">
                <span className="text-muted small">Showing <strong className="text-main">{filteredWorkers.length}</strong> verified workers found</span>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted fw-semibold">Sort By:</span>
                  <select className="form-select form-select-sm form-control-custom" style={{ width: '150px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="rating">Top Rated</option>
                    <option value="jobs">Most Experienced</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="card-custom p-5 text-center"><div className="spinner-border text-primary" role="status" /><p className="text-muted mt-3 mb-0">Loading verified workers...</p></div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : filteredWorkers.length > 0 ? (
                <div className="row g-4">
                  {filteredWorkers.map((worker) => (
                    <div className="col-md-6" key={worker.id}><WorkerCard worker={worker} /></div>
                  ))}
                </div>
              ) : (
                <div className="card-custom p-5 text-center">
                  <h5 className="fw-bold text-main">No verified workers found</h5>
                  <p className="text-muted mb-3">Try changing your search or filters. Newly registered workers appear here after admin verification.</p>
                  <button onClick={resetFilters} className="btn btn-primary-custom">Reset Filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default SearchWorkersPage;
