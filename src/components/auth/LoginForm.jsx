import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, ROUTES } from '../../utils/constants';
import { getDefaultRouteForRole } from '../../utils/authRoutes';
import { validateLoginForm } from '../../utils/validators';
import Button from '../common/Button';
import AuthFormField from './AuthFormField';
import AuthAlert from './AuthAlert';
import './AuthForms.css';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const validation = validateLoginForm({ email, password });
    setFieldErrors(validation.errors);
    if (!validation.isValid) return;

    setSubmitting(true);
    try {
      const result = await login(email, password);
      const userRole = result.profile?.role ?? role;
      const redirectTo =
        location.state?.from?.pathname ?? getDefaultRouteForRole(userRole);
      navigate(redirectTo, { replace: true });
    } catch {
      /* authError */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card elevated className="auth-page__card">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h2>Iniciar sesión</h2>
        <p className="auth-form__subtitle">Accede a tu cuenta de {APP_NAME}</p>

        <AuthAlert type="error" message={authError} />

        <AuthFormField
          id="login-email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
        />

        <AuthFormField
          id="login-password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <Button type="submit" block disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>

        <p className="auth-form__footer">
          ¿No tienes cuenta? <Link to={ROUTES.REGISTER}>Regístrate aquí</Link>
        </p>
      </form>
    </Card>
  );
}
