import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const paymentApi = {
  getAllPayments: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/payments`, { params });
    return response.data;
  },

  getPaymentById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/payments/${id}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await axios.post(`${API_BASE_URL}/payments`, paymentData);
    return response.data;
  },

  updatePayment: async (id, paymentData) => {
    const response = await axios.put(`${API_BASE_URL}/payments/${id}`, paymentData);
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/payments/${id}`);
    return response.data;
  },

  getPaymentStats: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/payments/stats`, { params });
    return response.data;
  }
};