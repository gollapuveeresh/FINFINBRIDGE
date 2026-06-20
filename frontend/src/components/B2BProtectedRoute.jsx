import { Navigate } from 'react-router-dom';
import { useB2BAuth } from '../context/B2BAuthContext';

export default function B2BProtectedRoute({ children }) {
  const { company } = useB2BAuth();
  if (!company) return <Navigate to="/b2b/login" replace />;
  return children;
}
