import { request } from './client';

export const userApi = {
  getAllUsers: () => {
    return request('/users').catch(() => {
      return [
        { id: 1, username: 'admin_sys', fullName: 'System Administrator', email: 'admin@buildtrack.aero', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-09-16 23:45', createdAt: '2026-01-10' },
        { id: 2, username: 'pm_kamal', fullName: 'Eng. Kamal Jayasuriya', email: 'kamal.p@buildtrack.aero', role: 'PM', status: 'ACTIVE', lastLogin: '2026-09-16 22:10', createdAt: '2026-02-15' },
        { id: 3, username: 'sup_perera', fullName: 'K. Perera (Site Supervisor)', email: 'perera.k@buildtrack.aero', role: 'SUPERVISOR', status: 'ACTIVE', lastLogin: '2026-09-16 19:30', createdAt: '2026-03-01' },
        { id: 4, username: 'client_road_auth', fullName: 'Road Development Authority', email: 'rda.client@gov.lk', role: 'CLIENT', status: 'ACTIVE', lastLogin: '2026-09-15 14:20', createdAt: '2026-04-12' },
        { id: 5, username: 'pm_sarath', fullName: 'Eng. Sarath Fonseka', email: 'sarath.f@buildtrack.aero', role: 'PM', status: 'INACTIVE', lastLogin: '2026-07-20 11:00', createdAt: '2026-01-12' },
      ];
    });
  },
  createUser: (user) => request('/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id, user) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
  toggleStatus: (id) => request(`/users/${id}/toggle-status`, { method: 'POST' }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
