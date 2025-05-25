import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { AlertContext } from '../context/alert/AlertContext';
import axios from 'axios';

interface Base {
  _id: string;
  name: string;
  location: string;
  description?: string;
}

interface FormData {
  name: string;
  location: string;
  description: string;
}

const Bases: React.FC = () => {
  const authContext = useContext(AuthContext)!;
  const alertContext = useContext(AlertContext)!;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [bases, setBases] = useState<Base[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    description: ''
  });
  const [currentBase, setCurrentBase] = useState<Base | null>(null);

  useEffect(() => {
    fetchBases();
    // eslint-disable-next-line
  }, []);

  const fetchBases = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/bases');
      setBases(res.data.data);
      setLoading(false);
    } catch (err) {
      setAlert('Error fetching bases', 'danger');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    try {
      if (currentBase) {
        // Update existing base
        await axios.put(`/api/v1/bases/${currentBase._id}`, formData);
        setAlert('Base updated successfully', 'success');
      } else {
        // Create new base
        await axios.post('/api/v1/bases', formData);
        setAlert('Base added successfully', 'success');
      }
      
      setFormData({
        name: '',
        location: '',
        description: ''
      });
      setCurrentBase(null);
      fetchBases();
    } catch (err: any) {
      setAlert(err.response?.data?.error || 'Error with base operation', 'danger');
    }
  };

  const handleEdit = (base: Base) => {
    setCurrentBase(base);
    setFormData({
      name: base.name,
      location: base.location,
      description: base.description || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this base?')) {
      try {
        await axios.delete(`/api/v1/bases/${id}`);
        setAlert('Base deleted successfully', 'success');
        fetchBases();
      } catch (err: any) {
        setAlert(err.response?.data?.error || 'Error deleting base', 'danger');
      }
    }
  };

  const cancelEdit = () => {
    setCurrentBase(null);
    setFormData({
      name: '',
      location: '',
      description: ''
    });
  };

  return (
    <div className="bases-page">
      <h1>Bases Management</h1>
      <p>Add, edit, and manage military bases</p>

      <div className="base-form-section">
        <h2>{currentBase ? 'Edit Base' : 'Add New Base'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Base Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {currentBase ? 'Update Base' : 'Add Base'}
            </button>
            {currentBase && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bases-list">
        <h2>Existing Bases</h2>
        {loading ? (
          <p>Loading bases...</p>
        ) : bases.length === 0 ? (
          <p>No bases found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bases.map(base => (
                <tr key={base._id}>
                  <td>{base.name}</td>
                  <td>{base.location}</td>
                  <td>{base.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleEdit(base)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(base._id)}
                    >
                      Delete
                    </button>
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

export default Bases;
