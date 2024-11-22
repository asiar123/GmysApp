import React from 'react';
import Login from '../components/Login'; // Asegúrate de que la ruta sea correcta
import Loader from '../components/Loader';
import locationGif from '../assets/point.gif';
import useLogin from '../hooks/useLogin'; // Hook personalizado para manejar el login

const LoginPage = () => {
  const { handleLogin, loading } = useLogin(); // Usar el hook para manejar la lógica del login

  return (
    <main className="login-container">
      {loading ? (
        <Loader />  
      ) : (
        <>
          {/* Formulario de login */}
          <Login handleLogin={handleLogin} />
          {/* Animación GPS */}
          <div className="gps-animation">
            <img src={locationGif} alt="GPS Animation" />
          </div>
        </>
      )}
    </main>
  );
};

export default LoginPage;
