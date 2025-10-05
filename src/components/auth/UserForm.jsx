import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Notification from '../common/Notification';

const UserForm = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: user?.role === 'ADMIN' ? 'CAISSIER' : 'ADMIN',
    companyId: ''
  });
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  React.useEffect(() => {
    if (isOpen && user?.role === 'SUPER_ADMIN') {
      fetchCompanies();
    }
  }, [isOpen, user]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/companies');
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Notification.error('Erreur de validation', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (user?.role !== 'ADMIN' && formData.role == 'SUPER_ADMIN' && !formData.companyId) {
      Notification.error('Erreur de validation', 'Veuillez sélectionner une entreprise pour cet utilisateur');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/users', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyId: formData.role === 'SUPER_ADMIN' ? null : formData.companyId
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Notification.error('Erreur de création', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: user?.role === 'ADMIN' ? 'CAISSIER' : 'ADMIN',
      companyId: ''
    });
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user?.role === 'ADMIN' ? "Créer un caissier" : "Créer un nouvel utilisateur"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Adresse email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="utilisateur@exemple.com"
          required
        />

        <FormInput
          label="Mot de passe"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          placeholder="Minimum 6 caractères"
          required
        />

        <FormInput
          label="Confirmer le mot de passe"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          placeholder="Répéter le mot de passe"
          required
        />

        {user?.role !== 'ADMIN' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={handleInputChange('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                required
              >
                <option value="ADMIN">Administrateur</option>
                <option value="CAISSIER">Caissier</option>
                {user?.role === 'SUPER_ADMIN' && (
                  <option value="SUPER_ADMIN">Super Administrateur</option>
                )}
              </select>
            </div>

            {formData.role !== 'SUPER_ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise *
                </label>
                <select
                  value={formData.companyId}
                  onChange={handleInputChange('companyId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  required
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Création...' : (user?.role === 'ADMIN' ? 'Créer le caissier' : 'Créer l\'utilisateur')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;