import { request } from './client';

export const userApi = {
  getAllUsers: () => {
    return request('/users');
  },
  createUser: (user) => request('/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id, user) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
  toggleStatus: (id) => request(`/users/${id}/toggle-status`, { method: 'POST' }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
