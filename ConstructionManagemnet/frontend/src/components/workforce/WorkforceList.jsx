import React, { useState, useEffect } from 'react';
import { workforceApi } from '../../api/workforceApi';
import {
  UserPlus, Calendar, Edit3,
  FileText
} from 'lucide-react';

export default function WorkforceList() {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const [workerForm, setWorkerForm] = useState({


    fullName: '',
    nic: '',
    tradeCategory: 'Mason',
    dailyWageRate: 35.00,
    phone: '',
    assignedSite: 'Lotus Horizon Commercial Complex',
    status: 'ACTIVE'
  });

  const [attendanceForm, setAttendanceForm] = useState({
    workerId: '',
    date: new Date().toISOString().split('T')[0],
    siteName: 'Lotus Horizon Commercial Complex',
    status: 'PRESENT',
    hoursWorked: 8
  });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    return Promise.all([workforceApi.getAllWorkers(), workforceApi.getAttendanceLogs()])
      .then(([workerData, attData]) => {
        setWorkers(workerData);
        setAttendance(attData);
        setAttendanceForm(current => ({ ...current, workerId: workerData.some(worker => String(worker.id) === String(current.workerId)) ? current.workerId : workerData.find(worker => worker.status === 'ACTIVE')?.id || '' }));
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleSaveWorker = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await workforceApi.updateWorker(editingWorker.id, workerForm);
      } else {
        await workforceApi.createWorker(workerForm);
      }
      loadData();
    } catch (err) {
      alert(err.message || "The request failed. Please try again.");
      return;
    }
    setShowAddModal(false);
    setEditingWorker(null);
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    const worker = workers.find(w => w.id === Number(attendanceForm.workerId));
    if (!worker) return;

    try {
      await workforceApi.logAttendance({
        workerId: worker.id,
        workerName: worker.fullName,
        trade: worker.tradeCategory,
        date: attendanceForm.date,
        siteName: attendanceForm.siteName,
        status: attendanceForm.status,
        hoursWorked: attendanceForm.status === 'PRESENT' ? 8 : attendanceForm.status === 'HALF_DAY' ? 4 : 0
      });
      loadData();
    } catch (err) {
      alert(err.message || "The request failed. Please try again.");
      return;
    }
    setShowAttendanceModal(false);
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Deactivate worker profile to maintain attendance and wage history?')) {
      try {
        const worker = workers.find(w => w.id === id);
        if (worker) {
          await workforceApi.updateWorker(id, { ...worker, status: 'INACTIVE' });
          loadData();
        }
      } catch (err) {
        alert(err.message || "The request failed. Please try again.");
        return;
      }
    }
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          w.nic.toLowerCase().includes(search.toLowerCase()) ||
                          (w.assignedSite || '').toLowerCase().includes(search.toLowerCase());
    const matchesTrade = tradeFilter === 'ALL' || w.tradeCategory === tradeFilter;
    return matchesSearch && matchesTrade;
  });

  const totalMonthlyPayroll = workers.reduce((acc, curr) => acc + (curr.totalEarnedWage || 0), 0);

  if (loading) return <div className="content-area" role="status">Loading records...</div>;

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div className="gsi-section-header" style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 18 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2rem', margin: 0 }}>
            Labour & Workforce <span>Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
            Worker trade registry, daily site attendance tracking, and automated wage ledger calculation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowAttendanceModal(true)}>
            <Calendar size={16} /> Log Daily Attendance
          </button>
          <button className="btn btn-secondary" onClick={() => setShowReportModal(true)}>
            <FileText size={16} /> Payroll Summary Report
          </button>
          <button className="btn-gsi-gold" onClick={() => { setEditingWorker(null); setWorkerForm({ fullName: '', nic: '', tradeCategory: 'Mason', dailyWageRate: 35.00, phone: '', assignedSite: 'Lotus Horizon Commercial Complex', status: 'ACTIVE' }); setShowAddModal(true); }}>
            <UserPlus size={16} /> Register Worker
          </button>
        </div>
      </div>

      {/* Payroll KPI Header Box */}
      <div style={{ padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Automated Wage Payable Summary
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
            Rs. {totalMonthlyPayroll.toLocaleString('en-US', { minimumFractionDigits: 2 })} LKR
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Calculated as (Days Present × Daily Wage Rate)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
            {workers.filter(w => w.status === 'ACTIVE').length} Active Workers
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Registered Across All Active Sites</div>
        </div>
      </div>

      {/* Worker Directory Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search worker by name, NIC, site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select-input" value={tradeFilter} onChange={(e) => setTradeFilter(e.target.value)}>
              <option value="ALL">All Trade Skills</option>
              <option value="Mason">Mason</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Site Helper">Site Helper</option>
            </select>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredWorkers.length} registered workers
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Worker Name & NIC</th>
                <th>Trade Skill</th>
                <th>Assigned Project Site</th>
                <th>Daily Wage Rate</th>
                <th>Days Present</th>
                <th>Total Earned Wage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((w) => (
                <tr key={w.id}>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{w.fullName}</strong>
                    <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NIC: {w.nic} &bull; {w.phone}</span>
                  </td>
                  <td><span className="badge badge-ongoing">{w.tradeCategory}</span></td>
                  <td>{w.assignedSite}</td>
                  <td style={{ fontWeight: 700 }}>Rs. {Number(w.dailyWageRate).toLocaleString()}/day</td>
                  <td style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>{w.daysPresentThisMonth} days</td>
                  <td style={{ fontWeight: 800, color: 'var(--success)' }}>
                    Rs. {Number(w.totalEarnedWage || 0).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-${w.status === 'ACTIVE' ? 'passed' : 'failed'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingWorker(w); setWorkerForm(w); setShowAddModal(true); }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(w.id)}>
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="table-card" style={{ marginTop: 32 }}>
        <div className="table-toolbar">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Daily Attendance Logs & Wage Claims</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Worker Name & Trade</th>
                <th>Target Site</th>
                <th>Attendance Status</th>
                <th>Hours Worked</th>
                <th>Daily Wage Claim</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.date}</td>
                  <td><strong style={{ color: '#ffffff' }}>{a.workerName}</strong> ({a.trade})</td>
                  <td>{a.siteName}</td>
                  <td>
                    <span className={`badge badge-${a.status === 'PRESENT' ? 'passed' : 'failed'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.hoursWorked} hrs</td>
                  <td style={{ fontWeight: 800, color: a.status === 'PRESENT' ? 'var(--success)' : 'var(--text-muted)' }}>
                    Rs. {Number(a.calculatedWage).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Register/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingWorker ? 'Edit Worker Profile' : 'Register New Construction Worker'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveWorker}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={workerForm.fullName}
                      onChange={(e) => setWorkerForm({ ...workerForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIC / Identity No *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={workerForm.nic}
                      onChange={(e) => setWorkerForm({ ...workerForm, nic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Trade Skill Category *</label>
                    <select
                      className="form-select"
                      value={workerForm.tradeCategory}
                      onChange={(e) => setWorkerForm({ ...workerForm, tradeCategory: e.target.value })}
                    >
                      <option value="Mason">Mason</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Site Helper">Site Helper</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Daily Wage Rate (LKR/day) *</label>
                    <input
                      type="number"
                      step="0.50"
                      className="form-input"
                      required
                      value={workerForm.dailyWageRate}
                      onChange={(e) => setWorkerForm({ ...workerForm, dailyWageRate: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={workerForm.phone}
                      onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Project Site *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={workerForm.assignedSite}
                      onChange={(e) => setWorkerForm({ ...workerForm, assignedSite: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  {editingWorker ? 'Update Profile' : 'Save Worker Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Logging Modal */}
      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Log Daily Worker Site Attendance</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAttendanceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLogAttendance}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Worker *</label>
                  <select
                    className="form-select"
                    value={attendanceForm.workerId}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, workerId: Number(e.target.value) })}
                  >
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.fullName} ({w.tradeCategory}) - Rs. {Number(w.dailyWageRate).toLocaleString()}/day</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Attendance Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-select"
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    >
                      <option value="PRESENT">Present (Full Day Wage)</option>
                      <option value="ABSENT">Absent (No Wage)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Site Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={attendanceForm.siteName}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, siteName: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAttendanceModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  Record Attendance Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Monthly Labour Attendance & Wage Summary Report</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: 8 }}>Executive Payroll Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>{workers.length}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registered Workers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)' }}>
                      Rs. {totalMonthlyPayroll.toLocaleString('en-US', { minimumFractionDigits: 2 })} LKR
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Wage Payable</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button className="btn-gsi-gold" style={{ padding: '8px 20px', borderRadius: 4, fontSize: '0.8rem' }} onClick={() => window.print()}>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
