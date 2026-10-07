import { request } from './client';

export const inventoryApi = {
  getAllMaterials: () => {
    return request('/materials');
  },
  getIssueLogs: () => {
    return request('/materials/logs');
  },
  createMaterial: (item) => request('/materials', { method: 'POST', body: JSON.stringify(item) }),
  updateMaterial: (id, item) => request(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  updateStock: (id, stockAdjustment) => request(`/materials/${id}/adjust`, { method: 'POST', body: JSON.stringify(stockAdjustment) }),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
};
