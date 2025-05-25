import React, { useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { AlertContext } from '../context/alert/AlertContext';
import axios from 'axios';

interface EquipmentType {
  _id: string;
  name: string;
  category: 'weapon' | 'vehicle' | 'ammunition' | 'other';
  description?: string;
}

interface FormData {
  name: string;
  category: 'weapon' | 'vehicle' | 'ammunition' | 'other';
  description: string;
}

const EquipmentTypes = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  if (!authContext || !alertContext) {
    return <div>Loading...</div>;
  }

  const { user } = authContext;
  const { setAlert } = alertContext;

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'weapon',
    description: ''
  });
  const [currentEquipmentType, setCurrentEquipmentType] = useState<EquipmentType | null>(null);

  useEffect(() => {
    fetchEquipmentTypes();
    // eslint-disable-next-line
  }, []);

  const fetchEquipmentTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/equipment-types');
      setEquipmentTypes(res.data.data);
      setLoading(false);
    } catch (err) {
      setAlert('Error fetching equipment types', 'danger');
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    try {
      if (currentEquipmentType) {
        // Update existing equipment type
        await axios.put(`/api/v1/equipment-types/${currentEquipmentType._id}`, formData);
        setAlert('Equipment type updated successfully', 'success');
      } else {
        // Create new equipment type
        await axios.post('/api/v1/equipment-types', formData);
        setAlert('Equipment type added successfully', 'success');
      }
      
      setFormData({
        name: '',
        category: 'weapon',
        description: ''
      });
      setCurrentEquipmentType(null);
      fetchEquipmentTypes();
    } catch (err: any) {
      setAlert(err.response.data.error || 'Error with equipment type operation', 'danger');
    }
  };

  const handleEdit = (equipmentType: EquipmentType) => {
    setCurrentEquipmentType(equipmentType);
    setFormData({
      name: equipmentType.name,
      category: equipmentType.category,
      description: equipmentType.description || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment type?')) {
      try {
        await axios.delete(`/api/v1/equipment-types/${id}`);
        setAlert('Equipment type deleted successfully', 'success');
        fetchEquipmentTypes();
      } catch (err: any) {
        setAlert(err.response.data.error || 'Error deleting equipment type', 'danger');
      }
    }
  };

  const cancelEdit = () => {
    setCurrentEquipmentType(null);
    setFormData({
      name: '',
      category: 'weapon',
      description: ''
    });
  };

  return (
    <div className="equipment-types-page">
      <h1>Equipment Types Management</h1>
      <p>Add, edit, and manage equipment types</p>

      <div className="equipment-type-form-section">
        <h2>{currentEquipmentType ? 'Edit Equipment Type' : 'Add New Equipment Type'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="weapon">Weapon</option>
              <option value="vehicle">Vehicle</option>
              <option value="ammunition">Ammunition</option>
              <option value="other">Other</option>
            </select>
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
              {currentEquipmentType ? 'Update Equipment Type' : 'Add Equipment Type'}
            </button>
            {currentEquipmentType && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="equipment-types-list">
        <h2>Existing Equipment Types</h2>
        {loading ? (
          <p>Loading equipment types...</p>
        ) : equipmentTypes.length === 0 ? (
          <p>No equipment types found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentTypes.map(equipmentType => (
                <tr key={equipmentType._id}>
                  <td>{equipmentType.name}</td>
                  <td>{equipmentType.category}</td>
                  <td>{equipmentType.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleEdit(equipmentType)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(equipmentType._id)}
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

export default EquipmentTypes;
