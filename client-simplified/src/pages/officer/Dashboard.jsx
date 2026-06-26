import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import api from '../../api/axios';

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="stat-card">
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

const STATUS_ORDER = ['APPLIED', 'SHORTLISTED', 'TECHNICAL', 'HR', 'OFFER_MADE', 'OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN'];

export default function OfficerDashboard({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/officer/analytics')
      .then((res) => setAnalytics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const a = analytics || {};

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="page-header">Officer Dashboard</h1>
          <p className="text-slate-400 mt-1">Placement overview at a glance</p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Placement Rate"
            value={`${a.placementRate ?? 0}%`}
            sub={`${a.placedStudents} / ${a.totalStudents} students`}
            color="text-emerald-400"
          />
          <StatCard
            label="Avg CTC"
            value={a.avgCTC ? `₹${a.avgCTC}L` : '—'}
            sub="From accepted offers"
            color="text-brand-400"
          />
          <StatCard
            label="Active Drives"
            value={a.activeDrives ?? 0}
            sub={`${a.totalDrives} total`}
          />
          <StatCard
            label="Applications"
            value={a.totalApplications ?? 0}
            sub="Total submitted"
          />
        </div>

        {/* Pipeline breakdown */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Pipeline Breakdown</h2>
            <Link to="/officer/drives" className="text-sm text-brand-400 hover:text-brand-300">
              Manage drives →
            </Link>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATUS_ORDER.map((status) => {
              const count = a.statusBreakdown?.[status] ?? 0;
              if (count === 0) return null;
              return (
                <div key={status} className="bg-slate-800/60 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-400 mt-1">{status.replace('_', ' ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
