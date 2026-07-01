import { useEffect, useState } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorMessage from '../components/common/ErrorMessage';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/profileService';
import './CustomerPages.css';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile(user.id, { full_name: fullName, phone });
      await refreshProfile?.();
      setFeedback({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="customer-page profile-page">
      <header className="customer-page__header">
        <h1>Mi perfil</h1>
        <p>Actualiza tu información de contacto.</p>
      </header>

      {feedback && (
        <ErrorMessage type={feedback.type} message={feedback.text} className="customer-page__notice" />
      )}

      <Card elevated>
        <form className="profile-page__form" onSubmit={handleSubmit}>
          <Input
            id="profile-email"
            label="Correo"
            value={profile?.email ?? ''}
            disabled
            hint="El correo no se puede cambiar desde la app."
          />
          <Input
            id="profile-name"
            label="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            id="profile-phone"
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
        <p className="profile-page__meta">
          Rol: {profile?.role_name ?? profile?.role ?? 'Cliente'}
        </p>
      </Card>
    </div>
  );
}
