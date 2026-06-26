import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';

export default function StudentDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me/applications')
      .then((res) => setApplications(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const student = user?.student;
  const activeApps = applications.filter(
    (a) => !['OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(a.currentStatus)
  );
  const offers = applications.filter((a) => a.currentStatus === 'OFFER_ACCEPTED');

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="page-header">
            Welcome back, {student?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            {student?.branch} · Year {student?.year} · CGPA {student?.cgpa}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Applications</p>
            <p className="text-3xl font-bold text-white">{applications.length}</p>
            <p className="text-xs text-slate-500">Total submitted</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Active</p>
            <p className="text-3xl font-bold text-brand-400">{activeApps.length}</p>
            <p className="text-xs text-slate-500">In pipeline</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Offers</p>
            <p className="text-3xl font-bold text-emerald-400">{offers.length}</p>
            <p className="text-xs text-slate-500">Accepted</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Status</p>
            <p className={`text-3xl font-bold ${student?.isPlaced ? 'text-green-400' : 'text-slate-300'}`}>
              {student?.isPlaced ? 'Placed' : 'Active'}
            </p>
            <p className="text-xs text-slate-500">Placement status</p>
          </div>
        </div>

        {/* Resume warning */}
        {!student?.resumeUrl && (
          <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            <p className="text-sm text-amber-300">
              You haven't uploaded a resume yet.{' '}
              <Link to="/student/profile" className="font-semibold underline">Upload now</Link>{' '}
              to start applying to drives.
            </p>
          </div>
        )}

        {/* Active applications */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Active Applications</h2>
            <Link to="/student/applications" className="text-sm text-brand-400 hover:text-brand-300">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No active applications</p>
              <Link to="/student/drives" className="btn-primary btn-sm">Browse drives</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {activeApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="font-medium text-white text-sm">{app.drive.companyName}</p>
                    <p className="text-xs text-slate-400">{app.drive.roleName} · {app.drive.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.currentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
