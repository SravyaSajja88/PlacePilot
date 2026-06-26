import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

import StudentDashboard from './pages/student/Dashboard';
import StudentDrives from './pages/student/Drives';
import StudentApplications from './pages/student/Applications';
import StudentProfile from './pages/student/Profile';

import OfficerDashboard from './pages/officer/Dashboard';
import OfficerDrives from './pages/officer/Drives';
import OfficerApplicants from './pages/officer/Applicants';
import OfficerStudents from './pages/officer/Students';
import OfficerSettings from './pages/officer/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />

        {/* Student */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/student/drives" element={
          <ProtectedRoute role="STUDENT"><StudentDrives /></ProtectedRoute>
        } />
        <Route path="/student/applications" element={
          <ProtectedRoute role="STUDENT"><StudentApplications /></ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute role="STUDENT"><StudentProfile /></ProtectedRoute>
        } />

        {/* Officer */}
        <Route path="/officer/dashboard" element={
          <ProtectedRoute role="OFFICER"><OfficerDashboard /></ProtectedRoute>
        } />
        <Route path="/officer/drives" element={
          <ProtectedRoute role="OFFICER"><OfficerDrives /></ProtectedRoute>
        } />
        <Route path="/officer/applicants/:driveId" element={
          <ProtectedRoute role="OFFICER"><OfficerApplicants /></ProtectedRoute>
        } />
        <Route path="/officer/students" element={
          <ProtectedRoute role="OFFICER"><OfficerStudents /></ProtectedRoute>
        } />
        <Route path="/officer/settings" element={
          <ProtectedRoute role="OFFICER"><OfficerSettings /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
