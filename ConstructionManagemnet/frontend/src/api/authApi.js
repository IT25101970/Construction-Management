import { request } from './client';
export const authApi = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  session: () => request('/auth/session'),
  logout: () => request('/auth/logout', { method: 'POST' }),
};
