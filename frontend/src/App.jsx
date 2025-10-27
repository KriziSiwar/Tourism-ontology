import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Profile from './pages/Profile';
import GuideDashboard from './pages/guide/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import EmailVerificationRequired from './pages/EmailVerificationRequired';
import AdminLayout from './components/admin/AdminLayout';
import './App.css';

// Composant de route protégée
const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérifier si l'email est vérifié (sauf pour certaines routes)
  const requiresEmailVerification = !['/verify-email', '/resend-verification', '/logout'].includes(window.location.pathname);
  if (requiresEmailVerification && !currentUser?.isEmailVerified && currentUser?.role !== 'admin') {
    return <Navigate to="/email-verification-required" />;
  }

  // Vérifier les rôles si spécifiés
  if (roles.length > 0 && !roles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/guide/dashboard"
            element={
              <PrivateRoute roles={['guide']}>
                <GuideDashboard />
              </PrivateRoute>
            }
          />
          {/* Routes d'administration - Version corrigée */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="statistics" element={<div>Statistiques</div>} />
            <Route path="settings" element={<div>Paramètres</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
