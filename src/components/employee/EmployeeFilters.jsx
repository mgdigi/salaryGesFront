import React, { useState } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import FormInput from '../common/FormInput';
import Button from '../common/Button';

const EmployeeFilters = () => {
  const { filterEmployees } = useEmployee();
  const [filters, setFilters] = useState({
    contractType: '',
    position: '',
    isActive: ''
  });

  const handleFilterChange = (field) => (e) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleApplyFilters = () => {
    const activeFilter = filters.isActive === '' ? undefined :
                        filters.isActive === 'active' ? true : false;

    filterEmployees({
      contractType: filters.contractType || undefined,
      position: filters.position || undefined,
      isActive: activeFilter
    });
  };

  const handleResetFilters = () => {
    setFilters({
      contractType: '',
      position: '',
      isActive: ''
    });
    filterEmployees({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 m-5">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
          <select
            value={filters.contractType}
            onChange={handleFilterChange('contractType')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Tous</option>
            <option value="FIXE">Fixe</option>
            <option value="JOURNALIER">Journalier</option>
            <option value="HONORAIRE">Honoraire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
          <input
            type="text"
            value={filters.position}
            onChange={handleFilterChange('position')}
            placeholder="Rechercher par poste..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={filters.isActive}
            onChange={handleFilterChange('isActive')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Tous</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <Button
            onClick={handleApplyFilters}
            variant="primary"
            size="sm"
          >
            Appliquer
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="secondary"
            size="sm"
          >
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;