import { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Vehiculos from './components/Vehiculos';
import VehiculoRecorrido from './components/VehiculoRecorrido';  
import Eventos from './components/Eventos';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';  
import Recorrido from './components/Recorrido';  
import Reportes from './components/Reportes'; // Importa el componente Reportes
import { UserProvider } from './context/UserContext'; // Importa el proveedor del contexto}
import GeocercaView from './components/GeocercaView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const currentPath = window.location.pathname;

    if (usuarioId) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (currentPath !== '/') {
        navigate('/login');
      }
    }
  }, [navigate]);

  return (
    <UserProvider> 
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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Ruta protegida para Reportes */}
            <Route
              path="/reportes"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/geocercas"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <GeocercaView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>} />
      </Routes>
    </UserProvider>
  );
}

export default App;
