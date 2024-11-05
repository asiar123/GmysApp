import React, { useState, useContext } from 'react';
import Login from '../components/Login'; // Asegúrate de que la ruta sea correcta
import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { UserContext } from '../context/UserContext';
import locationGif from '../assets/point.gif';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const response = await axios.post(
        'https://proxy-gmys.onrender.com/login',
        qs.stringify({ usuario: username, passwd: password }),
        { headers }
      );

      const data = response.data;
      const token = data.mensaje.token;

      if (token) {
        Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });
      }

      if (data.mensaje.usuario_id) {
        localStorage.setItem('usuario_id', data.mensaje.usuario_id);
        console.log('ID de usuario guardado:', data.mensaje.usuario_id);
        login(data.mensaje.usuario_id, token);  // Actualizar el contexto de usuario
      }

      setLoading(false);  // Desactivar Loader
      navigate('/dashboard');  // Redirigir

    } catch (error) {
      console.error('Error en la autenticación:', error.response?.data || error);
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      {loading ? (
        <Loader />  
      ) : (
        <>
          <Login
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
          {/* Agrega el GIF debajo del formulario */}
          <div className="gps-animation">
            <img src={locationGif} alt="GPS Animation" />
          </div>
        </>
      )}
    </main>
  );
};

export default LoginPage;
