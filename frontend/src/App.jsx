import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SignIn from './pages/SignIn';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PhotoCapture from './pages/PhotoCapture';
import ViewPhotos from './pages/ViewPhotos';
<<<<<<< HEAD
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminDashboard from './pages/admin/AdminDashboard';
import SessionDetails from './pages/admin/SessionDetails';
=======
import Enrollments from './pages/Enrollments';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminDashboard from './pages/admin/AdminDashboard';
import Subjects from './pages/admin/Subjects';
import SessionDetails from './pages/admin/SessionDetails';
import Students from './pages/admin/Students';
import Reports from './pages/admin/Reports';
import AttendanceSheet from './pages/admin/AttendanceSheet';
>>>>>>> harsh_sharma

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('token', adminToken);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [adminToken]);

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  const AdminProtectedRoute = ({ children }) => {
    return adminToken ? children : <Navigate to="/admin/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Student Routes */}
        <Route path="/signin" element={token ? <Navigate to="/dashboard" /> : <SignIn setToken={setToken} />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard token={token} setToken={setToken} /></ProtectedRoute>} />
        <Route path="/capture-photos" element={<ProtectedRoute><PhotoCapture token={token} /></ProtectedRoute>} />
        <Route path="/view-photos" element={<ProtectedRoute><ViewPhotos /></ProtectedRoute>} />
<<<<<<< HEAD
=======
        <Route path="/enrollments" element={<ProtectedRoute><Enrollments setToken={setToken} /></ProtectedRoute>} />
>>>>>>> harsh_sharma

        {/* Admin Routes */}
        <Route path="/admin/login" element={adminToken ? <Navigate to="/admin/dashboard" /> : <AdminLogin setAdminToken={setAdminToken} />} />
        <Route path="/admin/signup" element={adminToken ? <Navigate to="/admin/dashboard" /> : <AdminSignup setAdminToken={setAdminToken} />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard adminToken={adminToken} setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
<<<<<<< HEAD
        <Route path="/admin/session/:sessionId" element={<AdminProtectedRoute><SessionDetails /></AdminProtectedRoute>} />
=======
        <Route path="/admin/sessions" element={<AdminProtectedRoute><AdminDashboard adminToken={adminToken} setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
        <Route path="/admin/students" element={<AdminProtectedRoute><Students setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
        <Route path="/admin/subjects" element={<AdminProtectedRoute><Subjects setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
        <Route path="/admin/reports" element={<AdminProtectedRoute><Reports setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
        <Route path="/admin/attendance-sheet/:subjectId" element={<AdminProtectedRoute><AttendanceSheet setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
        <Route path="/admin/session/:sessionId" element={<AdminProtectedRoute><SessionDetails setAdminToken={setAdminToken} /></AdminProtectedRoute>} />
>>>>>>> harsh_sharma

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
