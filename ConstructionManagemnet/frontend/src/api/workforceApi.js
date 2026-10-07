import { request } from './client';

export const workforceApi = {
  getAllWorkers: () => {
    return request('/workers');
  },
  getAttendanceLogs: () => {
    return request('/workers/attendance');
  },
  createWorker: (worker) => request('/workers', { method: 'POST', body: JSON.stringify(worker) }),
  logAttendance: (log) => request('/workers/attendance', { method: 'POST', body: JSON.stringify(log) }),
  updateWorker: (id, worker) => request(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(worker) }),
  deleteWorker: (id) => request(`/workers/${id}`, { method: 'DELETE' }),
};
