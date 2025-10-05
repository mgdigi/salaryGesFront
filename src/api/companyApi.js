import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const companyApi = {
  getAllCompanies: async () => {
    const response = await axios.get(`${API_BASE_URL}/companies`);
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/companies/${id}`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await axios.post(`${API_BASE_URL}/companies`, companyData);
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await axios.put(`${API_BASE_URL}/companies/${id}`, companyData);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/companies/${id}`);
    return response.data;
  }
};