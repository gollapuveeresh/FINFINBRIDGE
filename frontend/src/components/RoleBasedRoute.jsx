import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessDepartment, getDepartmentDashboardPath, getUserDepartment } from '../utils/departmentAccess';

export default function RoleBasedRoute({ children, allowedRoles, allowedDepartment }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to their respective dashboard based on their actual role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'consultant') {
      return <Navigate to="/department-consultant/loans/dashboard" replace />;
    } else if (user?.role === 'department-admin') {
      return <Navigate to="/department-admin/loans/dashboard" replace />;
    } else {
      return <Navigate to="/client/dashboard" replace />;
    }
  }

  if (allowedDepartment && !canAccessDepartment(user, allowedDepartment)) {
    const ownDepartment = getUserDepartment(user);
    return <Navigate to={getDepartmentDashboardPath(user?.role, ownDepartment)} replace />;
  }

  return children;
}
