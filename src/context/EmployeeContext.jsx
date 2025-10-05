import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';
import { useAuth } from './AuthContext';
import axios from "axios"

const EmployeeContext = createContext();

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const companyId = user?.role === 'SUPER_ADMIN' ? undefined : user?.companyId;
      const url = companyId
        ? `http://localhost:3000/api/employees?companyId=${companyId}`
        : 'http://localhost:3000/api/employees';

      const response = await employeeApi.getAllEmployees({ companyId });
      setEmployees(response.employees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData) => {
    const response = await employeeApi.createEmployee(employeeData);
    await fetchEmployees();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    return response;
  };

  const updateEmployee = async (id, employeeData) => {
    const response = await employeeApi.updateEmployee(id, employeeData);
    await fetchEmployees();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    return response;
  };

  const toggleEmployeeStatus = async (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    const newStatus = !employee.isActive;

    await axios.put(`http://localhost:3000/api/employees/${id}`, {
      isActive: newStatus
    });
    await fetchEmployees();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
  };

  const filterEmployees = async (filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      const companyId = user?.role === 'SUPER_ADMIN' ? undefined : user?.companyId;
      if (companyId) queryParams.append('companyId', companyId);

      if (filters.contractType) queryParams.append('contractType', filters.contractType);
      if (filters.position) queryParams.append('position', filters.position);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());

      const response = await axios.get(`http://localhost:3000/api/employees/filter/search?${queryParams}`);
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const value = {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    filterEmployees
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};