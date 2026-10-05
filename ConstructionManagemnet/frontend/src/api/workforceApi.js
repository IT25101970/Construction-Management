import { request } from './client';

export const workforceApi = {
  getAllWorkers: () => {
    return request('/workers').catch(() => {
      return [
        { id: 201, fullName: 'Sunil Shantha', nic: '198234509122', tradeCategory: 'Mason', dailyWageRate: 10500.00, phone: '+94 77 123 4567', assignedSite: 'Lotus Horizon Commercial Complex', status: 'ACTIVE', daysPresentThisMonth: 18, totalEarnedWage: 189000.00 },
        { id: 202, fullName: 'Nimal Bandara', nic: '198754120988', tradeCategory: 'Electrician', dailyWageRate: 13500.00, phone: '+94 71 987 6543', assignedSite: 'Lotus Horizon Commercial Complex', status: 'ACTIVE', daysPresentThisMonth: 20, totalEarnedWage: 270000.00 },
        { id: 203, fullName: 'Kamal Pushpakumara', nic: '199011234887', tradeCategory: 'Plumber', dailyWageRate: 12000.00, phone: '+94 75 444 3322', assignedSite: 'Green Valley Eco Luxury Villas', status: 'ACTIVE', daysPresentThisMonth: 15, totalEarnedWage: 180000.00 },
        { id: 204, fullName: 'Ruwan Dissanayake', nic: '198599887123', tradeCategory: 'Carpenter', dailyWageRate: 11400.00, phone: '+94 78 555 1199', assignedSite: 'Green Valley Eco Luxury Villas', status: 'ACTIVE', daysPresentThisMonth: 22, totalEarnedWage: 250800.00 },
        { id: 205, fullName: 'Anura Wickramasinghe', nic: '199277881234', tradeCategory: 'Site Helper', dailyWageRate: 7500.00, phone: '+94 72 333 8811', assignedSite: 'Southern Highway Overpass & Bridge', status: 'ACTIVE', daysPresentThisMonth: 19, totalEarnedWage: 142500.00 },
      ];
    });
  },
  getAttendanceLogs: () => {
    return request('/workers/attendance').catch(() => {
      return [
        { id: 1, workerId: 201, workerName: 'Sunil Shantha', trade: 'Mason', date: '2026-09-16', siteName: 'Lotus Horizon Commercial Complex', status: 'PRESENT', hoursWorked: 8, calculatedWage: 10500.00 },
        { id: 2, workerId: 202, workerName: 'Nimal Bandara', trade: 'Electrician', date: '2026-09-16', siteName: 'Lotus Horizon Commercial Complex', status: 'PRESENT', hoursWorked: 8, calculatedWage: 13500.00 },
        { id: 3, workerId: 203, workerName: 'Kamal Pushpakumara', trade: 'Plumber', date: '2026-09-16', siteName: 'Green Valley Eco Luxury Villas', status: 'ABSENT', hoursWorked: 0, calculatedWage: 0.00 },
      ];
    });
  },
  createWorker: (worker) => request('/workers', { method: 'POST', body: JSON.stringify(worker) }),
  logAttendance: (log) => request('/workers/attendance', { method: 'POST', body: JSON.stringify(log) }),
  updateWorker: (id, worker) => request(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(worker) }),
  deleteWorker: (id) => request(`/workers/${id}`, { method: 'DELETE' }),
};
