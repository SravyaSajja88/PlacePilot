import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const STUDENT_LINKS = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/drives', label: 'Drives' },
  { to: '/student/applications', label: 'Applications' },
  { to: '/student/profile', label: 'Profile' },
];

const OFFICER_LINKS = [
  { to: '/officer/dashboard', label: 'Dashboard' },
  { to: '/officer/drives', label: 'Drives' },
  { to: '/officer/students', label: 'Students' },
  { to: '/officer/settings', label: 'Settings' },
];

export function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = user.role === 'STUDENT' ? STUDENT_LINKS : OFFICER_LINKS;
  const displayName =
    user.role === 'STUDENT' ? user.student?.name : user.officer?.name || 'Officer';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user.role === 'STUDENT' ? '/student/dashboard' : '/officer/dashboard'} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">PlacePilot</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200">{displayName}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary btn-sm"
              id="logout-btn"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
