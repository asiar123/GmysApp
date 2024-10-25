import React, { useState } from 'react';
import Login from '../components/Login'; // Asegúrate de que la ruta sea correcta
import Header from '../components/Header'; // Si estás usando un header
import Footer from '../components/Footer'; // Si tienes un footer
import axios from 'axios';
import qs from 'qs';  // Asegúrate de tener instalada esta librería
import Cookies from 'js-cookie';  // Para manejar las cookies si es necesario
import { useNavigate } from 'react-router-dom'; // Para redirigir después del login
import Loader from '../components/Loader'; // Asumiendo que el componente del loader ya existe

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Inicializar la función para redirigir

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Mostrar la animación de carga

    try {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      const response = await axios.post(
        'https://proxy-gmys.onrender.com/login',  // Reemplaza con la URL correcta de tu API
        qs.stringify({
          usuario: username,
          passwd: password,
        }),
        { headers }
      );

      const data = response.data;
      const token = data.mensaje.token || 'dummy-token';  // Ajusta si cambia el formato del token

      // Guardar el token en una cookie si es necesario
      Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });

      // Verificar y guardar el usuario_id en localStorage
      if (data.mensaje.usuario_id) {
        localStorage.setItem('usuario_id', data.mensaje.usuario_id);
        console.log('ID de usuario guardado:', data.mensaje.usuario_id);
      }

      // Simular un pequeño delay antes de redirigir (puedes eliminar este `setTimeout` si no es necesario)
      setTimeout(() => {
        setLoading(false); // Ocultar el Loader
        navigate('/dashboard'); // Redirigir al dashboard
      }, 2000); // Ajusta el tiempo si prefieres que sea inmediato

    } catch (error) {
      console.error('Error en la autenticación:', error.response?.data || error);
      setLoading(false); // Ocultar el Loader en caso de error
    }
  };

  return (
    <>
      <Header /> {/* Si estás usando un header */}
      <main>
        {/* Mostrar el loader mientras se está autenticando */}
        {loading ? (
          <Loader />  // Aquí se muestra el componente de animación de carga
        ) : (
          <Login
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />  // El componente de login pasará el estado y la función de autenticación
        )}
      </main>
      <Footer /> {/* Si tienes un footer */}
    </>
  );
};

export default LoginPage;
