import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { AlertContext } from '../context/alert/AlertContext';
import axios from 'axios';

interface Base {
  _id: string;
  name: string;
}

interface EquipmentType {
  _id: string;
  name: string;
}

interface Transfer {
  _id: string;
  equipmentType: EquipmentType;
  fromBase: Base;
  toBase: Base;
  quantity: number;
  transferOrder: string;
  notes?: string;
  transferDate: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    name: string;
  };
}

interface FormData {
  equipmentType: string;
  fromBase: string;
  toBase: string;
  quantity: string;
  transferOrder: string;
  notes: string;
}

interface Filters {
  fromBaseId: string;
  toBaseId: string;
  equipmentTypeId: string;
  startDate: string;
  endDate: string;
  status: string;
}

const Transfers: React.FC = () => {
  const authContext = useContext(AuthContext)!;
  const alertContext = useContext(AlertContext)!;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    equipmentType: '',
    fromBase: '',
    toBase: '',
    quantity: '',
    transferOrder: '',
    notes: ''
  });
  const [filters, setFilters] = useState<Filters>({
    fromBaseId: '',
    toBaseId: '',
    equipmentTypeId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchTransfers();
    fetchBases();
    fetchEquipmentTypes();
    // eslint-disable-next-line
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.fromBaseId) {
        // For transfers, we need to check both fromBase and toBase
        // This is handled on the backend with an OR query
      }
      if (filters.equipmentTypeId) queryParams.append('equipmentType', filters.equipmentTypeId);
      if (filters.startDate) queryParams.append('transferDate[gte]', filters.startDate);
      if (filters.endDate) queryParams.append('transferDate[lte]', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);

      const res = await axios.get(`/api/v1/transfers?${queryParams}`);
      setTransfers(res.data.data);
      setLoading(false);
    } catch (err) {
      setAlert('Error fetching transfers', 'danger');
      setLoading(false);
    }
  };

  const fetchBases = async () => {
    try {
      const res = await axios.get('/api/v1/bases');
      setBases(res.data.data);
      
      // Set default fromBase for non-admin users
      if (user && user.role !== 'admin' && user.assignedBase) {
        setFormData({
          ...formData,
          fromBase: user.assignedBase
        });
      }
    } catch (err) {
      setAlert('Error fetching bases', 'danger');
    }
  };

  const fetchEquipmentTypes = async () => {
    try {
      const res = await axios.get('/api/v1/equipment-types');
      setEquipmentTypes(res.data.data);
    } catch (err) {
      setAlert('Error fetching equipment types', 'danger');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransfers();
  };

  const resetFilters = () => {
    setFilters({
      fromBaseId: '',
      toBaseId: '',
      equipmentTypeId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setTimeout(() => fetchTransfers(), 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipmentType || !formData.fromBase || !formData.toBase || !formData.quantity || !formData.transferOrder) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    if (formData.fromBase === formData.toBase) {
      setAlert('Source and destination bases cannot be the same', 'danger');
      return;
    }

    try {
      await axios.post('/api/v1/transfers', formData);
      setAlert('Transfer initiated successfully', 'success');
      setFormData({
        equipmentType: '',
        fromBase: user && user.role !== 'admin' && user.assignedBase ? user.assignedBase : '',
        toBase: '',
        quantity: '',
        transferOrder: '',
        notes: ''
      });
      fetchTransfers();
    } catch (err: any) {
      setAlert(err.response?.data?.error || 'Error creating transfer', 'danger');
    }
  };

  const updateTransferStatus = async (id: string, status: 'pending' | 'in_transit' | 'completed' | 'cancelled') => {
    try {
      await axios.put(`/api/v1/transfers/${id}`, { status });
      setAlert(`Transfer ${status} successfully`, 'success');
      fetchTransfers();
    } catch (err: any) {
      setAlert(err.response?.data?.error || 'Error updating transfer status', 'danger');
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="transfers-page">
      <h1>Transfers</h1>

      <div className="filter-section">
        <h2>Filters</h2>
        <form onSubmit={applyFilters}>
          <div className="form-group">
            <label htmlFor="fromBaseId">Base</label>
            <select
              name="fromBaseId"
              value={filters.fromBaseId}
              onChange={handleFilterChange}
              disabled={!!(user && user.role !== 'admin')}
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
            <label htmlFor="status">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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

      <div className="add-transfer-section">
        <h2>Initiate New Transfer</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="equipmentType">Equipment Type *</label>
            <select
              name="equipmentType"
              value={formData.equipmentType}
              onChange={handleChange}
              required
            >
              <option value="">Select Equipment Type</option>
              {equipmentTypes.map(type => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fromBase">From Base</label>
            <select
              name="fromBase"
              value={formData.fromBase}
              onChange={handleChange}
              disabled={!!(user && user.role !== 'admin')}
              required
            >
              <option value="">Select From Base</option>
              {bases.map(base => (
                <option key={base._id} value={base._id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="toBase">To Base *</label>
            <select
              name="toBase"
              value={formData.toBase}
              onChange={handleChange}
              required
            >
              <option value="">Select Destination Base</option>
              {bases.map(base => (
                <option key={base._id} value={base._id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="transferOrder">Transfer Order # *</label>
            <input
              type="text"
              name="transferOrder"
              value={formData.transferOrder}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Initiate Transfer
          </button>
        </form>
      </div>

      <div className="transfers-list">
        <h2>Transfer History</h2>
        {loading ? (
          <p>Loading transfers...</p>
        ) : transfers.length === 0 ? (
          <p>No transfers found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment Type</th>
                <th>From Base</th>
                <th>To Base</th>
                <th>Quantity</th>
                <th>Transfer Order #</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer._id}>
                  <td>{formatDate(transfer.transferDate)}</td>
                  <td>{transfer.equipmentType.name}</td>
                  <td>{transfer.fromBase.name}</td>
                  <td>{transfer.toBase.name}</td>
                  <td>{transfer.quantity}</td>
                  <td>{transfer.transferOrder}</td>
                  <td>
                    <span className={`status-badge status-${transfer.status}`}>
                      {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                    </span>
                  </td>
                  <td>{transfer.createdBy.name}</td>
                  <td>
                    {transfer.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => updateTransferStatus(transfer._id, 'in_transit')}
                        >
                          Mark In Transit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateTransferStatus(transfer._id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {transfer.status === 'in_transit' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => updateTransferStatus(transfer._id, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transfers;
