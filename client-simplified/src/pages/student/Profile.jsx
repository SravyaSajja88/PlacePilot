import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import api from '../../api/axios';

export default function StudentProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me')
      .then((res) => {
        const s = res.data.data;
        setProfile(s);
      })
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

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-6">
        <div>
          <h1 className="page-header">My Profile</h1>
          <p className="text-slate-400 mt-1">View your academic and placement information</p>
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Account Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Email</p>
              <p className="text-slate-200 font-medium">{profile?.user?.email}</p>
            </div>
            <div>
              <p className="text-slate-500">Roll Number</p>
              <p className="text-slate-200 font-medium">{profile?.rollNo}</p>
            </div>
            <div>
              <p className="text-slate-500">Name</p>
              <p className="text-slate-200 font-medium">{profile?.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Placement Status</p>
              <p className={`font-medium ${profile?.isPlaced ? 'text-green-400' : 'text-slate-200'}`}>
                {profile?.isPlaced ? '✓ Placed' : 'Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Academic Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Branch</p>
              <p className="text-slate-200 font-medium">{profile?.branch}</p>
            </div>
            <div>
              <p className="text-slate-500">Year</p>
              <p className="text-slate-200 font-medium">Year {profile?.year}</p>
            </div>
            <div>
              <p className="text-slate-500">CGPA</p>
              <p className="text-slate-200 font-medium">{profile?.cgpa}</p>
            </div>
            <div>
              <p className="text-slate-500">Active Backlogs</p>
              <p className="text-slate-200 font-medium">{profile?.activeBacklogs}</p>
            </div>
            {profile?.phone && (
              <div className="col-span-2">
                <p className="text-slate-500">Phone</p>
                <p className="text-slate-200 font-medium">{profile?.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="card p-4 bg-brand-600/5 border border-brand-600/20">
          <p className="text-sm text-slate-300">
            <span className="font-medium">Note:</span> To upload your resume, visit the <strong>Drives</strong> section and apply to a position. You can upload your resume during the application process.
          </p>
        </div>
      </main>
    </div>
  );
}
