import { request } from './client';

export const projectApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.client) query.append('client', params.client);
    if (params.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/projects${queryString}`);
  },

  getById: (id) => request(`/projects/${id}`),

  create: (projectData) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  update: (id, projectData) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  delete: (id) => request(`/projects/${id}`, {
    method: 'DELETE',
  }),

  archive: (id) => request(`/projects/${id}/archive`, {
    method: 'PATCH',
  }),

  addMilestone: (projectId, milestoneData) => request(`/projects/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(milestoneData),
  }),

  updateMilestone: (milestoneId, milestoneData) => request(`/projects/milestones/${milestoneId}`, {
    method: 'PUT',
    body: JSON.stringify(milestoneData),
  }),

  deleteMilestone: (milestoneId) => request(`/projects/milestones/${milestoneId}`, {
    method: 'DELETE',
  }),

  getSummaryReport: () => request('/projects/reports/summary'),
};
