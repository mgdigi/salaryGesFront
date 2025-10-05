import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const authApi = {
  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  },

  register: async (email, password, role, companyId) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password, role, companyId });
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`);
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/auth/users`, { params });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/users`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axios.delete(`${API_BASE_URL}/auth/users/${userId}`);
    return response.data;
  }
};