import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';
import { paymentApi } from '../api/paymentApi';
import { payRunApi } from '../api/payRunApi';
import { useAuth } from './AuthContext';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalSalary: 0,
    paidAmount: 0,
    pendingAmount: 0,
    upcomingPayments: []
  });
  const [loading, setLoading] = useState(false);
  const [salaryEvolution, setSalaryEvolution] = useState([
    { month: 'Janvier', amount: 0 },
    { month: 'Février', amount: 0 },
    { month: 'Mars', amount: 0 },
    { month: 'Avril', amount: 0 },
    { month: 'Mai', amount: 0 },
    { month: 'Juin', amount: 0 }
  ]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      let companyIdParam = '';
      if (user?.role === 'SUPER_ADMIN' && localStorage.getItem('selectedCompany')) {
        const selectedCompany = JSON.parse(localStorage.getItem('selectedCompany'));
        companyIdParam = selectedCompany.id;
      } else if (user?.role !== 'SUPER_ADMIN') {
        companyIdParam = user?.companyId || '';
      }

      const [employeesResponse, paymentsResponse, payRunsResponse] = await Promise.all([
        employeeApi.getAllEmployees({ companyId: companyIdParam }),
        paymentApi.getPaymentStats({ companyId: companyIdParam }),
        payRunApi.getAllPayRuns({ companyId: companyIdParam })
      ]);

      const employees = employeesResponse.employees || [];
      const paymentStats = paymentsResponse.stats;
      const payRuns = payRunsResponse.payRuns || [];

      const upcomingPayments = [];
      payRuns.forEach(payRun => {
        if (payRun.payslips) {
          payRun.payslips.forEach(payslip => {
            if (payslip.status !== 'PAYE') {
              const totalPaid = payslip.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
              const remainingAmount = payslip.net - totalPaid;

              if (remainingAmount > 0) {
                upcomingPayments.push({
                  ...payslip,
                  payRun: { period: payRun.period },
                  amount: remainingAmount
                });
              }
            }
          });
        }
      });

      const activeEmployees = employees.filter(emp => emp.isActive).length;
      const totalSalary = employees
        .filter(emp => emp.isActive)
        .reduce((sum, emp) => sum + emp.rate, 0);

      // Calculer l'évolution dynamique de la masse salariale
      const monthlyData = {};
      const currentDate = new Date();

      // Initialiser les 6 derniers mois
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        monthlyData[monthKey] = 0;
      }

      // Agréger les paiements par mois
      if (paymentStats.monthlyPayments && Array.isArray(paymentStats.monthlyPayments)) {
        paymentStats.monthlyPayments.forEach(monthData => {
          try {
            const monthKey = new Date(monthData.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            if (monthlyData.hasOwnProperty(monthKey)) {
              monthlyData[monthKey] = monthData.amount || 0;
            }
          } catch (error) {
            console.warn('Erreur lors du traitement des données mensuelles:', error);
          }
        });
      }

      // Convertir en format pour le graphique
      const dynamicSalaryEvolution = Object.entries(monthlyData).map(([month, amount]) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        amount: amount
      }));

      const newStats = {
        totalEmployees: activeEmployees,
        totalSalary: totalSalary,
        paidAmount: paymentStats.totalAmount || 0,
        pendingAmount: totalSalary - (paymentStats.totalAmount || 0),
        upcomingPayments: upcomingPayments.slice(0, 5)
      };

      setStats(newStats);
      // Émettre un événement pour mettre à jour les autres composants
      window.dispatchEvent(new CustomEvent('statsUpdate', { detail: newStats }));
      setSalaryEvolution(dynamicSalaryEvolution);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // Écouter les événements de rafraîchissement des statistiques
  useEffect(() => {
    const handleRefreshStats = () => {
      if (user) {
        fetchDashboardStats();
      }
    };

    window.addEventListener('refreshDashboardStats', handleRefreshStats);

    return () => {
      window.removeEventListener('refreshDashboardStats', handleRefreshStats);
    };
  }, [user]);

  // Écouter les changements dans localStorage pour les super admins
  useEffect(() => {
    const handleStorageChange = () => {
      if (user?.role === 'SUPER_ADMIN') {
        fetchDashboardStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Aussi écouter les changements locaux (quand on modifie localStorage dans le même onglet)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (key === 'selectedCompany' && user?.role === 'SUPER_ADMIN') {
        fetchDashboardStats();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, [user]);

  // Fonction pour rafraîchir les statistiques (utilisée par d'autres contextes)
  const refreshStats = () => {
    if (user) {
      fetchDashboardStats();
    }
  };

  const value = {
    stats,
    salaryEvolution,
    loading,
    fetchDashboardStats,
    refreshStats
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};