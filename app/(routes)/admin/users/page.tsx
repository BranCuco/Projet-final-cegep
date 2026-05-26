'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import { getAdminUsers, type AdminUserSummary } from '@/lib/api';
import './admin-users.scss';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch {
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <ProtectedRoute>
      <div className="admin-users-page">
        <div className="container">
          <div className="admin-header">
            <div>
              <h1>Utilisateurs Boutique</h1>
              <p>Consultez les comptes clients et administrateurs de TechGear</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading">Chargement des utilisateurs...</div>
          ) : users.length === 0 ? (
            <div className="no-users">
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Identifiant</th>
                    <th>Courriel</th>
                    <th>Téléphone</th>
                    <th>Ville</th>
                    <th>Pays</th>
                    <th>Rôles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td data-label="Utilisateur" className="user-name">
                        <div>
                          <strong>{`${user.firstName} ${user.lastName}`.trim() || 'Sans nom'}</strong>
                        </div>
                      </td>
                      <td data-label="Identifiant">{user.userName || '—'}</td>
                      <td data-label="Courriel">{user.email || '—'}</td>
                      <td data-label="Téléphone">{user.phoneNumber || '—'}</td>
                      <td data-label="Ville">{user.city || '—'}</td>
                      <td data-label="Pays">{user.country || '—'}</td>
                      <td data-label="Rôles">
                        <div className="roles-list">
                          {user.roles.length > 0 ? user.roles.map((role) => <span key={role} className="role-badge">{role}</span>) : '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
