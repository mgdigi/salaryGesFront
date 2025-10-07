import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const absenceAutomationApi = {
  // Marquer automatiquement les absences pour une entreprise
  markAutomaticAbsences: async (companyId) => {
    const response = await axios.post(`${API_BASE_URL}/absence-automation/company/${companyId}/mark-automatic`);
    return response.data;
  },

  // Marquer les absences pour une date spécifique
  markAbsencesForDate: async (companyId, date) => {
    const response = await axios.post(`${API_BASE_URL}/absence-automation/company/${companyId}/mark-for-date`, { date });
    return response.data;
  },

  // Récupérer les statistiques d'absences pour un cycle de paie
  getAbsenceStatistics: async (payRunId) => {
    const response = await axios.get(`${API_BASE_URL}/absence-automation/payrun/${payRunId}/statistics`);
    return response.data;
  }
};