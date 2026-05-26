import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { getAllProfiles, getRoles, setProfileActive, updateUserRole } from '../../services/userService';
import './AdminShared.css';

export default function AdminUsersPanel({ onFeedback }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profiles, roleRows] = await Promise.all([getAllProfiles(), getRoles()]);
      setUsers(profiles);
      setRoles(roleRows);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRole = async (profileId, roleId) => {
    setBusyId(profileId);
    try {
      await updateUserRole(profileId, roleId);
      onFeedback?.('success', 'Rol actualizado');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (user) => {
    setBusyId(user.id);
    try {
      await setProfileActive(user.id, !user.is_active);
      onFeedback?.('success', user.is_active ? 'Usuario desactivado' : 'Usuario activado');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loading label="Cargando usuarios…" />;

  return (
    <Card elevated className="admin-panel-section">
      <div className="admin-panel-section__toolbar">
        <h2 className="page-section__title">Usuarios y roles</h2>
        <Button variant="secondary" size="sm" onClick={load}>
          Actualizar
        </Button>
      </div>
      {!users.length ? (
        <AdminEmptyState title="Sin usuarios" message="No hay perfiles en la tabla profiles." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role_id}
                      disabled={busyId === u.id}
                      onChange={(e) => handleRole(u.id, e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.is_active ? '' : 'admin-badge--muted'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === u.id}
                      onClick={() => handleToggleActive(u)}
                    >
                      {u.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
