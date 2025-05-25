import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/auth/AuthContext';

const Sidebar = ({ isOpen }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, user } = authContext;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>Navigation</h3>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/purchases">
            <i className="fas fa-shopping-cart"></i> Purchases
          </Link>
        </li>
        <li>
          <Link to="/transfers">
            <i className="fas fa-exchange-alt"></i> Transfers
          </Link>
        </li>
        <li>
          <Link to="/assignments">
            <i className="fas fa-tasks"></i> Assignments & Expenditures
          </Link>
        </li>
        {user.role === 'admin' && (
          <>
            <li className="sidebar-divider">Admin</li>
            <li>
              <Link to="/bases">
                <i className="fas fa-building"></i> Bases
              </Link>
            </li>
            <li>
              <Link to="/equipment-types">
                <i className="fas fa-tools"></i> Equipment Types
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
