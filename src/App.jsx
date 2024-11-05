import { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import VehiculosDashboard from './components/VehiculosDashboard';
import Eventos from './components/Eventos';
import Recorrido from './components/Recorrido';
import Reportes from './components/Reportes';
import GeocercaView from './components/GeocercaView';
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
      if (currentPath !== '/login' && currentPath !== '/') {
        navigate('/login');
      }
    }
  }, [navigate, location.pathname]);

  const protectedRoutes = (
    <ErrorBoundary>
      <Layout showHeaderFooter={isAuthenticated}>
        <Routes>
          <Route path="/vehiculos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><VehiculosDashboard /></ProtectedRoute>} />
          <Route path="/recorrido/:vehiId" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Recorrido /></ProtectedRoute>} />
          <Route path="/eventos/:placa" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Eventos /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Reportes /></ProtectedRoute>} />
          <Route path="/geocercas" element={<ProtectedRoute isAuthenticated={isAuthenticated}><GeocercaView /></ProtectedRoute>} />
          <Route path="/posicion/:lat/:lng" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PosicionMapa /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );

  return (
    <UserProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Layout showHeaderFooter={true}>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage setIsAuthenticated={setIsAuthenticated} />
          }
        />
  
        {/* Protected Routes */}
        <Route
          path="*"
          element={
            <Layout showHeaderFooter={isAuthenticated}>
              {protectedRoutes}
            </Layout>
          }
        />
      </Routes>
    </UserProvider>
  );
  
}

export default App;
