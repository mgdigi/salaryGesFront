import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const superAdminStatsApi = {
  // Récupérer les statistiques globales du super admin
  getGlobalStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/super-admin/stats/global`);
    return response.data;
  },

  // Vérifier la santé du système
  getSystemHealth: async () => {
    const response = await axios.get(`${API_BASE_URL}/super-admin/stats/health`);
    return response.data;
  }
};