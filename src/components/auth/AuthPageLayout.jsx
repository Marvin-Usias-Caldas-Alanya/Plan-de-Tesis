import { Navigate } from 'react-router-dom';
import Loading from '../common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForRole } from '../../utils/authRoutes';

/**
 * Contenedor común para páginas de autenticación (login/registro).
 * Redirige si ya hay sesión; muestra loading mientras se verifica.
 */
export default function AuthPageLayout({ children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <Loading label="Cargando..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <div className="auth-page">{children}</div>;
}
