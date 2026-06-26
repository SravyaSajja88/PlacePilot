import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import api from '../../api/axios';

export default function OfficerSettings({ user }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get('/officer/policy')
      .then((res) => setPolicy(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/officer/policy', { oneOfferLock: !policy.oneOfferLock });
      setPolicy(res.data.data);
      showToast(`One-offer lock ${res.data.data.oneOfferLock ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showToast('Failed to update policy', 'error');
    } finally {
      setSaving(false);
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="page-header">Settings</h1>
          <p className="text-slate-400 mt-1">Placement policy configuration</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">One-Offer Lock</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                When enabled, students who have accepted an offer cannot apply to additional drives. Prevents holding multiple offers.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`badge ${policy?.oneOfferLock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  {policy?.oneOfferLock ? '✓ Enabled' : 'Disabled'}
                </span>
                {policy?.updatedAt && (
                  <span className="text-xs text-slate-500">
                    Last updated {new Date(policy.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="w-12 h-6 bg-slate-700 rounded-full animate-pulse" />
            ) : (
              <button
                onClick={handleToggle}
                disabled={saving}
                id="one-offer-lock-toggle"
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  policy?.oneOfferLock ? 'bg-brand-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    policy?.oneOfferLock ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">How it works</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">→</span>
              When a student's application reaches <strong className="text-slate-200">OFFER_ACCEPTED</strong>, their <code className="text-xs bg-slate-800 px-1 rounded">isPlaced</code> flag is set to true via transaction.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">→</span>
              With this lock <strong className="text-slate-200">on</strong>, the apply endpoint checks <code className="text-xs bg-slate-800 px-1 rounded">student.isPlaced</code> and returns a 403 if already placed.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">→</span>
              Turning it <strong className="text-slate-200">off</strong> allows placed students to continue applying — useful for lateral placements.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
