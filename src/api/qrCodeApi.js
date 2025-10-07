import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const qrCodeApi = {
  // Générer un QR code pour un employé
  generateEmployeeQR: async (employeeId) => {
    const response = await axios.post(`${API_BASE_URL}/qrcodes/employee/${employeeId}/generate`);
    return response.data;
  },

  // Régénérer le QR code d'un employé
  regenerateEmployeeQR: async (employeeId) => {
    const response = await axios.post(`${API_BASE_URL}/qrcodes/employee/${employeeId}/regenerate`);
    return response.data;
  },

  // Récupérer le QR code d'un employé
  getEmployeeQR: async (employeeId) => {
    const response = await axios.get(`${API_BASE_URL}/qrcodes/employee/${employeeId}`);
    return response.data;
  },

  // Générer des QR codes en masse pour une entreprise
  generateBulkQRCodes: async (companyId) => {
    const response = await axios.post(`${API_BASE_URL}/qrcodes/company/${companyId}/generate-bulk`);
    return response.data;
  },

  // Valider un QR code scanné
  validateQRCode: async (qrData) => {
    const response = await axios.post(`${API_BASE_URL}/qrcodes/validate`, { qrData });
    return response.data;
  }
};