import { request } from './client';

export const inventoryApi = {
  getAllMaterials: () => {
    return request('/materials').catch(() => {
      return [
        { id: 101, name: 'Ordinary Portland Cement (50kg)', category: 'Cement', unit: 'Bags', currentStock: 120, reorderLevel: 250, unitPrice: 3750.00, supplier: 'Tokyo Cement Lanka PLC', isLowStock: true, location: 'Lotus Horizon Site Yard' },
        { id: 102, name: 'TMT Steel Rebar (16mm Fe500)', category: 'Steel', unit: 'Tons', currentStock: 48, reorderLevel: 20, unitPrice: 285000.00, supplier: 'Ceylon Steel Corporation', isLowStock: false, location: 'Lotus Horizon Site Yard' },
        { id: 103, name: 'Washed River Sand (Grade A)', category: 'Aggregate', unit: 'Cubic Meters', currentStock: 15, reorderLevel: 40, unitPrice: 11400.00, supplier: 'Kelani Mining Services', isLowStock: true, location: 'Green Valley Villa Site' },
        { id: 104, name: 'Clay Bricks (Standard 9x4x3)', category: 'Bricks', unit: 'Units', currentStock: 8500, reorderLevel: 3000, unitPrice: 135.00, supplier: 'Dankotuwa Brick Industries', isLowStock: false, location: 'Green Valley Villa Site' },
        { id: 105, name: 'Prestressed Concrete Girders', category: 'Precast', unit: 'Units', currentStock: 8, reorderLevel: 10, unitPrice: 1260000.00, supplier: 'State Development & Construction', isLowStock: true, location: 'Southern Highway Overpass Site' },
      ];
    });
  },
  getIssueLogs: () => {
    return request('/materials/logs').catch(() => {
      return [
        { id: 1, materialId: 101, materialName: 'Ordinary Portland Cement (50kg)', quantity: 80, transactionType: 'STOCK_OUT', siteName: 'Lotus Horizon Commercial Complex', issuedTo: 'Block A Concreting Crew', date: '2026-09-15', remarks: 'Cast-in-situ slab pouring L3' },
        { id: 2, materialId: 102, materialName: 'TMT Steel Rebar (16mm Fe500)', quantity: 15, transactionType: 'STOCK_IN', siteName: 'Lotus Horizon Commercial Complex', issuedTo: 'Main Yard Receiver', date: '2026-09-14', remarks: 'Batch delivery invoice #CS-8891' },
        { id: 3, materialId: 103, materialName: 'Washed River Sand (Grade A)', quantity: 25, transactionType: 'STOCK_OUT', siteName: 'Green Valley Eco Luxury Villas', issuedTo: 'Plastering Team 02', date: '2026-09-12', remarks: 'Internal wall plastering Villa 02' },
      ];
    });
  },
  createMaterial: (item) => request('/materials', { method: 'POST', body: JSON.stringify(item) }),
  updateMaterial: (id, item) => request(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  updateStock: (id, stockAdjustment) => request(`/materials/${id}/adjust`, { method: 'POST', body: JSON.stringify(stockAdjustment) }),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
};
