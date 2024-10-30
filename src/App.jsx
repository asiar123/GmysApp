import { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import VehiculosDashboard from './components/VehiculosDashboard';
import VehiculoRecorrido from './components/VehiculoRecorrido';
import Eventos from './components/Eventos';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Recorrido from './components/Recorrido';
import Reportes from './components/Reportes';
import { UserProvider } from './context/UserContext';
import GeocercaView from './components/GeocercaView';
import ErrorBoundary from './components/ErrorBoundary';
import PosicionMapa from './components/PosicionMapa';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const currentPath = location.pathname;

    if (usuarioId) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Redirige solo si la ruta actual no es `/` ni `/login`
      if (currentPath !== '/login' && currentPath !== '/') {
        navigate('/login');
      }
    }
  }, [navigate, location.pathname]);

  return (
    <UserProvider>
      <Routes>
        {/* Página de Login sin Header ni Footer */}
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />

        {/* HomePage sin protección de autenticación */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas protegidas */}
        <Route
          path="*"
          element={
            <ErrorBoundary>
              <Layout showHeaderFooter={isAuthenticated}>
                <Routes>
                  <Route
                    path="/vehiculos"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <VehiculosDashboard />
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
                  <Route
                    path="/posicion/:lat/:lng"
                    element={
                      <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <PosicionMapa />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </ErrorBoundary>
          }
        />
      </Routes>
    </UserProvider>
  );
}

export default App;
