import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ChangePassword({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.mustChangePassword) {
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/officer/dashboard');
      return;
    }
    setReady(true);
  }, [user, navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.newPassword) {
      setError('New password is required');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', { newPassword: form.newPassword });
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">PlacePilot</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Set up your password</h1>
          <p className="text-slate-400 text-sm mt-1">Please change your default password on first login</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5" id="change-password-form">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="label">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.newPassword}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              id="change-password-submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting password…
                </>
              ) : (
                'Set Password'
              )}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-6 p-4 bg-brand-600/5 border border-brand-600/20 rounded-lg text-xs text-slate-400 space-y-2">
            <p className="font-medium text-slate-300">Password requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 6 characters</li>
              <li>Must match confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
