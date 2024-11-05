import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';
import Loader from './Loader';
import { UserContext } from '../context/UserContext'; // Importar el contexto de usuario
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // Obtener el método login del contexto

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      const response = await axios.post(
        'https://proxy-gmys.onrender.com/login',
        qs.stringify({
          usuario: username,
          passwd: password,
        }),
        { headers }
      );

      const data = response.data;
      const token = data.mensaje.token;

      // Guardar el token en una cookie si es necesario
      if (token) {
        Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });
      }

      // Verificar y guardar el usuario_id en el contexto y en localStorage
      if (data.mensaje.usuario_id) {
        localStorage.setItem('usuario_id', data.mensaje.usuario_id);
        console.log('ID de usuario guardado:', data.mensaje.usuario_id);

        // Llamar al método login del contexto
        login(data.mensaje.usuario_id, token);
      }

      // Redirigir después de un breve retardo para el Loader
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error en la autenticación:', error.response?.data || error);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleLogin} className="login-form">
          <h2>Iniciar Sesión</h2>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'} // Toggle input type based on showPassword state
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              {showPassword ? 'Ocultar' : 'Mostrar contraseña'}
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
