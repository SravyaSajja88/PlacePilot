import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import api from '../../api/axios';

const NEXT_STATUSES = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['TECHNICAL', 'REJECTED'],
  TECHNICAL: ['HR', 'REJECTED'],
  HR: ['OFFER_MADE', 'REJECTED'],
  OFFER_MADE: ['OFFER_ACCEPTED', 'REJECTED'],
};

export default function OfficerApplicants({ user }) {
  const { driveId } = useParams();
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (filterStatus) params.set('status', filterStatus);
    Promise.all([
      api.get(`/drives/${driveId}`),
      api.get(`/drives/${driveId}/applications?${params}`),
    ])
      .then(([driveRes, appsRes]) => {
        setDrive(driveRes.data.data);
        setApplications(appsRes.data.data);
        setPagination(appsRes.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [driveId, page, filterStatus]);

  const handleAdvance = async (appId, toStatus) => {
    setAdvancing(appId);
    try {
      await api.patch(`/applications/${appId}/advance`, { toStatus });
      fetchData();
      showToast(`Moved to ${toStatus}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setAdvancing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Back + header */}
        <div className="mb-6">
          <Link to="/officer/drives" className="text-sm text-slate-400 hover:text-slate-200 mb-2 inline-block">← Back to drives</Link>
          {drive && (
            <>
              <h1 className="page-header">{drive.companyName} — {drive.roleName}</h1>
              <p className="text-slate-400 mt-1">
                {drive.location} · ₹{drive.ctcMin}–{drive.ctcMax} LPA · {pagination.total ?? 0} applicants
              </p>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            className="input w-48"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            id="applicants-filter"
          >
            <option value="">All stages</option>
            {['APPLIED', 'SHORTLISTED', 'TECHNICAL', 'HR', 'OFFER_MADE', 'OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="table-header px-4 py-3 text-left">Student</th>
                <th className="table-header px-4 py-3 text-left hidden md:table-cell">Branch / Year</th>
                <th className="table-header px-4 py-3 text-left hidden lg:table-cell">CGPA / Backlogs</th>
                <th className="table-header px-4 py-3 text-left">Status</th>
                <th className="table-header px-4 py-3 text-left hidden md:table-cell">Applied</th>
                <th className="table-header px-4 py-3 text-left">Actions</th>
                <th className="table-header px-4 py-3 text-left">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No applicants found</td></tr>
              ) : applications.map((app) => {
                const nexts = NEXT_STATUSES[app.currentStatus] || [];
                return (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="table-cell">
                      <p className="font-medium text-white text-sm">{app.student.name}</p>
                      <p className="text-xs text-slate-500">{app.student.rollNo}</p>
                      {app.student.phone && <p className="text-xs text-slate-500">{app.student.phone}</p>}
                    </td>
                    <td className="table-cell hidden md:table-cell">{app.student.branch} · Y{app.student.year}</td>
                    <td className="table-cell hidden lg:table-cell">
                      {app.student.cgpa} · {app.student.activeBacklogs} backlog{app.student.activeBacklogs !== 1 ? 's' : ''}
                    </td>
                    <td className="table-cell"><StatusBadge status={app.currentStatus} /></td>
                    <td className="table-cell hidden md:table-cell text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {nexts.map((ns) => (
                          <button
                            key={ns}
                            disabled={advancing === app.id}
                            onClick={() => handleAdvance(app.id, ns)}
                            className={`btn-sm text-xs ${ns === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                            id={`advance-${app.id}-${ns}`}
                          >
                            {advancing === app.id ? '…' : ns.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell">
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline">View</a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
          </div>
        </div>
      </main>
    </div>
  );
}
