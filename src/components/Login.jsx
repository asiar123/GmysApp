import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs'; // Asegúrate de tener instalada esta librería
import Cookies from 'js-cookie'; // Para manejar las cookies si es necesario
import Loader from './Loader';  // Importamos el componente del Loader
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Mostrar el Loader al hacer login

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
      const token = data.mensaje.token || 'dummy-token';  // Asegúrate de ajustar esto si cambia el formato del token

      // Guardar el token en una cookie si es necesario
      Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });

      // Verificar y guardar el usuario_id en localStorage
      if (data.mensaje.usuario_id) {
        localStorage.setItem('usuario_id', data.mensaje.usuario_id);
        console.log('ID de usuario guardado:', data.mensaje.usuario_id);
      }

      setTimeout(() => {
        setLoading(false); // Ocultar el Loader
        navigate('/dashboard'); // Redirigir al dashboard
      }, 2000); // Simulamos un tiempo de espera de 2 segundos para la animación

    } catch (error) {
      console.error('Error en la autenticación:', error.response?.data || error);
      setLoading(false); // En caso de error, ocultamos el Loader
    }
  };

  return (
    <div className="login-container">
      {loading ? (  // Si está cargando, mostramos el Loader
        <Loader />   // Mostrar el Loader mientras esperamos
      ) : (
        <form onSubmit={handleLogin} className="login-form">
          <h2>Iniciar Sesión</h2>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading} // Desactivar campo mientras carga
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading} // Desactivar campo mientras carga
          />
          <button type="submit" disabled={loading}>  
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
