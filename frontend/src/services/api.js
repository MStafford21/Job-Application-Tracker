import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const jobApplicationsApi = {
  getAll: (params) => api.get('/jobapplications', { params }),
  getById: (id) => api.get(`/jobapplications/${id}`),
  create: (data) => api.post('/jobapplications', data),
  update: (id, data) => api.put(`/jobapplications/${id}`, data),
  delete: (id) => api.delete(`/jobapplications/${id}`),
  getStats: () => api.get('/jobapplications/stats'),
  getStatuses: () => api.get('/jobapplications/statuses'),
  addEvent: (id, data) => api.post(`/jobapplications/${id}/events`, data),
};

export default api;
