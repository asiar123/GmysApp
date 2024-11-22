import { useState, useContext } from 'react';
import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (username, password) => {
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
        login(data.mensaje.usuario_id, token);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error en la autenticación:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading };
};

export default useLogin;
