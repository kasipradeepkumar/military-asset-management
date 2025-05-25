import React, { useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { AlertContext } from '../context/alert/AlertContext';
import axios from 'axios';

interface Base {
  _id: string;
  name: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  password2: string;
  role: 'admin' | 'base_commander' | 'logistics_officer';
  assignedBase: string;
}

const Register = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  if (!authContext || !alertContext) {
    return <div>Loading...</div>;
  }

  const { register, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  const [bases, setBases] = useState<Base[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'logistics_officer',
    assignedBase: ''
  });

  useEffect(() => {
    fetchBases();
    
    if (error) {
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error]);

  const fetchBases = async () => {
    try {
      const res = await axios.get('/api/v1/bases');
      setBases(res.data.data);
    } catch (err) {
      setAlert('Error fetching bases', 'danger');
    }
  };

  const { name, email, password, password2, role, assignedBase } = formData;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger');
    } else if ((role === 'base_commander' || role === 'logistics_officer') && !assignedBase) {
      setAlert('Base commanders and logistics officers must have an assigned base', 'danger');
    } else {
      register({
        name,
        email,
        password,
        role,
        assignedBase: role === 'admin' ? null : assignedBase
      });
    }
  };

  return (
    <div className="register-page">
      <div className="form-container">
        <h1>
          <span className="text-primary">Register</span> Account
        </h1>
        <p className="lead">
          <i className="fas fa-user-plus"></i> Create a new user account
        </p>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={password2}
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="base_commander">Base Commander</option>
              <option value="logistics_officer">Logistics Officer</option>
            </select>
          </div>
          {(role === 'base_commander' || role === 'logistics_officer') && (
            <div className="form-group">
              <label htmlFor="assignedBase">Assigned Base</label>
              <select
                name="assignedBase"
                value={assignedBase}
                onChange={onChange}
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
          )}
          <input
            type="submit"
            value="Register"
            className="btn btn-primary btn-block"
          />
        </form>
      </div>
    </div>
  );
};

export default Register;
