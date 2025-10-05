import React, { createContext, useContext, useState, useEffect } from 'react';
import { payRunApi } from '../api/payRunApi';
import { useAuth } from './AuthContext';
import axios from "axios"

const PayRunsContext = createContext();

export const usePayRuns = () => {
  const context = useContext(PayRunsContext);
  if (!context) {
    throw new Error('usePayRuns must be used within a PayRunsProvider');
  }
  return context;
};

export const PayRunsProvider = ({ children }) => {
  const { user } = useAuth();
  const [payRuns, setPayRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayRuns = async () => {
    try {
      setLoading(true);
      const companyId = user?.role === 'SUPER_ADMIN' ? undefined : user?.companyId;
      const url = companyId
        ? `http://localhost:3000/api/payruns?companyId=${companyId}`
        : 'http://localhost:3000/api/payruns';

      const response = await payRunApi.getAllPayRuns({ companyId });
      setPayRuns(response.payRuns || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cycles de paie:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPayRun = async (payRunData) => {
    const response = await payRunApi.createPayRun(payRunData);
    await fetchPayRuns();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    return response;
  };

  const generatePayslips = async (payRunId) => {
    const response = await axios.post(`http://localhost:3000/api/payruns/${payRunId}/generate-payslips`);
    await fetchPayRuns();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    return response.data;
  };

  const approvePayRun = async (payRunId) => {
    const response = await axios.post(`http://localhost:3000/api/payruns/${payRunId}/approve`);
    await fetchPayRuns();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    return response.data;
  };

  const closePayRun = async (payRunId) => {
    const response = await axios.post(`http://localhost:3000/api/payruns/${payRunId}/close`);
    await fetchPayRuns();
    // Émettre un événement pour rafraîchir les statistiques du dashboard
    window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
    return response.data;
  };

  useEffect(() => {
    if (user) {
      fetchPayRuns();
    }
  }, [user]);

  const value = {
    payRuns,
    loading,
    fetchPayRuns,
    createPayRun,
    generatePayslips,
    approvePayRun,
    closePayRun
  };

  return (
    <PayRunsContext.Provider value={value}>
      {children}
    </PayRunsContext.Provider>
  );
};