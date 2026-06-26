import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../../components/Navbar';
import { DriveCard } from '../../components/DriveCard';
import api from '../../api/axios';

export default function StudentDrives({ user }) {
  const [eligible, setEligible] = useState([]);
  const [ineligible, setIneligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('eligible');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef();
  const student = user?.student;

  useEffect(() => {
    api.get('/students/me/drives')
      .then((res) => {
        setEligible(res.data.data.eligible);
        setIneligible(res.data.data.ineligible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenApply = (drive) => {
    setSelectedDrive(drive);
    setShowApplyModal(true);
    setResumeFile(null);
  };

  const handleApply = async () => {
    if (!resumeFile) {
      showToast('Please select a resume file', 'error');
      return;
    }

    setApplying(selectedDrive.id);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('driveId', selectedDrive.id);

      await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEligible((prev) =>
        prev.map((d) => (d.id === selectedDrive.id ? { ...d, appliedStatus: 'APPLIED' } : d))
      );
      showToast('Application submitted successfully!');
      setShowApplyModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply', 'error');
    } finally {
      setApplying(null);
    }
  };

  const drives = tab === 'eligible' ? eligible : ineligible;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedDrive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="font-bold text-white">Apply to Position</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedDrive.companyName}</h3>
                  <p className="text-sm text-slate-400">{selectedDrive.roleName}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Information</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-slate-500">Name</p>
                  <p className="text-slate-200 font-medium">{student?.name}</p>
                  <p className="text-slate-500">Roll No</p>
                  <p className="text-slate-200 font-medium">{student?.rollNo}</p>
                  <p className="text-slate-500">CGPA</p>
                  <p className="text-slate-200 font-medium">{student?.cgpa}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="label">Resume (PDF)</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    resumeFile
                      ? 'bg-brand-600/10 border-brand-500 text-brand-300'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {resumeFile ? resumeFile.name : 'Click to upload resume'}
                    </p>
                    <p className="text-xs opacity-70">PDF only, max 5 MB</p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        showToast('Only PDF files are allowed', 'error');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('File size must be less than 5 MB', 'error');
                        return;
                      }
                      setResumeFile(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying === selectedDrive?.id || !resumeFile}
                className="btn-primary flex-1"
              >
                {applying === selectedDrive?.id ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-6">
          <h1 className="page-header">Placement Drives</h1>
          <p className="text-slate-400 mt-1">Drives matched to your profile</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit mb-6">
          <button
            onClick={() => setTab('eligible')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'eligible' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Eligible ({eligible.length})
          </button>
          <button
            onClick={() => setTab('ineligible')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'ineligible' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Not Eligible ({ineligible.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : drives.length === 0 ? (
          <div className="card flex flex-col items-center py-20 gap-2">
            <p className="text-slate-400">
              {tab === 'eligible' ? 'No eligible drives available right now.' : 'No ineligible drives.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drives.map((drive) => (
              <DriveCard
                key={drive.id}
                drive={drive}
                reason={drive.reason}
                actions={
                  tab === 'eligible' ? (
                    drive.appliedStatus ? (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Applied — {drive.appliedStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenApply(drive)}
                        className="btn-primary btn-sm"
                        id={`apply-${drive.id}`}
                      >
                        Apply Now
                      </button>
                    )
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
