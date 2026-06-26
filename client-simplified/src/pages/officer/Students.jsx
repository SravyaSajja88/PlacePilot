import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Pagination } from '../../components/Pagination';
import api from '../../api/axios';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const YEARS = [1, 2, 3, 4];

export default function OfficerStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlaced, setFilterPlaced] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [toggling, setToggling] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    rollNo: '',
    branch: 'CSE',
    year: '4',
    cgpa: '',
    activeBacklogs: '0',
    phone: '',
  });
  const [createError, setCreateError] = useState('');

  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set('search', search);
    if (filterPlaced !== '') params.set('isPlaced', filterPlaced);
    api.get(`/officer/students?${params}`)
      .then((res) => { setStudents(res.data.data); setPagination(res.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [page, search, filterPlaced]);

  const handleToggle = async (student) => {
    setToggling(student.id);
    try {
      await api.patch(`/officer/students/${student.id}/toggle-active`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setToggling(null);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    setCreateError('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await api.post('/officer/students', {
        name: createForm.name,
        email: createForm.email,
        rollNo: createForm.rollNo,
        branch: createForm.branch,
        year: parseInt(createForm.year),
        cgpa: parseFloat(createForm.cgpa),
        activeBacklogs: parseInt(createForm.activeBacklogs),
        phone: createForm.phone || null,
      });
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        rollNo: '',
        branch: 'CSE',
        year: '4',
        cgpa: '',
        activeBacklogs: '0',
        phone: '',
      });
      fetchStudents();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-header">Student Management</h1>
            <p className="text-slate-400 mt-1">
              {pagination.total ?? 0} total active students
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            id="create-student-btn"
          >
            + Create Student
          </button>
        </div>

        {/* Create Student Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="card w-full max-w-lg my-8">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h2 className="font-bold text-white">Create Student</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                {createError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
                    {createError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="name" className="label">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={createForm.name}
                      onChange={handleCreateChange}
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="email" className="label">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={createForm.email}
                      onChange={handleCreateChange}
                      className="input"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="rollNo" className="label">Roll Number</label>
                    <input
                      id="rollNo"
                      name="rollNo"
                      type="text"
                      required
                      value={createForm.rollNo}
                      onChange={handleCreateChange}
                      className="input"
                      placeholder="21BCS001"
                    />
                  </div>

                  <div>
                    <label htmlFor="branch" className="label">Branch</label>
                    <select
                      id="branch"
                      name="branch"
                      value={createForm.branch}
                      onChange={handleCreateChange}
                      className="input"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="year" className="label">Year</label>
                    <select
                      id="year"
                      name="year"
                      value={createForm.year}
                      onChange={handleCreateChange}
                      className="input"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cgpa" className="label">CGPA</label>
                    <input
                      id="cgpa"
                      name="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={createForm.cgpa}
                      onChange={handleCreateChange}
                      className="input"
                      placeholder="8.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="activeBacklogs" className="label">Active Backlogs</label>
                    <input
                      id="activeBacklogs"
                      name="activeBacklogs"
                      type="number"
                      min="0"
                      value={createForm.activeBacklogs}
                      onChange={handleCreateChange}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="phone" className="label">Phone (Optional)</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={createForm.phone}
                      onChange={handleCreateChange}
                      className="input"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 border border-slate-700">
                  <p className="font-medium text-slate-300 mb-1">Note:</p>
                  <p>Default password will be set to the roll number. Student must change it on first login.</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary flex-1"
                  >
                    {creating ? 'Creating…' : 'Create Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            id="student-search"
            className="input max-w-xs"
            placeholder="Search name, roll no, branch…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            id="student-filter-placed"
            className="input w-44"
            value={filterPlaced}
            onChange={(e) => { setFilterPlaced(e.target.value); setPage(1); }}
          >
            <option value="">All students</option>
            <option value="true">Placed</option>
            <option value="false">Not placed</option>
          </select>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="table-header px-4 py-3 text-left">Student</th>
                <th className="table-header px-4 py-3 text-left hidden md:table-cell">Branch / Year</th>
                <th className="table-header px-4 py-3 text-left hidden lg:table-cell">CGPA</th>
                <th className="table-header px-4 py-3 text-left hidden lg:table-cell">Backlogs</th>
                <th className="table-header px-4 py-3 text-left">Placed</th>
                <th className="table-header px-4 py-3 text-left hidden md:table-cell">Apps</th>
                <th className="table-header px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No students found</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-800/30 transition-colors ${!s.isActive ? 'opacity-50' : ''}`}>
                  <td className="table-cell">
                    <p className="font-medium text-white text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.rollNo}</p>
                    <p className="text-xs text-slate-500">{s.user?.email}</p>
                  </td>
                  <td className="table-cell hidden md:table-cell">{s.branch} · Year {s.year}</td>
                  <td className="table-cell hidden lg:table-cell">{s.cgpa}</td>
                  <td className="table-cell hidden lg:table-cell">{s.activeBacklogs}</td>
                  <td className="table-cell">
                    {s.isPlaced ? (
                      <span className="badge bg-green-500/20 text-green-400">Placed</span>
                    ) : (
                      <span className="badge bg-slate-700 text-slate-400">No</span>
                    )}
                  </td>
                  <td className="table-cell hidden md:table-cell">{s._count?.applications ?? 0}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleToggle(s)}
                      disabled={toggling === s.id}
                      className={`btn-sm ${s.isActive ? 'btn-danger' : 'btn-secondary'}`}
                      id={`toggle-student-${s.id}`}
                    >
                      {toggling === s.id ? '…' : s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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
