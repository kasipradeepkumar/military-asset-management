import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Bases from './pages/Bases';
import EquipmentTypes from './pages/EquipmentTypes';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import { AuthProvider } from './context/auth/AuthContext';
import { AlertProvider } from './context/alert/AlertContext';
import Alert from './components/layout/Alert';
import './App.css';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="app">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="container">
              <Sidebar isOpen={isSidebarOpen} />
              <main className={`content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <Alert />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<PrivateRoute component={Dashboard} />} />
                  <Route path="/purchases" element={<PrivateRoute component={Purchases} />} />
                  <Route path="/transfers" element={<PrivateRoute component={Transfers} />} />
                  <Route path="/assignments" element={<PrivateRoute component={Assignments} />} />
                  <Route path="/bases" element={<AdminRoute component={Bases} />} />
                  <Route path="/equipment-types" element={<AdminRoute component={EquipmentTypes} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
};

export default App;
