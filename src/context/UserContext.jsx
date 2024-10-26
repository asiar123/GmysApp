// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuarioId, setUsuarioId] = useState(localStorage.getItem('usuario_id'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const login = (userId, token) => {
    localStorage.setItem('usuario_id', userId);
    localStorage.setItem('token', token);
    setUsuarioId(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('token');
    setUsuarioId(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ usuarioId, setUsuarioId, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
