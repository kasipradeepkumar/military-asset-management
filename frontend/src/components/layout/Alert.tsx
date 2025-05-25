import React, { useContext } from 'react';
import { AlertContext } from '../../context/alert/AlertContext';

const Alert = () => {
  const alertContext = useContext(AlertContext);

  return (
    <div className="alert-wrapper">
      {alertContext.alerts.length > 0 &&
        alertContext.alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            <i className="fas fa-info-circle" /> {alert.msg}
          </div>
        ))}
    </div>
  );
};

export default Alert;
