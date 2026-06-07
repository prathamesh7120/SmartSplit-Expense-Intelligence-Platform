import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import GroupDetail from './pages/dashboard/GroupDetail';
import ServerWakeUp from './components/ServerWakeUp';

// ProtectedRoute = wrapper component.
// If user is not logged in → redirect to /login automatically.
// If logged in → show the page they requested.
// This protects every page that requires authentication.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// PublicRoute = opposite of ProtectedRoute.
// If user IS logged in and tries to visit /login or /register,
// redirect them to dashboard automatically.
// No logged-in user should see the login page.
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route → redirect to register */}
      <Route path="/" element={<Navigate to="/register" replace />} />

      {/* Public routes — only for non-logged-in users */}
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />

      {/* Protected route placeholder — dashboard coming next */}
      <Route path="/dashboard" element={
         <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/groups/:groupId" element={
   <ProtectedRoute><GroupDetail /></ProtectedRoute>
} />

    </Routes>

      

  );
};




// Wrap your entire return in App:
const App = () => {
  return (
    <AuthProvider>
      <ServerWakeUp>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Syne, sans-serif',
              },
            }}
          />
        </BrowserRouter>
      </ServerWakeUp>
    </AuthProvider>
  );
};