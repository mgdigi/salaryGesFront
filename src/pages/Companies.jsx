import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/common/Notification';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserManagement from '../components/auth/UserManagement';
import ColorPicker from '../components/ColorPicker';
import CompanyDetailsModal from '../components/company/CompanyDetailsModal';
import { Eye, Info } from 'lucide-react';

const CompaniesContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('companies');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/companies');
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+?[1-9]\d{0,3})?[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}$/;
    return phoneRegex.test(phone) || phone === '';
  };

  const validateCompanyName = (name) => {
    const nameRegex = /^[A-Za-zÀ-ÿ0-9\s\-&]{2,}$/;
    return nameRegex.test(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCompany) {
      if (!validateCompanyName(formData.name)) {
        Notification.error('Erreur de validation', 'Le nom de l\'entreprise doit contenir au moins 2 caractères');
        return;
      }

      if (!validateEmail(formData.adminEmail)) {
        Notification.error('Erreur de validation', 'Veuillez saisir une adresse email valide');
        return;
      }

      if (!validatePassword(formData.adminPassword)) {
        Notification.error('Erreur de validation', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      if (formData.adminPassword !== formData.confirmPassword) {
        Notification.error('Erreur de validation', 'Les mots de passe ne correspondent pas');
        return;
      }
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      Notification.error('Erreur de validation', 'Veuillez saisir un numéro de téléphone valide');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      Notification.error('Erreur de validation', 'Veuillez saisir une adresse email valide pour l\'entreprise');
      return;
    }

    try {
      if (editingCompany) {
        await axios.put(`http://localhost:3000/api/companies/${editingCompany.id}`, formData);
        Notification.success('Succès', 'Entreprise modifiée avec succès');
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('color', formData.color || '#f97316');
        formDataToSend.append('adminEmail', formData.adminEmail);
        formDataToSend.append('adminPassword', formData.adminPassword);

        if (logoFile) {
          formDataToSend.append('logo', logoFile);
        }

        const response = await axios.post('http://localhost:3000/api/companies', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        Notification.success('Succès', `Entreprise créée avec succès ! Admin: ${response.data.admin.email}`);
      }

      fetchCompanies();
      setShowModal(false);
      resetForm();
      setEditingCompany(null);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Notification.error('Erreur', 'Impossible de sauvegarder l\'entreprise');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      color: company.color || '#f97316'
    });
    setShowModal(true);
  };

  const handleViewCompanyDetails = (company) => {
    setSelectedCompanyForDetails(company);
    setShowCompanyDetailsModal(true);
  };

  const handleViewCompanyDashboard = async (company) => {
    try {
      console.log('Début du changement d\'entreprise:', company);
      const response = await axios.get(`http://localhost:3000/api/companies/${company.id}`);
      const companyDetails = response.data.company;
      console.log('Détails de l\'entreprise récupérés:', companyDetails);

      const companyData = {
        id: companyDetails.id,
        name: companyDetails.name,
        color: companyDetails.color,
        logo: companyDetails.logo
      };

      localStorage.setItem('selectedCompany', JSON.stringify(companyData));
      console.log('Données stockées dans localStorage:', companyData);

      navigate('/dashboard');
      Notification.success('Dashboard de l\'entreprise', `Vous visualisez maintenant le dashboard de "${companyDetails.name}"`);
    } catch (error) {
      console.error('Erreur lors du changement d\'entreprise:', error);
      Notification.error('Erreur', 'Impossible d\'accéder au dashboard de cette entreprise');
    }
  };

  const handleDelete = async (companyId) => {
    const result = await Notification.confirm(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette entreprise ?',
      'Supprimer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/companies/${companyId}`);
        fetchCompanies();
        Notification.success('Succès', 'Entreprise supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Notification.error('Erreur', 'Impossible de supprimer l\'entreprise');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      color: '#f97316'
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Chargement des entreprises...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div className='ml-10'>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'companies' ? 'Gestion des Entreprises' : 'Gestion des Utilisateurs'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {activeTab === 'companies'
                ? 'Gérez toutes les entreprises de votre système'
                : 'Gérez les comptes utilisateurs du système'
              }
            </p>
          </div>
          {user?.role === 'SUPER_ADMIN' && activeTab === 'companies' && (
            <Button onClick={() => setShowModal(true)} variant="primary">
              Nouvelle entreprise
            </Button>
          )}
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <div className="bg-white shadow rounded-lg m-8 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('companies')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'companies'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Entreprises
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'users'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Utilisateurs
                </button>
              </nav>
            </div>
          </div>
        )}

        {activeTab === 'companies' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg m-8">
            <ul className="divide-y divide-gray-200">
              {companies.map((company) => (
                <li key={company.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-orange-600">
                            <img src={company.logo} alt={company.name} className="h-15 w-40 object-cover rounded-full" />
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.address}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.email} • {company.phone}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {company.users?.length || 0} utilisateurs • {company.employees?.length || 0} employés
                        </div>
                      </div>
                    </div>
                    {user?.role === 'SUPER_ADMIN' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleViewCompanyDetails(company)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Info className="w-4 h-4" />
                          <span>Détails</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleEdit(company)}
                          variant="secondary"
                          size="sm"
                        >
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleDelete(company.id)}
                          variant="danger"
                          size="sm"
                        >
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {companies.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune entreprise</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première entreprise.</p>
                {user?.role === 'SUPER_ADMIN' && (
                  <div className="mt-6">
                    <Button onClick={() => setShowModal(true)} variant="primary">
                      Créer la première entreprise
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <UserManagement />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCompany(null);
          resetForm();
        }}
        title={editingCompany ? 'Modifier l\'entreprise' : 'Créer une nouvelle entreprise'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Nom de l'entreprise"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Ex: Entreprise XYZ"
            />

            <FormInput
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+221 XX XXX XX XX"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Adresse complète de l'entreprise"
            />
          </div>

          <FormInput
            label="Email de l'entreprise"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="contact@entreprise.com"
          />

          <ColorPicker
            label="Couleur de l'entreprise"
            value={formData.color || '#f97316'}
            onChange={(color) => setFormData({...formData, color})}
          />

          {!editingCompany && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Logo de l'entreprise (optionnel)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {logoPreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
              </p>
            </div>
          )}

          {!editingCompany && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium mr-2">
                    Nouveau
                  </span>
                  Créer le compte Administrateur
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Email de l'Admin"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                    required
                    placeholder="admin@entreprise.com"
                  />

                  <FormInput
                    label="Mot de passe"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                    required
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                <div className="mt-4">
                  <FormInput
                    label="Confirmer le mot de passe"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    placeholder="Répéter le mot de passe"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setEditingCompany(null);
              resetForm();
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
          >
            {editingCompany ? 'Modifier' : 'Créer l\'entreprise'}
          </Button>
        </div>
      </Modal>

      <CompanyDetailsModal
        isOpen={showCompanyDetailsModal}
        onClose={() => {
          setShowCompanyDetailsModal(false);
          setSelectedCompanyForDetails(null);
        }}
        company={selectedCompanyForDetails}
      />
    </Layout>
  );
};

const Companies = () => {
  return (
    <CompaniesContent />
  );
};

export default Companies;