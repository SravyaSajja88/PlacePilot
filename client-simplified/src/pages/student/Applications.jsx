import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';

export default function StudentApplications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [responding, setResponding] = useState(null);

  const fetchApplications = () => {
    setLoading(true);
    api.get('/students/me/applications')
      .then((res) => setApplications(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      await api.patch(`/applications/${appId}/withdraw`);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawing(null);
    }
  };

  const handleRespond = async (appId, response) => {
    const action = response === 'OFFER_ACCEPTED' ? 'Accept' : 'Reject';
    if (!window.confirm(`${action} this offer?`)) return;
    
    setResponding(appId);
    try {
      await api.patch(`/applications/${appId}/respond`, { response });
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} offer`);
    } finally {
      setResponding(null);
    }
  };

  const PIPELINE = ['APPLIED', 'SHORTLISTED', 'TECHNICAL', 'HR', 'OFFER_MADE', 'OFFER_ACCEPTED'];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="page-header">My Applications</h1>
          <p className="text-slate-400 mt-1">Track your placement journey across all drives</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="card flex flex-col items-center py-20 gap-3">
            <p className="text-slate-400">You haven't applied to any drives yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((app) => {
              const currentIdx = PIPELINE.indexOf(app.currentStatus);
              const isTerminal = ['REJECTED', 'WITHDRAWN'].includes(app.currentStatus);
              const isAccepted = app.currentStatus === 'OFFER_ACCEPTED';

              return (
                <div key={app.id} className="card overflow-hidden">
                  {/* Header */}
                  <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800">
                    <div>
                      <h3 className="font-semibold text-white">{app.drive.companyName}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {app.drive.roleName} · {app.drive.location} · ₹{app.drive.ctcMin}–{app.drive.ctcMax} LPA
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.currentStatus} />
                      
                      {app.currentStatus === 'OFFER_MADE' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespond(app.id, 'OFFER_ACCEPTED')}
                            disabled={responding === app.id}
                            className="btn-primary btn-sm bg-emerald-600 hover:bg-emerald-700 border-none h-8 min-h-0 text-[11px]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(app.id, 'REJECTED')}
                            disabled={responding === app.id}
                            className="btn-secondary btn-sm h-8 min-h-0 text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {app.currentStatus === 'APPLIED' && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                          className="btn-danger btn-sm h-8 min-h-0 text-[11px]"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pipeline progress */}
                  {!isTerminal && (
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-0">
                        {PIPELINE.map((stage, idx) => {
                          const done = isAccepted ? true : idx <= currentIdx;
                          const active = idx === currentIdx && !isAccepted;
                          return (
                            <div key={stage} className="flex items-center flex-1 min-w-0">
                              <div className="flex flex-col items-center gap-1 min-w-0">
                                <div
                                  className={`w-3 h-3 rounded-full shrink-0 transition-colors ${
                                    isAccepted ? 'bg-green-500' :
                                    done ? 'bg-brand-500' :
                                    active ? 'bg-brand-400 ring-2 ring-brand-400/30' :
                                    'bg-slate-700'
                                  }`}
                                />
                                <span className={`text-[9px] text-center leading-tight hidden sm:block ${
                                  done ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                  {stage.replace('_', ' ')}
                                </span>
                              </div>
                              {idx < PIPELINE.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${done && !active ? 'bg-brand-600' : 'bg-slate-700'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Event history */}
                  {app.events && app.events.length > 0 && (
                    <div className="px-6 pb-5">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Activity</p>
                      <div className="space-y-2">
                        {app.events.slice().reverse().map((ev) => (
                          <div key={ev.id} className="flex items-start gap-3 text-xs">
                            <span className="text-slate-600 shrink-0 mt-0.5">
                              {new Date(ev.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="text-slate-400">
                              Status → <span className="text-slate-200">{ev.toStatus.replace('_', ' ')}</span>
                              {ev.note && ev.note !== 'Initial application' && (
                                <span className="text-slate-500"> — {ev.note}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
