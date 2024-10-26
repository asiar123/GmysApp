// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuarioId, setUsuarioId] = useState(localStorage.getItem('usuario_id'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userId, token) => {
    console.log("Iniciando sesión con:", userId, token); // Verificación
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('usuario_id');
    if (token && userId) {
      setIsAuthenticated(true);
      setUsuarioId(userId);
    } else {
      setIsAuthenticated(false);
    }
    console.log("Estado de autenticación inicial:", isAuthenticated, "ID del usuario:", usuarioId);
  }, [usuarioId]); // Escucha cambios en `usuarioId`

  return (
    <UserContext.Provider value={{ usuarioId, setUsuarioId, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
