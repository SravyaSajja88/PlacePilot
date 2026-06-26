export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
      <p className="text-sm text-slate-400">
        Page <span className="font-medium text-slate-200">{page}</span> of{' '}
        <span className="font-medium text-slate-200">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary btn-sm"
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary btn-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
