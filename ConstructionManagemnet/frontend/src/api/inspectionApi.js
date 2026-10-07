import { request } from './client';

export const inspectionApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.stage) query.append('stage', params.stage);
    if (params.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/inspections${queryString}`);
  },

  getById: (id) => request(`/inspections/${id}`),

  create: (data) => request('/inspections', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => request(`/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/inspections/${id}`, {
    method: 'DELETE',
  }),

  getSummaryReport: () => request('/inspections/reports/summary'),
};
