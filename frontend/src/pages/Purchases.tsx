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

interface Purchase {
  _id: string;
  equipmentType: EquipmentType;
  base: Base;
  quantity: number;
  purchaseOrder: string;
  notes?: string;
  purchaseDate: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

interface FormData {
  equipmentType: string;
  base: string;
  quantity: string;
  purchaseOrder: string;
  notes: string;
}

interface Filters {
  baseId: string;
  equipmentTypeId: string;
  startDate: string;
  endDate: string;
}

const Purchases: React.FC = () => {
  const authContext = useContext(AuthContext)!;
  const alertContext = useContext(AlertContext)!;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    equipmentType: '',
    base: '',
    quantity: '',
    purchaseOrder: '',
    notes: ''
  });
  const [filters, setFilters] = useState<Filters>({
    baseId: '',
    equipmentTypeId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPurchases();
    fetchBases();
    fetchEquipmentTypes();
    // eslint-disable-next-line
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.baseId) queryParams.append('base', filters.baseId);
      if (filters.equipmentTypeId) queryParams.append('equipmentType', filters.equipmentTypeId);
      if (filters.startDate) queryParams.append('purchaseDate[gte]', filters.startDate);
      if (filters.endDate) queryParams.append('purchaseDate[lte]', filters.endDate);

      const res = await axios.get(`/api/v1/purchases?${queryParams}`);
      setPurchases(res.data.data);
      setLoading(false);
    } catch (err) {
      setAlert('Error fetching purchases', 'danger');
      setLoading(false);
    }
  };

  const fetchBases = async () => {
    try {
      const res = await axios.get('/api/v1/bases');
      setBases(res.data.data);
      
      // Set default base for non-admin users
      if (user && user.role !== 'admin' && user.assignedBase) {
        setFormData(prev => ({
          ...prev,
          base: user.assignedBase!
        }));
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
    fetchPurchases();
  };

  const resetFilters = () => {
    setFilters({
      baseId: '',
      equipmentTypeId: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(() => fetchPurchases(), 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipmentType || !formData.base || !formData.quantity || !formData.purchaseOrder) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    try {
      await axios.post('/api/v1/purchases', formData);
      setAlert('Purchase added successfully', 'success');
      setFormData({
        equipmentType: '',
        base: user && user.role !== 'admin' && user.assignedBase ? user.assignedBase : '',
        quantity: '',
        purchaseOrder: '',
        notes: ''
      });
      fetchPurchases();
    } catch (err: any) {
      setAlert(err.response?.data?.error || 'Error adding purchase', 'danger');
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="purchases-page">
      <h1>Purchases</h1>

      <div className="filter-section">
        <h2>Filters</h2>
        <form onSubmit={applyFilters}>
          <div className="form-group">
            <label htmlFor="baseId">Base</label>
            <select
              name="baseId"
              value={filters.baseId}
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

      <div className="add-purchase-section">
        <h2>Add New Purchase</h2>
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
            <label htmlFor="base">Base</label>
            <select
              name="base"
              value={formData.base}
              onChange={handleChange}
              disabled={!!(user && user.role !== 'admin')}
              required
            >
              <option value="">Select Base</option>
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
            <label htmlFor="purchaseOrder">Purchase Order # *</label>
            <input
              type="text"
              name="purchaseOrder"
              value={formData.purchaseOrder}
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
            Add Purchase
          </button>
        </form>
      </div>

      <div className="purchases-list">
        <h2>Purchase History</h2>
        {loading ? (
          <p>Loading purchases...</p>
        ) : purchases.length === 0 ? (
          <p>No purchases found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment Type</th>
                <th>Base</th>
                <th>Quantity</th>
                <th>Purchase Order #</th>
                <th>Created By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase._id}>
                  <td>{formatDate(purchase.purchaseDate)}</td>
                  <td>{purchase.equipmentType.name}</td>
                  <td>{purchase.base.name}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.purchaseOrder}</td>
                  <td>{purchase.createdBy.name}</td>
                  <td>{purchase.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Purchases;
