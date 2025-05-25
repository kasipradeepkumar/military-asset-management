import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth/AuthContext';

const AdminRoute = ({ component: Component }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, user } = authContext;

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user && user.role !== 'admin') return <Navigate to="/" />;
  
  return <Component />;
};

export default AdminRoute;
