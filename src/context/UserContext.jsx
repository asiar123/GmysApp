import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuarioId, setUsuarioId] = useState(localStorage.getItem('usuario_id') || null);

  // Calcula si el usuario está autenticado directamente.
  const isAuthenticated = Boolean(localStorage.getItem('token') && usuarioId);

  const login = (userId, token) => {
    console.log("Iniciando sesión con:", userId, token); // Verificación
    localStorage.setItem('usuario_id', userId);
    localStorage.setItem('token', token);
    setUsuarioId(userId);
  };

  const logout = () => {
    console.log("Cerrando sesión");
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('token');
    setUsuarioId(null);
  };

  return (
    <UserContext.Provider value={{ usuarioId, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
