import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { AlertContext } from '../context/alert/AlertContext';
import api from '../utils/api';

const Login = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { login, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      setAlert(error, 'danger');
      clearErrors();
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [error]);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    if (email === '' || password === '') {
      setAlert('Please fill in all fields', 'danger');
      setLoading(false);
    } else {
      try {
        await login({
          email,
          password
        });
      } catch (err) {
        console.error('Login error:', err);
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="form-container">
        <h1>
          <span className="text-primary">Login</span>
        </h1>
        <p className="lead">
          <i className="fas fa-user"></i> Sign in to your account
        </p>
        <form onSubmit={onSubmit}>
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
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
