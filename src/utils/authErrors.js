/**
 * Traduce errores de Supabase Auth a mensajes claros para el usuario.
 */
export function mapAuthError(error) {
  if (!error) return 'Ocurrió un error inesperado. Intenta de nuevo.';

  const message = error.message ?? String(error);
  const code = error.code ?? '';
  const lower = message.toLowerCase();

  if (code === 'invalid_credentials' || lower.includes('invalid login')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }
  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered')
  ) {
    return 'Este correo ya está registrado. Inicia sesión.';
  }
  if (lower.includes('password') && lower.includes('weak')) {
    return 'La contraseña no cumple los requisitos mínimos de seguridad.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Sin conexión con el servidor. Revisa tu internet.';
  }

  return message;
}
