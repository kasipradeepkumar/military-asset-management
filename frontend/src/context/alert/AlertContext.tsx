import React, { createContext, useReducer } from 'react';
import alertReducer from './alertReducer';
import { v4 as uuidv4 } from 'uuid';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const initialState = {
    alerts: []
  };

  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set Alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = uuidv4();
    dispatch({
      type: 'SET_ALERT',
      payload: { msg, type, id }
    });

    setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: id }), timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts: state.alerts,
        setAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
