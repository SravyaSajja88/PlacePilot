const JOB_TYPE_LABELS = {
  ON_SITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

const JOB_TYPE_COLORS = {
  ON_SITE: 'bg-orange-500/15 text-orange-300',
  REMOTE: 'bg-teal-500/15 text-teal-300',
  HYBRID: 'bg-violet-500/15 text-violet-300',
};

export function DriveCard({ drive, actions, reason }) {
  const isIneligible = !!reason;

  return (
    <div
      className={`card p-5 flex flex-col gap-4 transition-all duration-200 ${
        isIneligible ? 'opacity-60' : 'hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-base truncate">{drive.companyName}</h3>
            <span className={`badge ${JOB_TYPE_COLORS[drive.jobType]}`}>
              {JOB_TYPE_LABELS[drive.jobType]}
            </span>
            {drive.status === 'CLOSED' && (
              <span className="badge bg-slate-700 text-slate-400">Closed</span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{drive.roleName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-brand-400">
            ₹{drive.ctcMin}–{drive.ctcMax} LPA
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{drive.location}</p>
        </div>
      </div>

      {/* Eligibility criteria */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">
          CGPA ≥ {drive.minCgpa}
        </span>
        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">
          Year: {drive.allowedYears?.join(', ')}
        </span>
        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">
          Backlogs ≤ {drive.maxBacklogs}
        </span>
        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">
          {drive.allowedBranches?.join(', ')}
        </span>
      </div>

      {/* Description */}
      {drive.description && (
        <p className="text-sm text-slate-400 line-clamp-2">{drive.description}</p>
      )}

      {/* Ineligible reason */}
      {reason && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <p className="text-xs text-red-300">{reason}</p>
        </div>
      )}

      {/* Actions */}
      {actions && <div className="flex items-center gap-2 pt-1">{actions}</div>}
    </div>
  );
}
