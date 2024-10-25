import { useState, useEffect } from 'react';  // Importar useState y useEffect
import { Route, Routes, useNavigate } from 'react-router-dom';
import Vehiculos from './components/Vehiculos';
import VehiculoRecorrido from './components/VehiculoRecorrido';  // Asegúrate de cambiar este por el nuevo componente Recorrido
import Eventos from './components/Eventos';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';  // Importar el Dashboard
import Recorrido from './components/Recorrido';  // Asegúrate de importar el componente Recorrido

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Usar un estado para la autenticación
  const navigate = useNavigate();  // Para redireccionar

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const currentPath = window.location.pathname;  // Obtiene la ruta actual
  
    if (usuarioId) {
      setIsAuthenticated(true);  // Autenticado si existe el ID de usuario
    } else {
      setIsAuthenticated(false);  // No autenticado si no existe
      // Solo redirige al login si NO estás en la ruta inicial '/'
      if (currentPath !== '/') {
        navigate('/login');
      }
    }
  }, [navigate]);  

  return (
    <Routes>
      {/* Página de Login fuera del Layout */}
      <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />

      {/* Rutas con Layout */}
      <Route path="*" element={<Layout> {/* Uso de "path=*" */}
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Página de inicio */}
          <Route
            path="/vehiculos"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Vehiculos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recorrido/:vehiId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Recorrido />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/:placa"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Eventos />
              </ProtectedRoute>
            }
          />
          {/* Ruta protegida para el Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>} />
    </Routes>
  );
}

export default App;
