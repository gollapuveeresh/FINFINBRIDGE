import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to role-specific login page, but save the current location
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/crm-admin')) {
      return <Navigate to="/crm-admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/department-admin')) {
      return <Navigate to="/department-admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/department-consultant')) {
      return <Navigate to="/department-consultant/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/consultant')) {
      return <Navigate to="/department-consultant/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/client')) {
      return <Navigate to="/client/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
