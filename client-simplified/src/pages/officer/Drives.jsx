import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Pagination } from '../../components/Pagination';
import api from '../../api/axios';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const JOB_TYPES = ['ON_SITE', 'REMOTE', 'HYBRID'];

const EMPTY_FORM = {
  companyName: '', roleName: '', ctcMin: '', ctcMax: '',
  location: '', jobType: 'ON_SITE', description: '',
  minCgpa: '', allowedBranches: ['CSE', 'IT'], maxBacklogs: '0', allowedYears: [4],
};

export default function OfficerDrives({ user }) {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [formError, setFormError] = useState('');

  const fetchDrives = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 10 });
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    api.get(`/drives?${params}`)
      .then((res) => { setDrives(res.data.data); setPagination(res.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrives(); }, [page, search, filterStatus]);

  const handleBranchToggle = (b) => {
    setForm((f) => ({
      ...f,
      allowedBranches: f.allowedBranches.includes(b)
        ? f.allowedBranches.filter((x) => x !== b)
        : [...f.allowedBranches, b],
    }));
  };
  const handleYearToggle = (y) => {
    setForm((f) => ({
      ...f,
      allowedYears: f.allowedYears.includes(y)
        ? f.allowedYears.filter((x) => x !== y)
        : [...f.allowedYears, y],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        ctcMin: parseFloat(form.ctcMin),
        ctcMax: parseFloat(form.ctcMax),
        minCgpa: parseFloat(form.minCgpa),
        maxBacklogs: parseInt(form.maxBacklogs),
      };
      if (editId) {
        await api.patch(`/drives/${editId}`, payload);
      } else {
        await api.post('/drives', payload);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchDrives();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Save failed';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (drive) => {
    setForm({
      ...drive,
      ctcMin: drive.ctcMin.toString(),
      ctcMax: drive.ctcMax.toString(),
      minCgpa: drive.minCgpa.toString(),
      maxBacklogs: drive.maxBacklogs.toString(),
    });
    setEditId(drive.id);
    setShowForm(true);
    setFormError('');
  };

  const handleClose = async (drive) => {
    try {
      await api.patch(`/drives/${drive.id}`, { status: drive.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' });
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-header">Placement Drives</h1>
            <p className="text-slate-400 mt-1">Create and manage company drives</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); setFormError(''); }} className="btn-primary" id="create-drive-btn">
            + New Drive
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <input
            id="drive-search"
            className="input max-w-xs"
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            id="drive-filter-status"
            className="input w-40"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Drive form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h2 className="font-semibold text-white">{editId ? 'Edit Drive' : 'New Drive'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4" id="drive-form">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">{formError}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company Name</label>
                    <input className="input" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input className="input" required value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">CTC Min (LPA)</label>
                    <input type="number" step="0.01" className="input" required value={form.ctcMin} onChange={(e) => setForm({ ...form, ctcMin: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">CTC Max (LPA)</label>
                    <input type="number" step="0.01" className="input" required value={form.ctcMax} onChange={(e) => setForm({ ...form, ctcMax: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input className="input" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Job Type</label>
                    <select className="input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Min CGPA</label>
                    <input type="number" step="0.1" min="0" max="10" className="input" required value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Max Backlogs</label>
                    <input type="number" min="0" className="input" required value={form.maxBacklogs} onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea rows={3} className="input" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div>
                  <label className="label">Allowed Branches</label>
                  <div className="flex flex-wrap gap-2">
                    {BRANCHES.map((b) => (
                      <button key={b} type="button"
                        onClick={() => handleBranchToggle(b)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          form.allowedBranches.includes(b)
                            ? 'bg-brand-600 border-brand-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}>{b}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Allowed Years</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((y) => (
                      <button key={y} type="button"
                        onClick={() => handleYearToggle(y)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          form.allowedYears.includes(y)
                            ? 'bg-brand-600 border-brand-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}>Year {y}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary" id="drive-submit-btn">
                    {saving ? 'Saving…' : editId ? 'Update Drive' : 'Create Drive'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drives table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="table-header px-4 py-3 text-left">Company / Role</th>
                <th className="table-header px-4 py-3 text-left hidden md:table-cell">CTC</th>
                <th className="table-header px-4 py-3 text-left hidden lg:table-cell">Eligibility</th>
                <th className="table-header px-4 py-3 text-left">Status</th>
                <th className="table-header px-4 py-3 text-left hidden md:table-cell">Apps</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : drives.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No drives found</td></tr>
              ) : drives.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-white">{d.companyName}</p>
                    <p className="text-xs text-slate-500">{d.roleName}</p>
                  </td>
                  <td className="table-cell hidden md:table-cell">₹{d.ctcMin}–{d.ctcMax}L</td>
                  <td className="table-cell hidden lg:table-cell">
                    <span className="text-xs">CGPA ≥ {d.minCgpa} · Yr {d.allowedYears?.join(',')} · Backlogs ≤ {d.maxBacklogs}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${d.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="table-cell hidden md:table-cell">{d._count?.applications ?? 0}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/officer/applicants/${d.id}`)} className="btn-secondary btn-sm">Applicants</button>
                      <button onClick={() => handleEdit(d)} className="btn-secondary btn-sm">Edit</button>
                      <button onClick={() => handleClose(d)} className={`btn-sm ${d.status === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}`}>
                        {d.status === 'ACTIVE' ? 'Close' : 'Reopen'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
