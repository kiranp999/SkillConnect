const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80';

export function mapWorker(worker) {
  if (!worker) return null;

  return {
    ...worker,
    id: String(worker.id),
    name: worker.full_name || 'Local Worker',
    category: worker.category_name || worker.category_details?.category_name || 'General',
    categoryId: worker.category_details?.category_id || worker.category?.category_id || worker.category_name?.toLowerCase().replace(/\s+/g, '_') || '',
    rating: Number(worker.average_rating ?? 0),
    reviewsCount: Number(worker.reviews_count ?? 0),
    completedJobs: Number(worker.completed_jobs_count ?? 0),
    experience: worker.experience || 'Experience not specified',
    hourlyRate: Number(worker.hourly_rate ?? 0),
    location: worker.address || worker.ward || worker.panchayat || worker.district || '',
    district: worker.district || '',
    state: worker.state || '',
    pincode: worker.pincode || '',
    ward: worker.ward || '',
    panchayat: worker.panchayat || '',
    isAvailable: Boolean(worker.availability),
    isVerified: worker.verification_status === 'Verified',
    phone: worker.phone || '',
    email: worker.email || '',
    avatar: worker.profile_photo || DEFAULT_AVATAR,
    banner: worker.banner_photo || DEFAULT_BANNER,
    about: worker.about || 'Verified local service professional.',
    skills: Array.isArray(worker.skills) ? worker.skills : [],
    certifications: Array.isArray(worker.certifications_list) ? worker.certifications_list : []
  };
}
