import React, { useState } from 'react';
import { EmployeeProvider, useEmployee } from '../context/EmployeeContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import EmployeeList from '../components/employee/EmployeeList';
import EmployeeForm from '../components/employee/EmployeeForm';
import EmployeeFilters from '../components/employee/EmployeeFilters';
import UserManagement from '../components/auth/UserManagement';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';

const EmployeesContent = () => {
  const { user } = useAuth();
  const { toggleEmployeeStatus, employees } = useEmployee();
  const [activeTab, setActiveTab] = useState('employees');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleToggleStatus = async (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    const action = employee.isActive ? 'désactiver' : 'activer';
    const result = await Notification.confirm(
      `Confirmer l'action`,
      `Êtes-vous sûr de vouloir ${action} cet employé ?`,
      'Confirmer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await toggleEmployeeStatus(id);
        Notification.success(
          'Statut mis à jour',
          `L'employé a été ${employee.isActive ? 'désactivé' : 'activé'} avec succès`
        );
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error);
        Notification.error('Erreur', 'Impossible de changer le statut de l\'employé');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div className='flex flex-col'>
            <p className="ml-8 mt-1 text-sm text-gray-600">
              Gérez vos employés et utilisateurs
            </p>
          </div>
          {activeTab === 'employees' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setEditingEmployee(null);
                setShowModal(true);
              }}
              variant="primary"
            >
              Ajouter un employé
            </Button>
          )}
        </div>

        <div className="bg-white shadow rounded-lg mb-6 m-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Employés
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Utilisateurs
                </button>
              )}
            </nav>
          </div>
        </div>

        {activeTab === 'employees' ? (
          <>
            <EmployeeFilters />
            <EmployeeList
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          </>
        ) : (
          <UserManagement companyId={user?.companyId} />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
        size="lg"
      >
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleCloseModal}
        />
      </Modal>
    </Layout>
  );
};

const Employees = () => {
  return (
    <EmployeeProvider>
      <EmployeesContent />
    </EmployeeProvider>
  );
};

export default Employees;