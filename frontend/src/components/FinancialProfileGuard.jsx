import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FinancialProfileGuard({ children }) {
  const { hasFinancialProfile, user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only clients need a financial profile check.
  // Force redirect to /client/financial-profile if missing.
  if (user?.role === 'client' && !hasFinancialProfile && location.pathname !== '/client/financial-profile') {
    return <Navigate to="/client/financial-profile" replace />;
  }

  return children;
}
