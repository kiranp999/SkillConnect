// SkillConnect Helper Utilities

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'approved':
    case 'verified':
      return 'badge-success';
    case 'accepted':
    case 'in progress':
      return 'badge-primary';
    case 'pending':
    case 'under review':
      return 'badge-warning';
    case 'rejected':
    case 'cancelled':
      return 'badge-danger';
    default:
      return 'badge-primary';
  }
};
