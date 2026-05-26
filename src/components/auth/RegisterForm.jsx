import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { getDefaultRouteForRole } from '../../utils/authRoutes';
import { validateRegisterForm } from '../../utils/validators';
import Button from '../common/Button';
import AuthFormField from './AuthFormField';
import AuthAlert from './AuthAlert';
import './AuthForms.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, error: authError, clearError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    const validation = validateRegisterForm({
      fullName,
      email,
      password,
      confirmPassword,
    });
    setFieldErrors(validation.errors);
    if (!validation.isValid) return;

    setSubmitting(true);
    try {
      const data = await register(fullName, email, password);

      if (data.session) {
        navigate(getDefaultRouteForRole('customer'), { replace: true });
        return;
      }

      setSuccessMessage(
        'Cuenta creada. Revisa tu correo si debes confirmar el registro antes de iniciar sesión.',
      );
    } catch {
      /* authError */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card elevated className="auth-page__card">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h2>Crear cuenta</h2>
        <p className="auth-form__subtitle">
          Tu perfil de cliente se crea automáticamente al registrarte
        </p>

        <AuthAlert type="success" message={successMessage} />
        <AuthAlert type="error" message={authError} />

        <AuthFormField
          id="register-fullName"
          label="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
          autoComplete="name"
        />

        <AuthFormField
          id="register-email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
        />

        <AuthFormField
          id="register-password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoComplete="new-password"
        />

        <AuthFormField
          id="register-confirmPassword"
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" block disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrarse'}
        </Button>

        <p className="auth-form__footer">
          ¿Ya tienes cuenta? <Link to={ROUTES.LOGIN}>Inicia sesión</Link>
        </p>
      </form>
    </Card>
  );
}
