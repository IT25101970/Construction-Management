import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import {
  Plus, AlertTriangle, FileText, Edit3, Trash2
} from 'lucide-react';

export default function InventoryList() {
  const [materials, setMaterials] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: 'Cement',
    unit: 'Bags',
    currentStock: 100,
    reorderLevel: 50,
    unitPrice: 15.00,
    supplier: '',
    location: 'Lotus Horizon Site Yard'
  });

  const [adjustForm, setAdjustForm] = useState({
    quantity: 10,
    transactionType: 'STOCK_OUT',
    siteName: 'Lotus Horizon Commercial Complex',
    issuedTo: '',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    return Promise.all([inventoryApi.getAllMaterials(), inventoryApi.getIssueLogs()])
      .then(([matData, logData]) => {
        setMaterials(matData);
        setLogs(logData);
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  const lowStockItems = materials.filter(m => m.currentStock <= m.reorderLevel);

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      if (selectedMaterial) {
        await inventoryApi.updateMaterial(selectedMaterial.id, materialForm);
      } else {
        await inventoryApi.createMaterial(materialForm);
      }
      loadData();
    } catch (err) {
      alert(err.message || "The request failed. Please try again.");
      return;
    }
    setShowAddModal(false);
    setSelectedMaterial(null);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    try {
      await inventoryApi.updateStock(selectedMaterial.id, adjustForm);
      loadData();
    } catch (err) {
      alert(err.message || "The request failed. Please try again.");
      return;
    }
    setShowAdjustModal(false);
    setSelectedMaterial(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Retire and delete this material from inventory catalog?')) {
      try {
        await inventoryApi.deleteMaterial(id);
        loadData();
      } catch (err) {
        alert(err.message || "The request failed. Please try again.");
        return;
      }
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="content-area" role="status">Loading records...</div>;

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div className="gsi-section-header" style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 18 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2rem', margin: 0 }}>
            Material & Inventory <span>Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
            Material catalogs, stock-in purchases, site issue logs, and automated low-stock warnings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowReportModal(true)}>
            <FileText size={16} /> Inventory Usage Report
          </button>
          <button className="btn-gsi-gold" onClick={() => { setSelectedMaterial(null); setMaterialForm({ name: '', category: 'Cement', unit: 'Bags', currentStock: 100, reorderLevel: 50, unitPrice: 15.00, supplier: '', location: 'Lotus Horizon Site Yard' }); setShowAddModal(true); }}>
            <Plus size={16} /> Register Material
          </button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 'var(--radius)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <AlertTriangle size={24} color="var(--warning)" />
          <div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.92rem' }}>
              Automated Threshold Warning: {lowStockItems.length} Materials Below Reorder Level!
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Re-order alerts triggered for: {lowStockItems.map(m => `${m.name} (${m.currentStock} ${m.unit} left)`).join(', ')}.
            </div>
          </div>
        </div>
      )}

      {/* Material Directory */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search material, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="Cement">Cement</option>
              <option value="Steel">Steel Rebar</option>
              <option value="Aggregate">Aggregate & Sand</option>
              <option value="Bricks">Bricks & Masonry</option>
              <option value="Precast">Precast Concrete</option>
            </select>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredMaterials.length} material listings
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Material Name & Location</th>
                <th>Category</th>
                <th>Current Stock Level</th>
                <th>Reorder Level</th>
                <th>Unit Price (LKR)</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((m) => (
                <tr key={m.id} style={{ background: m.isLowStock ? 'rgba(245, 158, 11, 0.05)' : undefined }}>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{m.name}</strong>
                    <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier: {m.supplier} &bull; {m.location}</span>
                  </td>
                  <td><span className="badge badge-ongoing">{m.category}</span></td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: m.isLowStock ? 'var(--warning)' : '#ffffff' }}>
                      {m.currentStock} {m.unit}
                    </strong>
                  </td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{m.reorderLevel} {m.unit}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>Rs. {Number(m.unitPrice).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${m.isLowStock ? 'pending' : 'passed'}`}>
                      {m.isLowStock ? 'Low Stock Alert' : 'Optimal'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => { setSelectedMaterial(m); setShowAdjustModal(true); }}
                      >
                        Adjust Stock
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSelectedMaterial(m); setMaterialForm(m); setShowAddModal(true); }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Log History Table */}
      <div className="table-card" style={{ marginTop: 32 }}>
        <div className="table-toolbar">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Stock Movement & Site Issuance Log History</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Material</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Target Site & Issued To</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.date}</td>
                  <td><strong style={{ color: '#ffffff' }}>{l.materialName}</strong></td>
                  <td>
                    <span className={`badge badge-${l.transactionType === 'STOCK_IN' ? 'passed' : 'ongoing'}`}>
                      {l.transactionType === 'STOCK_IN' ? 'Stock-In Purchase' : 'Stock-Out Issued'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: l.transactionType === 'STOCK_IN' ? 'var(--success)' : 'var(--gold-primary)' }}>
                    {l.transactionType === 'STOCK_IN' ? '+' : '-'}{l.quantity}
                  </td>
                  <td>
                    {l.siteName}
                    <br/>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Issued To: {l.issuedTo}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{selectedMaterial ? 'Edit Material Listing' : 'Register New Construction Material'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveMaterial}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Material Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={materialForm.category}
                      onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    >
                      <option value="Cement">Cement</option>
                      <option value="Steel">Steel Rebar</option>
                      <option value="Aggregate">Aggregate & Sand</option>
                      <option value="Bricks">Bricks & Masonry</option>
                      <option value="Precast">Precast Concrete</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measure *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={materialForm.unit}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Initial Stock Qty *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      disabled={Boolean(selectedMaterial)} value={materialForm.currentStock}
                      onChange={(e) => setMaterialForm({ ...materialForm, currentStock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reorder Alert Level *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      value={materialForm.reorderLevel}
                      onChange={(e) => setMaterialForm({ ...materialForm, reorderLevel: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit Price (LKR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      required
                      value={materialForm.unitPrice}
                      onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={materialForm.supplier}
                      onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  {selectedMaterial ? 'Update Listing' : 'Register Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedMaterial && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Adjust Stock Level: {selectedMaterial.name}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdjustModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdjustStock}>
              <div className="modal-body">
                <div style={{ padding: 12, background: 'var(--bg-main)', borderRadius: 6, marginBottom: 12 }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Current Stock: <strong style={{ color: '#ffffff' }}>{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Transaction Type *</label>
                    <select
                      className="form-select"
                      value={adjustForm.transactionType}
                      onChange={(e) => setAdjustForm({ ...adjustForm, transactionType: e.target.value })}
                    >
                      <option value="STOCK_OUT">Stock-Out (Issue to Site)</option>
                      <option value="STOCK_IN">Stock-In (New Purchase)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity ({selectedMaterial.unit}) *</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1"
                      value={adjustForm.quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target Site Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={adjustForm.siteName}
                      onChange={(e) => setAdjustForm({ ...adjustForm, siteName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issued To / Receiver *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={adjustForm.issuedTo}
                      onChange={(e) => setAdjustForm({ ...adjustForm, issuedTo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Purpose</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adjustForm.remarks}
                    onChange={(e) => setAdjustForm({ ...adjustForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  Log Stock Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Material Stock Level & Usage Summary Report</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: 8 }}>Executive Inventory Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>{materials.length}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Materials</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--warning)' }}>
                      {lowStockItems.length}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Low-Stock Alerts</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)' }}>
                      {logs.length}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Site Issuances</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button className="btn-gsi-gold" style={{ padding: '8px 20px', borderRadius: 4, fontSize: '0.8rem' }} onClick={() => alert('PDF Material Stock Report generated!')}>
                Export PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
