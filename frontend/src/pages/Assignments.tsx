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

interface Assignment {
  _id: string;
  equipmentType: EquipmentType;
  base: Base;
  quantity: number;
  assignedTo: string;
  notes?: string;
  assignmentDate: string;
  status: 'active' | 'returned';
  returnDate?: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

interface FormData {
  equipmentType: string;
  base: string;
  quantity: string;
  assignedTo: string;
  notes: string;
}

interface Filters {
  baseId: string;
  equipmentTypeId: string;
  startDate: string;
  endDate: string;
  status: string;
}

const Assignments: React.FC = () => {
  const authContext = useContext(AuthContext)!;
  const alertContext = useContext(AlertContext)!;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    equipmentType: '',
    base: '',
    quantity: '',
    assignedTo: '',
    notes: ''
  });
  const [filters, setFilters] = useState<Filters>({
    baseId: '',
    equipmentTypeId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchBases();
    fetchEquipmentTypes();
    // eslint-disable-next-line
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.baseId) queryParams.append('base', filters.baseId);
      if (filters.equipmentTypeId) queryParams.append('equipmentType', filters.equipmentTypeId);
      if (filters.startDate) queryParams.append('assignmentDate[gte]', filters.startDate);
      if (filters.endDate) queryParams.append('assignmentDate[lte]', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);

      const res = await axios.get(`/api/v1/assignments?${queryParams}`);
      setAssignments(res.data.data);
      setLoading(false);
    } catch (err) {
      setAlert('Error fetching assignments', 'danger');
      setLoading(false);
    }
  };

  const fetchBases = async () => {
    try {
      const res = await axios.get('/api/v1/bases');
      setBases(res.data.data);
      
      // Set default base for non-admin users
      if (user && user.role !== 'admin' && user.assignedBase) {
        setFormData({
          ...formData,
          base: user.assignedBase
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
    fetchAssignments();
  };

  const resetFilters = () => {
    setFilters({
      baseId: '',
      equipmentTypeId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setTimeout(() => fetchAssignments(), 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipmentType || !formData.base || !formData.quantity || !formData.assignedTo) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    try {
      await axios.post('/api/v1/assignments', formData);
      setAlert('Assignment created successfully', 'success');
      setFormData({
        equipmentType: '',
        base: user && user.role !== 'admin' && user.assignedBase ? user.assignedBase : '',
        quantity: '',
        assignedTo: '',
        notes: ''
      });
      fetchAssignments();
    } catch (err: any) {
      setAlert(err.response?.data?.error || 'Error creating assignment', 'danger');
    }
  };

  const updateAssignmentStatus = async (id: string, status: 'active' | 'returned') => {
    try {
      await axios.put(`/api/v1/assignments/${id}`, { status });
      setAlert(`Assignment marked as ${status} successfully`, 'success');
      fetchAssignments();
    } catch (err: any) {
      setAlert(err.response?.data?.error || 'Error updating assignment status', 'danger');
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="assignments-page">
      <h1>Assignments & Expenditures</h1>

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
            <label htmlFor="status">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="returned">Returned</option>
              <option value="expended">Expended</option>
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

      <div className="add-assignment-section">
        <h2>Create New Assignment</h2>
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
            <label htmlFor="base">Base *</label>
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
            <label htmlFor="assignedTo">Assigned To *</label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              placeholder="Personnel name or ID"
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
            Create Assignment
          </button>
        </form>
      </div>

      <div className="assignments-list">
        <h2>Assignment History</h2>
        {loading ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment Type</th>
                <th>Base</th>
                <th>Quantity</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Return Date</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{formatDate(assignment.assignmentDate)}</td>
                  <td>{assignment.equipmentType.name}</td>
                  <td>{assignment.base.name}</td>
                  <td>{assignment.quantity}</td>
                  <td>{assignment.assignedTo}</td>
                  <td>{assignment.status === 'active' ? 'Active' : 'Returned'}</td>
                  <td>{assignment.returnDate ? formatDate(assignment.returnDate) : '-'}</td>
                  <td>{assignment.createdBy.name}</td>
                  <td>{assignment.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Assignments;
