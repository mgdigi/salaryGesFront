import React, { useState } from 'react';
import { usePayRuns } from '../../context/PayRunsContext';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Notification from '../common/Notification';

const PayRunForm = ({ onClose }) => {
  const { createPayRun } = usePayRuns();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start <= end && start >= new Date('2000-01-01') && end <= new Date('2100-12-31');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDates(formData.startDate, formData.endDate)) {
      Notification.error('Erreur de validation', 'Veuillez saisir des dates valides (date de début ≤ date de fin)');
      return;
    }

    try {
      setLoading(true);
      await createPayRun({
        name: formData.name,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        companyId: user?.companyId
      });
      Notification.success('Succès', 'Cycle de paie créé avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Notification.error('Erreur', 'Impossible de créer le cycle de paie');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Nom du cycle (optionnel)"
        type="text"
        value={formData.name}
        onChange={handleInputChange('name')}
        placeholder="Ex: Septembre 2024"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Date de début"
          type="date"
          value={formData.startDate}
          onChange={handleInputChange('startDate')}
          required
        />

        <FormInput
          label="Date de fin"
          type="date"
          value={formData.endDate}
          onChange={handleInputChange('endDate')}
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
          {loading ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default PayRunForm;