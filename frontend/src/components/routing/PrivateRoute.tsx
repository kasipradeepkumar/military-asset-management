import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth/AuthContext';

const PrivateRoute = ({ component: Component }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext;

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <Component />;
};

export default PrivateRoute;
