import React, { useState, useEffect } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Notification from '../common/Notification';

const EmployeeForm = ({ employee, onClose }) => {
  const { createEmployee, updateEmployee } = useEmployee();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    contractType: 'FIXE',
    rate: '',
    bankDetails: '',
    companyId: user?.companyId || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        contractType: employee.contractType,
        rate: employee.rate.toString(),
        bankDetails: employee.bankDetails || '',
        companyId: employee.companyId
      });
    }
  }, [employee]);

  const validateName = (name) => {
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-']{2,}$/;
    return nameRegex.test(name);
  };

  const validatePosition = (position) => {
    const positionRegex = /^[A-Za-zÀ-ÿ0-9\s\-&]{2,}$/;
    return positionRegex.test(position);
  };

  const validateAmount = (amount) => {
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    const num = parseFloat(amount);
    return amountRegex.test(amount) && num > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(formData.firstName)) {
      Notification.error('Erreur de validation', 'Le prénom doit contenir au moins 2 caractères');
      return;
    }

    if (!validateName(formData.lastName)) {
      Notification.error('Erreur de validation', 'Le nom doit contenir au moins 2 caractères');
      return;
    }

    if (!validatePosition(formData.position)) {
      Notification.error('Erreur de validation', 'Le poste doit contenir au moins 2 caractères');
      return;
    }

    if (!validateAmount(formData.rate)) {
      Notification.error('Erreur de validation', 'Le salaire doit être un nombre positif valide');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        rate: parseFloat(formData.rate)
      };

      if (employee) {
        await updateEmployee(employee.id, data);
      } else {
        await createEmployee(data);
      }

      Notification.success('Succès', employee ? 'Employé modifié avec succès' : 'Employé créé avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Notification.error('Erreur', 'Impossible de sauvegarder l\'employé');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Sauvegarde...' : (employee ? 'Modifier' : 'Ajouter')}
      </Button>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Prénom"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            required
          />
          <FormInput
            label="Nom"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            required
          />
        </div>
        <FormInput
          label="Poste"
          value={formData.position}
          onChange={handleInputChange('position')}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={formData.contractType}
              onChange={handleInputChange('contractType')}
            >
              <option value="FIXE">Fixe</option>
              <option value="JOURNALIER">Journalier</option>
              <option value="HONORAIRE">Honoraire</option>
            </select>
          </div>
          <FormInput
            label="Salaire/Taux"
            type="number"
            value={formData.rate}
            onChange={handleInputChange('rate')}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coordonnées bancaires</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows="3"
            value={formData.bankDetails}
            onChange={handleInputChange('bankDetails')}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? 'Sauvegarde...' : (employee ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </>
  );
};

export default EmployeeForm;