import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const leaveApi = {
  // Créer une demande de congé
  createLeaveRequest: async (leaveData) => {
    const response = await axios.post(`${API_BASE_URL}/leaves`, leaveData);
    return response.data;
  },

  // Approuver ou refuser une demande de congé
  approveOrRejectLeave: async (leaveId, approvalData) => {
    const response = await axios.put(`${API_BASE_URL}/leaves/${leaveId}/approve`, approvalData);
    return response.data;
  },

  // Annuler une demande de congé
  cancelLeave: async (leaveId) => {
    const response = await axios.put(`${API_BASE_URL}/leaves/${leaveId}/cancel`);
    return response.data;
  },

  // Récupérer les congés d'un employé
  getEmployeeLeaves: async (employeeId) => {
    const response = await axios.get(`${API_BASE_URL}/leaves/employee/${employeeId}`);
    return response.data;
  },

  // Récupérer les congés de l'utilisateur connecté
  getMyLeaves: async () => {
    const response = await axios.get(`${API_BASE_URL}/leaves/my-leaves`);
    return response.data;
  },

  // Récupérer toutes les demandes de congé pour une entreprise
  getCompanyLeaveRequests: async (companyId, status = null) => {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_BASE_URL}/leaves/company/${companyId}`, { params });
    return response.data;
  },

  // Récupérer le solde de congés d'un employé
  getLeaveBalance: async (employeeId) => {
    const response = await axios.get(`${API_BASE_URL}/leaves/balance/${employeeId}`);
    return response.data;
  },

  // Récupérer le solde de congés de l'utilisateur connecté
  getMyLeaveBalance: async () => {
    const response = await axios.get(`${API_BASE_URL}/leaves/my-balance`);
    return response.data;
  }
};