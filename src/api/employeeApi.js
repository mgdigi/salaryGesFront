import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const employeeApi = {
  getAllEmployees: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/employees`, { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await axios.post(`${API_BASE_URL}/employees`, employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await axios.put(`${API_BASE_URL}/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/employees/${id}`);
    return response.data;
  },

  getEmployeeStats: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/employees/${id}/stats`);
    return response.data;
  },

  filterEmployees: async (filters) => {
    const response = await axios.get(`${API_BASE_URL}/employees/filter/search`, { params: filters });
    return response.data;
  },

  getEmployeesByCompany: async (companyId) => {
    const response = await axios.get(`${API_BASE_URL}/employees/company/${companyId}`);
    return response.data;
  }
};