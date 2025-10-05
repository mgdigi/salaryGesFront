import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Users, UserCheck, Building2, Mail, Phone, Calendar } from 'lucide-react';

const CompanyDetailsModal = ({ isOpen, onClose, company }) => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && company) {
      fetchCompanyDetails();
    }
  }, [isOpen, company]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/companies/${company.id}`);
      setCompanyDetails(response.data.company);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
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
        return 'Super Administrateur';
      case 'ADMIN':
        return 'Administrateur';
      case 'CAISSIER':
        return 'Caissier';
      default:
        return role;
    }
  };

  if (!companyDetails) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'entreprise">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Chargement des détails...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de ${companyDetails.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Informations générales de l'entreprise */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            {companyDetails.logo ? (
              <img
                src={companyDetails.logo}
                alt={`${companyDetails.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{companyDetails.name}</h3>
              <p className="text-sm text-gray-600">Créée le {new Date(companyDetails.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{companyDetails.email || 'Non spécifié'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{companyDetails.phone || 'Non spécifié'}</span>
            </div>
            <div className="flex items-center space-x-2 col-span-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{companyDetails.address || 'Adresse non spécifiée'}</span>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{companyDetails.users?.length || 0}</div>
            <div className="text-sm text-blue-700">Utilisateurs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{companyDetails.employees?.length || 0}</div>
            <div className="text-sm text-green-700">Employés</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{companyDetails.payRuns?.length || 0}</div>
            <div className="text-sm text-purple-700">Cycles de paie</div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Utilisateurs ({companyDetails.users?.length || 0})
          </h4>

          {companyDetails.users && companyDetails.users.length > 0 ? (
            <div className="space-y-3">
              {companyDetails.users.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun utilisateur trouvé pour cette entreprise.</p>
            </div>
          )}
        </div>

        {/* Liste des employés */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Employés ({companyDetails.employees?.length || 0})
          </h4>

          {companyDetails.employees && companyDetails.employees.length > 0 ? (
            <div className="space-y-3">
              {companyDetails.employees.map((employee) => (
                <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.position} • {employee.contractType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.rate.toLocaleString()} FCFA • {employee.isActive ? 'Actif' : 'Inactif'}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun employé trouvé pour cette entreprise.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </Modal>
  );
};

export default CompanyDetailsModal;