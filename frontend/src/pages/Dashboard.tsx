import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { AlertContext } from '../context/alert/AlertContext';
import api from '../utils/api';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [metrics, setMetrics] = useState({
    totalAssets: 0,
    totalBases: 0,
    totalEquipmentTypes: 0,
    recentPurchases: 0,
    recentTransfers: 0,
    recentAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    baseId: '',
    equipmentTypeId: '',
    startDate: '',
    endDate: ''
  });
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchBases();
    fetchEquipmentTypes();
    // eslint-disable-next-line
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.baseId) queryParams.append('baseId', filters.baseId);
      if (filters.equipmentTypeId) queryParams.append('equipmentTypeId', filters.equipmentTypeId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const res = await api.get(`/assets/dashboard?${queryParams}`);
      setMetrics(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setAlert('Error fetching dashboard metrics', 'danger');
      setLoading(false);
    }
  };

  const fetchBases = async () => {
    try {
      const res = await api.get('/bases');
      setBases(res.data.data);
    } catch (err) {
      console.error('Error fetching bases:', err);
      setAlert('Error fetching bases', 'danger');
    }
  };

  const fetchEquipmentTypes = async () => {
    try {
      const res = await api.get('/equipment-types');
      setEquipmentTypes(res.data.data);
    } catch (err) {
      console.error('Error fetching equipment types:', err);
      setAlert('Error fetching equipment types', 'danger');
    }
  };

  const handleFilterChange = e => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = e => {
    e.preventDefault();
    fetchMetrics();
  };

  const resetFilters = () => {
    setFilters({
      baseId: '',
      equipmentTypeId: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(() => fetchMetrics(), 100);
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome, {user && user.name}!</p>

      <div className="filter-section">
        <h2>Filters</h2>
        <form onSubmit={applyFilters}>
          <div className="form-group">
            <label htmlFor="baseId">Base</label>
            <select
              name="baseId"
              value={filters.baseId}
              onChange={handleFilterChange}
              disabled={user && user.role !== 'admin' && user.assignedBase}
            >
              <option value="">All Bases</option>
              {bases.map(base => (
                <option key={base._id} value={base._id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="equipmentTypeId">Equipment Type</label>
            <select
              name="equipmentTypeId"
              value={filters.equipmentTypeId}
              onChange={handleFilterChange}
            >
              <option value="">All Equipment Types</option>
              {equipmentTypes.map(type => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading metrics...</div>
      ) : (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Assets</h3>
            <div className="metric-value">{metrics.totalAssets}</div>
          </div>

          <div className="metric-card">
            <h3>Total Bases</h3>
            <div className="metric-value">{metrics.totalBases}</div>
          </div>

          <div className="metric-card">
            <h3>Equipment Types</h3>
            <div className="metric-value">{metrics.totalEquipmentTypes}</div>
          </div>

          <div className="metric-card clickable" onClick={() => window.location.href = '/purchases'}>
            <h3>Recent Purchases</h3>
            <div className="metric-value">{metrics.recentPurchases}</div>
          </div>

          <div className="metric-card clickable" onClick={() => window.location.href = '/transfers'}>
            <h3>Recent Transfers</h3>
            <div className="metric-value">{metrics.recentTransfers}</div>
          </div>

          <div className="metric-card clickable" onClick={() => window.location.href = '/assignments'}>
            <h3>Recent Assignments</h3>
            <div className="metric-value">{metrics.recentAssignments}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
