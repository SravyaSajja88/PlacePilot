const STATUS_CONFIG = {
  APPLIED:        { label: 'Applied',        className: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40' },
  SHORTLISTED:    { label: 'Shortlisted',    className: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40' },
  TECHNICAL:      { label: 'Technical',      className: 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40' },
  HR:             { label: 'HR Round',       className: 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40' },
  OFFER_MADE:     { label: 'Offer Made',     className: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' },
  OFFER_ACCEPTED: { label: 'Offer Accepted', className: 'bg-green-500/20 text-green-400 ring-1 ring-green-500/40' },
  REJECTED:       { label: 'Rejected',       className: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40' },
  WITHDRAWN:      { label: 'Withdrawn',      className: 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/40' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-slate-700 text-slate-300' };
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
