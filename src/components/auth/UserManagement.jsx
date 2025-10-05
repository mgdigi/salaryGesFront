import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import Button from '../common/Button';
import UserForm from './UserForm';
import Notification from '../common/Notification';
import { TrashIcon, UserPlusIcon } from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authApi.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Notification.confirm(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      'Supprimer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await authApi.deleteUser(userId);
        fetchUsers();
        Notification.success('Succès', 'Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Notification.error('Erreur de suppression', error.response?.data?.error || error.message);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800';
      case 'CAISSIER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'CAISSIER':
        return 'Caissier';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md m-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {user?.role === 'ADMIN' ? 'Gestion des Caissiers' : 'Gestion des Utilisateurs'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'ADMIN' ? 'Gérez les comptes caissiers de votre entreprise' : 'Gérez les comptes utilisateurs du système'}
          </p>
        </div>
        <Button
          onClick={() => setShowUserForm(true)}
          variant="primary"
          size="sm"
          className="flex items-center space-x-2"
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>{user?.role === 'ADMIN' ? 'Créer caissier' : 'Nouvel utilisateur'}</span>
        </Button>
      </div>

      <ul className="divide-y divide-gray-200">
        {users.map((userItem) => (
          <li key={userItem.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {userItem.email.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {userItem.email}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userItem.role)}`}>
                      {getRoleLabel(userItem.role)}
                    </span>
                    {userItem.company && (
                      <span className="text-xs text-gray-500">
                        • {userItem.company.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Créé le {new Date(userItem.createdAt).toLocaleDateString('fr-FR')}
                </span>
                {user?.role === 'SUPER_ADMIN' && userItem.role !== 'SUPER_ADMIN' && (
                  <Button
                    onClick={() => handleDeleteUser(userItem.id)}
                    variant="danger"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Aucun utilisateur</h3>
          <p className="text-sm text-gray-500 mb-4">
            Commencez par créer votre premier utilisateur.
          </p>
          <Button
            onClick={() => setShowUserForm(true)}
            variant="primary"
          >
            Créer un utilisateur
          </Button>
        </div>
      )}

      <UserForm
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;