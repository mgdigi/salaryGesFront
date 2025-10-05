import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const attendanceApi = {
  // Créer un pointage
  createAttendance: async (attendanceData) => {
    const response = await axios.post(`${API_BASE_URL}/attendances`, attendanceData);
    return response.data;
  },

  // Créer plusieurs pointages en masse
  bulkCreateAttendances: async (attendances) => {
    const response = await axios.post(`${API_BASE_URL}/attendances/bulk`, { attendances });
    return response.data;
  },

  // Récupérer les pointages par cycle de paie
  getAttendancesByPayRun: async (payRunId) => {
    const response = await axios.get(`${API_BASE_URL}/attendances/payrun/${payRunId}`);
    return response.data;
  },

  // Récupérer les pointages par employé
  getAttendancesByEmployee: async (employeeId, payRunId = null) => {
    const params = payRunId ? { payRunId } : {};
    const response = await axios.get(`${API_BASE_URL}/attendances/employee/${employeeId}`, { params });
    return response.data;
  },

  // Récupérer les statistiques d'assiduité
  getAttendanceStats: async (employeeId, payRunId) => {
    const response = await axios.get(`${API_BASE_URL}/attendances/stats/${employeeId}/${payRunId}`);
    return response.data;
  },

  // Mettre à jour un pointage
  updateAttendance: async (id, attendanceData) => {
    const response = await axios.put(`${API_BASE_URL}/attendances/${id}`, attendanceData);
    return response.data;
  },

  // Supprimer un pointage
  deleteAttendance: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/attendances/${id}`);
    return response.data;
  },

  // Générer les pointages par défaut pour un cycle
  generateDefaultAttendances: async (payRunId) => {
    const response = await axios.post(`${API_BASE_URL}/attendances/generate-default/${payRunId}`);
    return response.data;
  }
};