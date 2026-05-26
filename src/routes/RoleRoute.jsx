import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { canAccessRoute, getDefaultRouteForRole } from '../utils/authRoutes';
import Loading from '../components/common/Loading';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading">
        <Loading label="Cargando permisos..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(role);
  const canAccess = hasAllowedRole && canAccessRoute(role, location.pathname);

  if (!canAccess) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return children;
}
