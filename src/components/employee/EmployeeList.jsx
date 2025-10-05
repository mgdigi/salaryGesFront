import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../../context/EmployeeContext';
import Button from '../common/Button';

const EmployeeList = ({ onEdit, onToggleStatus }) => {
  const { employees, loading } = useEmployee();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md m-5">
      <ul className="divide-y divide-gray-200">
        {employees.map((employee) => (
          <li key={employee.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.position} • {employee.contractType} • {employee.rate.toLocaleString()} FCFA
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  employee.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.isActive ? 'Actif' : 'Inactif'}
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/employee/${employee.id}`);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Voir détails
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(employee);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Modifier
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(employee.id);
                  }}
                  variant={employee.isActive ? "danger" : "primary"}
                  size="sm"
                >
                  {employee.isActive ? "Désactiver" : "Activer"}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun employé trouvé.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;