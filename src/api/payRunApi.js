import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const payRunApi = {
  getAllPayRuns: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/payruns`, { params });
    return response.data;
  },

  getPayRunById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/payruns/${id}`);
    return response.data;
  },

  createPayRun: async (payRunData) => {
    const response = await axios.post(`${API_BASE_URL}/payruns`, payRunData);
    return response.data;
  },

  updatePayRun: async (id, payRunData) => {
    const response = await axios.put(`${API_BASE_URL}/payruns/${id}`, payRunData);
    return response.data;
  },

  deletePayRun: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/payruns/${id}`);
    return response.data;
  }
};