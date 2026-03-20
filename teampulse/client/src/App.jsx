import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard    from './pages/Dashboard';
import AdminLayout      from './pages/admin/AdminLayout';
import AdminOverview    from './pages/admin/Adminoverview';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminUserDetail  from './pages/admin/AdminUserDetail';
import AdminAttendance  from './pages/admin/AdminAttendance';
import AdminEODReports  from './pages/admin/AdminEODReports';

const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Poppins,sans-serif', color:'#7A8CA5', gap:12 }}>
    <div style={{ width:22, height:22, border:'2.5px solid #E4EBF5', borderTopColor:'#7367F0', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    Loading…
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// Sirf logged in users ke liye
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

// Sirf admin ke liye
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Spinner />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Login/Register — already logged in ho toh redirect
const PublicRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (user) {
    // Admin ko admin panel, user ko dashboard
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* User dashboard — regular users only */}
            <Route path="/" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />

            {/* Admin panel — admin only */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index                   element={<AdminOverview />} />
              <Route path="users"            element={<AdminUsers />} />
              <Route path="users/:id"        element={<AdminUserDetail />} />
              <Route path="attendance"       element={<AdminAttendance />} />
              <Route path="eod"              element={<AdminEODReports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}